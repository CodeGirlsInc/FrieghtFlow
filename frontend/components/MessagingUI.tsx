'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  id: string;
  shipmentId: string;
  trackingNumber: string;
  participantName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function MessagingUI() {
  const [conversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = 'current-user';

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !selectedId) return;

    const msg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      senderName: 'You',
      body: input.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, msg]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="p-4 sm:p-8">
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No conversations yet. Messages will appear when you have an active shipment with a carrier.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Messages</h1>
      <div className="flex rounded-xl border bg-card shadow overflow-hidden h-[600px]">
        {/* Conversations list */}
        <div className="w-72 border-r border-border flex flex-col shrink-0 hidden md:flex">
          <div className="p-3 border-b border-border">
            <Input placeholder="Search conversations..." className="h-8 text-sm" readOnly />
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full text-left px-3 py-3 hover:bg-accent transition-colors ${
                  selectedId === conv.id ? 'bg-accent' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">{conv.participantName}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(conv.lastMessageAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground truncate">{conv.lastMessage}</span>
                  {conv.unreadCount > 0 && (
                    <span className="h-4 min-w-[16px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                      {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thread view */}
        <div className="flex-1 flex flex-col">
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Select a conversation to view messages
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="h-14 flex items-center gap-3 px-4 border-b border-border">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {selectedConversation?.participantName?.[0] ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-medium">{selectedConversation?.participantName ?? 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">Shipment: {selectedConversation?.trackingNumber ?? ''}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === currentUserId;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-lg px-3 py-2 ${isMine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-[10px] opacity-70">{timeAgo(msg.createdAt)}</span>
                            {isMine && (
                              <span className="text-[10px] opacity-70">{msg.read ? '✓✓' : '✓'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1"
                  aria-label="Message input"
                />
                <Button onClick={handleSend} disabled={!input.trim()}>
                  Send
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
