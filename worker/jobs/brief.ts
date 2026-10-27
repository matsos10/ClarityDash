import { todayISO } from "../../src/lib/dates";
import { ctxForUser } from "../../src/server/ctx";
import { deliverBrief } from "../../src/server/brief";
import { db } from "../../src/server/db";
import { briefButtons } from "../../src/server/telegram/bot";
import { telegramApi } from "../telegram";

/** 07:00 — brief du matin pour chaque utilisateur (push + Telegram). */
export async function morningBrief() {
  const api = telegramApi();
  const date = todayISO();
  for (const u of await db.user.findMany()) {
    const ctx = await ctxForUser(u.id);
    if (!ctx) continue;
    await deliverBrief(ctx, date, api ? async (chatId, html, proposed, d) => void (await api.sendMessage(chatId, html, proposed ? briefButtons(d) : undefined)) : undefined);
  }
}
