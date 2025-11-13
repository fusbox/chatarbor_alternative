import { Hono } from "hono";
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
import { processAndEmbedDocument } from "./knowledge";
import { getChatResponse } from "./chat";
/**
 * DO NOT MODIFY THIS FUNCTION. Only for your reference.
 */
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
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

    app.post('/api/knowledge/upload', async (c) => {
        const formData = await c.req.formData();
        const file = formData.get('file');
        if (file) {
            await processAndEmbedDocument(file as File, c.env);
            return c.json({ success: true, message: 'File processed successfully' });
        }

        return c.json({ success: false, error: 'No file provided' }, { status: 400 });
    });

    app.post('/api/v2/chat', async (c) => {
        const { message } = await c.req.json();
        if (!message) {
            return c.json({ success: false, error: 'Message is required' }, { status: 400 });
        }
        const response = await getChatResponse(message, c.env);
        return c.json({ success: true, data: { response } });
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