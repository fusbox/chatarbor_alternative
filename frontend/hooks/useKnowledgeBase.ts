
import { useState, useEffect, useCallback } from 'react';
import type { Document } from '../types';

export const useKnowledgeBase = () => {
  const [knowledgeBaseDocs, setKnowledgeBaseDocs] = useState<Document[]>([]);

  const fetchKnowledgeBase = useCallback(async () => {
    try {
      const response = await fetch('/api/knowledge');
      if (!response.ok) {
        throw new Error('Failed to fetch knowledge base');
      }
      const { data } = await response.json();
      setKnowledgeBaseDocs(data);
    } catch (err) {
      console.error("Failed to load knowledge base from backend", err);
    }
  }, []);

  useEffect(() => {
    fetchKnowledgeBase();
  }, [fetchKnowledgeBase]);

  const handleAddDocument = async (doc: Omit<Document, 'id'>) => {
    try {
      const response = await fetch('/api/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doc),
      });
      if (!response.ok) {
        throw new Error('Failed to add document');
      }
      fetchKnowledgeBase();
    } catch (err) {
      console.error("Failed to add document", err);
    }
  };

  const handleUpdateDocument = async (updatedDoc: Document) => {
    try {
      const response = await fetch(`/api/knowledge/${updatedDoc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDoc),
      });
      if (!response.ok) {
        throw new Error('Failed to update document');
      }
      fetchKnowledgeBase();
    } catch (err) {
      console.error("Failed to update document", err);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const response = await fetch(`/api/knowledge/${docId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      fetchKnowledgeBase();
    } catch (err) {
      console.error("Failed to delete document", err);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      fetchKnowledgeBase();
    } catch (err) {
      console.error("Failed to upload file", err);
    }
  };

  return {
    knowledgeBaseDocs,
    handleAddDocument,
    handleUpdateDocument,
    handleDeleteDocument,
    handleFileUpload,
  };
};
