import { Check, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Avatar } from './Avatar';
import { messagingService } from '../services/messagingService';
import type { User } from '../types';

interface NewMessageModalProps {
  onClose: () => void;
  onStartConversation: (userId: string) => Promise<void>;
}

const getUserSubtitle = (user: User) => user.username ?? user.id;

export function NewMessageModal({ onClose, onStartConversation }: NewMessageModalProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId),
    [selectedUserId, users],
  );

  useEffect(() => {
    let isCurrentRequest = true;
    const timeoutId = window.setTimeout(() => {
      async function loadUsers() {
        try {
          setError(null);
          setIsLoading(true);
          const nextUsers = await messagingService.searchUsers(query.trim());

          if (isCurrentRequest) {
            setUsers(nextUsers);
            setSelectedUserId((current) =>
              current && nextUsers.some((user) => user.id === current) ? current : null,
            );
          }
        } catch {
          if (isCurrentRequest) {
            setUsers([]);
            setSelectedUserId(null);
            setError('Unable to load users.');
          }
        } finally {
          if (isCurrentRequest) {
            setIsLoading(false);
          }
        }
      }

      void loadUsers();
    }, 180);

    return () => {
      isCurrentRequest = false;
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const startConversation = async () => {
    if (!selectedUser || isStarting) {
      return;
    }

    try {
      setError(null);
      setIsStarting(true);
      await onStartConversation(selectedUser.id);
      onClose();
    } catch {
      setError('Unable to start chat.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="forward-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="forward-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-message-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="forward-modal__header">
          <h2 id="new-message-title">New message</h2>
          <button className="forward-modal__close" type="button" onClick={onClose} aria-label="Close new message">
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
          {isLoading ? (
            <div className="forward-modal__empty">Loading users...</div>
          ) : error ? (
            <div className="forward-modal__empty">{error}</div>
          ) : users.length > 0 ? (
            users.map((user) => {
              const isSelected = selectedUserId === user.id;

              return (
                <button
                  className="forward-target"
                  type="button"
                  key={user.id}
                  data-selected={isSelected}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedUserId((current) => (current === user.id ? null : user.id))}
                >
                  <Avatar name={user.name} imageUrl={user.avatarUrl} isOnline={user.isOnline} size="sm" />
                  <span className="forward-target__text">
                    <strong>{user.name}</strong>
                    <small>{getUserSubtitle(user)}</small>
                  </span>
                  <span className="forward-target__check" aria-hidden="true">
                    {isSelected ? <Check size={14} /> : null}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="forward-modal__empty">No users found.</div>
          )}
        </div>

        <button
          className="forward-modal__send"
          type="button"
          disabled={!selectedUser || isStarting}
          onClick={() => {
            void startConversation();
          }}
        >
          {isStarting ? 'Opening...' : 'Chat'}
        </button>
      </section>
    </div>
  );
}
