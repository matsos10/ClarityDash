import webpush from "web-push";
import { db } from "./db";

let configured = false;

function configure() {
  if (configured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? "mailto:admin@example.com", pub, priv);
  configured = true;
  return true;
}

export type PushPayload = { title: string; body?: string; url?: string; tag?: string };

/** Envoie à tous les appareils de l'utilisateur ; supprime les abonnements expirés. */
export async function sendPush(userId: string, payload: PushPayload) {
  if (!configure()) return 0;
  const subs = await db.pushSubscription.findMany({ where: { userId } });
  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 3600 });
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) await db.pushSubscription.delete({ where: { id: s.id } });
    }
  }
  return sent;
}
