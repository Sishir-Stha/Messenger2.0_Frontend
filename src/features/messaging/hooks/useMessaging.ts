import { useCallback, useEffect, useMemo, useState } from 'react';
import { messagingConfig } from '../../../config/messagingConfig';
import { messagingService } from '../services/messagingService';
import { messagingSocketClient } from '../services/messagingSocketClient';
import type { Conversation, Message, User } from '../types';

interface UseMessagingState {
  conversations: Conversation[];
  selectedConversation: Conversation | undefined;
  selectedConversationId: string | null;
  messages: Message[];
  currentUser: User;
  currentUserId: string;
  isConversationsLoading: boolean;
  isMessagesLoading: boolean;
  error: string | null;
  selectConversation: (conversationId: string) => void;
  clearSelectedConversation: () => void;
  startDirectConversation: (userId: string) => Promise<void>;
  sendLocalMessage: (body: string) => Promise<void>;
  forwardLocalMessage: (message: Message, conversationIds: string[]) => Promise<void>;
}

const fallbackCurrentUser: User = {
  id: messagingConfig.currentUserId,
  name: 'You',
  username: messagingConfig.currentUserId,
};

const createPendingMessage = (conversationId: string, senderId: string, body: string): Message => ({
  id: `pending-${Date.now()}`,
  conversationId,
  senderId,
  body,
  createdAt: new Date().toISOString(),
  status: 'sending',
});

const sortConversationsByLastMessage = (conversations: Conversation[]) =>
  [...conversations].sort((first, second) => Date.parse(second.lastMessageAt) - Date.parse(first.lastMessageAt));

const sortMessagesByCreatedAt = (messages: Message[]) =>
  [...messages].sort((first, second) => Date.parse(first.createdAt) - Date.parse(second.createdAt));

const mergeIncomingMessage = (messages: Message[], incomingMessage: Message) => {
  const nextMessages = messages.filter((message) => {
    if (message.id === incomingMessage.id) {
      return false;
    }

    const isMatchingPendingMessage =
      message.id.startsWith('pending-') &&
      message.conversationId === incomingMessage.conversationId &&
      message.senderId === incomingMessage.senderId &&
      message.body === incomingMessage.body;

    return !isMatchingPendingMessage;
  });

  return sortMessagesByCreatedAt([...nextMessages, incomingMessage]);
};

export function useMessaging(): UseMessagingState {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(fallbackCurrentUser);
  const [isConversationsLoading, setIsConversationsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadConversations() {
      try {
        setError(null);
        setIsConversationsLoading(true);
        const [nextCurrentUser, nextConversations] = await Promise.all([
          messagingService.fetchCurrentUser(),
          messagingService.fetchConversations(),
        ]);

        if (isMounted) {
          setCurrentUser(nextCurrentUser);
          setConversations(nextConversations);
        }
      } catch {
        if (isMounted) {
          setError('Unable to load conversations.');
        }
      } finally {
        if (isMounted) {
          setIsConversationsLoading(false);
        }
      }
    }

    void loadConversations();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    const conversationId = selectedConversationId;
    let isMounted = true;

    async function loadMessages() {
      try {
        setError(null);
        setIsMessagesLoading(true);
        const [nextMessages] = await Promise.all([
          messagingService.fetchMessages(conversationId),
          messagingService.markAsRead(conversationId),
        ]);

        if (isMounted) {
          setMessages(nextMessages);
          setConversations((current) =>
            current.map((conversation) =>
              conversation.id === conversationId
                ? { ...conversation, unreadCount: 0 }
                : conversation,
            ),
          );
        }
      } catch {
        if (isMounted) {
          setError('Unable to load messages.');
        }
      } finally {
        if (isMounted) {
          setIsMessagesLoading(false);
        }
      }
    }

    void loadMessages();

    return () => {
      isMounted = false;
    };
  }, [selectedConversationId]);

  const conversationSubscriptionKey = useMemo(
    () => conversations.map((conversation) => conversation.id).sort().join('|'),
    [conversations],
  );

  const handleIncomingSocketMessage = useCallback(
    (incomingMessage: Message) => {
      setConversations((current) =>
        sortConversationsByLastMessage(
          current.map((conversation) => {
            if (conversation.id !== incomingMessage.conversationId) {
              return conversation;
            }

            const isOpenConversation = conversation.id === selectedConversationId;
            const isOwnMessage = incomingMessage.senderId === currentUser.id;

            return {
              ...conversation,
              lastMessagePreview: incomingMessage.body,
              lastMessageAt: incomingMessage.createdAt,
              unreadCount: isOpenConversation || isOwnMessage ? 0 : conversation.unreadCount + 1,
            };
          }),
        ),
      );

      if (incomingMessage.conversationId !== selectedConversationId) {
        return;
      }

      setMessages((current) => mergeIncomingMessage(current, incomingMessage));

      if (incomingMessage.senderId !== currentUser.id) {
        void messagingService.markAsRead(incomingMessage.conversationId, incomingMessage.id);
      }
    },
    [currentUser.id, selectedConversationId],
  );

  useEffect(() => {
    if (isConversationsLoading || !currentUser.id) {
      return undefined;
    }

    let isActive = true;
    let subscriptions: Array<{ unsubscribe: () => void }> = [];

    async function connectAndSubscribe() {
      try {
        await messagingSocketClient.connect(currentUser.id);

        if (!isActive) {
          return;
        }

        subscriptions = conversationSubscriptionKey
          .split('|')
          .filter(Boolean)
          .map((conversationId) =>
            messagingSocketClient.subscribeToConversation(conversationId, handleIncomingSocketMessage),
          );

        subscriptions.push(messagingSocketClient.subscribeToUserQueue(handleIncomingSocketMessage));
      } catch {
        if (isActive) {
          setError('Unable to connect to real-time messaging.');
        }
      }
    }

    void connectAndSubscribe();

    return () => {
      isActive = false;
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, [conversationSubscriptionKey, currentUser.id, handleIncomingSocketMessage, isConversationsLoading]);

  useEffect(
    () => () => {
      void messagingSocketClient.disconnect();
    },
    [],
  );

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId),
    [conversations, selectedConversationId],
  );

  const selectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
  }, []);

  const clearSelectedConversation = useCallback(() => {
    setSelectedConversationId(null);
  }, []);

  const startDirectConversation = useCallback(async (userId: string) => {
    try {
      setError(null);
      const conversation = await messagingService.createDirectConversation(userId);

      setConversations((current) => {
        const existingConversation = current.some((item) => item.id === conversation.id);
        const nextConversations = existingConversation
          ? current.map((item) => (item.id === conversation.id ? conversation : item))
          : [conversation, ...current];

        return sortConversationsByLastMessage(nextConversations);
      });
      setSelectedConversationId(conversation.id);
    } catch (error) {
      setError('Unable to start conversation.');
      throw error;
    }
  }, []);

  const sendMessageToConversation = useCallback(
    async (conversationId: string, body: string) => {
      const trimmedBody = body.trim();

      if (!trimmedBody) {
        return;
      }

      const pendingMessage = createPendingMessage(conversationId, currentUser.id, trimmedBody);
      const isOpenConversation = conversationId === selectedConversationId;

      if (isOpenConversation) {
        setMessages((current) => [...current, pendingMessage]);
      }

      setConversations((current) =>
        sortConversationsByLastMessage(
          current.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  lastMessagePreview: trimmedBody,
                  lastMessageAt: pendingMessage.createdAt,
                  unreadCount: 0,
                }
              : conversation,
          ),
        ),
      );

      try {
        await messagingSocketClient.connect(currentUser.id);
        await messagingSocketClient.sendSocketMessage(
          {
            conversationId,
            body: trimmedBody,
          },
          currentUser.id,
        );
      } catch {
        if (isOpenConversation) {
          setMessages((current) =>
            current.map((message) =>
              message.id === pendingMessage.id ? { ...message, status: 'failed' } : message,
            ),
          );
        }

        setError('Unable to send message.');
      }
    },
    [currentUser.id, selectedConversationId],
  );

  const sendLocalMessage = useCallback(
    async (body: string) => {
      if (!selectedConversationId) {
        return;
      }

      await sendMessageToConversation(selectedConversationId, body);
    },
    [selectedConversationId, sendMessageToConversation],
  );

  const forwardLocalMessage = useCallback(
    async (message: Message, conversationIds: string[]) => {
      if (conversationIds.length === 0) {
        return;
      }

      try {
        const forwardedMessages = await messagingService.forwardMessage(message.id, conversationIds);

        setConversations((current) =>
          current
            .map((conversation) => {
              const forwardedMessage = forwardedMessages.find((item) => item.conversationId === conversation.id);

              if (!forwardedMessage) {
                return conversation;
              }

              return {
                ...conversation,
                lastMessagePreview: forwardedMessage.body,
                lastMessageAt: forwardedMessage.createdAt,
                unreadCount: 0,
              };
            })
            .sort((first, second) => Date.parse(second.lastMessageAt) - Date.parse(first.lastMessageAt)),
        );

        if (selectedConversationId) {
          const forwardedToOpenConversation = forwardedMessages.filter(
            (forwardedMessage) => forwardedMessage.conversationId === selectedConversationId,
          );

          if (forwardedToOpenConversation.length > 0) {
            setMessages((current) => [...current, ...forwardedToOpenConversation]);
          }
        }
      } catch (error) {
        setError('Unable to forward message.');
        throw error;
      }
    },
    [selectedConversationId],
  );

  return {
    conversations,
    selectedConversation,
    selectedConversationId,
    messages,
    currentUser,
    currentUserId: currentUser.id,
    isConversationsLoading,
    isMessagesLoading,
    error,
    selectConversation,
    clearSelectedConversation,
    startDirectConversation,
    sendLocalMessage,
    forwardLocalMessage,
  };
}
