
import { useState, useRef, useEffect, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { runChat } from '../services/geminiService';
import { retrieveFromKnowledgeBase } from '../rag/retriever';
import type { Message, Document } from '../types';
import { GREETING_MESSAGE } from '../constants';

export const useChat = (systemPrompt: string, knowledgeBaseDocs: Document[]) => {
  const [messages, setMessages] = useState<Message[]>([GREETING_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);

  const initializeChat = useCallback(() => {
    try {
      chatRef.current = runChat(systemPrompt);
    } catch (e) {
      console.error(e);
      setError('Failed to initialize the chat service. Please check your API key.');
    }
  }, [systemPrompt]);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  const handleSendMessage = async (userInput: string) => {
    if (isLoading || !userInput.trim()) return;

    setError(null);
    setIsLoading(true);
    const newUserMessage: Message = { id: `user-${Date.now()}`, role: 'user', content: userInput };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    if (!chatRef.current) {
      initializeChat();
      if (!chatRef.current) {
        setError('Chat is not initialized. Please refresh the page.');
        setIsLoading(false);
        return;
      }
    }

    try {
      const chat = chatRef.current;
      const retrievedDocs = retrieveFromKnowledgeBase(userInput, knowledgeBaseDocs);
      let finalInput = userInput;

      if (retrievedDocs.length > 0) {
        const context = retrievedDocs.map(doc => `- ${doc.content} (Source: ${doc.source})`).join('\n');
        finalInput = `Based on the following context, answer the user's query.
<context>
${context}
</context>

User Query: "${userInput}"
`;
      }

      const stream = await chat.sendMessageStream({ message: finalInput });

      let botMessageId = '';
      let fullResponse = '';

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullResponse += chunkText;

        if (!botMessageId) {
          botMessageId = `gemini-${Date.now()}`;
          setMessages((prev) => [
            ...prev,
            { id: botMessageId, role: 'model', content: fullResponse },
          ]);
        } else {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId ? { ...msg, content: fullResponse } : msg
            )
          );
        }
      }
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
