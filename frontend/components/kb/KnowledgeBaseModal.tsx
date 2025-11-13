
import React, { useState, useEffect, useRef } from 'react';
import type { Document } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  docs: Document[];
  onAdd: (doc: Omit<Document, 'id'>) => void;
  onUpdate: (doc: Document) => void;
  onDelete: (docId: string) => void;
  onFileUpload: (file: File) => void;
}

const DocumentForm: React.FC<{
  doc: Partial<Document> | null;
  onSave: (doc: Omit<Document, 'id'> | Document) => void;
  onCancel: () => void;
  onFileUpload: (file: File) => void;
}> = ({ doc, onSave, onCancel, onFileUpload }) => {
  const [source, setSource] = useState(doc?.source || '');
  const [content, setContent] = useState(doc?.content || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !content.trim()) return;
    onSave({ ...doc, source, content } as Omit<Document, 'id'> | Document);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="p-6 space-y-4 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Source (URL or Title)
          </label>
          <input
            type="text"
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 p-2"
            placeholder="e.g., Internal Support Guidelines or https://example.com"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Content (for plain text)
          </label>
          <textarea
            id="content"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 p-2"
            placeholder="Enter the document content here..."
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">
            Save Text/URL
          </button>
        </div>
      </form>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Upload a file (.txt, .pdf, .docx)
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                <span>Upload a file</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" ref={fileInputRef} onChange={handleFileChange} accept=".txt,.pdf,.docx" />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">TXT, PDF, DOCX up to 10MB</p>
          </div>
        </div>
      </div>
    </div>
  );
};


export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({ isOpen, onClose, docs, onAdd, onUpdate, onDelete, onFileUpload }) => {
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setEditingDoc(null);
      setIsAdding(false);
    }
  }, [isOpen]);

  const handleSave = (doc: Omit<Document, 'id'> | Document) => {
    if ('id' in doc) {
      onUpdate(doc);
    } else {
      onAdd(doc);
    }
    setEditingDoc(null);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditingDoc(null);
    setIsAdding(false);
  };
  
  const handleDelete = (docId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
        onDelete(docId);
    }
  }

  if (!isOpen) return null;

  const showForm = isAdding || editingDoc;
  const currentDoc = isAdding ? {} : editingDoc;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {showForm ? (isAdding ? 'Add New Document' : 'Edit Document') : 'Manage Knowledge Base'}
          </h2>
          {!showForm && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Document</span>
            </button>
          )}
        </header>
        
        {showForm ? (
            <DocumentForm doc={currentDoc} onSave={handleSave} onCancel={handleCancel} onFileUpload={onFileUpload} />
        ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {docs.length > 0 ? (
                docs.map(doc => (
                <div key={doc.id} className="p-3 border rounded-md dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{doc.source}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{doc.content}</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                        <button onClick={() => setEditingDoc(doc)} className="p-1 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400" aria-label="Edit document">
                            <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(doc.id)} className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400" aria-label="Delete document">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                    </div>
                </div>
                ))
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">No documents in the knowledge base.</p>
            )}
            </div>
        )}

        {!showForm && (
            <footer className="flex justify-end items-center p-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                Close
            </button>
            </footer>
        )}
      </div>
    </div>
  );
};
