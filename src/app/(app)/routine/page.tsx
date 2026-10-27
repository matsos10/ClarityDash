import type { RoutineItem } from "@prisma/client";
import { DomainDot, PageHeader, Section } from "@/components/ui";
import { routineStreak } from "@/lib/calc/streaks";
import { addDaysISO, dbDate, isoFromDb, isoWeekday, todayISO } from "@/lib/dates";
import { DAY_SHORT, DOMAIN_LABEL } from "@/lib/labels";
import { getCtx, spaceIdsFor } from "@/server/access";
import { deleteRoutineItem, saveRoutineItem } from "@/server/actions/daily";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

function ItemForm({ item, objectives }: { item?: RoutineItem; objectives: { id: string; title: string }[] }) {
  const days = item?.daysOfWeek.length ? item.daysOfWeek : [1, 2, 3, 4, 5, 6, 7];
  return (
    <form action={saveRoutineItem} className="space-y-2">
      {item && <input type="hidden" name="id" value={item.id} />}
      <input name="title" className="input" defaultValue={item?.title} placeholder="Habitude" required />
      <div className="flex justify-between">
        {DAY_SHORT.map((d, i) => (
          <label key={i} className="flex flex-col items-center text-xs text-muted">
            {d}
            <input type="checkbox" name="days" value={i + 1} defaultChecked={days.includes(i + 1)} className="mt-1 h-5 w-5" />
          </label>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select name="domain" className="input" defaultValue={item?.domain ?? "PERSONAL"}>
          {Object.entries(DOMAIN_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <input name="timeOfDay" type="time" className="input" defaultValue={item?.timeOfDay ?? ""} />
      </div>
      <select name="objectiveId" className="input" defaultValue={item?.objectiveId ?? ""}>
        <option value="">Objectif servi (optionnel)</option>
        {objectives.map((o) => (
          <option key={o.id} value={o.id}>
            {o.title}
          </option>
        ))}
      </select>
      {item && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={item.active} className="h-5 w-5" /> Active
        </label>
      )}
      <button className="btn w-full">{item ? "Enregistrer" : "Ajouter"}</button>
    </form>
  );
}

export default async function RoutinePage() {
  const ctx = await getCtx();
  const today = todayISO();
  const from = addDaysISO(today, -27);
  const [items, objectives] = await Promise.all([
    db.routineItem.findMany({
      where: { userId: ctx.userId, deletedAt: null },
      orderBy: [{ active: "desc" }, { order: "asc" }],
      include: { checks: { where: { date: { gte: dbDate(addDaysISO(today, -400)) } }, select: { date: true } } },
    }),
    db.objective.findMany({ where: { spaceId: { in: spaceIdsFor(ctx, "HORIZONS") } }, orderBy: { order: "asc" } }),
  ]);
  const grid = Array.from({ length: 28 }, (_, i) => addDaysISO(from, i));

  return (
    <>
      <PageHeader title="Routine" sub="Séries et régularité sur 4 semaines" back="/today" />
      {items.map((item) => {
        const checked = new Set(item.checks.map((c) => isoFromDb(c.date)));
        const { current, best } = routineStreak(item.daysOfWeek, checked, today);
        const sched = grid.filter((d) => d <= today && (item.daysOfWeek.length === 0 || item.daysOfWeek.includes(isoWeekday(d))));
        const rate = sched.length ? Math.round((sched.filter((d) => checked.has(d)).length / sched.length) * 100) : 0;
        return (
          <Section key={item.id} className={item.active ? "" : "opacity-60"}>
            <div className="flex items-center gap-2">
              <DomainDot domain={item.domain} />
              <span className="flex-1 text-[15px] font-medium">{item.title}</span>
              <span className="num text-xs text-muted">
                {current}🔥 · max {best} · {rate} %
              </span>
            </div>
            <div className="mt-2 grid grid-cols-[repeat(28,minmax(0,1fr))] gap-[3px]">
              {grid.map((d) => {
                const isSched = item.daysOfWeek.length === 0 || item.daysOfWeek.includes(isoWeekday(d));
                return (
                  <span
                    key={d}
                    title={d}
                    className={`aspect-square rounded-sm ${checked.has(d) ? "bg-good" : !isSched ? "bg-transparent" : d > today ? "bg-line/40" : "bg-line"}`}
                  />
                );
              })}
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-accent">Modifier</summary>
              <div className="mt-2">
                <ItemForm item={item} objectives={objectives} />
                <form action={deleteRoutineItem} className="mt-2">
                  <input type="hidden" name="id" value={item.id} />
                  <button className="text-xs text-bad">Supprimer</button>
                </form>
              </div>
            </details>
          </Section>
        );
      })}
      <Section title="Nouvelle habitude">
        <ItemForm objectives={objectives} />
      </Section>
    </>
  );
}
