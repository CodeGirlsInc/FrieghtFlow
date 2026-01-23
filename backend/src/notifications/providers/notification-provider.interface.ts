export interface INotificationProvider {
  send(
    recipient: string,
    subject: string,
    body: string,
    metadata?: Record<string, any>,
  ): Promise<boolean>;
  isConfigured(): boolean;
}
