import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Message, User } from '../types';

interface MessageListProps {
  messages: Message[];
  participants: User[];
  currentUserId: string;
  isLoading: boolean;
  error: string | null;
  onReplyMessage: (message: Message) => void;
  onForwardMessage: (message: Message) => void;
}

export function MessageList({
  messages,
  participants,
  currentUserId,
  isLoading,
  error,
  onReplyMessage,
  onForwardMessage,
}: MessageListProps) {
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  if (isLoading) {
    return <div className="message-list__state">Loading messages...</div>;
  }

  if (error) {
    return <div className="message-list__state message-list__state--error">{error}</div>;
  }

  if (messages.length === 0) {
    return <div className="message-list__state">No messages yet.</div>;
  }

  return (
    <div className="message-list" role="log" aria-live="polite" aria-label="Message history">
      {messages.map((message, index) => {
        const previousMessage = messages[index - 1];
        const shouldShowTime =
          !previousMessage ||
          Date.parse(message.createdAt) - Date.parse(previousMessage.createdAt) >= 30 * 60_000;

        return (
          <div className="message-entry" key={message.id}>
            {shouldShowTime ? (
              <time className="message-time-separator" dateTime={message.createdAt}>
                {new Intl.DateTimeFormat(undefined, {
                  hour: 'numeric',
                  minute: '2-digit',
                }).format(new Date(message.createdAt))}
              </time>
            ) : null}
            <MessageBubble
              message={message}
              sender={participants.find((participant) => participant.id === message.senderId)}
              isOwnMessage={message.senderId === currentUserId}
              onReplyMessage={onReplyMessage}
              onForwardMessage={onForwardMessage}
            />
          </div>
        );
      })}
      <div ref={endOfMessagesRef} />
    </div>
  );
}
