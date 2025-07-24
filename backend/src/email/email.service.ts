import { Injectable } from '@nestjs/common';
import { EmailVerificationTokenProvider } from './providers/email-verification-token';

@Injectable()
export class EmailService {
    constructor(
        private readonly emailVerificationTokenProvider: EmailVerificationTokenProvider
    ) {}

    public emailVerificationToken() {
        return this.emailVerificationTokenProvider.generateToken()
    }
}
