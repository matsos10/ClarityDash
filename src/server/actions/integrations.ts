"use server";

import { revalidatePath } from "next/cache";
import { getCtx } from "../access";
import { db } from "../db";
import { createLinkCode } from "../telegram/link";
import { guard } from "./form";

export async function createTelegramLink() {
  return guard(async () => {
    const ctx = await getCtx();
    if (!process.env.TELEGRAM_BOT_TOKEN) throw new Error("Bot Telegram non configuré (TELEGRAM_BOT_TOKEN)");
    await createLinkCode(ctx.userId);
    revalidatePath("/settings");
  });
}

export async function unlinkTelegram() {
  return guard(async () => {
    const ctx = await getCtx();
    await db.telegramLink.deleteMany({ where: { userId: ctx.userId } });
    revalidatePath("/settings");
  });
}
