import { Injectable, Logger } from '@nestjs/common';
import { User } from '../entities/user.entity';

@Injectable()
export class GetUserProfileProvider {
  private readonly logger = new Logger(GetUserProfileProvider.name);

  async getUserProfile(user: User): Promise<Partial<User>> {
    try {
      this.logger.log(`Getting profile for user: ${user.email}`);

      // Return user profile without sensitive information
      const { password, emailVerificationToken, emailVerificationTokenExpires, passwordResetToken, passwordResetTokenExpires, ...profile } = user;

      return profile;
    } catch (error) {
      this.logger.error(`Error getting user profile: ${error.message}`, error.stack);
      throw error;
    }
  }
} 