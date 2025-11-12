import { z } from 'zod';
export const knowledgeDocumentSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }).max(100, { message: "Title cannot exceed 100 characters." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters long." }),
});
export type KnowledgeDocumentFormData = z.infer<typeof knowledgeDocumentSchema>;