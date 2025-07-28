import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { GenerateRandomTokenProvider } from './generateRandomToken.provider';

@Injectable()
export class EmailVerificationTokenProvider {
  private readonly logger = new Logger(EmailVerificationTokenProvider.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly generateRandomTokenProvider: GenerateRandomTokenProvider,
  ) {}

  async getEmailVerificationToken(user: User): Promise<string> {
    try {
      this.logger.log(`Generating email verification token for user: ${user.email}`);

      const token = this.generateRandomTokenProvider.getRandomToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

      // Update user with verification token
      await this.userRepository.update(
        { id: user.id },
        {
          emailVerificationToken: token,
          emailVerificationTokenExpires: expiresAt,
        }
      );

      this.logger.log(`Email verification token generated for user: ${user.email}`);

      return token;
    } catch (error) {
      this.logger.error(`Error generating email verification token: ${error.message}`, error.stack);
      throw error;
    }
  }
} 