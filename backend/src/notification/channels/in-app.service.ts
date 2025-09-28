import { Injectable } from '@nestjs/common';

export interface InAppMessage {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

@Injectable()
export class InAppService {
  // In a real application, this would be a database table (e.g., using TypeORM).
  private notifications: InAppMessage[] = [];

  async createInAppMessage(userId: string, message: string): Promise<InAppMessage> {
    const newMessage: InAppMessage = {
      id: Math.random().toString(36).substring(2, 9),
      userId,
      message,
      read: false,
      createdAt: new Date(),
    };
    this.notifications.push(newMessage);
    console.log(`In-app message created for user ${userId}: "${message}"`);
    return newMessage;
  }

  async getMessagesForUser(userId: string): Promise<InAppMessage[]> {
    return this.notifications.filter((n) => n.userId === userId && !n.read);
  }
}