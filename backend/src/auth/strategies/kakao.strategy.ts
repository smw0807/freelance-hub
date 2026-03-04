import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID'),
      callbackURL: configService.get<string>('KAKAO_REDIRECT_URI'),
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user: any) => void,
  ) {
    const { id, username, _json } = profile;
    const user = {
      kakaoOauthId: String(id),
      name: username || _json?.kakao_account?.profile?.nickname || '사용자',
      email: _json?.kakao_account?.email,
    };
    done(null, user);
  }
}
