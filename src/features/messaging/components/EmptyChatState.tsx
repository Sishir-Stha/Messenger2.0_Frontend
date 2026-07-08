import { MessageCircle } from 'lucide-react';

export function EmptyChatState() {
  return (
    <section className="empty-chat" aria-label="No conversation selected">
      <div className="empty-chat__icon">
        <MessageCircle size={38} aria-hidden="true" />
      </div>
      <h2>Select a conversation</h2>
      <p>Choose a message thread from the inbox to start chatting.</p>
    </section>
  );
}
