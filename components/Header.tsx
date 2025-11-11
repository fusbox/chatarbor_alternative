
import React from 'react';

interface HeaderProps {
  onOpenKbModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenKbModal }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            Job Seeker Virtual Assistant
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">Your AI Career Assistant</p>
        </div>
        <button 
          onClick={onOpenKbModal}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Manage Knowledge Base
        </button>
      </div>
    </header>
  );
};
