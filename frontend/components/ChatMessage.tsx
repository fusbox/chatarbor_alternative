import React from 'react';
import type { Message } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';

interface ChatMessageProps {
  message: Message;
  onOpenFeedback: (message: Message) => void;
}

const renderWithLinks = (content: string) => {
    // Regex to find markdown links: [text](url)
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    // Fix: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
    const elements: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
        // Push text before the link
        if (match.index > lastIndex) {
            elements.push(content.substring(lastIndex, match.index));
        }
        // Push the link element
        const [_, text, url] = match;
        elements.push(
            <a
                key={match.index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
                {text}
            </a>
        );
        lastIndex = match.index + match[0].length;
    }

    // Push remaining text after the last link
    if (lastIndex < content.length) {
        elements.push(content.substring(lastIndex));
    }

    return elements;
};


export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onOpenFeedback }) => {
  const isUser = message.role === 'user';
  const isError = message.isError ?? false;

  const wrapperClasses = `flex items-start gap-3 ${isUser ? 'justify-end' : ''}`;
  const messageClasses = `rounded-lg p-3 max-w-lg break-words ${
    isUser
      ? 'bg-indigo-600 text-white'
      : isError 
      ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200' 
      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }`;

  return (
    <div className={wrapperClasses}>
      {!isUser && <BotIcon className="w-8 h-8 text-gray-500 dark:text-gray-400 flex-shrink-0" />}
      <div className="flex flex-col items-start gap-1">
        <div className={messageClasses}>
            <p className="text-sm">{isUser ? message.content : renderWithLinks(message.content)}</p>
        </div>
        {!isUser && !isError && (
             <button 
                onClick={() => onOpenFeedback(message)}
                className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="Rate this response"
             >
                <ThumbsUpIcon className="w-4 h-4" />
                <span>Rate response</span>
            </button>
        )}
      </div>
      {isUser && <UserIcon className="w-8 h-8 text-indigo-500 flex-shrink-0" />}
    </div>
  );
};
