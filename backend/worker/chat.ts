import { Ai } from "@cloudflare/ai";
import { Env } from "./core-utils";

export async function getChatResponse(
  message: string,
  env: Env
): Promise<string> {
  const ai = new Ai(env.AI);

  // 1. Generate embedding for the user's message
  const embeddings = await ai.run("@cf/baai/bge-base-en-v1.5", {
    text: [message],
  });
  const vector = embeddings.data[0];

  // 2. Query the Vectorize index
  const similarVectors = await env.VECTORIZE_INDEX.query(vector, { topK: 5 });
  const context = similarVectors.matches
    .map((match) => match.metadata?.text)
    .join("\n");

  // 3. Generate a response using a language model
  const { response } = await ai.run(
    "@cf/meta/llama-2-7b-chat-int8",
    {
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant. Use the following context to answer the user's question:\n${context}`,
        },
        { role: "user", content: message },
      ],
    }
  );

  return response;
}
