
import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_SYSTEM_PROMPT } from '../constants';

const SYSTEM_PROMPT_DOC_ID = 'system-prompt';

export const useSystemPrompt = () => {
  const [systemPrompt, setSystemPrompt] = useState<string>(DEFAULT_SYSTEM_PROMPT);

  const fetchSystemPrompt = useCallback(async () => {
    try {
      const response = await fetch(`/api/knowledge/${SYSTEM_PROMPT_DOC_ID}`);
      if (response.ok) {
        const { data } = await response.json();
        setSystemPrompt(data.content);
      } else {
        setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
      }
    } catch (err) {
      console.error("Failed to load system prompt from backend", err);
      setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
    }
  }, []);

  useEffect(() => {
    fetchSystemPrompt();
  }, [fetchSystemPrompt]);

  const handleSaveSystemPrompt = async (newPrompt: string) => {
    try {
      const response = await fetch(`/api/knowledge/${SYSTEM_PROMPT_DOC_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'System Prompt', content: newPrompt }),
      });
      if (!response.ok) {
        // if the prompt doesn't exist, create it
        if (response.status === 404) {
          const createResponse = await fetch('/api/knowledge', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: SYSTEM_PROMPT_DOC_ID, title: 'System Prompt', content: newPrompt }),
          });
          if (!createResponse.ok) {
            throw new Error('Failed to create system prompt');
          }
        } else {
          throw new Error('Failed to save system prompt');
        }
      }
      setSystemPrompt(newPrompt);
    } catch (err) {
      console.error("Failed to save system prompt", err);
    }
  };

  return {
    systemPrompt,
    handleSaveSystemPrompt,
  };
};
