
import { useState } from 'react';
import type { Message } from '../types';

interface MessagePair {
  userPrompt: Message;
  botResponse: Message;
}

export const useFeedback = (messages: Message[]) => {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedMessageForFeedback, setSelectedMessageForFeedback] = useState<MessagePair | null>(null);

  const handleOpenFeedbackModal = (botResponse: Message) => {
    const botResponseIndex = messages.findIndex((msg) => msg.id === botResponse.id);
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

  return {
    isFeedbackModalOpen,
    selectedMessageForFeedback,
    handleOpenFeedbackModal,
    handleCloseFeedbackModal,
    handleSubmitFeedback,
  };
};
