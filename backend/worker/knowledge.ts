import { Ai } from "@cloudflare/ai";
import mammoth from "mammoth";
import pdf from "pdf-parse";
import { Env } from "./core-utils";

async function getTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  if (file.type === "application/pdf") {
    const data = await pdf(Buffer.from(arrayBuffer));
    return data.text;
  } else if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const { value } = await mammoth.extractRawText({
      arrayBuffer,
    });
    return value;
  } else {
    return new TextDecoder().decode(arrayBuffer);
  }
}

async function embedText(text: string, env: Env): Promise<void> {
  const ai = new Ai(env.AI);
  const chunks = text.split("\n").filter((chunk) => chunk.trim().length > 0);
  const embeddings = await ai.run("@cf/baai/bge-base-en-v1.5", {
    text: chunks,
  });
  const vectors = embeddings.data.map((embedding, i) => ({
    id: `${Date.now()}-${i}`,
    values: embedding,
    metadata: { text: chunks[i] },
  }));
  await env.VECTORIZE_INDEX.upsert(vectors);
}

export async function processAndEmbedDocument(
  file: File,
  env: Env
): Promise<void> {
  const text = await getTextFromFile(file);
  await embedText(text, env);
}
