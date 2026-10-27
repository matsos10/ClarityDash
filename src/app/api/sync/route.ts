import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiCtx } from "@/server/access";
import { applyMutation } from "@/server/mutations";

const body = z.object({
  mutations: z.array(z.object({ id: z.string().min(8).max(64), kind: z.string(), payload: z.unknown(), at: z.number().optional() })).max(200),
});

export async function POST(req: Request) {
  const ctx = await getApiCtx();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });

  // Rejeu dans l'ordre de création ; une mutation invalide n'empêche pas les suivantes.
  const results: { id: string; ok: boolean; error?: string }[] = [];
  for (const m of parsed.data.mutations) {
    try {
      await applyMutation(ctx, m);
      results.push({ id: m.id, ok: true });
    } catch (e) {
      results.push({ id: m.id, ok: false, error: e instanceof z.ZodError ? "Données invalides" : (e as Error).message });
    }
  }
  return NextResponse.json({ results });
}
