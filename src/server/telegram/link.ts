import { randomBytes } from "node:crypto";
import { db } from "../db";

const PREFIX = "telegram:";
const TTL_MS = 15 * 60_000;

/** Code à usage unique pour lier un chat Telegram (deep link t.me/<bot>?start=<code>). */
export async function createLinkCode(userId: string) {
  await db.verificationToken.deleteMany({ where: { identifier: `${PREFIX}${userId}` } });
  const token = randomBytes(9).toString("base64url");
  await db.verificationToken.create({ data: { identifier: `${PREFIX}${userId}`, token, expires: new Date(Date.now() + TTL_MS) } });
  return token;
}

export async function consumeLinkCode(code: string): Promise<string | null> {
  const row = await db.verificationToken.findUnique({ where: { token: code } });
  if (!row || !row.identifier.startsWith(PREFIX)) return null;
  await db.verificationToken.delete({ where: { token: code } });
  if (row.expires < new Date()) return null;
  return row.identifier.slice(PREFIX.length);
}

export async function linkChat(userId: string, chatId: bigint) {
  await db.$transaction([
    db.telegramLink.deleteMany({ where: { chatId, NOT: { userId } } }),
    db.telegramLink.upsert({ where: { userId }, update: { chatId, linkedAt: new Date() }, create: { userId, chatId } }),
  ]);
}
