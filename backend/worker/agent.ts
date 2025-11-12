import { Agent } from 'agents';
import type { Env } from './core-utils';
import type { ChatState } from './types';
import { ChatHandler } from './chat';
import { API_RESPONSES } from './config';
import { createMessage, createStreamResponse } from './utils';
/**
 * ChatAgent - Main agent class using Cloudflare Agents SDK
 *
 * This class extends the Agents SDK Agent class and handles all chat operations.
 */
export class ChatAgent extends Agent<Env, ChatState> {
  private chatHandler?: ChatHandler;
  // Initial state for new chat sessions
  initialState: ChatState = {
    messages: [],
    sessionId: crypto.randomUUID(),
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.5-flash',
    knowledgeBase: [],
  };
  /**
   * Initialize chat handler when agent starts
   */
  async onStart(): Promise<void> {
    this.chatHandler = new ChatHandler(
      this.env.CF_AI_BASE_URL ,
      this.env.CF_AI_API_KEY,
      this.state.model,
      this.env
    );
    console.log(`ChatAgent ${this.name} initialized with session ${this.state.sessionId}`);
  }
  /**
   * Handle incoming requests - clean routing with error handling
   */
  async onRequest(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const method = request.method;
      // Route to appropriate handler
      if (method === 'GET' && url.pathname === '/messages') {
        return this.handleGetMessages();
      }
      if (method === 'POST' && url.pathname === '/chat') {
        return this.handleChatMessage(await request.json());
      }
      if (method === 'DELETE' && url.pathname === '/clear') {
        return this.handleClearMessages();
      }
      if (method === 'POST' && url.pathname === '/model') {
        return this.handleModelUpdate(await request.json());
      }
      return Response.json({
        success: false,
        error: API_RESPONSES.NOT_FOUND
      }, { status: 404 });
    } catch (error) {
      console.error('Request handling error:', error);
      return Response.json({
        success: false,
        error: API_RESPONSES.INTERNAL_ERROR
      }, { status: 500 });
    }
  }
  /**
   * Get current conversation messages
   */
  private handleGetMessages(): Response {
    return Response.json({
      success: true,
      data: this.state
    });
  }
  /**
   * Process new chat message
   */
  private async handleChatMessage(body: { message: string; model?: string; stream?: boolean }): Promise<Response> {
    const { message, model, stream = true } = body;
    if (!message?.trim()) {
      return Response.json({
        success: false,
        error: API_RESPONSES.MISSING_MESSAGE
      }, { status: 400 });
    }
    if (model && model !== this.state.model) {
      this.setState({ ...this.state, model });
      this.chatHandler?.updateModel(model);
    }
    const userMessage = createMessage('user', message.trim());
    this.setState({
      ...this.state,
      messages: [...this.state.messages, userMessage],
      isProcessing: true
    });
    try {
      if (!this.chatHandler) {
        throw new Error('Chat handler not initialized');
      }
      const { response, toolCalls } = await this.chatHandler.processMessage(
        message,
        this.state.messages,
        stream
      );
      if (response instanceof ReadableStream) {
        // We don't get the final message content here, so we can't save it to state yet.
        // The client will have the full conversation.
        this.setState({ ...this.state, isProcessing: false });
        return createStreamResponse(response);
      }
      // Non-streaming response
      const assistantMessage = createMessage('assistant', response, toolCalls);
      this.setState({
        ...this.state,
        messages: [...this.state.messages, assistantMessage],
        isProcessing: false
      });
      return Response.json({
        success: true,
        data: this.state,
      });
    } catch (error) {
      console.error('Chat processing error:', error);
      this.setState({ ...this.state, isProcessing: false });
      return Response.json({
        success: false,
        error: API_RESPONSES.PROCESSING_ERROR
      }, { status: 500 });
    }
  }
  /**
   * Clear conversation history
   */
  private handleClearMessages(): Response {
    this.setState({
      ...this.state,
      messages: []
    });
    return Response.json({
      success: true,
      data: this.state
    });
  }
  /**
   * Update selected AI model
   */
  private handleModelUpdate(body: { model: string }): Response {
    const { model } = body;
    this.setState({ ...this.state, model });
    this.chatHandler?.updateModel(model);
    return Response.json({
      success: true,
      data: this.state
    });
  }
}