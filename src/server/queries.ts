import type { Prisma } from "@prisma/client";

export const taskInclude = {
  project: { select: { id: true, title: true, objective: { select: { id: true, title: true } } } },
  objective: { select: { id: true, title: true } },
  keyResult: { select: { id: true, title: true, objective: { select: { id: true, title: true } } } },
  space: { select: { kind: true, name: true } },
} satisfies Prisma.TaskInclude;

export type TaskWithLinks = Prisma.TaskGetPayload<{ include: typeof taskInclude }>;

/** Objectif servi par une tâche : direct, via son KR ou via son projet. */
export function servedObjective(t: TaskWithLinks): string | null {
  return t.objective?.title ?? t.keyResult?.objective.title ?? t.project?.objective?.title ?? null;
}

export function toTaskView(t: TaskWithLinks) {
  return {
    id: t.id,
    title: t.title,
    domain: t.domain,
    status: t.status,
    project: t.project?.title ?? null,
    objective: servedObjective(t),
    orphan: !t.projectId && !t.objectiveId && !t.keyResultId,
    shared: t.space.kind !== "PERSONAL" ? t.space.name : null,
    plannedDate: t.plannedDate?.toISOString().slice(0, 10) ?? null,
    estimateMin: t.estimateMin,
    timeboxStart: t.timeboxStart?.toISOString() ?? null,
  };
}

export type TaskView = ReturnType<typeof toTaskView>;
