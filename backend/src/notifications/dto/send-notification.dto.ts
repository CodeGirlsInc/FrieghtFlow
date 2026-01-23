export class SendNotificationDto {
  userId: string;
  type: string;
  title: string;
  message: string;
  channels?: string[];
  metadata?: Record<string, any>;
  recipientEmail?: string;
  recipientPhone?: string;
}
