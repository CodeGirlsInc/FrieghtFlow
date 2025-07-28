import { Injectable, Logger } from '@nestjs/common';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendVerificationEmail(user: User, token: string): Promise<void> {
    this.logger.log(`Sending verification email to ${user.email} with token: ${token}`);
    // Implementation would send actual email
  }

  async sendPasswordResetEmail(user: User, token: string): Promise<void> {
    this.logger.log(`Sending password reset email to ${user.email} with token: ${token}`);
    // Implementation would send actual email
  }
} 