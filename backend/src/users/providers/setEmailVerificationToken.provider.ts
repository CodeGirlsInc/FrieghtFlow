import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  RequestTimeoutException,
} from '@nestjs/common';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { GenerateRandomTokenProvider } from './generateRandomToken.provider';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EmailVerificationTokenProvider {
  constructor(
    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,

    private readonly generateRandomTokenProvider: GenerateRandomTokenProvider,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  public async getEmailVerificationToken(user: User) {
    // generate the random token
    const token = this.generateRandomTokenProvider.getRandomToken();

    // hash the token
    let hashedToken: string;
    try {
      hashedToken = await this.hashingProvider.hashPassword(token);
    } catch (error) {
      throw new RequestTimeoutException(
        'Timeout! Error hashing email verification token',
      );
    }

    // save to database
    try {
      user.emailVerificationToken = hashedToken;
      user.emailVerificationExpiresIn = new Date(Date.now() + 3600000);

      await this.usersRepository.save(user);
    } catch (error) {
      if (
        error.name === 'QueryFailedError' &&
        error.message.includes('timeout')
      ) {
        throw new RequestTimeoutException(
          'Your request timedout. Kindly try again later',
        );
      }

      throw new InternalServerErrorException(
        'Failed to save due to server error',
      );
    }

    return token;
  }
}
