
import type { Document } from '../types';

// A very simple keyword-based retriever.
// In a real-world scenario, this would be replaced by a vector similarity search.
export const retrieveFromKnowledgeBase = (query: string, knowledgeBase: Document[]): Document[] => {
  const queryWords = new Set(query.toLowerCase().split(/\s+/).filter(word => word.length > 2));
  if (queryWords.size === 0) return [];
  
  const scoredDocs: { doc: Document, score: number }[] = [];

  knowledgeBase.forEach(doc => {
    let score = 0;
    const contentLower = doc.content.toLowerCase();
    
    queryWords.forEach(queryWord => {
      if (contentLower.includes(queryWord)) {
        score++;
      }
    });

    if (score > 0) {
      scoredDocs.push({ doc, score });
    }
  });

  // Sort by score descending
  scoredDocs.sort((a, b) => b.score - a.score);

  // Return top 2 most relevant documents
  return scoredDocs.slice(0, 2).map(item => item.doc);
};
