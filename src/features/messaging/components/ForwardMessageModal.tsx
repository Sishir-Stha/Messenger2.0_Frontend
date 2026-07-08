import { Check, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Avatar } from './Avatar';
import type { Conversation, Message } from '../types';

interface ForwardMessageModalProps {
  message: Message;
  conversations: Conversation[];
  currentConversationId: string;
  currentUserId: string;
  onClose: () => void;
  onForwardMessage: (message: Message, conversationIds: string[]) => Promise<void>;
}

const getSubtitle = (conversation: Conversation, currentUserId: string) => {
  const otherParticipant = conversation.participants.find((participant) => participant.id !== currentUserId);

  return otherParticipant?.username ?? conversation.lastMessagePreview;
};

export function ForwardMessageModal({
  message,
  conversations,
  currentConversationId,
  currentUserId,
  onClose,
  onForwardMessage,
}: ForwardMessageModalProps) {
  const [query, setQuery] = useState('');
  const [selectedConversationIds, setSelectedConversationIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  const filteredConversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return conversations
      .filter((conversation) => conversation.id !== currentConversationId)
      .filter((conversation) => {
        if (!normalizedQuery) {
          return true;
        }

        return [conversation.name, getSubtitle(conversation, currentUserId)].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );
      });
  }, [conversations, currentConversationId, currentUserId, query]);

  const toggleConversation = (conversationId: string) => {
    setSelectedConversationIds((current) =>
      current.includes(conversationId)
        ? current.filter((id) => id !== conversationId)
        : [...current, conversationId],
    );
  };

  const sendForward = async () => {
    if (selectedConversationIds.length === 0 || isSending) {
      return;
    }

    setIsSending(true);

    try {
      await onForwardMessage(message, selectedConversationIds);
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="forward-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="forward-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="forward-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="forward-modal__header">
          <h2 id="forward-modal-title">Forward</h2>
          <button className="forward-modal__close" type="button" onClick={onClose} aria-label="Close forward dialog">
            <X size={22} aria-hidden="true" />
          </button>
        </header>

        <label className="forward-modal__search">
          <span>To:</span>
          <input
            value={query}
            type="search"
            placeholder="Search..."
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />
        </label>

        <div className="forward-modal__list">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => {
              const isSelected = selectedConversationIds.includes(conversation.id);

              return (
                <button
                  className="forward-target"
                  type="button"
                  key={conversation.id}
                  data-selected={isSelected}
                  aria-pressed={isSelected}
                  onClick={() => toggleConversation(conversation.id)}
                >
                  <Avatar
                    name={conversation.name}
                    imageUrl={conversation.avatarUrl}
                    isOnline={conversation.isOnline}
                    size="sm"
                  />
                  <span className="forward-target__text">
                    <strong>{conversation.name}</strong>
                    <small>{getSubtitle(conversation, currentUserId)}</small>
                  </span>
                  <span className="forward-target__check" aria-hidden="true">
                    {isSelected ? <Check size={14} /> : null}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="forward-modal__empty">No conversations found.</div>
          )}
        </div>

        <button
          className="forward-modal__send"
          type="button"
          disabled={selectedConversationIds.length === 0 || isSending}
          onClick={() => {
            void sendForward();
          }}
        >
          Send
        </button>
      </section>
    </div>
  );
}
