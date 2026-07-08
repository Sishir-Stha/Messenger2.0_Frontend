export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type ConversationType = 'direct' | 'group';

export interface User {
  id: string;
  name: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastActiveAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  status: MessageStatus;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string;
  participants: User[];
  avatarUrl?: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  isOnline?: boolean;
}

export interface SendMessagePayload {
  conversationId: string;
  body: string;
}

export interface MessagingSocketSubscription {
  unsubscribe: () => void;
}
