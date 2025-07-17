import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './providers/auth.service';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entities/refreshToken.entity';
import { HashingProvider } from './providers/hashing.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { ValidateUserProvider } from './providers/validateUser.provider';
import { LocalStrategy } from './strategies/local.strategy';
import { GenerateTokensProvider } from './providers/generateTokens.provider';
import { RefreshTokenRepositoryOperations } from './providers/RefreshTokenCrud.repository';
import { RefreshTokensProvider } from './providers/refreshTokens.provider';
import { FindOneRefreshTokenProvider } from './providers/findOneRefreshToken.provider';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import jwtConfig from './config/jwtConfig';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from './guards/roles.guard';
import { LoginUserProvider } from './providers/loginUser.provider';
import { EmailModule } from 'src/email/email.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwtRefresh.strategy';

@Module({
  imports: [
    PassportModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_TOKEN_TTL'),
        },
      }),
    }),
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([RefreshTokenEntity]),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    ValidateUserProvider,
    LoginUserProvider,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    GenerateTokensProvider,
    RefreshTokenRepositoryOperations,
    RefreshTokensProvider,
    FindOneRefreshTokenProvider,
    RolesGuard,
  ],
  exports: [AuthService, HashingProvider],
})
export class AuthModule {}
