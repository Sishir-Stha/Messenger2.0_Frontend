import { messagingConfig } from '../../../config/messagingConfig';
import { authSession } from '../../auth/authSession';
import type { Conversation, ConversationType, Message, MessageStatus, SendMessagePayload, User } from '../types';

interface ApiUser {
  id: string;
  name: string;
  username: string | null;
  email: string | null;
  avatarUrl: string | null;
  isOnline: boolean;
  lastActiveAt: string | null;
}

interface ApiConversation {
  id: string;
  type: ConversationType;
  name: string;
  participants: ApiUser[];
  avatarUrl: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  isOnline: boolean;
}

interface ApiMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  status: Exclude<MessageStatus, 'sending' | 'failed'>;
}

const apiBaseUrl = messagingConfig.restApiBaseUrl.replace(/\/+$/, '');

const normalizeDateValue = (value: string | null | undefined) => value ?? new Date(0).toISOString();

const toTimestamp = (value: string) => {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const request = async <T>(path: string, init: RequestInit = {}, userId = authSession.getRequestUserId()): Promise<T> => {
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('X-User-Id', userId);

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorBody = (await response.json()) as { message?: string; error?: string };
      message = errorBody.message ?? errorBody.error ?? message;
    } catch {
      // Keep the HTTP status message when the server does not return JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

const normalizeUser = (user: ApiUser): User => ({
  id: user.id,
  name: user.name,
  username: user.username ?? undefined,
  email: user.email ?? undefined,
  avatarUrl: user.avatarUrl ?? undefined,
  isOnline: user.isOnline,
  lastActiveAt: user.lastActiveAt ?? undefined,
});

const normalizeConversation = (conversation: ApiConversation): Conversation => ({
  id: conversation.id,
  type: conversation.type,
  name: conversation.name,
  participants: conversation.participants.map(normalizeUser),
  avatarUrl: conversation.avatarUrl ?? undefined,
  lastMessagePreview: conversation.lastMessagePreview ?? '',
  lastMessageAt: normalizeDateValue(conversation.lastMessageAt),
  unreadCount: conversation.unreadCount,
  isOnline: conversation.isOnline,
});

const normalizeMessage = (message: ApiMessage): Message => ({
  id: message.id,
  conversationId: message.conversationId,
  senderId: message.senderId,
  body: message.body,
  createdAt: message.createdAt,
  status: message.status,
});

const sortConversations = (conversations: Conversation[]) =>
  [...conversations].sort((first, second) => toTimestamp(second.lastMessageAt) - toTimestamp(first.lastMessageAt));

export const messagingService = {
  async login(email: string, password: string): Promise<User> {
    return normalizeUser(await request<ApiUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }));
  },

  async fetchCurrentUser(userId?: string): Promise<User> {
    return normalizeUser(await request<ApiUser>('/me', {}, userId));
  },

  async searchUsers(query = ''): Promise<User[]> {
    const users = await request<ApiUser[]>(`/users/search?q=${encodeURIComponent(query)}`);
    return users.map(normalizeUser);
  },

  async fetchConversations(): Promise<Conversation[]> {
    const conversations = await request<ApiConversation[]>('/conversations');
    return sortConversations(conversations.map(normalizeConversation));
  },

  async createDirectConversation(userId: string): Promise<Conversation> {
    const conversation = await request<ApiConversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({
        type: 'direct',
        participantIds: [userId],
      }),
    });

    return normalizeConversation(conversation);
  },

  async fetchMessages(conversationId: string): Promise<Message[]> {
    const messages = await request<ApiMessage[]>(
      `/conversations/${encodeURIComponent(conversationId)}/messages`,
    );
    return messages.map(normalizeMessage);
  },

  async sendMessage(payload: SendMessagePayload): Promise<Message> {
    const message = await request<ApiMessage>(
      `/conversations/${encodeURIComponent(payload.conversationId)}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );

    return normalizeMessage(message);
  },

  async markAsRead(conversationId: string, messageId?: string): Promise<void> {
    await request(`/conversations/${encodeURIComponent(conversationId)}/read`, {
      method: 'POST',
      body: JSON.stringify({ conversationId, messageId }),
    });
  },

  async forwardMessage(messageId: string, conversationIds: string[]): Promise<Message[]> {
    const messages = await request<ApiMessage[]>(`/messages/${encodeURIComponent(messageId)}/forward`, {
      method: 'POST',
      body: JSON.stringify({ conversationIds }),
    });

    return messages.map(normalizeMessage);
  },
};
