import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // In a real app, these would come from your .env file
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.example.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('SMTP_USER', 'user@example.com'),
        pass: this.configService.get<string>('SMTP_PASS', 'password'),
      },
    });
  }

  async sendEmail(to: string, subject: string, body: string) {
    const mailOptions = {
      from: '"My App" <noreply@example.com>',
      to,
      subject,
      html: body, // Or 'text' for plain text
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}