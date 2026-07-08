import { Paperclip, Send, Smile, X } from 'lucide-react';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import type { Message } from '../types';

interface MessageComposerProps {
  replyToMessage?: Message | null;
  onCancelReply?: () => void;
  onSendMessage: (body: string) => Promise<void>;
}

export function MessageComposer({ replyToMessage, onCancelReply, onSendMessage }: MessageComposerProps) {
  const [messageBody, setMessageBody] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const canSend = messageBody.trim().length > 0 && !isSending;
  const emojis = [
    '😀',
    '😃',
    '😄',
    '😁',
    '😆',
    '😅',
    '😂',
    '🤣',
    '🙂',
    '😊',
    '😉',
    '😍',
    '😘',
    '🤩',
    '😎',
    '🥳',
    '😋',
    '🤗',
    '😮',
    '😱',
    '🤯',
    '😢',
    '😭',
    '🥺',
    '😡',
    '😤',
    '🙄',
    '😴',
    '🤮',
    '🙏',
    '🙌',
    '👏',
    '🤝',
    '👍',
    '👎',
    '👌',
    '🤌',
    '💪',
    '👀',
    '🔥',
    '🎉',
    '✨',
    '⭐',
    '🌟',
    '💯',
    '✅',
    '❤️',
    '💕',
    '💔',
    '💙',
    '💜',
    '🖤',
    '😇',
    '🤔',
  ];

  const sendMessage = async () => {
    if (!canSend) {
      return;
    }

    const nextMessage = messageBody;
    setMessageBody('');
    setIsSending(true);

    try {
      await onSendMessage(nextMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const addEmoji = (emoji: string) => {
    setMessageBody((current) => `${current}${emoji}`);
    setIsEmojiPickerOpen(false);
  };

  useEffect(() => {
    if (!isEmojiPickerOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        emojiPickerRef.current &&
        event.target instanceof Node &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setIsEmojiPickerOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isEmojiPickerOpen]);

  return (
    <form
      className="message-composer"
      onSubmit={(event) => {
        event.preventDefault();
        void sendMessage();
      }}
    >
      {replyToMessage ? (
        <div className="reply-preview">
          <div>
            <span>Replying to message</span>
            <p>{replyToMessage.body}</p>
          </div>
          <button className="reply-preview__close" type="button" onClick={onCancelReply} aria-label="Cancel reply">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <div className="message-composer__row">
        <button className="icon-button" type="button" aria-label="Add attachment">
          <Paperclip size={19} aria-hidden="true" />
        </button>
        <div className="emoji-picker-wrap" ref={emojiPickerRef}>
          <button
            className="icon-button"
            type="button"
            aria-label="Add emoji"
            aria-expanded={isEmojiPickerOpen}
            onClick={() => setIsEmojiPickerOpen((current) => !current)}
          >
            <Smile size={19} aria-hidden="true" />
          </button>
          {isEmojiPickerOpen ? (
            <div className="emoji-picker" role="menu" aria-label="Choose emoji">
              {emojis.map((emoji) => (
                <button key={emoji} type="button" role="menuitem" onClick={() => addEmoji(emoji)}>
                  {emoji}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <label className="message-composer__field">
          <span className="sr-only">Message text</span>
          <textarea
            rows={1}
            value={messageBody}
            placeholder="Message..."
            onChange={(event) => setMessageBody(event.target.value)}
            onKeyDown={handleKeyDown}
          />
        </label>
        <button className="send-button" type="submit" disabled={!canSend} aria-label="Send message">
          <Send size={18} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
