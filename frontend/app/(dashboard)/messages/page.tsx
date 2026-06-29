'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { messagingApi, Conversation, Message } from '../../../lib/api/messaging.api';
import { useAuthStore } from '../../../stores/auth.store';
import { useNotificationStore } from '../../../stores/notification.store';
import { useMessagingSocket } from '../../../hooks/useMessagingSocket';

// ── helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function groupByDate(messages: Message[]): { label: string; messages: Message[] }[] {
  const groups: Record<string, Message[]> = {};
  for (const m of messages) {
    const label = formatDateLabel(m.createdAt);
    (groups[label] ??= []).push(m);
  }
  return Object.entries(groups).map(([label, msgs]) => ({ label, messages: msgs }));
}

function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

// ── ConversationRow ───────────────────────────────────────────────────────────

function ConversationRow({
  conv,
  active,
  onClick,
}: {
  conv: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-accent transition-colors border-b border-border ${
        active ? 'bg-primary/10' : ''
      }`}
      aria-pressed={active}
    >
      <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
        {initials(conv.otherParty.firstName, conv.otherParty.lastName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="text-sm font-medium truncate">
            {conv.otherParty.firstName} {conv.otherParty.lastName}
          </p>
          {conv.lastMessageAt && (
            <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
              {timeAgo(conv.lastMessageAt)}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-mono">{conv.shipmentTrackingNumber}</p>
        {conv.lastMessage && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {conv.lastMessage.slice(0, 60)}
            {conv.lastMessage.length > 60 ? '…' : ''}
          </p>
        )}
      </div>
      {conv.unreadCount > 0 && (
        <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-1">
          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
        </span>
      )}
    </button>
  );
}

// ── MessageBubble ─────────────────────────────────────────────────────────────

function MessageBubble({ msg, isSent }: { msg: Message; isSent: boolean }) {
  return (
    <div className={`flex items-end gap-2 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`max-w-[72%] rounded-2xl px-3 py-2 text-sm ${
          isSent
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted text-foreground rounded-bl-none'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{msg.body}</p>
        <div className={`flex items-center gap-1 mt-1 ${isSent ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] opacity-70">
            {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isSent && msg.readAt && (
            <span className="text-[10px] opacity-70">· Read</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MessageSkeleton ───────────────────────────────────────────────────────────

function MessageSkeleton() {
  return (
    <div className="flex-1 p-4 space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <div className="h-10 rounded-2xl bg-muted animate-pulse" style={{ width: `${120 + (i % 3) * 60}px` }} />
        </div>
      ))}
    </div>
  );
}

// ── MessagesPage ──────────────────────────────────────────────────────────────

function MessagesContent() {
  const { user } = useAuthStore();
  const { clearMessageUnread } = useNotificationStore();
  const searchParams = useSearchParams();
  const preselect = searchParams.get('conversationId');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convsLoading, setConvsLoading] = useState(true);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  // Mobile: show thread when a conversation is selected
  const [showThread, setShowThread] = useState(false);

  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load conversations
  useEffect(() => {
    messagingApi.listConversations()
      .then((data) => {
        setConversations(data);
        // Preselect from URL param or first conversation
        const target = preselect
          ? data.find((c) => c.id === preselect) ?? data[0]
          : data[0];
        if (target) setActiveConv(target);
      })
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setConvsLoading(false));
  }, [preselect]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConv) return;
    setMsgsLoading(true);
    setMessages([]);
    messagingApi.listMessages(activeConv.id)
      .then((res) => setMessages(res.data))
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setMsgsLoading(false));
    // Clear global message badge when opening messages
    clearMessageUnread();
  }, [activeConv, clearMessageUnread]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time: new message for active conversation
  const handleIncoming = useCallback((msg: Message & { conversationId: string }) => {
    setMessages((prev) => [...prev, msg]);
    // Update last message preview in the list
    setConversations((prev) =>
      prev.map((c) =>
        c.id === msg.conversationId
          ? { ...c, lastMessage: msg.body, lastMessageAt: msg.createdAt }
          : c,
      ),
    );
  }, []);

  useMessagingSocket({ activeConversationId: activeConv?.id, onMessage: handleIncoming });

  const handleSelectConv = (conv: Conversation) => {
    setActiveConv(conv);
    setShowThread(true);
    // Zero out unread badge on this row locally
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c)),
    );
  };

  const handleSend = async () => {
    if (!activeConv || !draft.trim() || sending) return;
    const body = draft.trim();
    setDraft('');
    setSending(true);
    try {
      const msg = await messagingApi.sendMessage(activeConv.id, body);
      setMessages((prev) => [...prev, msg]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id ? { ...c, lastMessage: body, lastMessageAt: msg.createdAt } : c,
        ),
      );
    } catch {
      toast.error('Failed to send message');
      setDraft(body); // restore draft on failure
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > 2000) return;
    setDraft(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const groups = groupByDate(messages);
  const MAX = 2000;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-screen">
      {/* ── Conversation list ── */}
      <aside
        className={`w-full md:w-80 lg:w-96 border-r border-border bg-card flex flex-col flex-shrink-0 ${
          showThread ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="h-14 flex items-center px-4 border-b border-border">
          <h1 className="text-base font-semibold">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                    <div className="h-2.5 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center px-6 py-12">
              No conversations yet. Conversations start automatically when a bid is accepted.
            </p>
          ) : (
            conversations.map((conv) => (
              <ConversationRow
                key={conv.id}
                conv={conv}
                active={activeConv?.id === conv.id}
                onClick={() => handleSelectConv(conv)}
              />
            ))
          )}
        </div>
      </aside>

      {/* ── Thread panel ── */}
      <div
        className={`flex-1 flex flex-col bg-background ${
          showThread ? 'flex' : 'hidden md:flex'
        }`}
      >
        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Select a conversation to start messaging</p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="h-14 flex items-center gap-3 px-4 border-b border-border bg-card flex-shrink-0">
              {/* Mobile back button */}
              <button
                className="md:hidden text-muted-foreground hover:text-foreground mr-1"
                onClick={() => setShowThread(false)}
                aria-label="Back to conversations"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                {initials(activeConv.otherParty.firstName, activeConv.otherParty.lastName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {activeConv.otherParty.firstName} {activeConv.otherParty.lastName}
                </p>
                <Link
                  href={`/shipments/${activeConv.shipmentId}`}
                  className="text-xs text-primary hover:underline font-mono"
                >
                  {activeConv.shipmentTrackingNumber}
                </Link>
              </div>
              <Link
                href={`/shipments/${activeConv.shipmentId}`}
                className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1 transition-colors whitespace-nowrap"
              >
                View Shipment
              </Link>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4" aria-live="polite" aria-label="Messages">
              {msgsLoading ? (
                <MessageSkeleton />
              ) : messages.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No messages yet. Say hello!
                </p>
              ) : (
                groups.map(({ label, messages: msgs }) => (
                  <div key={label}>
                    <div className="flex items-center gap-2 my-4">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <div className="space-y-2">
                      {msgs.map((msg) => (
                        <MessageBubble
                          key={msg.id}
                          msg={msg}
                          isSent={msg.senderId === user?.id}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="border-t border-border bg-card px-4 py-3 flex-shrink-0">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={handleDraftChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message…"
                    rows={1}
                    disabled={sending}
                    aria-label="Message input"
                    className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 overflow-hidden"
                    style={{ minHeight: '38px', maxHeight: '120px' }}
                  />
                  <span className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">
                    {draft.length}/{MAX}
                  </span>
                </div>
                <button
                  onClick={handleSend}
                  disabled={sending || !draft.trim()}
                  aria-label="Send message"
                  className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesContent />
    </Suspense>
  );
}
