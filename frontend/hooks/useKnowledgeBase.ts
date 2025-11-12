
import { useState, useEffect } from 'react';
import type { Document } from '../types';
import { knowledgeBase as defaultKnowledgeBase } from '../rag/knowledgeBase';

export const useKnowledgeBase = () => {
  const [knowledgeBaseDocs, setKnowledgeBaseDocs] = useState<Document[]>([]);

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

  useEffect(() => {
    if (knowledgeBaseDocs.length > 0) {
      try {
        localStorage.setItem('knowledgeBase', JSON.stringify(knowledgeBaseDocs));
      } catch (err) {
        console.error("Failed to save knowledge base to localStorage", err);
      }
    }
  }, [knowledgeBaseDocs]);

  const handleAddDocument = (doc: Omit<Document, 'id'>) => {
    const newDoc = { ...doc, id: `doc-${Date.now()}` };
    setKnowledgeBaseDocs((prevDocs) => [...prevDocs, newDoc]);
  };

  const handleUpdateDocument = (updatedDoc: Document) => {
    setKnowledgeBaseDocs((prevDocs) =>
      prevDocs.map((doc) => (doc.id === updatedDoc.id ? updatedDoc : doc))
    );
  };

  const handleDeleteDocument = (docId: string) => {
    setKnowledgeBaseDocs((prevDocs) => prevDocs.filter((doc) => doc.id !== docId));
  };

  return {
    knowledgeBaseDocs,
    handleAddDocument,
    handleUpdateDocument,
    handleDeleteDocument,
  };
};
