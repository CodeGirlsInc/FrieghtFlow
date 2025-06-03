import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { VerifyEmailDto } from 'src/auth/dtos/verifyEmail.dto';
import { User } from '../entities/user.entity';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindOneUserByIdProvider } from './findOneUserById.provider';

@Injectable()
export class VerifyEmailProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,

    private readonly findOneUserByIdProvider: FindOneUserByIdProvider,
  ) {}

  public async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { userId, token } = verifyEmailDto;

    // find the user
    const user = await this.findOneUserByIdProvider.findOneUser(userId);

    // check if the token exists and if it has not expired
    if (
      !user.emailVerificationToken ||
      user.emailVerificationExpiresIn < new Date()
    ) {
      throw new NotFoundException(
        'Email verification token invalid or expired',
      );
    }

    // compare the email verification tokens
    let isVerificationTokenValid: boolean;

    try {
      isVerificationTokenValid = await this.hashingProvider.comparePassword(
        token,
        user.emailVerificationToken,
      );
    } catch (error) {
      throw new RequestTimeoutException(
        'Timeout! Error validation email verification token',
      );
    }

    // check if they match
    if (!isVerificationTokenValid) {
      throw new NotFoundException('Email Verification token is invalid');
    }

    try {
      user.isEmailVerified = true;
      // user.emailVerificationExpiresIn = null;
      // user.emailVerificationToken = null;

      await this.usersRepository.save(user);
    } catch (error) {
      if (
        error.name === 'ErrorQueryFailed' &&
        error.message.includes('timeout')
      ) {
        throw new RequestTimeoutException(
          'Your request timed out. Kindly try again later',
        );
      }

      throw new InternalServerErrorException(
        'Failed to save due to server error',
      );
    }

    return {
      success: true,
      message: 'Email verified successfully',
      user: {
        userId: user.id,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }
}
