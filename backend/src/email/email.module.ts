import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import { EmailVerificationTokenProvider } from './providers/email-verification-token';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationToken } from './emailVerificationToken.enttity';


@Module({
  imports: [TypeOrmModule.forFeature([EmailVerificationToken]), ConfigModule],
  providers: [EmailService, EmailVerificationTokenProvider],
  exports: [EmailService],
})
export class EmailModule {}
