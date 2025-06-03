import { Inject, Injectable, Type } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwtConfig';
import { ConfigType } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class GenerateTokensProvider {
  constructor(
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfigurations: ConfigType<typeof jwtConfig>,
  ) {}

  public async signSingleToken(
    userId: string,
    expiresIn: number,
    userRole: string,
    payload?: any,
  ) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        role: userRole,
        ...payload,
      },
      {
        audience: this.jwtConfigurations.audience,
        issuer: this.jwtConfigurations.issuer,
        secret: this.jwtConfigurations.secret,
        expiresIn,
      },
    );
  }

  public async generateBothTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signSingleToken(
        user.id,
        this.jwtConfigurations.accessTokenTTL,
        user.role,
        {
          email: user.email,
        },
      ),
      this.signSingleToken(
        user.id,
        this.jwtConfigurations.refreshTokenTTL,
        user.role,
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
