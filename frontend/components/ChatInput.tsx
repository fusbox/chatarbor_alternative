
import React, { useState, useRef, useEffect } from 'react';
import { SendIcon } from './icons/SendIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

// Fix: Add type definitions for the Web Speech API to resolve TypeScript errors.
// These types are not included by default in TypeScript's DOM library.
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface ChatInputProps {
  onSendMessage: (input: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let newFinalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newFinalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }
        
        if (newFinalTranscript) {
            const separator = finalTranscriptRef.current.length > 0 && !finalTranscriptRef.current.endsWith(' ') ? ' ' : '';
            finalTranscriptRef.current += separator + newFinalTranscript.trim();
        }

        setInput(finalTranscriptRef.current + (interimTranscript ? ' ' + interimTranscript : ''));
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
            alert('Microphone access was denied. Please allow microphone access in your browser settings to use dictation.');
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;

      return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
      };
    }
  }, []);

  const handleToggleRecording = () => {
    if (isLoading || !recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      finalTranscriptRef.current = input; // Capture current input
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
      finalTranscriptRef.current = '';
    }
  };
  
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    setInput(newText);
    if (isRecording) {
      finalTranscriptRef.current = newText;
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
    }
  }

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 sticky bottom-0">
      <div className="container mx-auto">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about resumes, interviews, or career advice..."
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 resize-none"
            rows={1}
            disabled={isLoading}
            style={{ maxHeight: '100px' }}
          />
          {speechSupported && (
            <button
                type="button"
                onClick={handleToggleRecording}
                disabled={isLoading}
                className={`p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isRecording 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                }`}
                aria-label={isRecording ? 'Stop dictation' : 'Start dictation'}
            >
                <MicrophoneIcon className="w-6 h-6" />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 bg-indigo-600 text-white rounded-lg disabled:bg-indigo-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </footer>
  );
};
