import Link from "next/link";
import { QuickTask } from "@/components/client/quick-task";
import { RoutineList } from "@/components/client/routine-list";
import { TaskRow } from "@/components/client/task-row";
import { Badge, Empty, PageHeader, Section } from "@/components/ui";
import { dbDate, formatDayFr, isoDateInTz, quarterOf, todayISO } from "@/lib/dates";
import { defaultSpaceId, getCtx, spaceIdsFor } from "@/server/access";
import { db } from "@/server/db";
import { linkOptions, routineForDay, spaceOptions } from "@/server/horizons";
import { taskInclude, toTaskView } from "@/server/queries";
import { MAX_TODAY } from "@/server/tasks";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const ctx = await getCtx();
  const today = todayISO();
  const spaceIds = spaceIdsFor(ctx, "HORIZONS");
  const mine = { OR: [{ assigneeId: ctx.userId }, { assigneeId: null }] };

  const [todayTasks, doneToday, backlog, routine, links, inboxCount, journal, session, accounts] = await Promise.all([
    db.task.findMany({ where: { status: "TODAY", assigneeId: ctx.userId, deletedAt: null }, include: taskInclude, orderBy: { todayRank: "asc" } }),
    db.task.findMany({
      where: { status: "DONE", assigneeId: ctx.userId, completedAt: { gte: new Date(Date.now() - 36 * 3_600_000) } },
      include: taskInclude,
    }).then((ts) => ts.filter((t) => t.completedAt && isoDateInTz(t.completedAt) === today)),
    db.task.findMany({
      where: { spaceId: { in: spaceIds }, status: { in: ["WEEK", "BACKLOG"] }, deletedAt: null, ...mine },
      include: taskInclude,
      orderBy: [{ status: "desc" }, { createdAt: "desc" }],
      take: 40,
    }),
    routineForDay(ctx.userId, today),
    linkOptions(ctx, quarterOf(today)),
    db.capture.count({ where: { userId: ctx.userId, status: { in: ["PENDING", "SUGGESTED"] } } }),
    db.journalEntry.findUnique({ where: { userId_date: { userId: ctx.userId, date: dbDate(today) } } }),
    db.tradingSession.findUnique({ where: { userId_date: { userId: ctx.userId, date: dbDate(today) } } }),
    db.tradingAccount.count({ where: { spaceId: ctx.personalSpaceId, status: "ACTIVE" } }),
  ]);

  const week = backlog.filter((t) => t.status === "WEEK");
  const rest = backlog.filter((t) => t.status === "BACKLOG");
  const canPromote = todayTasks.length < MAX_TODAY;
  const routineDone = routine.filter((r) => r.done).length;

  return (
    <>
      <PageHeader
        title="Aujourd'hui"
        sub={<span className="capitalize">{formatDayFr(today, { weekday: "long", day: "numeric", month: "long" })}</span>}
        right={
          inboxCount > 0 ? (
            <Link href="/inbox" className="btn-sm">
              Inbox <span className="num ml-1 font-semibold text-accent">{inboxCount}</span>
            </Link>
          ) : null
        }
      />

      <Section title={`3 priorités · ${todayTasks.length}/${MAX_TODAY}`}>
        {todayTasks.length === 0 ? (
          <Empty>Choisis jusqu&apos;à 3 priorités dans « Cette semaine » ou le backlog.</Empty>
        ) : (
          <ul>
            {todayTasks.map((t, i) => (
              <TaskRow key={t.id} task={toTaskView(t)} mode="today" date={today} rank={i + 1} />
            ))}
          </ul>
        )}
        {doneToday.length > 0 && (
          <ul className="mt-1 opacity-80">
            {doneToday.map((t) => (
              <TaskRow key={t.id} task={toTaskView(t)} mode="done" date={today} />
            ))}
          </ul>
        )}
        <div className="mt-3">
          <QuickTask
            date={today}
            status={canPromote ? "TODAY" : "BACKLOG"}
            links={links}
            spaces={spaceOptions(ctx)}
            defaultSpaceId={defaultSpaceId(ctx, "HORIZONS")}
          />
        </div>
      </Section>

      {accounts > 0 && (
        <Link href="/trading/session" className="card mb-3 flex items-center justify-between">
          <div>
            <div className="h2 mb-0">Trading</div>
            <div className="text-sm">
              {session?.lockedAt
                ? "Session verrouillée (2 pertes) — on s'arrête."
                : session?.checklistPassedAt
                  ? `Session ouverte · ${session.lossesCount} perte(s)`
                  : "Check-list pré-session à faire"}
            </div>
          </div>
          {session?.lockedAt ? <Badge tone="bad">STOP</Badge> : session?.checklistPassedAt ? <Badge tone="good">OK</Badge> : <Badge tone="warn">À faire</Badge>}
        </Link>
      )}

      <Section title={`Routine · ${routineDone}/${routine.length}`} right={<Link href="/routine" className="text-xs text-muted">Gérer</Link>}>
        {routine.length ? <RoutineList items={routine} date={today} /> : <Empty>Aucune habitude prévue aujourd&apos;hui.</Empty>}
      </Section>

      <Section title={`Cette semaine · ${week.length}`}>
        {week.length ? (
          <ul>
            {week.map((t) => (
              <TaskRow key={t.id} task={toTaskView(t)} mode="week" date={today} canPromote={canPromote} />
            ))}
          </ul>
        ) : (
          <Empty>Rien de planifié pour la semaine.</Empty>
        )}
      </Section>

      <Section title={`Backlog · ${rest.length}`}>
        {rest.length ? (
          <ul>
            {rest.map((t) => (
              <TaskRow key={t.id} task={toTaskView(t)} mode="backlog" date={today} canPromote={canPromote} />
            ))}
          </ul>
        ) : (
          <Empty>Backlog vide.</Empty>
        )}
      </Section>

      <Link href="/journal" className="card mb-3 flex items-center justify-between">
        <div>
          <div className="h2 mb-0">Revue du soir</div>
          <div className="text-sm">{journal ? "Faite ✓" : "Fait / bloqué / demain — 1 minute"}</div>
        </div>
        <span className="text-muted">→</span>
      </Link>
    </>
  );
}
