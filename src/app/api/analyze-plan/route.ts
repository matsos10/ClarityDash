import { NextResponse } from "next/server";
import { analyzePlan, getAvailableProviders } from "@/lib/ai";
import type { AIProvider } from "@/lib/ai/types";

export async function GET() {
  const available = getAvailableProviders();
  return NextResponse.json({ providers: available });
}

export async function POST(request: Request) {
  try {
    const { dataUrl, fileType, provider } = await request.json();

    if (!dataUrl) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 },
      );
    }

    const selectedProvider: AIProvider = provider ?? "anthropic";

    const available = getAvailableProviders();
    if (available.length === 0) {
      return NextResponse.json(
        {
          error:
            "Aucune clé API configurée. Ajoutez ANTHROPIC_API_KEY, OPENAI_API_KEY ou DEEPSEEK_API_KEY dans votre fichier .env.local",
        },
        { status: 500 },
      );
    }

    if (!available.includes(selectedProvider)) {
      return NextResponse.json(
        {
          error: `Le provider "${selectedProvider}" n'est pas configuré. Providers disponibles : ${available.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const base64Data = dataUrl.replace(/^data:[^;]+;base64,/, "");
    const mediaType = fileType || "image/png";

    const rawText = await analyzePlan(selectedProvider, base64Data, mediaType);

    let jsonText = rawText.trim();
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const analysis = JSON.parse(jsonText);

    return NextResponse.json({ analysis, provider: selectedProvider });
  } catch (error) {
    console.error("Plan analysis error:", error);
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: `Erreur lors de l'analyse : ${message}` },
      { status: 500 },
    );
  }
}
