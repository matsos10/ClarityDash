import Anthropic from "@anthropic-ai/sdk";
import { PLAN_ANALYSIS_PROMPT } from "./prompt";

export async function analyzeWithAnthropic(
  apiKey: string,
  model: string,
  base64Data: string,
  mediaType: string,
): Promise<string> {
  const anthropic = new Anthropic({ apiKey });

  const content: Anthropic.ContentBlockParam[] = [];

  if (mediaType === "application/pdf") {
    content.push({
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: base64Data,
      },
    } as unknown as Anthropic.ContentBlockParam);
  } else {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: mediaType as
          | "image/jpeg"
          | "image/png"
          | "image/gif"
          | "image/webp",
        data: base64Data,
      },
    });
  }

  content.push({ type: "text", text: PLAN_ANALYSIS_PROMPT });

  const response = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    messages: [{ role: "user", content }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Pas de réponse textuelle du modèle Anthropic");
  }

  return textBlock.text;
}
