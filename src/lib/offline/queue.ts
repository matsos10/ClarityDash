"use client";

import { get, update } from "idb-keyval";

// File de mutations hors ligne : chaque mutation porte un id client (idempotence côté serveur).
export type Mutation = { id: string; kind: string; payload: unknown; at: number };

const KEY = "palmela:pending-mutations";
const listeners = new Set<(n: number) => void>();

async function notify() {
  const n = ((await get<Mutation[]>(KEY)) ?? []).length;
  listeners.forEach((l) => l(n));
}

export function onPendingChange(fn: (n: number) => void) {
  listeners.add(fn);
  void notify();
  return () => listeners.delete(fn);
}

async function send(mutations: Mutation[]) {
  const res = await fetch("/api/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) throw new Error(`sync ${res.status}`);
  return (await res.json()) as { results: { id: string; ok: boolean; error?: string }[] };
}

export function newId(): string {
  return crypto.randomUUID();
}

/** Envoie tout de suite si possible, sinon met en file. */
export async function mutate(kind: string, payload: unknown): Promise<"sent" | "queued"> {
  const m: Mutation = { id: newId(), kind, payload, at: Date.now() };
  if (navigator.onLine) {
    try {
      const { results } = await send([m]);
      const r = results[0];
      if (r && !r.ok) throw Object.assign(new Error(r.error ?? "Erreur"), { fatal: true });
      return "sent";
    } catch (e) {
      if ((e as { fatal?: boolean }).fatal) throw e;
    }
  }
  await update<Mutation[]>(KEY, (q) => [...(q ?? []), m]);
  await notify();
  return "queued";
}

/** Rejoue la file ; retourne le nombre de mutations envoyées. */
export async function flush(): Promise<number> {
  const queue = (await get<Mutation[]>(KEY)) ?? [];
  if (!queue.length || !navigator.onLine) return 0;
  try {
    await send(queue);
  } catch {
    return 0;
  }
  const sent = new Set(queue.map((m) => m.id));
  await update<Mutation[]>(KEY, (q) => (q ?? []).filter((m) => !sent.has(m.id)));
  await notify();
  return queue.length;
}
