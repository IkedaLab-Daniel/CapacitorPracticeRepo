import { useState, useCallback } from 'react';
import { llmService } from '../services/llm';
import { storage, type Message, type ChatSession } from '../services/storage';

export const useChat = (modelId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !modelId) return;

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsGenerating(true);

    try {
      let assistantContent = '';
      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      // Add a placeholder assistant message
      setMessages([...newMessages, assistantMessage]);

      await llmService.chat(
        newMessages.map(m => ({ role: m.role, content: m.content })),
        (token) => {
          assistantContent += token;
          setMessages([...newMessages, { ...assistantMessage, content: assistantContent }]);
        }
      );

      // Finalize history saving (optional: implement session management)
      // await storage.saveHistory([{ id: 'default', messages: [...newMessages, { ...assistantMessage, content: assistantContent }], modelId, createdAt: Date.now() }]);

    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Failed to generate response.', timestamp: Date.now() }]);
    } finally {
      setIsGenerating(false);
    }
  }, [messages, modelId]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isGenerating,
    sendMessage,
    clearChat,
  };
};
