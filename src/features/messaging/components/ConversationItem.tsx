import { Avatar } from './Avatar';
import type { Conversation } from '../types';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversationId: string) => void;
}

const formatRelativeTime = (value: string) => {
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 60_000));

  if (elapsedMinutes < 1) {
    return 'now';
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);

  if (elapsedHours < 24) {
    return `${elapsedHours}h`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);

  if (elapsedDays < 7) {
    return `${elapsedDays}d`;
  }

  const elapsedWeeks = Math.floor(elapsedDays / 7);

  if (elapsedWeeks < 5) {
    return `${elapsedWeeks}w`;
  }

  const elapsedMonths = Math.floor(elapsedDays / 30);

  if (elapsedMonths < 12) {
    return `${elapsedMonths}mo`;
  }

  return `${Math.floor(elapsedDays / 365)}y`;
};

export function ConversationItem({ conversation, isSelected, onSelect }: ConversationItemProps) {
  return (
    <button
      className="conversation-item"
      data-selected={isSelected}
      type="button"
      onClick={() => onSelect(conversation.id)}
      aria-pressed={isSelected}
    >
      <Avatar name={conversation.name} imageUrl={conversation.avatarUrl} isOnline={conversation.isOnline} />
      <span className="conversation-item__content">
        <span className="conversation-item__topline">
          <span className="conversation-item__name">{conversation.name}</span>
        </span>
        <span className="conversation-item__bottomline">
          <span className="conversation-item__preview">
            <span className="conversation-item__preview-text">{conversation.lastMessagePreview}</span>
            <time className="conversation-item__time" dateTime={conversation.lastMessageAt}>
              · {formatRelativeTime(conversation.lastMessageAt)}
            </time>
          </span>
          {conversation.unreadCount > 0 ? (
            <span className="conversation-item__badge" aria-label={`${conversation.unreadCount} unread messages`}>
              {conversation.unreadCount}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}
