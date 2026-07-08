import { ChevronDown, LogOut, Moon, Search, SquarePen, Sun } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConversationItem } from './ConversationItem';
import type { Conversation } from '../types';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  isLoading: boolean;
  accountName: string;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
  onOpenNewMessage: () => void;
  onSelectConversation: (conversationId: string) => void;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  isLoading,
  accountName,
  themeMode,
  onToggleTheme,
  onLogout,
  onOpenNewMessage,
  onSelectConversation,
}: ConversationListProps) {
  const [query, setQuery] = useState('');

  const filteredConversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return conversations;
    }

    return conversations.filter((conversation) =>
      [conversation.name, conversation.lastMessagePreview].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [conversations, query]);

  return (
    <aside className="conversation-panel" aria-label="Conversations">
      <div className="conversation-panel__header">
        <button className="account-selector" type="button" aria-label="Open account menu">
          <span>{accountName}</span>
          <ChevronDown size={14} aria-hidden="true" />
        </button>
        <div className="conversation-panel__actions">
          <button
            className="header-icon-button"
            type="button"
            onClick={onToggleTheme}
            aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {themeMode === 'dark' ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
          </button>
          <button className="header-icon-button" type="button" onClick={onOpenNewMessage} aria-label="New message">
            <SquarePen size={21} aria-hidden="true" />
          </button>
          <button className="header-icon-button" type="button" onClick={onLogout} aria-label="Log out">
            <LogOut size={19} aria-hidden="true" />
          </button>
        </div>
      </div>

      <label className="conversation-search">
        <Search size={18} aria-hidden="true" />
        <span className="sr-only">Search conversations</span>
        <input
          type="search"
          value={query}
          placeholder="Search"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className="conversation-list">
        {isLoading ? (
          <div className="conversation-list__status">Loading conversations...</div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={conversation.id === selectedConversationId}
              onSelect={onSelectConversation}
            />
          ))
        ) : (
          <div className="conversation-list__status">No conversations found.</div>
        )}
      </div>
    </aside>
  );
}
