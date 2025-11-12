import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
/**
 * DO NOT MODIFY THIS FUNCTION. Only for your reference.
 */
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    // Use this API for conversations. **DO NOT MODIFY**
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
        const sessionId = c.req.param('sessionId');
        const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId); // Get existing agent or create a new one if it doesn't exist, with sessionId as the name
        const url = new URL(c.req.url);
        url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
        return agent.fetch(new Request(url.toString(), {
            method: c.req.method,
            headers: c.req.header(),
            body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
        }));
        } catch (error) {
        console.error('Agent routing error:', error);
        return c.json({
            success: false,
            error: API_RESPONSES.AGENT_ROUTING_FAILED
        }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Knowledge Base Routes
    app.get('/api/knowledge', async (c) => {
        const controller = getAppController(c.env);
        const documents = await controller.getDocuments();
        return c.json({ success: true, data: documents });
    });
    app.post('/api/knowledge', async (c) => {
        const body = await c.req.json();
        if (!body.title || !body.content) {
            return c.json({ success: false, error: 'Title and content are required' }, { status: 400 });
        }
        const controller = getAppController(c.env);
        const newDoc = await controller.addDocument(body);
        return c.json({ success: true, data: newDoc }, { status: 201 });
    });
    app.put('/api/knowledge/:id', async (c) => {
        const id = c.req.param('id');
        const body = await c.req.json();
        const controller = getAppController(c.env);
        const updatedDoc = await controller.updateDocument(id, body);
        if (!updatedDoc) {
            return c.json({ success: false, error: 'Document not found' }, { status: 404 });
        }
        return c.json({ success: true, data: updatedDoc });
    });
    app.delete('/api/knowledge/:id', async (c) => {
        const id = c.req.param('id');
        const controller = getAppController(c.env);
        const deleted = await controller.deleteDocument(id);
        if (!deleted) {
            return c.json({ success: false, error: 'Document not found' }, { status: 404 });
        }
        return c.json({ success: true, data: { id } });
    });
    // Session Management Routes
    app.get('/api/sessions', async (c) => {
        try {
            const controller = getAppController(c.env);
            const sessions = await controller.listSessions();
            return c.json({ success: true, data: sessions });
        } catch (error) {
            console.error('Failed to list sessions:', error);
            return c.json({
                success: false,
                error: 'Failed to retrieve sessions'
            }, { status: 500 });
        }
    });
}