export type AIProvider = "anthropic" | "openai" | "deepseek";

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  description: string;
  model: string;
  envKey: string;
}

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    description: "Claude Sonnet — excellent pour l'analyse de plans architecturaux",
    model: "claude-sonnet-4-20250514",
    envKey: "ANTHROPIC_API_KEY",
  },
  {
    id: "openai",
    name: "OpenAI (GPT)",
    description: "GPT-4o — analyse visuelle performante",
    model: "gpt-4o",
    envKey: "OPENAI_API_KEY",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "DeepSeek-V3 — alternative économique",
    model: "deepseek-chat",
    envKey: "DEEPSEEK_API_KEY",
  },
];

export function getProviderConfig(id: AIProvider): AIProviderConfig {
  const config = AI_PROVIDERS.find((p) => p.id === id);
  if (!config) throw new Error(`Unknown provider: ${id}`);
  return config;
}
