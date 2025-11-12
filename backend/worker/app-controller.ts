import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo, KnowledgeDocument } from './types';
import type { Env } from './core-utils';
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private knowledgeBase = new Map<string, KnowledgeDocument>();
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const stored = await this.ctx.storage.list<any>();
      for (const [key, value] of stored) {
        if (key.startsWith('session:')) {
          this.sessions.set(key.replace('session:', ''), value as SessionInfo);
        } else if (key.startsWith('doc:')) {
          this.knowledgeBase.set(key.replace('doc:', ''), value as KnowledgeDocument);
        }
      }
      this.loaded = true;
    }
  }
  // Session Management
  async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    const session: SessionInfo = {
      id: sessionId,
      title: title || `Chat ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      lastActive: now
    };
    this.sessions.set(sessionId, session);
    await this.ctx.storage.put(`session:${sessionId}`, session);
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      this.sessions.set(sessionId, session);
      await this.ctx.storage.put(`session:${sessionId}`, session);
    }
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) await this.ctx.storage.delete(`session:${sessionId}`);
    return deleted;
  }
  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    return Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
  }
  // Knowledge Base Management
  async getDocuments(): Promise<KnowledgeDocument[]> {
    await this.ensureLoaded();
    return Array.from(this.knowledgeBase.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }
  async addDocument(doc: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeDocument> {
    await this.ensureLoaded();
    const now = Date.now();
    const newDoc: KnowledgeDocument = {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      ...doc,
    };
    this.knowledgeBase.set(newDoc.id, newDoc);
    await this.ctx.storage.put(`doc:${newDoc.id}`, newDoc);
    return newDoc;
  }
  async updateDocument(id: string, doc: Partial<Omit<KnowledgeDocument, 'id'>>): Promise<KnowledgeDocument | null> {
    await this.ensureLoaded();
    const existingDoc = this.knowledgeBase.get(id);
    if (!existingDoc) return null;
    const updatedDoc: KnowledgeDocument = {
      ...existingDoc,
      ...doc,
      updatedAt: Date.now(),
    };
    this.knowledgeBase.set(id, updatedDoc);
    await this.ctx.storage.put(`doc:${id}`, updatedDoc);
    return updatedDoc;
  }
  async deleteDocument(id: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.knowledgeBase.delete(id);
    if (deleted) {
      await this.ctx.storage.delete(`doc:${id}`);
    }
    return deleted;
  }
}