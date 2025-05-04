export interface NotificationPayload {
    type: string;
    userId: string;
    message: string;
    metadata?: Record<string, any>;
    persist?: boolean;
  }
  