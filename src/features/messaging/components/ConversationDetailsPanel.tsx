import { Bell, ChevronRight, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from './Avatar';
import type { Conversation } from '../types';

interface ConversationDetailsPanelProps {
  conversation: Conversation;
  currentUserId: string;
  themeMode: 'light' | 'dark';
  onClose: () => void;
  onToggleTheme: () => void;
}

const getHandle = (name: string, username?: string) =>
  username ? `@${username}` : `@${name.toLowerCase().replace(/\s+/g, '_')}`;

export function ConversationDetailsPanel({
  conversation,
  currentUserId,
  themeMode,
  onClose,
  onToggleTheme,
}: ConversationDetailsPanelProps) {
  const [isMuted, setIsMuted] = useState(false);
  const members = conversation.participants.filter((participant) => participant.id !== currentUserId);

  return (
    <aside className="details-panel" aria-label="Conversation details">
      <header className="details-panel__header">
        <h2>Details</h2>
        <button className="icon-button details-panel__close" type="button" onClick={onClose} aria-label="Close details">
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <section className="details-panel__section details-panel__section--compact">
        <div className="details-panel__setting">
          <span className="details-panel__setting-icon">
            <Bell size={18} aria-hidden="true" />
          </span>
          <span>Mute messages</span>
          <button
            className="switch"
            type="button"
            role="switch"
            aria-checked={isMuted}
            onClick={() => setIsMuted((current) => !current)}
          >
            <span />
          </button>
        </div>
        <div className="details-panel__setting">
          <span className="details-panel__setting-icon">
            {themeMode === 'dark' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
          </span>
          <span>Dark mode</span>
          <button
            className="switch"
            type="button"
            role="switch"
            aria-checked={themeMode === 'dark'}
            onClick={onToggleTheme}
          >
            <span />
          </button>
        </div>
      </section>

      <section className="details-panel__section">
        <h3>Members</h3>
        <div className="details-panel__members">
          {members.map((member) => (
            <div className="member-row" key={member.id}>
              <Avatar name={member.name} imageUrl={member.avatarUrl} isOnline={member.isOnline} />
              <div>
                <p>{member.name}</p>
                <span>{getHandle(member.name, member.username)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <nav className="details-panel__actions" aria-label="Conversation management">
        <button type="button">
          <span>Nicknames</span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
        <button type="button">
          <span>Block</span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
        <button className="details-panel__danger" type="button">
          <span>Report</span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
        <button className="details-panel__danger" type="button">
          <span>Delete chat</span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </nav>
    </aside>
  );
}
