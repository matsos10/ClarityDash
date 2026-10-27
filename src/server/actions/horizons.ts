"use server";

import type { Domain, ObjectiveArea, ProjectStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { krScore } from "@/lib/calc/okr-score";
import { addDaysISO, dbDate, todayISO, weekStartISO, zonedTimeToUtc } from "@/lib/dates";
import { assertSpace, getCtx, spaceIdsFor } from "../access";
import { db } from "../db";
import { findTaskForUser, resolveLink } from "../tasks";
import { guard, int, num, oneOf, req, str } from "./form";

const DOMAINS = ["BUSINESS", "TRADING", "HOME", "FAMILY", "PERSONAL"] as const satisfies readonly Domain[];
const AREAS = ["AUTONOMOUS_INCOME", "DREAM_PROPERTY", "NET_WORTH", "HEALTH", "SOCIAL_IMPACT"] as const satisfies readonly ObjectiveArea[];
const STATUSES = ["ACTIVE", "WAITING", "BLOCKED", "DONE", "ARCHIVED"] as const satisfies readonly ProjectStatus[];

async function objectiveForUser(id: string) {
  const ctx = await getCtx();
  const o = await db.objective.findFirst({ where: { id, spaceId: { in: spaceIdsFor(ctx, "HORIZONS") } } });
  if (!o) throw new Error("Objectif introuvable");
  return o;
}

async function krForUser(id: string) {
  const ctx = await getCtx();
  const kr = await db.keyResult.findFirst({ where: { id, objective: { spaceId: { in: spaceIdsFor(ctx, "HORIZONS") } } } });
  if (!kr) throw new Error("KR introuvable");
  return kr;
}

// ─── Vision ───

export async function saveVision(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const id = req(f, "id");
    const v = await db.vision.findFirst({ where: { id, spaceId: { in: spaceIdsFor(ctx, "HORIZONS") } } });
    if (!v) throw new Error("Vision introuvable");
    await db.vision.update({
      where: { id },
      data: { textFr: req(f, "textFr"), textPt: str(f, "textPt"), targetDate: dbDate(req(f, "targetDate")) },
    });
    revalidatePath("/vision");
    redirect("/vision");
  });
}

export async function addMilestone(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const visionId = req(f, "visionId");
    const v = await db.vision.findFirst({ where: { id: visionId, spaceId: { in: spaceIdsFor(ctx, "HORIZONS") } } });
    if (!v) throw new Error("Vision introuvable");
    await db.milestone.create({
      data: { visionId, title: req(f, "title"), dueDate: dbDate(req(f, "dueDate")), objectiveId: str(f, "objectiveId") },
    });
    revalidatePath("/vision");
  });
}

export async function toggleMilestone(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const m = await db.milestone.findFirst({ where: { id: req(f, "id"), vision: { spaceId: { in: spaceIdsFor(ctx, "HORIZONS") } } } });
    if (!m) throw new Error("Jalon introuvable");
    await db.milestone.update({ where: { id: m.id }, data: { doneAt: m.doneAt ? null : new Date() } });
    revalidatePath("/vision");
  });
}

// ─── OKR ───

export async function saveObjective(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const id = str(f, "id");
    const data = { title: req(f, "title"), area: oneOf(f, "area", AREAS), description: str(f, "description") };
    if (id) {
      await objectiveForUser(id);
      await db.objective.update({ where: { id }, data });
    } else {
      const spaceId = req(f, "spaceId");
      assertSpace(ctx, spaceId, "HORIZONS");
      const vision = await db.vision.findFirst({ where: { spaceId } });
      await db.objective.create({ data: { ...data, spaceId, visionId: vision?.id, order: await db.objective.count({ where: { spaceId } }) } });
    }
    revalidatePath("/okr");
  });
}

export async function addKeyResult(f: FormData) {
  return guard(async () => {
    const o = await objectiveForUser(req(f, "objectiveId"));
    const start = num(f, "startValue") ?? 0;
    const target = num(f, "targetValue");
    if (target == null) throw new Error("Cible requise");
    await db.keyResult.create({
      data: {
        objectiveId: o.id,
        quarter: req(f, "quarter"),
        title: req(f, "title"),
        unit: str(f, "unit"),
        startValue: start,
        targetValue: target,
        currentValue: start,
        score: 0,
        ownerId: str(f, "ownerId"),
      },
    });
    revalidatePath("/okr");
  });
}

/** Mise à jour hebdo d'un KR : valeur courante + check-in de la semaine. */
export async function checkinKeyResult(f: FormData) {
  return guard(async () => {
    const kr = await krForUser(req(f, "id"));
    const value = num(f, "value");
    if (value == null) throw new Error("Valeur requise");
    const score = krScore(Number(kr.startValue), Number(kr.targetValue), value);
    const weekStart = dbDate(weekStartISO(todayISO()));
    await db.$transaction([
      db.keyResult.update({ where: { id: kr.id }, data: { currentValue: value, score } }),
      db.keyResultCheckin.upsert({
        where: { keyResultId_weekStart: { keyResultId: kr.id, weekStart } },
        update: { value, score, note: str(f, "note") },
        create: { keyResultId: kr.id, weekStart, value, score, note: str(f, "note") },
      }),
      db.objective.update({ where: { id: kr.objectiveId }, data: { lastActionAt: new Date() } }),
    ]);
    revalidatePath("/okr");
  });
}

export async function archiveKeyResult(f: FormData) {
  return guard(async () => {
    const kr = await krForUser(req(f, "id"));
    await db.keyResult.update({ where: { id: kr.id }, data: { archivedAt: kr.archivedAt ? null : new Date() } });
    revalidatePath("/okr");
  });
}

export async function saveQuarterlyReview(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const spaceId = req(f, "spaceId");
    assertSpace(ctx, spaceId, "HORIZONS");
    const quarter = req(f, "quarter");
    const data = { wentWell: str(f, "wentWell"), wentBadly: str(f, "wentBadly"), lessons: str(f, "lessons"), completedAt: new Date() };
    await db.quarterlyReview.upsert({ where: { spaceId_quarter: { spaceId, quarter } }, update: data, create: { ...data, spaceId, quarter } });
    revalidatePath("/okr");
    redirect(`/okr?q=${str(f, "next") ?? quarter}`);
  });
}

// ─── Projets ───

export async function saveProject(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const id = str(f, "id");
    const links = await resolveLink(ctx, str(f, "link"));
    const data = {
      title: req(f, "title"),
      domain: oneOf(f, "domain", DOMAINS),
      status: oneOf(f, "status", STATUSES, "ACTIVE"),
      description: str(f, "description"),
      blockedReason: str(f, "blockedReason"),
      objectiveId: links.objectiveId,
      keyResultId: links.keyResultId,
      dueDate: str(f, "dueDate") ? dbDate(req(f, "dueDate")) : null,
    };
    if (id) {
      const p = await db.project.findFirst({ where: { id, spaceId: { in: spaceIdsFor(ctx, "HORIZONS") } } });
      if (!p) throw new Error("Projet introuvable");
      await db.project.update({ where: { id }, data });
      revalidatePath(`/projects/${id}`);
    } else {
      const spaceId = req(f, "spaceId");
      assertSpace(ctx, spaceId, "HORIZONS");
      const p = await db.project.create({ data: { ...data, spaceId } });
      revalidatePath("/projects");
      redirect(`/projects/${p.id}`);
    }
    revalidatePath("/projects");
  });
}

/** Définit la prochaine action d'un projet : tâche existante ou nouvelle. */
export async function setNextAction(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const project = await db.project.findFirst({ where: { id: req(f, "projectId"), spaceId: { in: spaceIdsFor(ctx, "HORIZONS") } } });
    if (!project) throw new Error("Projet introuvable");
    let taskId = str(f, "taskId");
    const title = str(f, "title");
    if (!taskId && title) {
      const t = await db.task.create({
        data: { spaceId: project.spaceId, projectId: project.id, title, domain: project.domain, status: "WEEK", weekStart: dbDate(weekStartISO(todayISO())), assigneeId: ctx.userId },
      });
      taskId = t.id;
    }
    if (!taskId) throw new Error("Prochaine action requise");
    await findTaskForUser(ctx, taskId);
    await db.project.update({ where: { id: project.id }, data: { nextActionTaskId: taskId } });
    revalidatePath(`/projects/${project.id}`);
    revalidatePath("/projects");
  });
}

// ─── Tâches (édition détaillée) ───

export async function saveTask(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const task = await findTaskForUser(ctx, req(f, "id"));
    const links = await resolveLink(ctx, str(f, "link"));
    const date = str(f, "plannedDate");
    const tbStart = str(f, "timeboxStart");
    const tbEnd = str(f, "timeboxEnd");
    await db.task.update({
      where: { id: task.id },
      data: {
        title: req(f, "title"),
        notes: str(f, "notes"),
        domain: oneOf(f, "domain", DOMAINS),
        ...links,
        estimateMin: int(f, "estimateMin"),
        plannedDate: date ? dbDate(date) : null,
        dueDate: str(f, "dueDate") ? dbDate(req(f, "dueDate")) : null,
        timeboxStart: date && tbStart ? zonedTimeToUtc(date, tbStart) : null,
        timeboxEnd: date && tbEnd ? zonedTimeToUtc(date, tbEnd) : null,
      },
    });
    revalidatePath("/today");
    revalidatePath("/week");
    redirect(str(f, "back") ?? "/today");
  });
}

export async function deleteTask(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const task = await findTaskForUser(ctx, req(f, "id"));
    await db.task.update({ where: { id: task.id }, data: { deletedAt: new Date(), status: "CANCELLED", todayRank: null } });
    revalidatePath("/today");
    redirect(str(f, "back") ?? "/today");
  });
}

/** Planifie une tâche sur un jour précis de la semaine (vue Semaine). */
export async function planTask(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const task = await findTaskForUser(ctx, req(f, "id"));
    const day = str(f, "day");
    await db.task.update({
      where: { id: task.id },
      data: day
        ? { plannedDate: dbDate(day), weekStart: dbDate(weekStartISO(day)), status: task.status === "BACKLOG" ? "WEEK" : task.status }
        : { plannedDate: null },
    });
    revalidatePath("/week");
  });
}

// ─── Revue hebdo ───

export async function saveWeeklyReview(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const spaceId = ctx.personalSpaceId;
    const weekStart = req(f, "weekStart");
    const nextWeek = dbDate(addDaysISO(weekStartISO(weekStart), 7));
    const ws = dbDate(weekStart);

    const data = {
      routineRate: num(f, "routineRate"),
      tradingPnl: num(f, "tradingPnl"),
      projectsNote: str(f, "projectsNote"),
      wins: str(f, "wins"),
      lessons: str(f, "lessons"),
      familyMoment: str(f, "familyMoment"),
      completedAt: new Date(),
    };

    // résultats de la semaine passée cochés / décochés
    const current = await db.weeklyOutcome.findMany({ where: { spaceId, weekStart: ws } });
    const krIds = new Set(
      (await db.keyResult.findMany({ where: { objective: { spaceId: { in: spaceIdsFor(ctx, "HORIZONS") } } }, select: { id: true } })).map((k) => k.id),
    );

    await db.$transaction([
      db.weeklyReview.upsert({ where: { spaceId_weekStart: { spaceId, weekStart: ws } }, update: data, create: { ...data, spaceId, weekStart: ws } }),
      ...current.map((o) => db.weeklyOutcome.update({ where: { id: o.id }, data: { done: f.get(`done_${o.id}`) === "on" } })),
      db.weeklyOutcome.deleteMany({ where: { spaceId, weekStart: nextWeek } }),
      ...[1, 2, 3, 4, 5].flatMap((rank) => {
        const title = str(f, `outcome_${rank}`);
        if (!title) return [];
        const kr = str(f, `kr_${rank}`);
        return [db.weeklyOutcome.create({ data: { spaceId, weekStart: nextWeek, rank, title, keyResultId: kr && krIds.has(kr) ? kr : null } })];
      }),
    ]);
    revalidatePath("/week");
    redirect(`/week?w=${nextWeek.toISOString().slice(0, 10)}`);
  });
}
