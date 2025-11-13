
import { useState } from 'react';
import type { Message } from '../types';
import { GREETING_MESSAGE } from '../constants';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([GREETING_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (userInput: string) => {
    if (isLoading || !userInput.trim()) return;

    setError(null);
    setIsLoading(true);
    const newUserMessage: Message = { id: `user-${Date.now()}`, role: 'user', content: userInput };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    try {
      const response = await fetch('/api/v2/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a response from the server.');
      }

      const { data } = await response.json();
      const botMessage: Message = { id: `bot-${Date.now()}`, role: 'model', content: data.response };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (e) {
      console.error(e);
      const errorMessage = 'Sorry, I encountered an error. Please try again.';
      setError(errorMessage);
      setMessages((prevMessages) => [...prevMessages, { id: `error-${Date.now()}`, role: 'model', content: errorMessage, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([GREETING_MESSAGE]);
    setError(null);
  }

  return {
    messages,
    isLoading,
    error,
    handleSendMessage,
    resetChat
  };
};
