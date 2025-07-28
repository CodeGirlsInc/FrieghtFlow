import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { GenerateRandomTokenProvider } from './generateRandomToken.provider';

@Injectable()
export class PasswordResetTokenProvider {
  private readonly logger = new Logger(PasswordResetTokenProvider.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly generateRandomTokenProvider: GenerateRandomTokenProvider,
  ) {}

  async setPasswordResetToken(email: string): Promise<string> {
    try {
      this.logger.log(`Setting password reset token for email: ${email}`);

      const user = await this.userRepository.findOne({
        where: { email, deletedAt: null },
      });

      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }

      const token = this.generateRandomTokenProvider.getRandomToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

      // Update user with reset token
      await this.userRepository.update(
        { id: user.id },
        {
          passwordResetToken: token,
          passwordResetTokenExpires: expiresAt,
          updatedAt: new Date(),
        }
      );

      this.logger.log(`Password reset token set for user: ${email}`);

      return token;
    } catch (error) {
      this.logger.error(`Error setting password reset token: ${error.message}`, error.stack);
      throw error;
    }
  }
} 