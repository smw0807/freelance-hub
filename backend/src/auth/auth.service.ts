import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException('이미 사용 중인 이메일입니다.');

    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name, phone: dto.phone, password },
    });

    return this.issueTokens(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.password)
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid)
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );

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
    }

    return this.issueTokens(user.id, user.email);
  }

  async kakaoCodeLogin(code: string, redirectUri: string) {
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
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    return this.issueTokens(user.id, user.email);
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  private async issueTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });

    return { accessToken, refreshToken };
  }
}
