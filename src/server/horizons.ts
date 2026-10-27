import { addDaysISO, dbDate, isoFromDb, isoWeekday } from "@/lib/dates";
import { routineStreak } from "@/lib/calc/streaks";
import { spaceIdsFor, spacesFor, type Ctx } from "./access";
import { db } from "./db";

/** Options « lier à » : projets actifs, objectifs et KR du trimestre. */
export async function linkOptions(ctx: Ctx, quarter: string) {
  const spaceIds = spaceIdsFor(ctx, "HORIZONS");
  const [projects, objectives, krs] = await Promise.all([
    db.project.findMany({ where: { spaceId: { in: spaceIds }, status: { in: ["ACTIVE", "WAITING", "BLOCKED"] }, deletedAt: null }, orderBy: { title: "asc" } }),
    db.objective.findMany({ where: { spaceId: { in: spaceIds } }, orderBy: { order: "asc" } }),
    db.keyResult.findMany({ where: { quarter, archivedAt: null, objective: { spaceId: { in: spaceIds } } }, orderBy: { createdAt: "asc" } }),
  ]);
  return [
    ...projects.map((p) => ({ value: `p:${p.id}`, label: `Projet · ${p.title}`, domain: p.domain })),
    ...krs.map((k) => ({ value: `k:${k.id}`, label: `KR · ${k.title}` })),
    ...objectives.map((o) => ({ value: `o:${o.id}`, label: `Objectif · ${o.title}` })),
  ];
}

export function spaceOptions(ctx: Ctx) {
  return spacesFor(ctx, "HORIZONS").map((s) => ({ id: s.id, name: s.kind === "PERSONAL" ? "Perso" : s.name }));
}

/** Habitudes du jour avec état et série. */
export async function routineForDay(userId: string, date: string) {
  const items = await db.routineItem.findMany({
    where: { userId, active: true, deletedAt: null },
    orderBy: { order: "asc" },
    include: { checks: { where: { date: { gte: dbDate(addDaysISO(date, -400)) } }, select: { date: true } } },
  });
  const wd = isoWeekday(date);
  return items
    .filter((i) => i.daysOfWeek.length === 0 || i.daysOfWeek.includes(wd))
    .map((i) => {
      const checked = new Set(i.checks.map((c) => isoFromDb(c.date)));
      return {
        id: i.id,
        title: i.title,
        domain: i.domain,
        timeOfDay: i.timeOfDay,
        done: checked.has(date),
        streak: routineStreak(i.daysOfWeek, checked, date).current,
      };
    });
}
