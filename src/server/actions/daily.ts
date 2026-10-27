"use server";

import type { Domain, TaskStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { dbDate, todayISO, weekStartISO } from "@/lib/dates";
import { assertSpace, getCtx, spaceIdsFor } from "../access";
import { db } from "../db";
import { resolveLink, setTaskStatus } from "../tasks";
import { bool, guard, oneOf, req, str } from "./form";

const DOMAINS = ["BUSINESS", "TRADING", "HOME", "FAMILY", "PERSONAL"] as const satisfies readonly Domain[];

// ─── Routine ───

export async function saveRoutineItem(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const id = str(f, "id");
    const days = f.getAll("days").map(Number).filter((d) => d >= 1 && d <= 7);
    const objectiveId = str(f, "objectiveId");
    if (objectiveId && !(await db.objective.count({ where: { id: objectiveId, spaceId: { in: spaceIdsFor(ctx, "HORIZONS") } } }))) {
      throw new Error("Objectif invalide");
    }
    const data = {
      title: req(f, "title"),
      domain: oneOf(f, "domain", DOMAINS),
      daysOfWeek: days.length === 7 ? [] : days,
      timeOfDay: str(f, "timeOfDay"),
      objectiveId,
      active: id ? bool(f, "active") : true,
    };
    if (id) {
      const item = await db.routineItem.findFirst({ where: { id, userId: ctx.userId } });
      if (!item) throw new Error("Habitude introuvable");
      await db.routineItem.update({ where: { id }, data });
    } else {
      await db.routineItem.create({ data: { ...data, userId: ctx.userId, order: await db.routineItem.count({ where: { userId: ctx.userId } }) } });
    }
    revalidatePath("/routine");
    revalidatePath("/today");
  });
}

export async function deleteRoutineItem(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    await db.routineItem.updateMany({ where: { id: req(f, "id"), userId: ctx.userId }, data: { deletedAt: new Date(), active: false } });
    revalidatePath("/routine");
  });
}

// ─── Inbox ───

async function captureForUser(id: string) {
  const ctx = await getCtx();
  const c = await db.capture.findFirst({ where: { id, userId: ctx.userId } });
  if (!c) throw new Error("Capture introuvable");
  return { ctx, capture: c };
}

export async function routeCaptureToTask(f: FormData) {
  return guard(async () => {
    const { ctx, capture } = await captureForUser(req(f, "id"));
    const spaceId = req(f, "spaceId");
    assertSpace(ctx, spaceId, "HORIZONS");
    const status = oneOf(f, "status", ["BACKLOG", "WEEK", "TODAY"] as const satisfies readonly TaskStatus[]);
    const today = todayISO();
    const task = await db.task.create({
      data: {
        spaceId,
        title: req(f, "title"),
        notes: capture.rawText.length > 120 ? capture.rawText : null,
        domain: oneOf(f, "domain", DOMAINS),
        status: status === "WEEK" ? "WEEK" : "BACKLOG",
        weekStart: status === "WEEK" ? dbDate(weekStartISO(today)) : null,
        captureId: capture.id,
        assigneeId: ctx.userId,
        ...(await resolveLink(ctx, str(f, "link"))),
      },
    });
    if (status === "TODAY") await setTaskStatus(ctx, task.id, "TODAY", today);
    await db.capture.update({ where: { id: capture.id }, data: { status: "ROUTED", routedType: "task", routedId: task.id, processedAt: new Date() } });
    revalidatePath("/inbox");
    revalidatePath("/today");
  });
}

export async function routeCaptureToJournal(f: FormData) {
  return guard(async () => {
    const { ctx, capture } = await captureForUser(req(f, "id"));
    const date = dbDate(todayISO());
    const entry = await db.journalEntry.findUnique({ where: { userId_date: { userId: ctx.userId, date } } });
    const done = [entry?.done, capture.rawText].filter(Boolean).join("\n");
    await db.journalEntry.upsert({ where: { userId_date: { userId: ctx.userId, date } }, update: { done }, create: { userId: ctx.userId, date, done } });
    await db.capture.update({ where: { id: capture.id }, data: { status: "ROUTED", routedType: "journal", processedAt: new Date() } });
    revalidatePath("/inbox");
  });
}

export async function dismissCapture(f: FormData) {
  return guard(async () => {
    const { capture } = await captureForUser(req(f, "id"));
    await db.capture.update({ where: { id: capture.id }, data: { status: "DISMISSED", processedAt: new Date() } });
    revalidatePath("/inbox");
  });
}

// ─── Réglages ───

export async function toggleSpaceModule(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const spaceId = req(f, "spaceId");
    const space = ctx.spaces.find((s) => s.id === spaceId && s.kind !== "PERSONAL");
    if (!space) throw new Error("Espace partagé introuvable");
    const mod = oneOf(f, "module", ["HORIZONS", "ROUTINE", "TRADING", "BUSINESS", "FINANCE", "HOME", "FAMILY", "ADMIN", "PERSONAL"] as const);
    const enabled = bool(f, "enabled");
    await db.spaceModule.upsert({ where: { spaceId_module: { spaceId, module: mod } }, update: { enabled }, create: { spaceId, module: mod, enabled } });
    revalidatePath("/settings");
  });
}

export async function saveTheme(theme: "SYSTEM" | "LIGHT" | "DARK") {
  const ctx = await getCtx();
  await db.user.update({ where: { id: ctx.userId }, data: { theme } });
}
