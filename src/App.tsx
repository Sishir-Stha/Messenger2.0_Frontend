import { useState } from 'react';
import { LoginPage } from './features/auth/components/LoginPage';
import { authSession } from './features/auth/authSession';
import { MessagingPage } from './features/messaging/components/MessagingPage';

export default function App() {
  const [currentUserId, setCurrentUserId] = useState(() => authSession.getUserId());

  if (!currentUserId) {
    return <LoginPage onLogin={setCurrentUserId} />;
  }

  return (
    <MessagingPage
      key={currentUserId}
      onLogout={() => {
        authSession.clear();
        setCurrentUserId(null);
      }}
    />
  );
}
