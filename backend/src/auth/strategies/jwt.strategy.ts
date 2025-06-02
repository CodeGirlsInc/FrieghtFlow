import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from '../config/jwtConfig';
import { ConfigType } from '@nestjs/config';
import { UsersService } from 'src/users/providers/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfigurations: ConfigType<typeof jwtConfig>,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfigurations.secret ?? 'defaultSecret',
      issuer: jwtConfigurations.issuer ?? 'defaultIssuer',
      audience: jwtConfigurations.audience ?? 'defaultAudience',
    });
  }

  async validate(payload: any) {
    return await this.usersService.findOneUserById(payload.sub);
  }
}
