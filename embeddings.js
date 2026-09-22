import { configDotenv } from "dotenv";
import OpenAI from "openai";

configDotenv();

const client = new OpenAI({
  apiKey: process.env.API_KEY,
});

export async function embeddings(text) {
  const { data } = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return data[0].embedding;
}

