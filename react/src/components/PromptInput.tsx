import React, { useState } from 'react';

interface PromptInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <form className="prompt-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
      />
      <button type="submit" className="button primary" disabled={disabled || !input.trim()}>
        Send
      </button>
    </form>
  );
};
