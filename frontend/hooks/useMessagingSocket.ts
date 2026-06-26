'use client';

import { useEffect } from 'react';
import { getSocket } from '../lib/socket';
import { useNotificationStore } from '../stores/notification.store';
import { Message } from '../lib/api/messaging.api';

interface MessageNewPayload extends Message {
  conversationId: string;
}

interface UseMessagingSocketOptions {
  /** Currently open conversation — incoming messages for it go to onMessage, not the badge */
  activeConversationId?: string | null;
  onMessage?: (msg: MessageNewPayload) => void;
}

export function useMessagingSocket({ activeConversationId, onMessage }: UseMessagingSocketOptions = {}) {
  const { incrementMessageUnread } = useNotificationStore();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (msg: MessageNewPayload) => {
      if (msg.conversationId === activeConversationId) {
        onMessage?.(msg);
      } else {
        incrementMessageUnread();
      }
    };

    socket.on('message:new', handler);
    return () => { socket.off('message:new', handler); };
  }, [activeConversationId, onMessage, incrementMessageUnread]);
}
