import { useEffect, useState } from 'react';
import { ChatWindow } from './ChatWindow';
import { ConversationList } from './ConversationList';
import { NewMessageModal } from './NewMessageModal';
import { useMessaging } from '../hooks/useMessaging';

type ThemeMode = 'light' | 'dark';

const themeStorageKey = 'messenger-theme';

const getBrowserTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const savedTheme = window.localStorage.getItem(themeStorageKey);

  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }

  return getBrowserTheme();
};

interface MessagingPageProps {
  onLogout: () => void;
}

export function MessagingPage({ onLogout }: MessagingPageProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const {
    conversations,
    selectedConversation,
    selectedConversationId,
    messages,
    currentUser,
    currentUserId,
    isConversationsLoading,
    isMessagesLoading,
    error,
    selectConversation,
    startDirectConversation,
    sendLocalMessage,
    forwardLocalMessage,
  } = useMessaging();

  useEffect(() => {
    setIsDetailsOpen(false);
  }, [selectedConversationId]);

  useEffect(() => {
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleBrowserThemeChange = (event: MediaQueryListEvent) => {
      const savedTheme = window.localStorage.getItem(themeStorageKey);

      if (!savedTheme) {
        setThemeMode(event.matches ? 'dark' : 'light');
      }
    };

    colorSchemeQuery.addEventListener('change', handleBrowserThemeChange);

    return () => {
      colorSchemeQuery.removeEventListener('change', handleBrowserThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    setThemeMode((current) => {
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(themeStorageKey, nextTheme);
      return nextTheme;
    });
  };

  return (
    <div className="messaging-page" data-theme={themeMode}>
      <div className="messaging-shell" data-chat-open={Boolean(selectedConversation)}>
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          isLoading={isConversationsLoading}
          accountName={currentUser.username ?? currentUser.name}
          themeMode={themeMode}
          onToggleTheme={toggleTheme}
          onLogout={onLogout}
          onOpenNewMessage={() => setIsNewMessageOpen(true)}
          onSelectConversation={selectConversation}
        />
        <ChatWindow
          conversation={selectedConversation}
          conversations={conversations}
          messages={messages}
          currentUserId={currentUserId}
          isLoading={isMessagesLoading}
          error={error}
          isDetailsOpen={isDetailsOpen}
          themeMode={themeMode}
          onCloseDetails={() => setIsDetailsOpen(false)}
          onToggleDetails={() => setIsDetailsOpen((current) => !current)}
          onToggleTheme={toggleTheme}
          onSendMessage={sendLocalMessage}
          onForwardMessage={forwardLocalMessage}
        />
        {isNewMessageOpen ? (
          <NewMessageModal
            onClose={() => setIsNewMessageOpen(false)}
            onStartConversation={startDirectConversation}
          />
        ) : null}
      </div>
    </div>
  );
}
