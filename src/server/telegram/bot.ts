import { briefToTelegram } from "@/lib/brief";
import { DOMAIN_LABEL } from "@/lib/labels";
import { todayISO } from "@/lib/dates";
import { ctxForUser } from "../ctx";
import { aiEnabled, triageCapture } from "../ai/triage";
import { acceptProposed, getBrief } from "../brief";
import { applySuggestion, captureForUser, dismiss, type Suggestion } from "../captures";
import { db } from "../db";
import { transcribe } from "../stt";
import type { InlineButton, TelegramApi, TgUpdate } from "./api";
import { consumeLinkCode, linkChat } from "./link";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const HELP = [
  "<b>Base Palmela</b>",
  "• Écris ou dicte (note vocale) : ça part dans l'inbox, trié par l'IA.",
  "• /brief — le brief du jour",
  "• /aide — cette aide",
].join("\n");

export const COMMANDS = [
  { command: "brief", description: "Brief du jour" },
  { command: "aide", description: "Aide" },
];

export function briefButtons(date: string): InlineButton[][] {
  return [[{ text: "✅ Prendre ces priorités", callback_data: `pr:${date}` }]];
}

const STATUS_LABEL = { TODAY: "aujourd'hui", WEEK: "cette semaine", BACKLOG: "backlog" } as const;

async function linkLabel(link: string | null) {
  if (!link) return null;
  const [kind, id] = link.split(":");
  if (kind === "p") return (await db.project.findUnique({ where: { id } }))?.title ?? null;
  if (kind === "k") return (await db.keyResult.findUnique({ where: { id } }))?.title ?? null;
  if (kind === "o") return (await db.objective.findUnique({ where: { id } }))?.title ?? null;
  return null;
}

export async function suggestionText(s: Suggestion) {
  const link = await linkLabel(s.link);
  const head = s.kind === "journal" ? "→ <b>Journal</b>" : `→ Tâche (${STATUS_LABEL[s.status]}) : <b>${esc(s.title)}</b>`;
  const meta = [DOMAIN_LABEL[s.domain], link, s.dueDate ? `échéance ${s.dueDate}` : null].filter(Boolean).map((x) => esc(x!)).join(" · ");
  return `${head}\n${meta}\n<i>${esc(s.reason)}</i>`;
}

async function userForChat(chatId: number) {
  return db.telegramLink.findUnique({ where: { chatId: BigInt(chatId) } });
}

/** Capture (texte ou transcription) → inbox → suggestion IA → boutons de validation. */
async function capture(api: TelegramApi, chatId: number, userId: string, text: string, transcript: boolean) {
  const c = await db.capture.create({
    data: { userId, rawText: text.slice(0, 5000), transcript: transcript ? text : null, source: "TELEGRAM" },
  });
  const prefix = transcript ? `🎙 « ${esc(text.slice(0, 500))} »\n\n` : "";
  let suggestion: Suggestion | null = null;
  if (aiEnabled()) {
    try {
      suggestion = await triageCapture(c.id);
    } catch (e) {
      console.error("[telegram] triage", e);
    }
  }
  if (suggestion) {
    await api.sendMessage(chatId, `${prefix}📥 Capturé\n${await suggestionText(suggestion)}`, [
      [{ text: "✅ Appliquer", callback_data: `ap:${c.id}` }],
      [
        { text: "📥 Laisser dans l'inbox", callback_data: `kp:${c.id}` },
        { text: "🗑 Archiver", callback_data: `rm:${c.id}` },
      ],
    ]);
  } else {
    await api.sendMessage(chatId, `${prefix}📥 Ajouté à l'inbox`, [[{ text: "🗑 Annuler", callback_data: `rm:${c.id}` }]]);
  }
}

async function handleMessage(api: TelegramApi, m: NonNullable<TgUpdate["message"]>) {
  const chatId = m.chat.id;
  if (m.chat.type !== "private") return;
  const text = (m.text ?? m.caption ?? "").trim();

  if (text.startsWith("/start")) {
    const code = text.split(/\s+/)[1];
    if (code) {
      const userId = await consumeLinkCode(code);
      if (!userId) return void (await api.sendMessage(chatId, "Code invalide ou expiré. Génère un nouveau lien dans Réglages → Telegram."));
      await linkChat(userId, BigInt(chatId));
      return void (await api.sendMessage(chatId, `✅ Compte lié.\n\n${HELP}`));
    }
  }

  const link = await userForChat(chatId);
  if (!link) return void (await api.sendMessage(chatId, "Ce chat n'est pas lié. Dans l'app : Réglages → Telegram → Lier ce compte."));
  const userId = link.userId;

  if (text === "/aide" || text === "/help" || text === "/start") return void (await api.sendMessage(chatId, HELP));

  if (text.startsWith("/brief")) {
    const ctx = await ctxForUser(userId);
    if (!ctx) return;
    const date = todayISO();
    const { content } = await getBrief(ctx, date, true);
    return void (await api.sendMessage(chatId, briefToTelegram(content), content.proposed.length ? briefButtons(date) : undefined));
  }

  const media = m.voice ?? m.audio;
  if (media) {
    if (!process.env.STT_URL) return void (await api.sendMessage(chatId, "Transcription vocale non configurée (STT_URL)."));
    const { data, path } = await api.downloadFile(media.file_id);
    const said = await transcribe(data, path.split("/").pop() ?? "voice.ogg");
    if (!said) return void (await api.sendMessage(chatId, "Je n'ai rien compris dans ce vocal."));
    return capture(api, chatId, userId, said, true);
  }

  if (text && !text.startsWith("/")) return capture(api, chatId, userId, text, false);
  await api.sendMessage(chatId, HELP);
}

async function handleCallback(api: TelegramApi, q: NonNullable<TgUpdate["callback_query"]>) {
  const chatId = q.message?.chat.id;
  const messageId = q.message?.message_id;
  const link = chatId ? await userForChat(chatId) : null;
  if (!link || !chatId || !messageId || !q.data) return void (await api.answerCallbackQuery(q.id, "Chat non lié"));
  const ctx = await ctxForUser(link.userId);
  if (!ctx) return void (await api.answerCallbackQuery(q.id));
  const [action, arg] = [q.data.slice(0, 2), q.data.slice(3)];

  try {
    if (action === "pr") {
      const n = await acceptProposed(ctx, arg);
      await api.answerCallbackQuery(q.id, n ? `${n} priorité(s) ajoutée(s)` : "Rien à ajouter");
      return;
    }
    const c = await captureForUser(ctx.userId, arg);
    if (c.status === "ROUTED" || c.status === "DISMISSED") return void (await api.answerCallbackQuery(q.id, "Déjà traité"));
    if (action === "ap") {
      const r = await applySuggestion(ctx, c);
      const done = r.kind === "journal" ? "✅ Ajouté au journal" : `✅ Tâche créée : <b>${esc(r.task.title)}</b>${r.note ? `\n<i>${esc(r.note)} — placée dans la semaine</i>` : ""}`;
      await api.editMessageText(chatId, messageId, done);
    } else if (action === "kp") {
      await api.editMessageText(chatId, messageId, `📥 Laissé dans l'inbox : ${esc(c.rawText.slice(0, 200))}`);
    } else if (action === "rm") {
      await dismiss(c);
      await api.editMessageText(chatId, messageId, `🗑 Archivé : <s>${esc(c.rawText.slice(0, 200))}</s>`);
    }
    await api.answerCallbackQuery(q.id);
  } catch (e) {
    await api.answerCallbackQuery(q.id, (e as Error).message.slice(0, 180));
  }
}

export async function handleUpdate(api: TelegramApi, u: TgUpdate) {
  if (u.message) await handleMessage(api, u.message);
  else if (u.callback_query) await handleCallback(api, u.callback_query);
}
