import type { Conversation, Message, User } from '../types';

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

export const currentUser: User = {
  id: 'user-current',
  name: 'You',
  username: 'sishirshrestha0',
  isOnline: true,
};

export const mockUsers: User[] = [
  currentUser,
  {
    id: 'user-aanya',
    name: 'Aanya Sharma',
    username: 'aanya_sharma',
    isOnline: true,
  },
  {
    id: 'user-bibek',
    name: 'Bibek K.C.',
    username: 'bibek_kc',
    isOnline: false,
    lastActiveAt: minutesAgo(22),
  },
  {
    id: 'user-maya',
    name: 'Maya Gurung',
    username: 'maya_gurung',
    isOnline: true,
  },
  {
    id: 'user-product',
    name: 'Product Team',
    username: 'product_team',
    isOnline: false,
    lastActiveAt: minutesAgo(90),
  },
];

export const mockConversations: Conversation[] = [
  {
    id: 'conversation-aanya',
    type: 'direct',
    name: 'Aanya Sharma',
    participants: [currentUser, mockUsers[1]],
    lastMessagePreview: 'Can you send the latest mockup?',
    lastMessageAt: minutesAgo(4),
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: 'conversation-bibek',
    type: 'direct',
    name: 'Bibek K.C.',
    participants: [currentUser, mockUsers[2]],
    lastMessagePreview: 'I pushed the API contract changes.',
    lastMessageAt: minutesAgo(38),
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'conversation-maya',
    type: 'direct',
    name: 'Maya Gurung',
    participants: [currentUser, mockUsers[3]],
    lastMessagePreview: 'Let me know once the frontend route is ready.',
    lastMessageAt: minutesAgo(75),
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: 'conversation-product',
    type: 'group',
    name: 'Product Team',
    participants: [currentUser, mockUsers[1], mockUsers[2], mockUsers[3], mockUsers[4]],
    lastMessagePreview: 'Sprint review is moved to 4:00 PM.',
    lastMessageAt: minutesAgo(180),
    unreadCount: 0,
    isOnline: false,
  },
];

export const mockMessagesByConversation: Record<string, Message[]> = {
  'conversation-aanya': [
    {
      id: 'message-aanya-1',
      conversationId: 'conversation-aanya',
      senderId: 'user-aanya',
      body: 'Hey, did you get a chance to review the chat layout?',
      createdAt: minutesAgo(18),
      status: 'read',
    },
    {
      id: 'message-aanya-2',
      conversationId: 'conversation-aanya',
      senderId: 'user-current',
      body: 'Yes. I am simplifying the desktop view and keeping mobile focused on one panel at a time.',
      createdAt: minutesAgo(15),
      status: 'read',
    },
    {
      id: 'message-aanya-3',
      conversationId: 'conversation-aanya',
      senderId: 'user-aanya',
      body: 'Nice. Can you send the latest mockup?',
      createdAt: minutesAgo(4),
      status: 'delivered',
    },
  ],
  'conversation-bibek': [
    {
      id: 'message-bibek-1',
      conversationId: 'conversation-bibek',
      senderId: 'user-bibek',
      body: 'I pushed the API contract changes.',
      createdAt: minutesAgo(42),
      status: 'read',
    },
    {
      id: 'message-bibek-2',
      conversationId: 'conversation-bibek',
      senderId: 'user-current',
      body: 'Good. I will keep the frontend service layer clean so the real endpoints can drop in later.',
      createdAt: minutesAgo(38),
      status: 'delivered',
    },
  ],
  'conversation-maya': [
    {
      id: 'message-maya-1',
      conversationId: 'conversation-maya',
      senderId: 'user-maya',
      body: 'Let me know once the frontend route is ready.',
      createdAt: minutesAgo(75),
      status: 'sent',
    },
  ],
  'conversation-product': [
    {
      id: 'message-product-1',
      conversationId: 'conversation-product',
      senderId: 'user-product',
      body: 'Sprint review is moved to 4:00 PM.',
      createdAt: minutesAgo(180),
      status: 'read',
    },
    {
      id: 'message-product-2',
      conversationId: 'conversation-product',
      senderId: 'user-current',
      body: 'Thanks, I will update the calendar invite.',
      createdAt: minutesAgo(172),
      status: 'read',
    },
  ],
};
