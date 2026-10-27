import type { Capture, Domain, TaskStatus } from "@prisma/client";
import { dbDate, todayISO, weekStartISO } from "@/lib/dates";
import { assertSpace, defaultSpaceId, type Ctx } from "./ctx";
import { db } from "./db";
import { resolveLink, setTaskStatus } from "./tasks";

export type Suggestion = {
  kind: "task" | "journal";
  module: string;
  title: string;
  domain: Domain;
  status: "TODAY" | "WEEK" | "BACKLOG";
  link: string | null;
  dueDate: string | null;
  reason: string;
};

export async function captureForUser(userId: string, id: string) {
  const c = await db.capture.findFirst({ where: { id, userId } });
  if (!c) throw new Error("Capture introuvable");
  return c;
}

export async function routeToTask(
  ctx: Ctx,
  capture: Capture,
  f: { title: string; domain: Domain; status: Extract<TaskStatus, "BACKLOG" | "WEEK" | "TODAY">; link: string | null; spaceId?: string; dueDate?: string | null },
) {
  const spaceId = f.spaceId ?? defaultSpaceId(ctx, "HORIZONS");
  assertSpace(ctx, spaceId, "HORIZONS");
  const today = todayISO();
  const task = await db.task.create({
    data: {
      spaceId,
      title: f.title.slice(0, 300),
      notes: capture.rawText.length > 120 ? capture.rawText : null,
      domain: f.domain,
      status: f.status === "WEEK" ? "WEEK" : "BACKLOG",
      weekStart: f.status === "WEEK" ? dbDate(weekStartISO(today)) : null,
      dueDate: f.dueDate ? dbDate(f.dueDate) : null,
      captureId: capture.id,
      assigneeId: ctx.userId,
      ...(await resolveLink(ctx, f.link).catch(() => resolveLink(ctx, null))),
    },
  });
  let note: string | null = null;
  if (f.status === "TODAY") {
    try {
      await setTaskStatus(ctx, task.id, "TODAY", today);
    } catch (e) {
      // 3 priorités déjà prises : la tâche reste pour la semaine
      await setTaskStatus(ctx, task.id, "WEEK", today);
      note = (e as Error).message;
    }
  }
  await db.capture.update({ where: { id: capture.id }, data: { status: "ROUTED", routedType: "task", routedId: task.id, processedAt: new Date() } });
  return { task, note };
}

export async function routeToJournal(ctx: Ctx, capture: Capture) {
  const date = dbDate(todayISO());
  const entry = await db.journalEntry.findUnique({ where: { userId_date: { userId: ctx.userId, date } } });
  const done = [entry?.done, capture.rawText].filter(Boolean).join("\n");
  await db.journalEntry.upsert({ where: { userId_date: { userId: ctx.userId, date } }, update: { done }, create: { userId: ctx.userId, date, done } });
  await db.capture.update({ where: { id: capture.id }, data: { status: "ROUTED", routedType: "journal", processedAt: new Date() } });
}

export async function dismiss(capture: Capture) {
  await db.capture.update({ where: { id: capture.id }, data: { status: "DISMISSED", processedAt: new Date() } });
}

/** Applique la suggestion de l'IA (tâche ou journal). */
export async function applySuggestion(ctx: Ctx, capture: Capture) {
  const s = capture.suggestion as Suggestion | null;
  if (!s) throw new Error("Aucune suggestion pour cette capture");
  if (s.kind === "journal") {
    await routeToJournal(ctx, capture);
    return { kind: "journal" as const, note: null };
  }
  const { task, note } = await routeToTask(ctx, capture, { title: s.title, domain: s.domain, status: s.status, link: s.link, dueDate: s.dueDate });
  return { kind: "task" as const, task, note };
}
