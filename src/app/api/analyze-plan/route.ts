import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const ANALYSIS_PROMPT = `Tu es un expert en analyse de plans d'architecture. Analyse ce plan de construction et extrais toutes les informations détectables pour un projet de construction en ossature métallique légère (LSF - Light Steel Framing).

Examine attentivement le plan et identifie :
1. Les pièces (nom et surface estimée en m² si possible)
2. Les fenêtres (dimensions estimées en mm, quantité par type)
3. Les portes (dimensions estimées en mm, quantité, intérieure ou extérieure)
4. La surface totale du plancher (en m²)
5. Le périmètre extérieur du bâtiment (en mètres)
6. La longueur totale des cloisons intérieures (en mètres)
7. Le nombre d'étages visibles
8. La hauteur des murs (en mm) si indiquée
9. Le type de toiture si visible (gable, hip, mono-pitch, flat)
10. La pente de toiture en degrés si visible
11. Les dimensions générales du bâtiment (largeur et longueur en mètres)

RÈGLES IMPORTANTES :
- Retourne UNIQUEMENT un objet JSON valide, sans texte avant ou après
- Pour les valeurs que tu ne peux pas déterminer avec certitude, utilise null
- Les dimensions des fenêtres et portes en MILLIMÈTRES
- Les surfaces en m², les longueurs en mètres
- Sois précis si des cotes sont visibles, sinon estime de façon conservatrice
- Les fenêtres standard font environ 1200x1400mm, les portes 900x2100mm
- Regroupe les fenêtres de même dimension (augmente la quantité)
- Distingue bien les portes extérieures (entrée, terrasse) des intérieures

Format JSON :
{
  "projectName": "string - nom du projet si visible, sinon 'Mon Projet LSF'",
  "detectedRooms": [{"name": "string", "estimatedArea": number|null}],
  "totalFloorArea": number|null,
  "perimeterLength": number|null,
  "interiorWallLength": number|null,
  "wallHeight": number|null,
  "numberOfFloors": number|null,
  "windows": [{"width": number, "height": number, "quantity": number}],
  "doors": [{"width": number, "height": number, "quantity": number, "isExterior": boolean}],
  "roofType": "gable"|"hip"|"mono-pitch"|"flat"|null,
  "roofPitch": number|null,
  "buildingWidth": number|null,
  "buildingLength": number|null,
  "notes": "observations sur le plan, éléments détectés, limites de l'analyse"
}`;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "ANTHROPIC_API_KEY non configurée. Ajoutez-la dans votre fichier .env.local",
        },
        { status: 500 },
      );
    }

    const { dataUrl, fileType } = await request.json();

    if (!dataUrl) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 },
      );
    }

    const base64Data = dataUrl.replace(/^data:[^;]+;base64,/, "");

    const anthropic = new Anthropic({ apiKey });

    const content: Anthropic.ContentBlockParam[] = [];

    if (fileType === "application/pdf") {
      content.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64Data },
      } as unknown as Anthropic.ContentBlockParam);
    } else {
      const mediaType = fileType.startsWith("image/")
        ? (fileType as "image/jpeg" | "image/png" | "image/gif" | "image/webp")
        : "image/png";
      content.push({
        type: "image",
        source: { type: "base64", media_type: mediaType, data: base64Data },
      });
    }

    content.push({ type: "text", text: ANALYSIS_PROMPT });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "Pas de réponse textuelle du modèle" },
        { status: 500 },
      );
    }

    let jsonText = textBlock.text.trim();
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const analysis = JSON.parse(jsonText);

    return NextResponse.json({ analysis });
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
