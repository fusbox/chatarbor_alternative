
import { useState, useEffect } from 'react';
import { DEFAULT_SYSTEM_PROMPT } from '../constants';

export const useSystemPrompt = () => {
  const [systemPrompt, setSystemPrompt] = useState<string>(DEFAULT_SYSTEM_PROMPT);

  useEffect(() => {
    try {
      const savedPrompt = localStorage.getItem('systemPrompt');
      if (savedPrompt && savedPrompt.trim() !== '') {
        setSystemPrompt(savedPrompt);
      } else {
        setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
      }
    } catch (err)
      console.error("Failed to load system prompt from localStorage", err);
      setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('systemPrompt', systemPrompt);
    } catch (err) {
      console.error("Failed to save system prompt to localStorage", err);
    }
  }, [systemPrompt]);

  const handleSaveSystemPrompt = (newPrompt: string) => {
    setSystemPrompt(newPrompt);
  };

  return {
    systemPrompt,
    handleSaveSystemPrompt,
  };
};
