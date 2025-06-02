import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendPasswordResetEmail(user: User, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

    await this.mailerService.sendMail({
      from: `Accounts Unit <accounts@nestjsdairy.com>`,
      to: user.email,
      subject: `${user.firstName}, Reset Your Password | Nestjs Diary`,
      context: {
        name: user.firstName,
        email: user.email,
        loginUrl: 'http://localhost:6000',
        resetUrl: resetUrl,
      },
      template: './passwordReset.ejs',
    });
  }

  public async sendVerificationEmail(user: User, verificationToken: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&userId=${user.id}`;

    await this.mailerService.sendMail({
      from: 'Accounts Unit <accounts@nestjsdairy.com>',
      to: user.email,
      subject: `Kindly Verify Your Email | Nestjs Diary`,
      context: {
        userName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        verificationUrl: verificationUrl,
      },
      template: './emailVerification',
    });

    return {
      success: true,
      message: 'Verification Email sent successfully',
    };
  }
}
