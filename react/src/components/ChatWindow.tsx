import React from 'react';
import { MessageList } from './MessageList';
import { PromptInput } from './PromptInput';
import { type Message } from '../services/storage';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isGenerating: boolean;
  disabled: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  isGenerating,
  disabled,
}) => {
  return (
    <div className="chat-window">
      <MessageList messages={messages} />
      <PromptInput onSend={onSendMessage} disabled={disabled || isGenerating} />
    </div>
  );
};
