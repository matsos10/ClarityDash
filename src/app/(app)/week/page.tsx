import Link from "next/link";
import { Badge, DomainDot, Empty, PageHeader, Section } from "@/components/ui";
import { DOMAINS, domainLoad } from "@/lib/calc/load";
import { addDaysISO, dbDate, formatDayFr, isoFromDb, timeInTz, todayISO, weekDaysISO, weekStartISO } from "@/lib/dates";
import { DOMAIN_COLOR, DOMAIN_LABEL } from "@/lib/labels";
import { getCtx, spaceIdsFor } from "@/server/access";
import { planTask } from "@/server/actions/horizons";
import { db } from "@/server/db";
import { taskInclude } from "@/server/queries";

export const dynamic = "force-dynamic";

const fmtH = (min: number) => (min >= 60 ? `${Math.floor(min / 60)}h${String(min % 60).padStart(2, "0")}` : `${min}m`);

export default async function WeekPage({ searchParams }: { searchParams: { w?: string } }) {
  const ctx = await getCtx();
  const today = todayISO();
  const weekStart = weekStartISO(searchParams.w ?? today);
  const days = weekDaysISO(weekStart);
  const spaceIds = spaceIdsFor(ctx, "HORIZONS");
  const mine = { OR: [{ assigneeId: ctx.userId }, { assigneeId: null }] };

  const [planned, unplanned, outcomes, review, revisions] = await Promise.all([
    db.task.findMany({
      where: { spaceId: { in: spaceIds }, deletedAt: null, status: { not: "CANCELLED" }, plannedDate: { gte: dbDate(days[0]), lte: dbDate(days[6]) }, ...mine },
      include: taskInclude,
      orderBy: [{ timeboxStart: "asc" }, { todayRank: "asc" }],
    }),
    db.task.findMany({
      where: { spaceId: { in: spaceIds }, deletedAt: null, status: "WEEK", weekStart: dbDate(weekStart), plannedDate: null, ...mine },
      include: taskInclude,
    }),
    db.weeklyOutcome.findMany({ where: { spaceId: { in: spaceIds }, weekStart: dbDate(weekStart) }, orderBy: { rank: "asc" } }),
    db.weeklyReview.findFirst({ where: { spaceId: { in: spaceIds }, weekStart: dbDate(addDaysISO(weekStart, -7)) } }),
    db.routineItem.findMany({ where: { userId: ctx.userId, active: true, domain: "FAMILY" } }),
  ]);

  const { grid, totals } = domainLoad(
    planned.map((t) => ({ domain: t.domain, day: t.plannedDate ? isoFromDb(t.plannedDate) : null, estimateMin: t.estimateMin })),
    days,
  );
  const max = Math.max(60, ...days.map((d) => DOMAINS.reduce((a, k) => a + grid[d][k], 0)));
  const isSunday = today === days[6];

  return (
    <>
      <PageHeader
        title="Semaine"
        sub={`${formatDayFr(days[0], { day: "numeric", month: "short" })} → ${formatDayFr(days[6], { day: "numeric", month: "short" })}`}
        right={
          <div className="flex gap-1">
            <Link className="btn-sm" href={`/week?w=${addDaysISO(weekStart, -7)}`}>
              ←
            </Link>
            <Link className="btn-sm" href="/week">
              Auj.
            </Link>
            <Link className="btn-sm" href={`/week?w=${addDaysISO(weekStart, 7)}`}>
              →
            </Link>
          </div>
        }
      />

      <Link href={`/week/review?w=${weekStart}`} className={`card mb-3 flex items-center justify-between ${isSunday ? "border-accent" : ""}`}>
        <div>
          <div className="h2 mb-0">Revue hebdo {isSunday && "· c'est dimanche"}</div>
          <div className="text-sm">Bilan routine, P&amp;L, projets, 5 résultats de la semaine suivante</div>
        </div>
        <span className="text-muted">→</span>
      </Link>

      <Section title="5 résultats de la semaine">
        {outcomes.length ? (
          <ol className="space-y-1">
            {outcomes.map((o) => (
              <li key={o.id} className="flex gap-2 text-[15px]">
                <span className="num text-muted">{o.rank}.</span>
                <span className={o.done ? "text-muted line-through" : ""}>{o.title}</span>
              </li>
            ))}
          </ol>
        ) : (
          <Empty>Pas encore choisis — fais la revue hebdo.</Empty>
        )}
      </Section>

      <Section title="Charge par domaine">
        <div className="space-y-1.5">
          {days.map((d) => (
            <div key={d} className="flex items-center gap-2">
              <span className={`w-12 shrink-0 text-xs capitalize ${d === today ? "font-semibold text-accent" : "text-muted"}`}>
                {formatDayFr(d, { weekday: "short", day: "numeric" })}
              </span>
              <div className="flex h-3 flex-1 overflow-hidden rounded bg-line">
                {DOMAINS.map((k) =>
                  grid[d][k] ? <div key={k} className={DOMAIN_COLOR[k]} style={{ width: `${(grid[d][k] / max) * 100}%` }} title={`${DOMAIN_LABEL[k]} ${fmtH(grid[d][k])}`} /> : null,
                )}
              </div>
              <span className="num w-10 text-right text-[11px] text-muted">{fmtH(DOMAINS.reduce((a, k) => a + grid[d][k], 0))}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
          {DOMAINS.map((k) => (
            <span key={k} className="flex items-center gap-1">
              <DomainDot domain={k} /> {DOMAIN_LABEL[k]} <span className="num">{fmtH(totals[k])}</span>
            </span>
          ))}
        </div>
      </Section>

      <Section title="Rappels famille">
        <ul className="space-y-1 text-sm">
          <li>👨‍👩‍👧‍👦 Moment famille de la semaine : {review?.familyMoment ? <b>{review.familyMoment}</b> : <span className="text-muted">à choisir dans la revue</span>}</li>
          {revisions.map((r) => (
            <li key={r.id}>
              📚 {r.title} · <span className="text-muted">{r.daysOfWeek.length ? r.daysOfWeek.map((x) => "LMMJVSD"[x - 1]).join(" ") : "tous les jours"}</span>
            </li>
          ))}
        </ul>
      </Section>

      {days.map((d) => {
        const list = planned.filter((t) => t.plannedDate && isoFromDb(t.plannedDate) === d);
        return (
          <Section key={d} title={formatDayFr(d, { weekday: "long", day: "numeric", month: "short" })} className={d === today ? "border-accent" : ""}>
            {list.length ? (
              <ul className="space-y-1.5">
                {list.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 text-[15px]">
                    <DomainDot domain={t.domain} />
                    {t.timeboxStart && <span className="num text-xs text-muted">{timeInTz(t.timeboxStart)}</span>}
                    <Link href={`/tasks/${t.id}?back=/week?w=${weekStart}`} className={`flex-1 truncate ${t.status === "DONE" ? "text-muted line-through" : ""}`}>
                      {t.title}
                    </Link>
                    {t.status === "TODAY" && <Badge tone="accent">prio</Badge>}
                    {!t.projectId && !t.objectiveId && !t.keyResultId && <Badge tone="warn">orph.</Badge>}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>—</Empty>
            )}
          </Section>
        );
      })}

      {unplanned.length > 0 && (
        <Section title="À placer dans la semaine">
          <ul className="space-y-2">
            {unplanned.map((t) => (
              <li key={t.id}>
                <form action={planTask} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={t.id} />
                  <DomainDot domain={t.domain} />
                  <span className="flex-1 truncate text-[15px]">{t.title}</span>
                  <select name="day" className="input w-auto min-h-[36px] py-0 text-sm" defaultValue="">
                    <option value="">Jour…</option>
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {formatDayFr(d, { weekday: "short", day: "numeric" })}
                      </option>
                    ))}
                  </select>
                  <button className="btn-sm">OK</button>
                </form>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
