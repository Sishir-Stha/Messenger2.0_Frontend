import { ChatHeader } from './ChatHeader';
import { ConversationDetailsPanel } from './ConversationDetailsPanel';
import { EmptyChatState } from './EmptyChatState';
import { ForwardMessageModal } from './ForwardMessageModal';
import { MessageComposer } from './MessageComposer';
import { MessageList } from './MessageList';
import { useState } from 'react';
import type { Conversation, Message } from '../types';

interface ChatWindowProps {
  conversation: Conversation | undefined;
  conversations: Conversation[];
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
  error: string | null;
  isDetailsOpen: boolean;
  themeMode: 'light' | 'dark';
  onCloseDetails: () => void;
  onToggleDetails: () => void;
  onToggleTheme: () => void;
  onSendMessage: (body: string) => Promise<void>;
  onForwardMessage: (message: Message, conversationIds: string[]) => Promise<void>;
}

export function ChatWindow({
  conversation,
  conversations,
  messages,
  currentUserId,
  isLoading,
  error,
  isDetailsOpen,
  themeMode,
  onCloseDetails,
  onToggleDetails,
  onToggleTheme,
  onSendMessage,
  onForwardMessage,
}: ChatWindowProps) {
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);

  if (!conversation) {
    return (
      <main className="chat-panel chat-panel--empty">
        <EmptyChatState />
      </main>
    );
  }

  return (
    <main className="chat-panel" data-details-open={isDetailsOpen}>
      <section className="chat-thread" aria-label="Conversation">
        <ChatHeader
          conversation={conversation}
          isDetailsOpen={isDetailsOpen}
          onToggleDetails={onToggleDetails}
        />
        <MessageList
          messages={messages}
          participants={conversation.participants}
          currentUserId={currentUserId}
          isLoading={isLoading}
          error={error}
          onReplyMessage={setReplyToMessage}
          onForwardMessage={setForwardMessage}
        />
        <MessageComposer
          replyToMessage={replyToMessage}
          onCancelReply={() => setReplyToMessage(null)}
          onSendMessage={async (body) => {
            await onSendMessage(body);
            setReplyToMessage(null);
          }}
        />
      </section>
      {forwardMessage ? (
        <ForwardMessageModal
          message={forwardMessage}
          conversations={conversations}
          currentConversationId={conversation.id}
          currentUserId={currentUserId}
          onClose={() => setForwardMessage(null)}
          onForwardMessage={onForwardMessage}
        />
      ) : null}
      {isDetailsOpen ? (
        <ConversationDetailsPanel
          conversation={conversation}
          currentUserId={currentUserId}
          themeMode={themeMode}
          onClose={onCloseDetails}
          onToggleTheme={onToggleTheme}
        />
      ) : null}
    </main>
  );
}
