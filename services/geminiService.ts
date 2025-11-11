import { GoogleGenAI, Chat } from "@google/genai";

let cachedClient: GoogleGenAI | null = null;
let cachedApiKey: string | null = null;

const getClient = (apiKey: string): GoogleGenAI => {
  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedClient = new GoogleGenAI({ apiKey });
    cachedApiKey = apiKey;
  }
  return cachedClient;
};

export const runChat = (systemInstruction: string): Chat => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Gemini API key is not configured. Please set the VITE_GEMINI_API_KEY environment variable."
    );
  }

  const ai = getClient(apiKey);

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
    },
  });
};
