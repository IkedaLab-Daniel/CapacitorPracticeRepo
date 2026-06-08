import React, { useEffect, useRef } from 'react';
import { type Message } from '../services/storage';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.length === 0 && (
        <div className="empty-chat">
          <p>No messages yet. Start a conversation!</p>
        </div>
      )}
      {messages.map((m, i) => (
        <div key={i} className={`message ${m.role}`}>
          <div className="message-header">
            <strong>{m.role === 'user' ? 'You' : 'XiaoBai'}</strong>
          </div>
          <div className="message-content">
            {m.content}
          </div>
        </div>
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};
