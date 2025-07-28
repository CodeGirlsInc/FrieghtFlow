import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { GenerateRandomTokenProvider } from './generateRandomToken.provider';

@Injectable()
export class ResendEmailVerificationProvider {
  private readonly logger = new Logger(ResendEmailVerificationProvider.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly generateRandomTokenProvider: GenerateRandomTokenProvider,
  ) {}

  async resendEmailVerification(user: User): Promise<string> {
    try {
      this.logger.log(`Resending email verification for user: ${user.email}`);

      const token = this.generateRandomTokenProvider.getRandomToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

      // Update user with new verification token
      await this.userRepository.update(
        { id: user.id },
        {
          emailVerificationToken: token,
          emailVerificationTokenExpires: expiresAt,
          updatedAt: new Date(),
        }
      );

      this.logger.log(`Email verification token regenerated for user: ${user.email}`);

      return token;
    } catch (error) {
      this.logger.error(`Error resending email verification: ${error.message}`, error.stack);
      throw error;
    }
  }
} 