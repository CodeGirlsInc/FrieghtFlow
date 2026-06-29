import { apiClient } from './client';

export interface Conversation {
  id: string;
  shipmentId: string;
  shipmentTrackingNumber: string;
  otherParty: { id: string; firstName: string; lastName: string };
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface PaginatedMessages {
  data: Message[];
  total: number;
  page: number;
  limit: number;
}

export const messagingApi = {
  listConversations(): Promise<Conversation[]> {
    return apiClient('/conversations');
  },

  getOrCreateConversation(shipmentId: string): Promise<Conversation> {
    return apiClient('/conversations', { method: 'POST', body: JSON.stringify({ shipmentId }) });
  },

  listMessages(conversationId: string, page = 1, limit = 50): Promise<PaginatedMessages> {
    return apiClient(`/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
  },

  sendMessage(conversationId: string, body: string): Promise<Message> {
    return apiClient(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  },
};
