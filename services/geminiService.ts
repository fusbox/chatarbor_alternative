import { GoogleGenAI, Chat } from "@google/genai";

// Ensure the API key is available from environment variables.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fix: Removed deprecated and unused model reference `ai.models['gemini-2.5-flash']` which is prohibited by the coding guidelines.

export const runChat = (systemInstruction: string): Chat => {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
  });
  return chat;
};
