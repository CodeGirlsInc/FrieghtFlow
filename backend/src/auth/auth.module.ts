import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entities/refreshToken.entity';
import { FindOneRefreshTokenProvider } from './providers/findOneRefreshToken.provider';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from 'src/email/email.module';
import { ConfigFactory } from '@nestjs/config';
import { HashingProvider } from './providers/hashing.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { ValidateUserProvider } from './providers/validateUser.provider';
import { LoginUserProvider } from './providers/loginUser.provider';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { GenerateTokensProvider } from './providers/generateTokens.provider';
import { RefreshTokenRepositoryOperations } from './providers/refreshTokenRepositoryOperations.provider';
// Import RolesGuard if it exists
import { RolesGuard } from './guards/roles.guard';

const jwtConfig: ConfigFactory = () => ({
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret',
  JWT_ACCESS_TOKEN_TTL: process.env.JWT_ACCESS_TOKEN_TTL || '1h',
});

@Module({
  imports: [
    UsersModule, // required
    PassportModule,
    ConfigModule.forFeature(jwtConfig), // Ensure jwtConfig is defined in your config files
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
    FindOneRefreshTokenProvider,
    RolesGuard,
  ],
  exports: [AuthService, HashingProvider],
})
export class AuthModule {}

export default jwtConfig;

