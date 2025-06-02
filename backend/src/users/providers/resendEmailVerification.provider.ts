import { Injectable } from '@nestjs/common';
import { GenerateRandomTokenProvider } from './generateRandomToken.provider';
import { MailService } from 'src/mail/mail.service';
import { User } from '../entities/user.entity';

@Injectable()
export class ResendEmailVerificationProvider {
  constructor(
    private readonly generateRandomTokenProvider: GenerateRandomTokenProvider,

    private readonly mailService: MailService,
  ) {}

  public async resendEmailVerification(user: User) {
    // check if the email is already verified
    if (user.isEmailVerified) {
      return {
        message: 'Email already verified',
      };
    }

    // generate the token
    const verificationToken = this.generateRandomTokenProvider.getRandomToken();

    // send the verification email
    return await this.mailService.sendVerificationEmail(
      user,
      verificationToken,
    );
  }
}
