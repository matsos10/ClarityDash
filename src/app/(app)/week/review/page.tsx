import { Badge, Empty, PageHeader, Section, Stat } from "@/components/ui";
import { sum } from "@/lib/calc/types";
import { addDaysISO, dbDate, formatDayFr, isoWeekday, quarterOf, todayISO, weekDaysISO, weekStartISO, zonedTimeToUtc } from "@/lib/dates";
import { DOMAIN_LABEL, PROJECT_STATUS_LABEL, signed } from "@/lib/labels";
import { getCtx, spaceIdsFor } from "@/server/access";
import { saveWeeklyReview } from "@/server/actions/horizons";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function WeeklyReviewPage({ searchParams }: { searchParams: { w?: string } }) {
  const ctx = await getCtx();
  const today = todayISO();
  const weekStart = weekStartISO(searchParams.w ?? today);
  const days = weekDaysISO(weekStart);
  const lastDay = days[6] < today ? days[6] : today;
  const elapsed = days.filter((d) => d <= lastDay);
  const spaceIds = spaceIdsFor(ctx, "HORIZONS");
  const from = zonedTimeToUtc(days[0], "00:00");
  const to = zonedTimeToUtc(addDaysISO(days[6], 1), "00:00");

  const [routine, trades, projects, doneTasks, outcomes, review, nextOutcomes, krs] = await Promise.all([
    db.routineItem.findMany({
      where: { userId: ctx.userId, active: true },
      include: { checks: { where: { date: { gte: dbDate(days[0]), lte: dbDate(days[6]) } } } },
    }),
    db.trade.findMany({ where: { deletedAt: null, entryAt: { gte: from, lt: to }, account: { spaceId: ctx.personalSpaceId } } }),
    db.project.findMany({
      where: { spaceId: { in: spaceIds }, status: { in: ["ACTIVE", "WAITING", "BLOCKED"] }, deletedAt: null },
      include: { nextActionTask: true },
      orderBy: { status: "asc" },
    }),
    db.task.findMany({ where: { spaceId: { in: spaceIds }, status: "DONE", completedAt: { gte: from, lt: to }, assigneeId: ctx.userId } }),
    db.weeklyOutcome.findMany({ where: { spaceId: ctx.personalSpaceId, weekStart: dbDate(weekStart) }, orderBy: { rank: "asc" } }),
    db.weeklyReview.findUnique({ where: { spaceId_weekStart: { spaceId: ctx.personalSpaceId, weekStart: dbDate(weekStart) } } }),
    db.weeklyOutcome.findMany({ where: { spaceId: ctx.personalSpaceId, weekStart: dbDate(addDaysISO(weekStart, 7)) }, orderBy: { rank: "asc" } }),
    db.keyResult.findMany({ where: { quarter: quarterOf(addDaysISO(weekStart, 7)), archivedAt: null, objective: { spaceId: { in: spaceIds } } } }),
  ]);

  let scheduled = 0;
  let checked = 0;
  for (const r of routine) {
    for (const d of elapsed) if (r.daysOfWeek.length === 0 || r.daysOfWeek.includes(isoWeekday(d))) scheduled++;
    checked += r.checks.filter((c) => c.date <= dbDate(lastDay)).length;
  }
  const routineRate = scheduled ? Math.round((checked / scheduled) * 100) : 0;
  const pnl = Math.round(sum(trades.map((t) => Number(t.pnl))) * 100) / 100;
  const byDomain = Object.entries(
    doneTasks.reduce<Record<string, number>>((a, t) => ({ ...a, [t.domain]: (a[t.domain] ?? 0) + 1 }), {}),
  );

  return (
    <>
      <PageHeader title="Revue hebdo" sub={`Semaine du ${formatDayFr(weekStart, { day: "numeric", month: "long" })}`} back={`/week?w=${weekStart}`} />

      <Section title="1 · Bilan chiffré">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Routine" value={`${routineRate} %`} tone={routineRate >= 80 ? "good" : routineRate >= 50 ? "warn" : "bad"} />
          <Stat label="P&L trading" value={signed(pnl)} tone={pnl >= 0 ? "good" : "bad"} />
          <Stat label="Tâches faites" value={doneTasks.length} />
        </div>
        {byDomain.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
            {byDomain.map(([k, n]) => (
              <span key={k}>
                {DOMAIN_LABEL[k as keyof typeof DOMAIN_LABEL]} <span className="num">{n}</span>
              </span>
            ))}
          </div>
        )}
      </Section>

      <Section title="2 · Projets">
        {projects.length ? (
          <ul className="space-y-2">
            {projects.map((p) => (
              <li key={p.id} className="text-sm">
                <div className="flex items-center gap-2">
                  <a href={`/projects/${p.id}`} className="flex-1 truncate font-medium">
                    {p.title}
                  </a>
                  <Badge tone={p.status === "BLOCKED" ? "bad" : p.status === "WAITING" ? "warn" : "muted"}>{PROJECT_STATUS_LABEL[p.status]}</Badge>
                </div>
                <div className={`text-xs ${p.nextActionTask ? "text-muted" : "text-bad"}`}>
                  → {p.nextActionTask?.title ?? "aucune prochaine action"}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Aucun projet actif.</Empty>
        )}
        {projects.length > 7 && <p className="mt-2 text-xs text-warn">{projects.length} projets actifs : risque de surcharge, mets-en en attente.</p>}
      </Section>

      <form action={saveWeeklyReview}>
        <input type="hidden" name="weekStart" value={weekStart} />
        <input type="hidden" name="routineRate" value={routineRate} />
        <input type="hidden" name="tradingPnl" value={pnl} />

        {outcomes.length > 0 && (
          <Section title="3 · Résultats de cette semaine">
            <ul className="space-y-1">
              {outcomes.map((o) => (
                <li key={o.id}>
                  <label className="flex min-h-[40px] items-center gap-3 text-[15px]">
                    <input type="checkbox" name={`done_${o.id}`} defaultChecked={o.done} className="h-5 w-5" />
                    {o.title}
                  </label>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="4 · Ce qui a marché / leçons">
          <label className="label">Victoires</label>
          <textarea name="wins" className="input mb-2 min-h-[70px] py-2" defaultValue={review?.wins ?? ""} />
          <label className="label">Leçons / à corriger</label>
          <textarea name="lessons" className="input mb-2 min-h-[70px] py-2" defaultValue={review?.lessons ?? ""} />
          <label className="label">Note projets</label>
          <textarea name="projectsNote" className="input min-h-[50px] py-2" defaultValue={review?.projectsNote ?? ""} />
        </Section>

        <Section title="5 · Les 5 résultats de la semaine prochaine">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((rank) => {
              const o = nextOutcomes.find((x) => x.rank === rank);
              return (
                <div key={rank} className="space-y-1">
                  <input name={`outcome_${rank}`} className="input" placeholder={`Résultat ${rank}`} defaultValue={o?.title ?? ""} />
                  <select name={`kr_${rank}`} className="input min-h-[36px] text-sm" defaultValue={o?.keyResultId ?? ""}>
                    <option value="">KR servi (optionnel)</option>
                    {krs.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.title}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="6 · Moment famille de la semaine">
          <input name="familyMoment" className="input" placeholder="Sortie, repas, activité…" defaultValue={review?.familyMoment ?? ""} />
        </Section>

        <button className="btn mb-3 w-full">Valider la revue</button>
      </form>
    </>
  );
}
