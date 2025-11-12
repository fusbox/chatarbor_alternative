
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import type { Message } from '../types';

interface ChatHistoryProps {
  messages: Message[];
  isLoading: boolean;
  onOpenFeedback: (message: Message) => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, isLoading, onOpenFeedback }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} onOpenFeedback={onOpenFeedback} />
      ))}
      {isLoading && (
        <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg p-3 max-w-lg">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></span>
            </div>
        </div>
      )}
      <div ref={endOfMessagesRef} />
    </main>
  );
};
