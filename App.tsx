
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { Header } from './components/Header';
import { ChatHistory } from './components/ChatHistory';
import { ChatInput } from './components/ChatInput';
import { FeedbackModal } from './components/feedback/FeedbackModal';
import { KnowledgeBaseModal } from './components/kb/KnowledgeBaseModal';
import { runChat } from './services/geminiService';
import { retrieveFromKnowledgeBase } from './rag/retriever';
import { knowledgeBase as defaultKnowledgeBase } from './rag/knowledgeBase';
import type { Message, Document } from './types';
import { SYSTEM_PROMPT } from './constants';

interface MessagePair {
  userPrompt: Message;
  botResponse: Message;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: `gemini-${Date.now()}`,
      role: 'model',
      content: "Hello! I'm ChatArbor, your AI career assistant. How can I help you with your job search today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Feedback Modal State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedMessageForFeedback, setSelectedMessageForFeedback] = useState<MessagePair | null>(null);
  
  // Knowledge Base State
  const [knowledgeBaseDocs, setKnowledgeBaseDocs] = useState<Document[]>([]);
  const [isKbModalOpen, setIsKbModalOpen] = useState(false);

  const chatRef = useRef<Chat | null>(null);

  // Load knowledge base from localStorage on initial render
  useEffect(() => {
    try {
      const savedKb = localStorage.getItem('knowledgeBase');
      if (savedKb) {
        setKnowledgeBaseDocs(JSON.parse(savedKb));
      } else {
        setKnowledgeBaseDocs(defaultKnowledgeBase);
      }
    } catch (err) {
      console.error("Failed to load knowledge base from localStorage", err);
      setKnowledgeBaseDocs(defaultKnowledgeBase);
    }
  }, []);

  // Save knowledge base to localStorage whenever it changes
  useEffect(() => {
    if (knowledgeBaseDocs.length > 0) {
      try {
        localStorage.setItem('knowledgeBase', JSON.stringify(knowledgeBaseDocs));
      } catch (err) {
        console.error("Failed to save knowledge base to localStorage", err);
      }
    }
  }, [knowledgeBaseDocs]);


  const initializeChat = useCallback(() => {
    try {
      chatRef.current = runChat(SYSTEM_PROMPT);
    } catch (e) {
      console.error(e);
      setError('Failed to initialize the chat service. Please check your API key.');
    }
  }, []);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  const handleSendMessage = async (userInput: string) => {
    if (isLoading || !userInput.trim()) return;

    setError(null);
    setIsLoading(true);
    const newUserMessage: Message = { id: `user-${Date.now()}`, role: 'user', content: userInput };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);

    if (!chatRef.current) {
       initializeChat();
       if(!chatRef.current) {
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

      const result = await chat.sendMessage({ message: finalInput });
      const botResponse: Message = { id: `gemini-${Date.now()}`, role: 'model', content: result.text };
      setMessages(prevMessages => [...prevMessages, botResponse]);
    } catch (e) {
      console.error(e);
      const errorMessage = 'Sorry, I encountered an error. Please try again.';
      setError(errorMessage);
      setMessages(prevMessages => [...prevMessages, { id: `error-${Date.now()}`, role: 'model', content: errorMessage, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Feedback Modal Handlers ---
  const handleOpenFeedbackModal = (botResponse: Message) => {
    const botResponseIndex = messages.findIndex(msg => msg.id === botResponse.id);
    if (botResponseIndex > 0) {
      let userPrompt: Message | null = null;
      for (let i = botResponseIndex - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          userPrompt = messages[i];
          break;
        }
      }
      if (userPrompt) {
        setSelectedMessageForFeedback({ userPrompt, botResponse });
        setIsFeedbackModalOpen(true);
      } else {
        console.error("Could not find corresponding user prompt for feedback.");
      }
    }
  };

  const handleCloseFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setSelectedMessageForFeedback(null);
  };

  const handleSubmitFeedback = (feedbackData: { scores: { [key: string]: number }; notes: string }) => {
    if (!selectedMessageForFeedback) return;

    const finalReport = {
      userPrompt: selectedMessageForFeedback.userPrompt.content,
      botResponse: selectedMessageForFeedback.botResponse.content,
      ratings: feedbackData.scores,
      notes: feedbackData.notes,
      timestamp: new Date().toISOString(),
    };

    console.log('--- FEEDBACK SUBMITTED ---');
    console.log(JSON.stringify(finalReport, null, 2));

    handleCloseFeedbackModal();
  };

  // --- Knowledge Base Handlers ---
  const handleAddDocument = (doc: Omit<Document, 'id'>) => {
    const newDoc = { ...doc, id: `doc-${Date.now()}` };
    setKnowledgeBaseDocs(prevDocs => [...prevDocs, newDoc]);
  };

  const handleUpdateDocument = (updatedDoc: Document) => {
    setKnowledgeBaseDocs(prevDocs =>
      prevDocs.map(doc => (doc.id === updatedDoc.id ? updatedDoc : doc))
    );
  };

  const handleDeleteDocument = (docId: string) => {
    setKnowledgeBaseDocs(prevDocs => prevDocs.filter(doc => doc.id !== docId));
  };


  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <Header onOpenKbModal={() => setIsKbModalOpen(true)} />
      <ChatHistory messages={messages} isLoading={isLoading} onOpenFeedback={handleOpenFeedbackModal} />
      {error && <p className="text-center text-red-500 text-sm px-4">{error}</p>}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      
      {selectedMessageForFeedback && (
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={handleCloseFeedbackModal}
          onSubmit={handleSubmitFeedback}
          messagePair={selectedMessageForFeedback}
        />
      )}

      <KnowledgeBaseModal
        isOpen={isKbModalOpen}
        onClose={() => setIsKbModalOpen(false)}
        docs={knowledgeBaseDocs}
        onAdd={handleAddDocument}
        onUpdate={handleUpdateDocument}
        onDelete={handleDeleteDocument}
      />
    </div>
  );
};

export default App;
