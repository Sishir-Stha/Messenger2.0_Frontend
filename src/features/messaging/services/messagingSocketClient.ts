import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import { messagingConfig } from '../../../config/messagingConfig';
import { authSession } from '../../auth/authSession';
import type { Message, MessagingSocketSubscription, SendMessagePayload } from '../types';

type MessageHandler = (message: Message) => void;
type TypingHandler = (conversationId: string, userId: string) => void;
type ReadReceiptHandler = (conversationId: string, messageId: string) => void;

let client: Client | null = null;
let connectedUserId: string | null = null;
let connectPromise: Promise<void> | null = null;

const shouldLogSocket = import.meta.env.DEV;

const logSocket = (message: string, details?: unknown) => {
  if (!shouldLogSocket) {
    return;
  }

  if (details === undefined) {
    console.info(`[messaging:ws] ${message}`);
    return;
  }

  console.info(`[messaging:ws] ${message}`, details);
};

const logSocketError = (message: string, details?: unknown) => {
  console.error(`[messaging:ws] ${message}`, details);
};

const withUserId = (endpoint: string, userId: string) => {
  const url = new URL(endpoint);
  url.searchParams.set('userId', userId);
  return url.toString();
};

const appDestination = (destination: string) =>
  `${messagingConfig.stompAppPrefix.replace(/\/+$/, '')}/${destination.replace(/^\/+/, '')}`;

const parseMessage = (message: IMessage): Message => JSON.parse(message.body) as Message;

const subscribe = (
  destination: string,
  handler: (message: IMessage) => void,
): MessagingSocketSubscription => {
  if (!client?.connected) {
    logSocket('subscribe skipped because STOMP is not connected', destination);
    return { unsubscribe: () => undefined };
  }

  const subscription: StompSubscription = client.subscribe(destination, handler);
  logSocket('subscribed', destination);

  return {
    unsubscribe: () => {
      subscription.unsubscribe();
      logSocket('unsubscribed', destination);
    },
  };
};

export const messagingSocketClient = {
  async connect(userId = authSession.getRequestUserId()) {
    if (client?.connected && connectedUserId === userId) {
      return;
    }

    if (connectPromise && connectedUserId === userId) {
      return connectPromise;
    }

    if (client && connectedUserId !== userId) {
      await this.disconnect();
    }

    connectedUserId = userId;
    logSocket('connecting', { endpoint: messagingConfig.webSocketEndpoint, userId });

    connectPromise = new Promise<void>((resolve, reject) => {
      let settled = false;

      const resolveOnce = () => {
        if (settled) {
          return;
        }

        settled = true;
        resolve();
      };

      const rejectOnce = (error: unknown) => {
        if (settled) {
          return;
        }

        settled = true;
        reject(error);
      };

      client = new Client({
        webSocketFactory: () => new WebSocket(withUserId(messagingConfig.webSocketEndpoint, userId)),
        connectHeaders: {
          'X-User-Id': userId,
        },
        reconnectDelay: 3000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: (message) => {
          if (shouldLogSocket) {
            console.debug(`[stomp] ${message}`);
          }
        },
        onConnect: () => {
          logSocket('connected', { userId });
          resolveOnce();
        },
        onDisconnect: () => {
          logSocket('disconnected', { userId });
        },
        onWebSocketClose: (event) => {
          logSocket('websocket closed', { code: event.code, reason: event.reason });
          connectPromise = null;
        },
        onWebSocketError: (event) => {
          logSocketError('websocket error', event);
          rejectOnce(event);
        },
        onStompError: (frame) => {
          logSocketError('broker error', frame.headers.message ?? frame.body);
          rejectOnce(new Error(frame.headers.message ?? 'STOMP broker error'));
        },
      });

      client.activate();
    }).finally(() => {
      connectPromise = null;
    });

    return connectPromise;
  },

  async disconnect() {
    if (!client) {
      connectedUserId = null;
      return;
    }

    const activeClient = client;
    client = null;
    connectedUserId = null;
    connectPromise = null;
    logSocket('disconnecting');
    await activeClient.deactivate();
  },

  isConnected() {
    return Boolean(client?.connected);
  },

  subscribeToConversation(
    conversationId: string,
    onMessageReceived: MessageHandler,
  ): MessagingSocketSubscription {
    const destination = `${messagingConfig.roomTopicDestination}/${conversationId}`;
    return subscribe(destination, (frame) => {
      const message = parseMessage(frame);
      logSocket('message received', { destination, messageId: message.id });
      onMessageReceived(message);
    });
  },

  subscribeToUserQueue(onMessageReceived: MessageHandler): MessagingSocketSubscription {
    const destination = `/user${messagingConfig.userQueueDestination}`;
    return subscribe(destination, (frame) => {
      const message = parseMessage(frame);
      logSocket('user queue message received', { destination, messageId: message.id });
      onMessageReceived(message);
    });
  },

  async sendSocketMessage(payload: SendMessagePayload, userId = authSession.getRequestUserId()) {
    await this.connect(userId);

    if (!client?.connected) {
      throw new Error('STOMP client is not connected.');
    }

    const destination = appDestination('/messages.send');
    client.publish({
      destination,
      body: JSON.stringify(payload),
    });
    logSocket('message sent', { destination, conversationId: payload.conversationId });
  },

  onMessageReceived(handler: MessageHandler): MessagingSocketSubscription {
    void handler;
    return { unsubscribe: () => undefined };
  },

  onTypingReceived(handler: TypingHandler): MessagingSocketSubscription {
    void handler;
    return { unsubscribe: () => undefined };
  },

  onReadReceiptReceived(handler: ReadReceiptHandler): MessagingSocketSubscription {
    void handler;
    return { unsubscribe: () => undefined };
  },
};
