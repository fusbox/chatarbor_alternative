
import React, { useState, useEffect } from 'react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrompt: string;
  onSave: (newPrompt: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, currentPrompt, onSave }) => {
  const [prompt, setPrompt] = useState(currentPrompt);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setPrompt(currentPrompt);
    setHasChanges(false);
  }, [isOpen, currentPrompt]);
  
  useEffect(() => {
    setHasChanges(prompt !== currentPrompt);
  }, [prompt, currentPrompt]);

  const handleSave = () => {
    if (prompt.trim()) {
      onSave(prompt);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Admin Panel: System Configuration
          </h2>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div>
            <label htmlFor="system-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              System Prompt
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
              This instruction guides the chatbot's persona, capabilities, and limitations. Changes will reset the current chat session.
            </p>
            <textarea
              id="system-prompt"
              rows={15}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200 p-2 font-mono text-xs"
              placeholder="Enter the system prompt..."
            />
          </div>
        </main>
        
        <footer className="flex justify-end items-center p-4 border-t border-gray-200 dark:border-gray-700 space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={!hasChanges}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </footer>
      </div>
    </div>
  );
};
