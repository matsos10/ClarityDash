import OpenAI from "openai";
import { PLAN_ANALYSIS_PROMPT } from "./prompt";

export async function analyzeWithOpenAI(
  apiKey: string,
  model: string,
  base64Data: string,
  mediaType: string,
  baseURL?: string,
): Promise<string> {
  const client = new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });

  const dataUrl = `data:${mediaType};base64,${base64Data}`;

  const response = await client.chat.completions.create({
    model,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: dataUrl, detail: "high" },
          },
          {
            type: "text",
            text: PLAN_ANALYSIS_PROMPT,
          },
        ],
      },
    ],
  });

  const text = response.choices[0]?.message?.content;
  if (!text) {
    throw new Error("Pas de réponse textuelle du modèle");
  }

  return text;
}
