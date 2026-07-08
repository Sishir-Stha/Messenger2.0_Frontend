import { Info, Phone, Video } from 'lucide-react';
import { Avatar } from './Avatar';
import type { Conversation } from '../types';

interface ChatHeaderProps {
  conversation: Conversation;
  isDetailsOpen: boolean;
  onToggleDetails: () => void;
}

const getPresenceText = (conversation: Conversation) => {
  if (conversation.isOnline) {
    return 'Active now';
  }

  const lastActiveUser = conversation.participants.find((participant) => participant.lastActiveAt);

  if (!lastActiveUser?.lastActiveAt) {
    return 'Offline';
  }

  return `Last active ${new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(lastActiveUser.lastActiveAt))}`;
};

const getSubtitleText = (conversation: Conversation) => {
  const matchingParticipant = conversation.participants.find((participant) => participant.name === conversation.name);

  return matchingParticipant?.username ?? getPresenceText(conversation);
};

export function ChatHeader({ conversation, isDetailsOpen, onToggleDetails }: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <Avatar name={conversation.name} imageUrl={conversation.avatarUrl} isOnline={conversation.isOnline} />

      <div className="chat-header__identity">
        <h2>{conversation.name}</h2>
        <p>{getSubtitleText(conversation)}</p>
      </div>

      <div className="chat-header__actions" aria-label="Conversation actions">
        <button className="icon-button" type="button" aria-label="Start voice call">
          <Phone size={18} aria-hidden="true" />
        </button>
        <button className="icon-button" type="button" aria-label="Start video call">
          <Video size={18} aria-hidden="true" />
        </button>
        <button
          className="icon-button"
          type="button"
          aria-label="Conversation info"
          aria-pressed={isDetailsOpen}
          data-active={isDetailsOpen}
          onClick={onToggleDetails}
        >
          <Info size={18} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
