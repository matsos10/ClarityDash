import { z } from "zod";
import { dbDate } from "@/lib/dates";
import { assertSpace, type Ctx } from "./ctx";
import { db } from "./db";
import { resolveLink, setTaskStatus } from "./tasks";

// Mutations rejouables depuis la file hors ligne (/api/sync).

const domain = z.enum(["BUSINESS", "TRADING", "HOME", "FAMILY", "PERSONAL"]);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const schemas = {
  "capture.create": z.object({ id: z.string().min(8), text: z.string().trim().min(1).max(5000), source: z.enum(["APP", "VOICE", "SHARE"]) }),
  "routine.toggle": z.object({ itemId: z.string(), date: isoDate, done: z.boolean() }),
  "task.create": z.object({
    id: z.string().min(8),
    title: z.string().trim().min(1).max(300),
    spaceId: z.string(),
    domain,
    status: z.enum(["INBOX", "BACKLOG", "WEEK", "TODAY"]),
    plannedDate: isoDate.nullish(),
    projectId: z.string().nullish(),
    objectiveId: z.string().nullish(),
    keyResultId: z.string().nullish(),
  }),
  "task.status": z.object({
    taskId: z.string(),
    status: z.enum(["BACKLOG", "WEEK", "TODAY", "DONE", "CANCELLED"]),
    date: isoDate,
  }),
  "task.move": z.object({ taskId: z.string(), direction: z.enum(["up", "down"]) }),
  "journal.upsert": z.object({
    date: isoDate,
    done: z.string().max(5000).nullish(),
    blocked: z.string().max(5000).nullish(),
    tomorrow: z.string().max(5000).nullish(),
    mood: z.number().int().min(1).max(5).nullish(),
    energy: z.number().int().min(1).max(5).nullish(),
  }),
} as const;

export type MutationKind = keyof typeof schemas;

async function apply(ctx: Ctx, kind: MutationKind, raw: unknown) {
  switch (kind) {
    case "capture.create": {
      const p = schemas[kind].parse(raw);
      await db.capture.upsert({
        where: { id: p.id },
        update: {},
        create: { id: p.id, userId: ctx.userId, rawText: p.text, source: p.source },
      });
      return;
    }
    case "routine.toggle": {
      const p = schemas[kind].parse(raw);
      const item = await db.routineItem.findFirst({ where: { id: p.itemId, userId: ctx.userId } });
      if (!item) throw new Error("Habitude introuvable");
      const date = dbDate(p.date);
      if (p.done) {
        await db.routineCheck.upsert({ where: { itemId_date: { itemId: item.id, date } }, update: { done: true }, create: { itemId: item.id, date } });
        if (item.objectiveId) await db.objective.update({ where: { id: item.objectiveId }, data: { lastActionAt: new Date() } });
      } else {
        await db.routineCheck.deleteMany({ where: { itemId: item.id, date } });
      }
      return;
    }
    case "task.create": {
      const p = schemas[kind].parse(raw);
      assertSpace(ctx, p.spaceId, "HORIZONS");
      const exists = await db.task.findUnique({ where: { id: p.id } });
      if (exists) return;
      await db.task.create({
        data: {
          id: p.id,
          title: p.title,
          spaceId: p.spaceId,
          domain: p.domain,
          status: "BACKLOG",
          ...(await resolveLink(ctx, p.projectId ? `p:${p.projectId}` : p.keyResultId ? `k:${p.keyResultId}` : p.objectiveId ? `o:${p.objectiveId}` : null)),
          assigneeId: ctx.userId,
        },
      });
      if (p.status !== "BACKLOG") await setTaskStatus(ctx, p.id, p.status === "INBOX" ? "BACKLOG" : p.status, p.plannedDate ?? null);
      return;
    }
    case "task.status": {
      const p = schemas[kind].parse(raw);
      await setTaskStatus(ctx, p.taskId, p.status, p.date);
      return;
    }
    case "task.move": {
      const p = schemas[kind].parse(raw);
      const today = await db.task.findMany({
        where: { status: "TODAY", assigneeId: ctx.userId, deletedAt: null },
        orderBy: { todayRank: "asc" },
      });
      const i = today.findIndex((t) => t.id === p.taskId);
      const j = p.direction === "up" ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= today.length) return;
      [today[i], today[j]] = [today[j], today[i]];
      await db.$transaction(today.map((t, k) => db.task.update({ where: { id: t.id }, data: { todayRank: k + 1 } })));
      return;
    }
    case "journal.upsert": {
      const p = schemas[kind].parse(raw);
      const date = dbDate(p.date);
      const data = { done: p.done ?? null, blocked: p.blocked ?? null, tomorrow: p.tomorrow ?? null, mood: p.mood ?? null, energy: p.energy ?? null };
      await db.journalEntry.upsert({ where: { userId_date: { userId: ctx.userId, date } }, update: data, create: { ...data, userId: ctx.userId, date } });
      return;
    }
  }
}

export async function applyMutation(ctx: Ctx, m: { id: string; kind: string; payload?: unknown }) {
  if (!(m.kind in schemas)) throw new Error(`Mutation inconnue : ${m.kind}`);
  const done = await db.syncMutation.findUnique({ where: { id: m.id } });
  if (done) return;
  await apply(ctx, m.kind as MutationKind, m.payload);
  await db.syncMutation.create({ data: { id: m.id, userId: ctx.userId, kind: m.kind } });
}
