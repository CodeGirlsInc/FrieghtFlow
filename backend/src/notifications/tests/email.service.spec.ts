import { Test, type TestingModule } from '@nestjs/testing';
import { EmailService } from '../services/email.service';
import type { EmailOptions } from '../services/email.service';
import { jest } from '@jest/globals';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    service.clearEmailQueue();
  });

  describe('sendEmail', () => {
    it('should send email and add to queue', async () => {
      const emailOptions: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'This is a test email',
      };

      const result = await service.sendEmail(emailOptions);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(service.getQueueSize()).toBe(1);

      const queue = service.getEmailQueue();
      expect(queue[0].email).toEqual(emailOptions);
    });

    it('should handle email sending errors', async () => {
      // Mock console.error to avoid test output
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Force an error by passing invalid options
      const emailOptions = null as any;

      const result = await service.sendEmail(emailOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      consoleSpy.mockRestore();
    });
  });

  describe('sendBulkEmails', () => {
    it('should send multiple emails', async () => {
      const emails: EmailOptions[] = [
        { to: 'user1@example.com', subject: 'Email 1', text: 'Message 1' },
        { to: 'user2@example.com', subject: 'Email 2', text: 'Message 2' },
        { to: 'user3@example.com', subject: 'Email 3', text: 'Message 3' },
      ];

      const results = await service.sendBulkEmails(emails);

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.success)).toBe(true);
      expect(service.getQueueSize()).toBe(3);
    });
  });

  describe('sendTemplateEmail', () => {
    it('should send email using template', async () => {
      const result = await service.sendTemplateEmail(
        'user@example.com',
        'shipment_created',
        {
          trackingNumber: 'TRK123456',
          recipientName: 'John Doe',
          origin: 'New York',
          destination: 'Los Angeles',
          estimatedDelivery: '2024-01-15',
          items: [{ name: 'Widget', quantity: 1, value: 25 }],
          actionUrl: 'https://app.example.com/track/TRK123456',
        },
      );

      expect(result.success).toBe(true);
      expect(service.getQueueSize()).toBe(1);

      const queue = service.getEmailQueue();
      const sentEmail = queue[0].email;

      expect(sentEmail.to).toBe('user@example.com');
      expect(sentEmail.subject).toContain('TRK123456');
      expect(sentEmail.text).toContain('John Doe');
      expect(sentEmail.text).toContain('New York');
      expect(sentEmail.html).toContain('TRK123456');
    });
  });

  describe('queue management', () => {
    it('should manage email queue correctly', async () => {
      expect(service.getQueueSize()).toBe(0);

      await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test message',
      });

      expect(service.getQueueSize()).toBe(1);

      const queue = service.getEmailQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].email.to).toBe('test@example.com');

      service.clearEmailQueue();
      expect(service.getQueueSize()).toBe(0);
    });
  });
});
