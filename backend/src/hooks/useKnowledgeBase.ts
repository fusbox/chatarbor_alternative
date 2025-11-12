import { useState, useEffect, useCallback } from 'react';
import { KnowledgeDocument } from '@/lib/types';
import { toast } from "sonner";
export function useKnowledgeBase() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/knowledge');
      if (!response.ok) throw new Error('Failed to fetch documents.');
      const data = await response.json();
      if (data.success) {
        setDocuments(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch documents.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(message);
      toast.error("Error", { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  const addDocument = async (doc: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to add document.');
      }
      toast.success("Document Added", { description: `"${data.data.title}" has been added.` });
      await fetchDocuments(); // Refresh list
      return data.data as KnowledgeDocument;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast.error("Error", { description: message });
      return null;
    }
  };
  const updateDocument = async (id: string, doc: Partial<Omit<KnowledgeDocument, 'id'>>) => {
    try {
      const response = await fetch(`/api/knowledge/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update document.');
      }
      toast.success("Document Updated", { description: `"${data.data.title}" has been updated.` });
      await fetchDocuments(); // Refresh list
      return data.data as KnowledgeDocument;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast.error("Error", { description: message });
      return null;
    }
  };
  const deleteDocument = async (id: string) => {
    try {
      const response = await fetch(`/api/knowledge/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete document.');
      }
      toast.success("Document Deleted");
      await fetchDocuments(); // Refresh list
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast.error("Error", { description: message });
      return false;
    }
  };
  return { documents, isLoading, error, fetchDocuments, addDocument, updateDocument, deleteDocument };
}