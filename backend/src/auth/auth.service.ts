import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      this.logger.warn(`Register failed - email already exists: ${dto.email}`);
      throw new BadRequestException('이미 사용 중인 이메일입니다.');
    }

    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name, phone: dto.phone, password },
    });

    this.logger.log(`User registered: ${user.email} (id=${user.id})`);
    return this.issueTokens(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.password) {
      this.logger.warn(`Login failed - user not found: ${dto.email}`);
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      this.logger.warn(`Login failed - wrong password: ${dto.email}`);
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    this.logger.log(`User logged in: ${user.email} (id=${user.id})`);
    return this.issueTokens(user.id, user.email);
  }

  async kakaoLogin(kakaoUser: {
    kakaoOauthId: string;
    name: string;
    email?: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { kakaoOauthId: kakaoUser.kakaoOauthId },
    });

    if (!user && kakaoUser.email) {
      user = await this.prisma.user.findUnique({
        where: { email: kakaoUser.email },
      });
      if (user) {
        this.logger.log(`Kakao: linking kakaoOauthId to existing user ${user.email}`);
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { kakaoOauthId: kakaoUser.kakaoOauthId },
        });
      }
    }

    if (!user) {
      const email =
        kakaoUser.email || `kakao_${kakaoUser.kakaoOauthId}@noreply.local`;
      user = await this.prisma.user.create({
        data: {
          email,
          name: kakaoUser.name,
          kakaoOauthId: kakaoUser.kakaoOauthId,
        },
      });
      this.logger.log(`Kakao: new user created ${user.email} (id=${user.id})`);
    } else {
      this.logger.log(`Kakao: user logged in ${user.email} (id=${user.id})`);
    }

    return this.issueTokens(user.id, user.email);
  }

  async kakaoCodeLogin(code: string, redirectUri: string) {
    this.logger.log(`Kakao code login: redirectUri=${redirectUri}`);
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.configService.get('KAKAO_CLIENT_ID')!,
        redirect_uri: redirectUri,
        code,
      }),
    });
    const tokenData = await tokenRes.json();

    const profileRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();

    return this.kakaoLogin({
      kakaoOauthId: String(profile.id),
      name: profile.kakao_account?.profile?.nickname || '사용자',
      email: profile.kakao_account?.email,
    });
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.refreshTokenHash)
      throw new UnauthorizedException('Refresh token not found');

    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) {
      // Reuse detection: hash mismatch means the token was already rotated.
      // Revoke all sessions immediately to limit attacker's window.
      this.logger.warn(`Refresh token reuse detected for userId=${userId} — revoking all sessions`);
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshTokenHash: null },
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(user.id, user.email);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({ where: { id: userId }, data: dto });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.password) {
      throw new BadRequestException('소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.');
    }

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) {
      throw new BadRequestException('현재 비밀번호가 올바르지 않습니다.');
    }

    const password = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { password } });
    this.logger.log(`Password changed for userId=${userId}`);
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: null,
        tokenVersion: { increment: 1 }, // Invalidate all existing access tokens
      },
    });
  }

  private async issueTokens(userId: string, email: string) {
    // 1. Generate refresh token
    const refreshToken = this.jwtService.sign(
      { sub: userId, email },
      { secret: this.configService.get('JWT_REFRESH_SECRET'), expiresIn: '7d' },
    );

    // 2. Persist new refresh token hash, read back tokenVersion in one round-trip
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const { tokenVersion } = await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
      select: { tokenVersion: true },
    });

    // 3. Embed tokenVersion in access token so logout invalidates it immediately
    const accessToken = this.jwtService.sign(
      { sub: userId, email, tokenVersion },
      { secret: this.configService.get('JWT_SECRET'), expiresIn: '1h' },
    );

    return { accessToken, refreshToken };
  }
}
