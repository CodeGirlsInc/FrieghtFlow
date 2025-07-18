import {
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { RefreshTokenEntity } from '../entities/refreshToken.entity';
import { HashingProvider } from './hashing.provider';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FindOneRefreshTokenProvider {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenEntity: Repository<RefreshTokenEntity>,
    private readonly hashingProvider: HashingProvider,
  ) {}

  public async findRefreshToken(userId: string, userRefreshToken: string) {
    let userTokens: RefreshTokenEntity[];

    try {
      userTokens = await this.refreshTokenEntity.find({
        where: {
          user: {
            id: userId,
          },
        },
        relations: ['user'],
      });
    } catch (error) {
      throw new RequestTimeoutException('Error connecting to the database');
    }

    if (!userTokens || userTokens.length === 0) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // compare provided token with each stored one
    for (const tokenEntity of userTokens) {
      const isMatch = await this.hashingProvider.compare(
        userRefreshToken,
        tokenEntity.token,
      );

      if (isMatch) {
        //checkif the token is already revoked
        if (tokenEntity.revoked) {
          throw new UnauthorizedException('Refresh token is already revoked');
        }

        return tokenEntity;
      }
    }

    throw new UnauthorizedException('Invalid refresh token');
  }
}
