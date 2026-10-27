import type { TaskStatus } from "@prisma/client";
import { dbDate, weekStartISO } from "@/lib/dates";
import { spaceIdsFor, type Ctx } from "./access";
import { db } from "./db";

export const MAX_TODAY = 3;

export async function findTaskForUser(ctx: Ctx, taskId: string) {
  const task = await db.task.findFirst({ where: { id: taskId, spaceId: { in: spaceIdsFor(ctx, "HORIZONS") }, deletedAt: null } });
  if (!task) throw new Error("Tâche introuvable");
  return task;
}

/** Marque l'objectif servi (directement, via KR ou via projet) comme ayant eu une action. */
export async function touchObjective(task: { objectiveId: string | null; keyResultId: string | null; projectId: string | null }) {
  let objectiveId = task.objectiveId;
  if (!objectiveId && task.keyResultId) objectiveId = (await db.keyResult.findUnique({ where: { id: task.keyResultId } }))?.objectiveId ?? null;
  if (!objectiveId && task.projectId) {
    const p = await db.project.findUnique({ where: { id: task.projectId }, include: { keyResult: true } });
    objectiveId = p?.objectiveId ?? p?.keyResult?.objectiveId ?? null;
  }
  if (objectiveId) await db.objective.update({ where: { id: objectiveId }, data: { lastActionAt: new Date() } });
}

/**
 * Change le statut d'une tâche. TODAY : 3 priorités max, rang attribué ;
 * WEEK : semaine de `date` ; DONE : horodatage + objectif touché.
 */
export async function setTaskStatus(ctx: Ctx, taskId: string, status: TaskStatus, date: string | null) {
  const task = await findTaskForUser(ctx, taskId);
  if (status === "TODAY" && task.status !== "TODAY") {
    const count = await db.task.count({ where: { status: "TODAY", assigneeId: ctx.userId, deletedAt: null } });
    if (count >= MAX_TODAY) throw new Error("3 priorités maximum aujourd'hui");
    await db.task.update({
      where: { id: task.id },
      data: {
        status,
        todayRank: count + 1,
        assigneeId: ctx.userId,
        plannedDate: date ? dbDate(date) : task.plannedDate,
        weekStart: date ? dbDate(weekStartISO(date)) : task.weekStart,
        completedAt: null,
      },
    });
    return;
  }
  await db.task.update({
    where: { id: task.id },
    data: {
      status,
      todayRank: status === "TODAY" ? task.todayRank : null,
      weekStart: status === "WEEK" && date ? dbDate(weekStartISO(date)) : task.weekStart,
      plannedDate: status === "BACKLOG" ? null : task.plannedDate,
      completedAt: status === "DONE" ? new Date() : null,
    },
  });
  if (task.status === "TODAY" && status !== "TODAY") await compactToday(ctx.userId);
  if (status === "DONE") await touchObjective(task);
}

async function compactToday(userId: string) {
  const today = await db.task.findMany({ where: { status: "TODAY", assigneeId: userId, deletedAt: null }, orderBy: { todayRank: "asc" } });
  await db.$transaction(today.map((t, k) => db.task.update({ where: { id: t.id }, data: { todayRank: k + 1 } })));
}

export function isOrphan(t: { projectId: string | null; objectiveId: string | null; keyResultId: string | null }) {
  return !t.projectId && !t.objectiveId && !t.keyResultId;
}

/** Valide un lien "p:<id>" | "o:<id>" | "k:<id>" vers un élément accessible. */
export async function resolveLink(ctx: Ctx, link: string | null | undefined) {
  const empty = { projectId: null, objectiveId: null, keyResultId: null } as {
    projectId: string | null;
    objectiveId: string | null;
    keyResultId: string | null;
  };
  if (!link) return empty;
  const [kind, id] = link.split(":");
  const spaceIds = spaceIdsFor(ctx, "HORIZONS");
  if (kind === "p" && (await db.project.count({ where: { id, spaceId: { in: spaceIds } } }))) return { ...empty, projectId: id };
  if (kind === "o" && (await db.objective.count({ where: { id, spaceId: { in: spaceIds } } }))) return { ...empty, objectiveId: id };
  if (kind === "k" && (await db.keyResult.count({ where: { id, objective: { spaceId: { in: spaceIds } } } }))) return { ...empty, keyResultId: id };
  throw new Error("Lien invalide");
}
