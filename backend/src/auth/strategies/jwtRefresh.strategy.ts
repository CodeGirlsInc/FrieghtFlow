import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwtConfig';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {
    const { secret, issuer, audience } = jwtConfiguration;

    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: secret,
      passReqToCallback: true,
      audience,
      issuer,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.body.refreshToken;

    return {
      id: payload.sub,
      refreshToken,
    };
  }
}
