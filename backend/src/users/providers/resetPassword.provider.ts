import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ResetPasswordDto } from 'src/auth/dtos/resetPassword.dto';
import { FindOneUserByEmailProvider } from './findOneUserByEmail.provider';
import { HashingProvider } from 'src/auth/providers/hashing.provider';

@Injectable()
export class ResetPasswordProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly findOneUserByEmailProvider: FindOneUserByEmailProvider,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,
  ) {}

  public async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, token, password } = resetPasswordDto;

    // check if the user actually exists
    const user = await this.findOneUserByEmailProvider.findUserByEmail(email);

    // check if we dont have a password reset token or the token has expired
    if (!user.passwordResetToken || user.passwordResetExpires < new Date()) {
      throw new UnauthorizedException(
        'Password reset token is invalid or has expired',
      );
    }

    // check if password token is the same
    let isPasswordResetTokenValid: boolean;
    try {
      isPasswordResetTokenValid = await this.hashingProvider.comparePassword(
        token,
        user.passwordResetToken,
      );
    } catch (error) {
      throw new RequestTimeoutException('Error verifying reset token');
    }

    if (!isPasswordResetTokenValid) {
      throw new UnauthorizedException('Password reset token is invalid');
    }

    // hash the new password, clear reset token fields and save the new password
    try {
      user.password = await this.hashingProvider.hashPassword(password);
      user.passwordResetToken = null;
      user.passwordResetExpires = null;

      await this.usersRepository.save(user);
    } catch (error) {
      if (
        error.name === 'QueryFailedError' &&
        error.message.includes('timeout')
      ) {
        throw new RequestTimeoutException(
          'Request timed out. Please try again later',
        );
      }

      throw new InternalServerErrorException(
        'Failed to save due to server error',
      );
    }

    return {
      success: true,
      message: 'Password reset successful',
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
