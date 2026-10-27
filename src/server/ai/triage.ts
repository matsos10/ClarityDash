import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { Prisma } from "@prisma/client";
import { z } from "zod/v4";
import { quarterOf, todayISO } from "@/lib/dates";
import { ctxForUser, spaceIdsFor } from "../ctx";
import type { Suggestion } from "../captures";
import { db } from "../db";
import { resolveLink } from "../tasks";

// Tri de l'inbox par Claude : chaque capture reçoit une suggestion (tâche ou journal),
// que l'utilisateur valide d'un tap (app ou Telegram). Rien n'est créé sans validation.

export const AI_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5";

const SuggestionSchema = z.object({
  kind: z.enum(["task", "journal"]),
  module: z.enum(["HORIZONS", "TRADING", "BUSINESS", "FINANCE", "HOME", "FAMILY", "ADMIN", "PERSONAL"]),
  title: z.string(),
  domain: z.enum(["BUSINESS", "TRADING", "HOME", "FAMILY", "PERSONAL"]),
  status: z.enum(["TODAY", "WEEK", "BACKLOG"]),
  link: z.string().nullable(),
  dueDate: z.string().nullable(),
  reason: z.string(),
});

const SYSTEM = `Tu tries l'inbox de Base Palmela, le système de pilotage de vie de Matias (Palmela, Portugal) et d'Ana.
Contexte : Matias est fondateur solo (PME-IA, OfficePulse, SaaS Transparência salarial, SaaS orçamentos IA), trader prop (XAUUSD / MGC, Topstep, FundedNext), gère une maison LSF en construction à Algeruz, un projet solaire, des biens loués, une rénovation, un litige, sa famille (Ana, Eva, Matheo), un livre, une association, du sport et de l'agriculture.
Les captures sont en français ou en portugais, souvent dictées.

Pour chaque capture, propose UNE destination :
- kind "task" : une action à faire. title = verbe d'action court et concret, dans la langue de la capture.
- kind "journal" : une réflexion, un constat, une émotion, un bilan — rien à faire.
domain : BUSINESS, TRADING, HOME (maison, chantiers, solaire, biens, litige), FAMILY, PERSONAL (livre, sport, association, agriculture, santé).
module : le module de l'app concerné (HORIZONS par défaut ; FAMILY, HOME, FINANCE, ADMIN, TRADING, BUSINESS si c'est évident).
status : TODAY seulement si la capture dit explicitement aujourd'hui / urgent ; WEEK si c'est cette semaine ; sinon BACKLOG.
link : l'identifiant exact ("p:…", "k:…" ou "o:…") du projet, du KR ou de l'objectif servi, choisi uniquement dans la liste fournie ; null si aucun ne correspond clairement. Préfère le projet le plus précis.
dueDate : AAAA-MM-JJ si une échéance est mentionnée (calcule les dates relatives depuis la date du jour), sinon null.
reason : une phrase courte qui justifie le classement.`;

let client: Anthropic | null = null;

export function aiEnabled() {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

async function linkCatalog(userId: string) {
  const ctx = await ctxForUser(userId);
  if (!ctx) throw new Error("Utilisateur introuvable");
  const spaceIds = spaceIdsFor(ctx, "HORIZONS");
  const [projects, krs, objectives] = await Promise.all([
    db.project.findMany({ where: { spaceId: { in: spaceIds }, deletedAt: null, status: { in: ["ACTIVE", "WAITING", "BLOCKED"] } }, orderBy: { title: "asc" } }),
    db.keyResult.findMany({ where: { quarter: quarterOf(todayISO()), archivedAt: null, objective: { spaceId: { in: spaceIds } } } }),
    db.objective.findMany({ where: { spaceId: { in: spaceIds } }, orderBy: { order: "asc" } }),
  ]);
  const lines = [
    ...projects.map((p) => `p:${p.id} — projet « ${p.title} » (${p.domain})`),
    ...krs.map((k) => `k:${k.id} — KR « ${k.title} »`),
    ...objectives.map((o) => `o:${o.id} — objectif « ${o.title} »`),
  ];
  return { ctx, catalog: lines.join("\n") };
}

/** Demande une suggestion à Claude ; renvoie null si l'IA n'est pas configurée ou refuse. */
export async function suggestForText(userId: string, text: string): Promise<Suggestion | null> {
  if (!aiEnabled()) return null;
  const { ctx, catalog } = await linkCatalog(userId);
  client ??= new Anthropic();
  const response = await client.beta.messages.parse({
    model: AI_MODEL,
    max_tokens: 4096,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: betaZodOutputFormat(SuggestionSchema) },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Date du jour : ${todayISO()}\n\nProjets, KR et objectifs disponibles :\n${catalog || "(aucun)"}\n\nCapture :\n"""\n${text}\n"""`,
      },
    ],
  });
  if (response.stop_reason === "refusal" || !response.parsed_output) return null;
  const s = response.parsed_output;
  // ne garder qu'un lien réellement accessible et une date valide
  const link = s.link ? await resolveLink(ctx, s.link).then(() => s.link, () => null) : null;
  const dueDate = s.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(s.dueDate) ? s.dueDate : null;
  return { ...s, link, dueDate, title: s.title.slice(0, 300) };
}

/** Trie une capture en attente et enregistre la suggestion. */
export async function triageCapture(captureId: string): Promise<Suggestion | null> {
  const capture = await db.capture.findUnique({ where: { id: captureId } });
  if (!capture || capture.status !== "PENDING") return (capture?.suggestion as Suggestion | null) ?? null;
  const suggestion = await suggestForText(capture.userId, capture.transcript ?? capture.rawText);
  if (!suggestion) return null;
  await db.capture.update({
    where: { id: capture.id },
    data: { suggestion: suggestion as unknown as Prisma.InputJsonValue, suggestedModule: suggestion.module as never, status: "SUGGESTED" },
  });
  return suggestion;
}

/** Trie les captures en attente (appelé par le worker). */
export async function triagePending(limit = 10) {
  if (!aiEnabled()) return 0;
  // délai de 30 s : les captures Telegram sont triées tout de suite par le bot
  const pending = await db.capture.findMany({
    where: { status: "PENDING", createdAt: { lt: new Date(Date.now() - 30_000) } },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  let n = 0;
  for (const c of pending) {
    try {
      if (await triageCapture(c.id)) n++;
    } catch (e) {
      if (e instanceof Anthropic.RateLimitError) break;
      console.error(`[triage] ${c.id}`, e instanceof Anthropic.APIError ? `${e.status} ${e.message}` : e);
    }
  }
  return n;
}
