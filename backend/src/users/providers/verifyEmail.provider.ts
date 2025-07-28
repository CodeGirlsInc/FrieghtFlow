import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

export class VerifyEmailDto {
  token: string;
}

@Injectable()
export class VerifyEmailProvider {
  private readonly logger = new Logger(VerifyEmailProvider.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<User> {
    try {
      this.logger.log('Attempting to verify email with token');

      const user = await this.userRepository.findOne({
        where: { emailVerificationToken: verifyEmailDto.token },
      });

      if (!user) {
        throw new BadRequestException('Invalid verification token');
      }

      if (user.isEmailVerified) {
        throw new BadRequestException('Email is already verified');
      }

      if (user.emailVerificationTokenExpires && user.emailVerificationTokenExpires < new Date()) {
        throw new BadRequestException('Verification token has expired');
      }

      // Update user as verified
      await this.userRepository.update(
        { id: user.id },
        {
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationTokenExpires: null,
          updatedAt: new Date(),
        }
      );

      this.logger.log(`Email verified successfully for user: ${user.email}`);

      return user;
    } catch (error) {
      this.logger.error(`Error verifying email: ${error.message}`, error.stack);
      throw error;
    }
  }
} 