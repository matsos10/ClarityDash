import type { AIProvider } from "./types";
import { getProviderConfig } from "./types";
import { analyzeWithAnthropic } from "./anthropic-provider";
import { analyzeWithOpenAI } from "./openai-provider";

export async function analyzePlan(
  provider: AIProvider,
  base64Data: string,
  mediaType: string,
): Promise<string> {
  const config = getProviderConfig(provider);
  const apiKey = process.env[config.envKey];

  if (!apiKey) {
    throw new Error(
      `Clé API manquante : configurez ${config.envKey} dans votre fichier .env.local`,
    );
  }

  switch (provider) {
    case "anthropic":
      return analyzeWithAnthropic(apiKey, config.model, base64Data, mediaType);

    case "openai":
      return analyzeWithOpenAI(apiKey, config.model, base64Data, mediaType);

    case "deepseek":
      return analyzeWithOpenAI(
        apiKey,
        config.model,
        base64Data,
        mediaType,
        "https://api.deepseek.com",
      );

    default:
      throw new Error(`Provider inconnu : ${provider}`);
  }
}

export function getAvailableProviders(): AIProvider[] {
  const available: AIProvider[] = [];
  if (process.env.ANTHROPIC_API_KEY) available.push("anthropic");
  if (process.env.OPENAI_API_KEY) available.push("openai");
  if (process.env.DEEPSEEK_API_KEY) available.push("deepseek");
  return available;
}
