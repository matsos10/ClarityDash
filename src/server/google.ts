import { db } from "./db";

// Google Agenda via REST (jetons OAuth stockés dans Account par NextAuth).

const API = process.env.GOOGLE_API_BASE ?? "https://www.googleapis.com";
const TOKEN_URL = process.env.GOOGLE_TOKEN_URL ?? "https://oauth2.googleapis.com/token";
const CALENDAR_ID = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID ?? "primary");

export const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";

export class GoogleNotConnected extends Error {
  constructor(message = "Google Agenda non connecté") {
    super(message);
  }
}

export type CalEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  /** Événement créé par Base Palmela pour une tâche (timebox) */
  taskId: string | null;
  link: string | null;
};

type GEvent = {
  id: string;
  summary?: string;
  status?: string;
  htmlLink?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  extendedProperties?: { private?: Record<string, string> };
};

async function googleAccount(userId: string) {
  const acc = await db.account.findFirst({ where: { userId, provider: "google" } });
  if (!acc || !acc.scope?.includes(CALENDAR_SCOPE)) throw new GoogleNotConnected();
  return acc;
}

async function accessToken(userId: string, force = false): Promise<string> {
  const acc = await googleAccount(userId);
  if (!force && acc.access_token && acc.expires_at && acc.expires_at * 1000 > Date.now() + 60_000) return acc.access_token;
  if (!acc.refresh_token) throw new GoogleNotConnected("Reconnecte Google (jeton de rafraîchissement absent)");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: acc.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new GoogleNotConnected(`Reconnecte Google (rafraîchissement refusé : ${res.status})`);
  const j = (await res.json()) as { access_token: string; expires_in: number };
  await db.account.update({
    where: { id: acc.id },
    data: { access_token: j.access_token, expires_at: Math.floor(Date.now() / 1000) + j.expires_in },
  });
  return j.access_token;
}

async function gapi<T>(userId: string, path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const token = await accessToken(userId, retried);
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...init.headers },
  });
  if (res.status === 401 && !retried) return gapi(userId, path, init, true);
  if (!res.ok && !(init.method === "DELETE" && (res.status === 404 || res.status === 410))) {
    throw new Error(`Google Agenda : erreur ${res.status}`);
  }
  return (res.status === 204 || init.method === "DELETE" ? null : await res.json()) as T;
}

function toCalEvent(e: GEvent): CalEvent {
  const allDay = !e.start.dateTime;
  return {
    id: e.id,
    title: e.summary ?? "(sans titre)",
    start: new Date(e.start.dateTime ?? `${e.start.date}T00:00:00Z`),
    end: new Date(e.end.dateTime ?? `${e.end.date}T00:00:00Z`),
    allDay,
    taskId: e.extendedProperties?.private?.palmelaTaskId ?? null,
    link: e.htmlLink ?? null,
  };
}

// Petit cache en mémoire (l'agenda est lu à chaque affichage d'Aujourd'hui / Semaine).
const cache = new Map<string, { at: number; events: CalEvent[] }>();
const TTL = 2 * 60_000;

export function invalidateAgenda(userId: string) {
  for (const k of cache.keys()) if (k.startsWith(`${userId}|`)) cache.delete(k);
}

export async function listEvents(userId: string, from: Date, to: Date): Promise<CalEvent[]> {
  const key = `${userId}|${from.toISOString()}|${to.toISOString()}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.events;
  const qs = new URLSearchParams({
    timeMin: from.toISOString(),
    timeMax: to.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  });
  const data = await gapi<{ items?: GEvent[] }>(userId, `/calendar/v3/calendars/${CALENDAR_ID}/events?${qs}`);
  const events = (data.items ?? [])
    .filter((e) => e.status !== "cancelled")
    .map(toCalEvent)
    .sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.start.getTime() - b.start.getTime());
  cache.set(key, { at: Date.now(), events });
  return events;
}

/** Agenda tolérant : renvoie connected=false au lieu d'échouer. */
export async function safeListEvents(userId: string, from: Date, to: Date) {
  try {
    return { connected: true as const, events: await listEvents(userId, from, to), error: null };
  } catch (e) {
    return { connected: !(e instanceof GoogleNotConnected), events: [] as CalEvent[], error: (e as Error).message };
  }
}

/** Crée ou met à jour l'événement de timebox d'une tâche ; renvoie son id. */
export async function upsertTaskEvent(
  userId: string,
  task: { id: string; title: string; calendarEventId: string | null; start: Date; end: Date; description?: string | null },
): Promise<string> {
  const body = JSON.stringify({
    summary: task.title,
    description: task.description ?? "Bloc planifié depuis Base Palmela",
    start: { dateTime: task.start.toISOString() },
    end: { dateTime: task.end.toISOString() },
    extendedProperties: { private: { palmelaTaskId: task.id } },
  });
  invalidateAgenda(userId);
  if (task.calendarEventId) {
    try {
      const e = await gapi<GEvent>(userId, `/calendar/v3/calendars/${CALENDAR_ID}/events/${encodeURIComponent(task.calendarEventId)}`, {
        method: "PATCH",
        body,
      });
      return e.id;
    } catch (err) {
      if (err instanceof GoogleNotConnected) throw err;
      // événement supprimé côté Google : on le recrée
    }
  }
  const e = await gapi<GEvent>(userId, `/calendar/v3/calendars/${CALENDAR_ID}/events`, { method: "POST", body });
  return e.id;
}

export async function deleteEvent(userId: string, eventId: string) {
  invalidateAgenda(userId);
  await gapi(userId, `/calendar/v3/calendars/${CALENDAR_ID}/events/${encodeURIComponent(eventId)}`, { method: "DELETE" });
}

export async function googleStatus(userId: string) {
  const acc = await db.account.findFirst({ where: { userId, provider: "google" } });
  return { linked: !!acc, calendar: !!acc?.scope?.includes(CALENDAR_SCOPE), refresh: !!acc?.refresh_token };
}
