
import React, { useState, useMemo, useEffect } from 'react';
import { RUBRIC_DIMENSIONS } from './rubric';
import type { Message } from '../../types';

interface MessagePair {
  userPrompt: Message;
  botResponse: Message;
}

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { scores: { [key: string]: number }; notes: string }) => void;
  messagePair: MessagePair;
}

const initialScores = RUBRIC_DIMENSIONS.reduce((acc, dim) => {
  acc[dim.name] = 0;
  return acc;
}, {} as { [key: string]: number });

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit, messagePair }) => {
  const [scores, setScores] = useState<{ [key: string]: number }>(initialScores);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setScores(initialScores);
      setNotes('');
    }
  }, [isOpen]);

  const handleScoreChange = (dimension: string, score: number) => {
    setScores(prev => ({ ...prev, [dimension]: score }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ scores, notes });
  };

  const { totalWeightedScore, weightedScores } = useMemo(() => {
    const weightedScores: { [key: string]: number } = {};
    let totalWeightedScore = 0;
    RUBRIC_DIMENSIONS.forEach(dim => {
      const score = scores[dim.name] || 0;
      const weightedScore = dim.weight * (score / 3);
      weightedScores[dim.name] = parseFloat(weightedScore.toFixed(2));
      totalWeightedScore += weightedScore;
    });
    return {
      totalWeightedScore: parseFloat(totalWeightedScore.toFixed(2)),
      weightedScores,
    };
  }, [scores]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Rate Chatbot Response</h2>
        </header>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">User Prompt:</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 italic">"{messagePair.userPrompt.content}"</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-md">
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">Chatbot Response:</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">"{messagePair.botResponse.content}"</p>
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border dark:border-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dimension</th>
                    <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Weight (%)</th>
                    <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score (0-3)</th>
                    <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Weighted Score</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {RUBRIC_DIMENSIONS.map(dim => (
                    <tr key={dim.name}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{dim.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">{dim.weight}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <fieldset className="flex justify-center items-center space-x-4">
                           <legend className="sr-only">Score for {dim.name}</legend>
                           {[0, 1, 2, 3].map(val => (
                             <label key={val} className="flex items-center space-x-1 cursor-pointer text-gray-700 dark:text-gray-300">
                               <input
                                 type="radio"
                                 name={dim.name}
                                 value={val}
                                 checked={scores[dim.name] === val}
                                 onChange={() => handleScoreChange(dim.name, val)}
                                 className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                               />
                               <span>{val}</span>
                             </label>
                           ))}
                        </fieldset>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">{weightedScores[dim.name]}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <td colSpan={3} className="px-4 py-2 text-right text-sm font-bold text-gray-700 dark:text-gray-200">TOTAL</td>
                        <td className="px-4 py-2 text-center text-sm font-bold text-gray-900 dark:text-white">{totalWeightedScore} / 100</td>
                    </tr>
                </tfoot>
              </table>
            </div>
             <div className="mt-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes / Comments</label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200 p-2"
                placeholder="Provide any additional comments here..."
              />
            </div>
          </div>
        </form>
        <footer className="flex justify-end items-center p-4 border-t border-gray-200 dark:border-gray-700 space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
            Cancel
          </button>
          <button type="submit" onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Submit Feedback
          </button>
        </footer>
      </div>
    </div>
  );
};
