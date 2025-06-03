import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './providers/auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwtConfig';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { HashingProvider } from './providers/hashing.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { LoginUserProvider } from './providers/loginuser.provider';
import { GenerateTokensProvider } from './providers/generateTokens.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entities/refreshToken.entity';
import { RefreshTokenRepositoryOperations } from './providers/RefreshTokenCrud.repository';
import { ValidateUserProvider } from './providers/validateUser.provider';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtRefreshStrategy } from './strategies/jwtRefresh.strategy';
import { RefreshTokensProvider } from './providers/refreshTokens.provider';
import { FindOneRefreshTokenProvider } from './providers/findOneRefreshToken.provider';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailModule } from 'src/mail/mail.module';
import { RolesGuard } from './guards/roles.guard';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PassportModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_TOKEN_TTL,
      },
    }),
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([RefreshTokenEntity]),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    LocalStrategy,
    JwtRefreshStrategy,
    AuthService,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    LoginUserProvider,
    GenerateTokensProvider,
    RefreshTokenRepositoryOperations,
    ValidateUserProvider,
    RefreshTokensProvider,
    FindOneRefreshTokenProvider,
    RolesGuard,
  ],
  exports: [
    AuthService,
    HashingProvider,
    PassportModule,
    JwtModule,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
})
export class AuthModule {}
