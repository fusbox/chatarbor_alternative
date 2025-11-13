
import React, { useState } from 'react';
import { Header } from './components/Header';
import { ChatHistory } from './components/ChatHistory';
import { ChatInput } from './components/ChatInput';
import { FeedbackModal } from './components/feedback/FeedbackModal';
import { KnowledgeBaseModal } from './components/kb/KnowledgeBaseModal';
import { AdminModal } from './components/admin/AdminModal';
import { useChat } from './hooks/useChat';
import { useKnowledgeBase } from './hooks/useKnowledgeBase';
import { useSystemPrompt } from './hooks/useSystemPrompt';
import { useFeedback } from './hooks/useFeedback';

const App: React.FC = () => {
  const [isKbModalOpen, setIsKbModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const { systemPrompt, handleSaveSystemPrompt } = useSystemPrompt();
  const { knowledgeBaseDocs, handleAddDocument, handleUpdateDocument, handleDeleteDocument, handleFileUpload } = useKnowledgeBase();
  const { messages, isLoading, error, handleSendMessage, resetChat } = useChat();
  const { isFeedbackModalOpen, selectedMessageForFeedback, handleOpenFeedbackModal, handleCloseFeedbackModal, handleSubmitFeedback } = useFeedback(messages);

  const onSaveSystemPrompt = (newPrompt: string) => {
    handleSaveSystemPrompt(newPrompt);
    resetChat();
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <Header 
        onOpenKbModal={() => setIsKbModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />
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
        onFileUpload={handleFileUpload}
      />

      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentPrompt={systemPrompt}
        onSave={onSaveSystemPrompt}
      />
    </div>
  );
};

export default App;
