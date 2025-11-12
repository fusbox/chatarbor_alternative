import OpenAI from 'openai';
import type { Message, ToolCall, KnowledgeDocument } from './types';
import { getToolDefinitions, executeTool } from './tools';
import { ChatCompletionMessageFunctionToolCall, ChatCompletionMessageToolCall } from 'openai/resources/index.mjs';
import { getAppController } from './core-utils';
import type { Env } from './core-utils';
import { Stream } from 'openai/streaming.mjs';
/**
 * ChatHandler - Handles all chat-related operations
 */
export class ChatHandler {
  private client: OpenAI;
  private model: string;
  private env: Env;
  constructor(aiGatewayUrl: string, apiKey: string, model: string, env: Env) {
    this.client = new OpenAI({
      baseURL: aiGatewayUrl,
      apiKey: apiKey
    });
    this.model = model;
    this.env = env;
  }
  private async getRagContext(query: string): Promise<{ context: string, documents: KnowledgeDocument[] }> {
    try {
      const controller = getAppController(this.env);
      const documents = await controller.getDocuments();
      if (!documents || documents.length === 0) {
        return { context: "", documents: [] };
      }
      // Simple keyword matching for RAG simulation
      const queryWords = query.toLowerCase().split(/\s+/);
      const scoredDocs = documents.map(doc => {
        const content = doc.content.toLowerCase();
        const title = doc.title.toLowerCase();
        let score = 0;
        queryWords.forEach(word => {
          if (content.includes(word)) score++;
          if (title.includes(word)) score += 2; // Weight title matches higher
        });
        return { ...doc, score };
      }).filter(doc => doc.score > 0);
      if (scoredDocs.length === 0) {
        return { context: "", documents: [] };
      }
      scoredDocs.sort((a, b) => b.score - a.score);
      // For simplicity, we'll use the top document as context
      const topDoc = scoredDocs[0];
      const context = `CONTEXT: The user is asking about a topic related to "${topDoc.title}". Here is some information from the knowledge base: "${topDoc.content}"\n\n`;
      return { context, documents: [topDoc] };
    } catch (error) {
      console.error("Error fetching RAG context:", error);
      return { context: "", documents: [] };
    }
  }
  async processMessage(
    message: string,
    conversationHistory: Message[],
    stream: boolean
  ): Promise<{
    response: string | ReadableStream;
    toolCalls?: ToolCall[];
    context?: string;
  }> {
    const { context: ragContext } = await this.getRagContext(message);
    const messages = this.buildConversationMessages(message, conversationHistory, ragContext);
    const toolDefinitions = await getToolDefinitions();
    if (!stream) {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages,
        tools: toolDefinitions,
        tool_choice: 'auto',
        max_tokens: 16000,
        stream: false
      });
      const response = await this.handleNonStreamResponse(completion, message, conversationHistory);
      return { response: response.content, toolCalls: response.toolCalls, context: ragContext };
    }
    // Handle streaming
    const readableStream = new ReadableStream({
      start: async (controller: ReadableStreamDefaultController) => {
        const openAIStream = await this.client.chat.completions.create({
          model: this.model,
          messages,
          tools: toolDefinitions,
          tool_choice: 'auto',
          stream: true,
        });
        const toolCalls: ChatCompletionMessageFunctionToolCall[] = [];
        let finalResponseStream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk> | null = null;
        for await (const chunk of openAIStream) {
          if (chunk.choices[0]?.delta?.tool_calls) {
            // Accumulate tool calls
            for (const toolCall of chunk.choices[0].delta.tool_calls) {
              if (toolCall.index === toolCalls.length) {
                toolCalls.push({ id: '', function: { name: '', arguments: '' }, type: 'function' });
              }
              const currentTool = toolCalls[toolCall.index];
              if (toolCall.id) currentTool.id = toolCall.id;
              if (toolCall.function?.name) currentTool.function.name = toolCall.function.name;
              if (toolCall.function?.arguments) currentTool.function.arguments += toolCall.function.arguments;
            }
          }
          if (chunk.choices[0]?.finish_reason === 'tool_calls') {
            const executedToolCalls = await this.executeToolCalls(toolCalls as ChatCompletionMessageFunctionToolCall[]);
            const toolResponseMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = this.buildConversationMessages(message, conversationHistory, ragContext);
            toolResponseMessages.push({ role: 'assistant', content: '', tool_calls: toolCalls });
            for (const toolResult of executedToolCalls) {
              toolResponseMessages.push({
                role: 'tool',
                tool_call_id: toolResult.id,
                content: JSON.stringify(toolResult.result),
              });
            }
            finalResponseStream = await this.client.chat.completions.create({
              model: this.model,
              messages: toolResponseMessages,
              stream: true,
            });
            break; // Exit the first stream loop
          }
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
          }
        }
        if (finalResponseStream) {
          for await (const chunk of finalResponseStream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
        }
        // Send context as the last chunk
        const contextPayload = `\n<CONTEXT>${ragContext}</CONTEXT>`;
        controller.enqueue(new TextEncoder().encode(contextPayload));
        controller.close();
      },
    });
    return { response: readableStream, context: ragContext };
  }
  private async handleNonStreamResponse(
    completion: OpenAI.Chat.Completions.ChatCompletion,
    message: string,
    conversationHistory: Message[]
  ) {
    const responseMessage = completion.choices[0]?.message;
    if (!responseMessage) {
      return { content: 'I apologize, but I encountered an issue processing your request.' };
    }
    if (!responseMessage.tool_calls) {
      return {
        content: responseMessage.content || 'I apologize, but I encountered an issue.'
      };
    }
    const toolCalls = await this.executeToolCalls(responseMessage.tool_calls as ChatCompletionMessageFunctionToolCall[]);
    const finalResponse = await this.generateToolResponse(
      message,
      conversationHistory,
      responseMessage.tool_calls,
      toolCalls
    );
    return { content: finalResponse, toolCalls };
  }
  private async executeToolCalls(openAiToolCalls: ChatCompletionMessageFunctionToolCall[]): Promise<ToolCall[]> {
    return Promise.all(
      openAiToolCalls.map(async (tc) => {
        try {
          const args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
          const result = await executeTool(tc.function.name, args);
          return {
            id: tc.id,
            name: tc.function.name,
            arguments: args,
            result
          };
        } catch (error) {
          console.error(`Tool execution failed for ${tc.function.name}:`, error);
          return {
            id: tc.id,
            name: tc.function.name,
            arguments: {},
            result: { error: `Failed to execute ${tc.function.name}: ${error instanceof Error ? error.message : 'Unknown error'}` }
          };
        }
      })
    );
  }
  private async generateToolResponse(
    userMessage: string,
    history: Message[],
    openAiToolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
    toolResults: ToolCall[]
  ): Promise<string> {
    const followUpCompletion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant. Respond naturally to the tool results.' },
        ...history.slice(-3).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
        {
          role: 'assistant',
          content: '',
          tool_calls: openAiToolCalls
        },
        ...toolResults.map((result, index) => ({
          role: 'tool' as const,
          content: JSON.stringify(result.result),
          tool_call_id: openAiToolCalls[index]?.id || result.id
        }))
      ],
      max_tokens: 16000
    });
    return followUpCompletion.choices[0]?.message?.content || 'Tool results processed successfully.';
  }
  private buildConversationMessages(userMessage: string, history: Message[], ragContext: string) {
    const systemMessage = `You are a helpful AI assistant for job seekers. Your name is CareerForge AI. Use the provided context from the knowledge base to answer questions accurately. If the context is not relevant, say you don't have information on that topic.
${ragContext}`;
    return [
      {
        role: 'system' as const,
        content: systemMessage
      },
      ...history.slice(-5).map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user' as const, content: userMessage }
    ];
  }
  updateModel(newModel: string): void {
    this.model = newModel;
  }
}