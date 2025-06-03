import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { UsersService } from 'src/users/providers/users.service';
import { RefreshTokenEntity } from '../entities/refreshToken.entity';
import { Repository } from 'typeorm';
import { HashingProvider } from './hashing.provider';
import { GenerateTokensProvider } from './generateTokens.provider';
import { RefreshTokenRepositoryOperations } from './RefreshTokenCrud.repository';
import jwtConfig from '../config/jwtConfig';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class RefreshTokensProvider {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,

    private readonly hashingProvider: HashingProvider,

    private readonly generateTokensProvider: GenerateTokensProvider,

    private readonly refreshTokenRepositoryOperations: RefreshTokenRepositoryOperations,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  public async refreshTokens(
    userId: string,
    refreshToken: string,
    req: Request,
  ) {
    const user = await this.usersService.findOneUserById(userId);

    // find all the tokens of the user in the database
    const allTokens = await this.refreshTokenRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user'],
    });

    let matchingExistingToken = null;

    for (const token of allTokens) {
      const isMatch = await this.hashingProvider.comparePassword(
        refreshToken,
        token.token,
      );

      if (isMatch) {
        matchingExistingToken = token;
        break;
      }
    }

    console.log(
      'THIS IS THE REFRESH TOKEN ENTITY FOUND IN THE DATABASE',
      matchingExistingToken,
    );

    if (!matchingExistingToken) {
      throw new ForbiddenException('Access Denied');
    }

    // verify refresh token matches
    const isMatch = await this.hashingProvider.comparePassword(
      refreshToken,
      matchingExistingToken.token,
    );

    if (!isMatch) {
      throw new ForbiddenException('Invalid refresh token');
    }

    const now = new Date();

    // if token has already been revoked
    if (matchingExistingToken.revoked) {
      throw new UnauthorizedException(
        'Token already revoked. Kindly login to get a new refresh token',
      );
    }

    // if refresh token has expired, mark it has revoked and let the user log in again to get a new access and refresh token
    if (matchingExistingToken.expiresAt < now) {
      matchingExistingToken.revoked = true;
      matchingExistingToken.revokedAt = now;
      await this.refreshTokenRepository.save(matchingExistingToken);

      throw new UnauthorizedException(
        'Your session has expired. Please login again',
      );

      // Then in the frontend, when you get a 401 Unauthorized from /refresh-token, redirect user to login.
    }

    // if refresh token is still valid, generate only access token
    if (matchingExistingToken.expiresAt > now) {
      const newAccessToken = await this.generateTokensProvider.signSingleToken(
        user.id,
        this.jwtConfiguration.accessTokenTTL,
        user.role,
        {
          email: user.email,
        },
      );

      return {
        user,
        accessToken: newAccessToken,
        refreshToken,
      };
    }

    // generate new tokens if the refresh token has expired
    // const newTokens =
    //   await this.generateTokensProvider.generateBothTokens(user);

    // const hashedNewRefreshToken = await this.hashingProvider.hashPassword(
    //   newTokens.refreshToken,
    // );

    // const newRefreshTokenEntity = this.refreshTokenRepository.create({
    //   token: hashedNewRefreshToken,
    //   expiresAt: new Date(Date.now() + this.jwtConfiguration.refreshTokenTTL),
    //   user: user,
    //   userId: userId,
    //   userAgent: req.headers['user-agent'] || '',
    //   ipAddress: req.ip,
    // });

    // await this.refreshTokenRepository.save(newRefreshTokenEntity);

    // return {
    //   user,
    //   accessToken: newTokens.accessToken,
    //   refreshToken: newTokens.refreshToken,
    // };
  }
}
