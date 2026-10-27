"use server";

import type { Domain, TaskStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getCtx, spaceIdsFor } from "../access";
import { db } from "../db";
import { applySuggestion, captureForUser, dismiss, routeToJournal, routeToTask } from "../captures";
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

export async function routeCaptureToTask(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const capture = await captureForUser(ctx.userId, req(f, "id"));
    await routeToTask(ctx, capture, {
      title: req(f, "title"),
      domain: oneOf(f, "domain", DOMAINS),
      status: oneOf(f, "status", ["BACKLOG", "WEEK", "TODAY"] as const satisfies readonly TaskStatus[]),
      link: str(f, "link"),
      spaceId: req(f, "spaceId"),
      dueDate: str(f, "dueDate"),
    });
    revalidatePath("/inbox");
    revalidatePath("/today");
  });
}

export async function applyCaptureSuggestion(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    await applySuggestion(ctx, await captureForUser(ctx.userId, req(f, "id")));
    revalidatePath("/inbox");
    revalidatePath("/today");
  });
}

export async function routeCaptureToJournal(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    await routeToJournal(ctx, await captureForUser(ctx.userId, req(f, "id")));
    revalidatePath("/inbox");
  });
}

export async function dismissCapture(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    await dismiss(await captureForUser(ctx.userId, req(f, "id")));
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
