import { Copy, Forward, MoreVertical, Reply, SmilePlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from './Avatar';
import type { Message, User } from '../types';

interface MessageBubbleProps {
  message: Message;
  sender: User | undefined;
  isOwnMessage: boolean;
  onReplyMessage: (message: Message) => void;
  onForwardMessage: (message: Message) => void;
}

const formatMessageTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));

const reactionEmojis = ['❤️', '😂', '😮', '😢', '😡', '👍', '🔥', '🎉'];

export function MessageBubble({
  message,
  sender,
  isOwnMessage,
  onReplyMessage,
  onForwardMessage,
}: MessageBubbleProps) {
  const [reaction, setReaction] = useState<string | null>(null);
  const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messageActionsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isReactionPickerOpen && !isMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        messageActionsRef.current &&
        event.target instanceof Node &&
        !messageActionsRef.current.contains(event.target)
      ) {
        setIsReactionPickerOpen(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isReactionPickerOpen, isMenuOpen]);

  const copyMessage = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message.body);
      }

      setIsMenuOpen(false);
    } catch {
      setIsMenuOpen(false);
    }
  };

  return (
    <article className="message-row" data-own={isOwnMessage}>
      <div className="message-cluster">
        {!isOwnMessage && sender ? (
          <span className="message-sender-avatar">
            <Avatar name={sender.name} imageUrl={sender.avatarUrl} isOnline={sender.isOnline} size="sm" />
          </span>
        ) : null}
        <div className="message-bubble-wrap">
          <div className="message-bubble">
            <p>{message.body}</p>
          </div>
          {reaction ? (
            <button
              className="message-reaction"
              type="button"
              aria-label="Remove reaction"
              onClick={() => setReaction(null)}
            >
              {reaction}
            </button>
          ) : null}
          </div>

        <div className="message-actions" ref={messageActionsRef} aria-label="Message actions">
          {isReactionPickerOpen ? (
            <div className="message-reaction-picker" role="menu" aria-label="Choose reaction">
              {reactionEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  role="menuitem"
                  aria-label={`React with ${emoji}`}
                  onClick={() => {
                    setReaction((current) => (current === emoji ? null : emoji));
                    setIsReactionPickerOpen(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          ) : null}
          <button
            className="message-action-button"
            type="button"
            aria-label="React to message"
            aria-pressed={Boolean(reaction)}
            aria-expanded={isReactionPickerOpen}
            onClick={() => {
              setIsReactionPickerOpen((current) => !current);
              setIsMenuOpen(false);
            }}
          >
            <SmilePlus size={16} aria-hidden="true" />
          </button>
          <button
            className="message-action-button"
            type="button"
            aria-label="Reply to message"
            onClick={() => {
              setIsReactionPickerOpen(false);
              onReplyMessage(message);
            }}
          >
            <Reply size={16} aria-hidden="true" />
          </button>
          <div className="message-more">
            <button
              className="message-action-button"
              type="button"
              aria-label="More message actions"
              aria-expanded={isMenuOpen}
              onClick={() => {
                setIsMenuOpen((current) => !current);
                setIsReactionPickerOpen(false);
              }}
            >
              <MoreVertical size={16} aria-hidden="true" />
            </button>
            {isMenuOpen ? (
              <div className="message-action-menu" role="menu">
                <time className="message-action-menu__time" dateTime={message.createdAt}>
                  {formatMessageTime(message.createdAt)}
                </time>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onForwardMessage(message);
                  }}
                >
                  <Forward size={15} aria-hidden="true" />
                  <span>Forward</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    void copyMessage();
                  }}
                >
                  <Copy size={15} aria-hidden="true" />
                  <span>Copy</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
