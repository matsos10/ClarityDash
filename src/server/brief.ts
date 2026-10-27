import type { Prisma } from "@prisma/client";
import { proposePriorities } from "@/lib/calc/priorities";
import { briefToPush, briefToTelegram, type BriefContent } from "@/lib/brief";
import { addDaysISO, dbDate, diffDaysISO, isoDateInTz, isoFromDb, isoWeekday, quarterOf, timeInTz, weekStartISO, zonedTimeToUtc } from "@/lib/dates";
import { spaceIdsFor, type Ctx } from "./ctx";
import { db } from "./db";
import { safeListEvents } from "./google";
import { routineForDay } from "./horizons";
import { sendPush } from "./push";
import { MAX_TODAY, setTaskStatus } from "./tasks";
import { accountSnapshot } from "./trading";

const STALE_DAYS = 14;
const idleDays = (d: Date | null) => (d ? Math.floor((Date.now() - d.getTime()) / 86_400_000) : null);

/** Construit le brief du jour à partir de toutes les données de l'utilisateur. */
export async function buildBrief(ctx: Ctx, date: string): Promise<BriefContent> {
  const spaceIds = spaceIdsFor(ctx, "HORIZONS");
  const quarter = quarterOf(date);
  const in7 = dbDate(addDaysISO(date, 7));
  const in30 = dbDate(addDaysISO(date, 30));
  const today = dbDate(date);
  const mine = { OR: [{ assigneeId: ctx.userId }, { assigneeId: null }] };

  const [chosen, candidates, objectives, agenda, routine, outcomes, inbox, vision, accounts, macro, session] = await Promise.all([
    db.task.findMany({
      where: { status: "TODAY", assigneeId: ctx.userId, deletedAt: null },
      include: { objective: true, keyResult: { include: { objective: true } }, project: { include: { objective: true } } },
      orderBy: { todayRank: "asc" },
    }),
    db.task.findMany({
      where: { spaceId: { in: spaceIds }, status: { in: ["WEEK", "BACKLOG"] }, deletedAt: null, ...mine },
      include: { objective: true, keyResult: { include: { objective: true } }, project: { include: { objective: true } }, nextActionOf: true },
      take: 200,
    }),
    db.objective.findMany({ where: { spaceId: { in: spaceIds } }, orderBy: { order: "asc" } }),
    safeListEvents(ctx.userId, zonedTimeToUtc(date, "00:00"), zonedTimeToUtc(addDaysISO(date, 1), "00:00")),
    routineForDay(ctx.userId, date),
    db.weeklyOutcome.findMany({ where: { spaceId: { in: spaceIds }, weekStart: dbDate(weekStartISO(date)), done: false }, orderBy: { rank: "asc" } }),
    db.capture.count({ where: { userId: ctx.userId, status: { in: ["PENDING", "SUGGESTED"] } } }),
    isoWeekday(date) === 1 ? db.vision.findFirst({ where: { spaceId: { in: spaceIds } } }) : null,
    db.tradingAccount.findMany({
      where: { spaceId: ctx.personalSpaceId, status: "ACTIVE" },
      include: { trades: { where: { deletedAt: null } }, payouts: true, scalingTiers: true },
    }),
    db.macroAnalysis.findFirst({ where: { spaceId: ctx.personalSpaceId, date: today } }),
    db.tradingSession.findUnique({ where: { userId_date: { userId: ctx.userId, date: today } } }),
  ]);

  const objectiveOf = (t: (typeof candidates)[number] | (typeof chosen)[number]) =>
    t.objective ?? t.keyResult?.objective ?? t.project?.objective ?? null;

  const proposed = proposePriorities(
    candidates.map((t) => {
      const o = objectiveOf(t);
      return {
        id: t.id,
        title: t.title,
        status: t.status as "WEEK" | "BACKLOG",
        dueDate: t.dueDate ? isoFromDb(t.dueDate) : null,
        plannedDate: t.plannedDate ? isoFromDb(t.plannedDate) : null,
        createdDate: isoDateInTz(t.createdAt),
        krTitle: t.keyResult && t.keyResult.quarter === quarter ? t.keyResult.title : null,
        objectiveTitle: o?.title ?? null,
        objectiveIdleDays: o ? idleDays(o.lastActionAt) ?? 999 : null,
        isNextAction: !!t.nextActionOf,
        orphan: !t.projectId && !t.objectiveId && !t.keyResultId,
      };
    }),
    date,
    MAX_TODAY - chosen.length,
  );

  // Échéances : tâches maison/famille, jalons, et modules phase 3 (école, dossiers, documents, fiscalité, véhicule).
  const familySpaces = { spaceId: { in: ctx.spaces.map((s) => s.id) } };
  const [dueTasks, milestones, school, dossier, docs, taxes, vehicle] = await Promise.all([
    db.task.findMany({
      where: { spaceId: { in: spaceIds }, deletedAt: null, status: { notIn: ["DONE", "CANCELLED"] }, domain: { in: ["HOME", "FAMILY"] }, dueDate: { gte: today, lte: in7 } },
    }),
    db.milestone.findMany({ where: { doneAt: null, dueDate: { gte: today, lte: in30 }, vision: { spaceId: { in: spaceIds } } } }),
    db.schoolEvent.findMany({ where: { member: familySpaces, date: { gte: zonedTimeToUtc(date, "00:00"), lt: zonedTimeToUtc(addDaysISO(date, 8), "00:00") } }, include: { member: true } }),
    db.dossierEvent.findMany({ where: { dossier: familySpaces, dueAt: { gte: today, lte: in7 } }, include: { dossier: true } }),
    db.document.findMany({ where: { ...familySpaces, expiresAt: { gte: today, lte: in30 } } }),
    db.taxObligation.findMany({ where: { ...familySpaces, paidAt: null, dueDate: { gte: today, lte: dbDate(addDaysISO(date, 14)) } } }),
    db.vehicleEvent.findMany({ where: { vehicle: familySpaces, nextDueDate: { gte: today, lte: in30 } }, include: { vehicle: true } }),
  ]);
  const deadlines = [
    ...dueTasks.map((t) => ({ date: isoFromDb(t.dueDate!), label: t.title, kind: t.domain === "HOME" ? "maison" : "famille" })),
    ...milestones.map((m) => ({ date: isoFromDb(m.dueDate), label: `Jalon : ${m.title}`, kind: "vision" })),
    ...school.map((s) => ({ date: isoDateInTz(s.date), label: `${s.member.name} : ${s.title}`, kind: "école" })),
    ...dossier.map((e) => ({ date: isoFromDb(e.dueAt!), label: `${e.dossier.title} : ${e.title}`, kind: "dossier" })),
    ...docs.map((d) => ({ date: isoFromDb(d.expiresAt!), label: `Expiration : ${d.title}`, kind: "document" })),
    ...taxes.map((t) => ({ date: isoFromDb(t.dueDate), label: `${t.kind} : ${t.label}`, kind: "fiscal" })),
    ...vehicle.map((v) => ({ date: isoFromDb(v.nextDueDate!), label: `${v.vehicle.model} : ${v.kind}`, kind: "véhicule" })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  let trading: BriefContent["trading"] = null;
  if (accounts.length) {
    const yesterday = addDaysISO(date, -1);
    const snaps = accounts.map((a) => ({ a, s: accountSnapshot(a) }));
    const ydays = snaps.flatMap(({ s }) => s.days.filter((d) => d.day === yesterday));
    trading = {
      macroDone: !!macro,
      sessionOpen: !!session?.checklistPassedAt,
      yesterdayPnl: ydays.length ? Math.round(ydays.reduce((x, d) => x + d.pnl, 0) * 100) / 100 : null,
      accounts: snaps.map(({ a, s }) => ({
        name: a.name,
        distance: s.mll.distance,
        distancePct: s.mll.distancePct,
        payoutEligible: s.payout.eligible,
        payoutDate: s.payout.earliestDate,
      })),
    };
  }

  return {
    date,
    vision: vision ? { title: vision.title, text: vision.textFr, daysLeft: diffDaysISO(isoFromDb(vision.targetDate), date) } : null,
    agenda: {
      connected: agenda.connected && !agenda.error,
      events: agenda.events.map((e) => ({ time: e.allDay ? null : timeInTz(e.start), end: e.allDay ? null : timeInTz(e.end), title: e.title })),
    },
    chosen: chosen.map((t) => ({ id: t.id, title: t.title, objective: objectiveOf(t)?.title ?? null })),
    proposed,
    deadlines,
    routine: routine.filter((r) => !r.done).map((r) => r.title),
    outcomes: outcomes.map((o) => o.title),
    trading,
    inbox,
    staleObjectives: objectives
      .filter((o) => (idleDays(o.lastActionAt) ?? Infinity) >= STALE_DAYS)
      .map((o) => ({ title: o.title, days: idleDays(o.lastActionAt) })),
  };
}

export async function saveBrief(ctx: Ctx, date: string) {
  const content = await buildBrief(ctx, date);
  const row = await db.dailyBrief.upsert({
    where: { userId_date: { userId: ctx.userId, date: dbDate(date) } },
    update: { content: content as unknown as Prisma.InputJsonValue },
    create: { userId: ctx.userId, date: dbDate(date), content: content as unknown as Prisma.InputJsonValue },
  });
  return { row, content };
}

export async function getBrief(ctx: Ctx, date: string, regenerate = false) {
  const existing = regenerate ? null : await db.dailyBrief.findUnique({ where: { userId_date: { userId: ctx.userId, date: dbDate(date) } } });
  if (existing) return { row: existing, content: existing.content as unknown as BriefContent };
  return saveBrief(ctx, date);
}

/** Passe les priorités proposées du brief en « Aujourd'hui » (dans la limite de 3). */
export async function acceptProposed(ctx: Ctx, date: string) {
  const { content } = await getBrief(ctx, date);
  let accepted = 0;
  for (const p of content.proposed) {
    try {
      await setTaskStatus(ctx, p.id, "TODAY", date);
      accepted++;
    } catch {
      // tâche supprimée entre-temps ou limite atteinte
    }
  }
  await saveBrief(ctx, date);
  return accepted;
}

export type BriefSender = (chatId: bigint, html: string, proposed: boolean, date: string) => Promise<void>;

/** Génère et envoie le brief (push + Telegram si lié). */
export async function deliverBrief(ctx: Ctx, date: string, sendTelegram?: BriefSender) {
  const { row, content } = await saveBrief(ctx, date);
  await sendPush(ctx.userId, { title: "Brief du jour", body: briefToPush(content), url: "/brief", tag: "brief" });
  const link = await db.telegramLink.findUnique({ where: { userId: ctx.userId } });
  if (link && sendTelegram) await sendTelegram(link.chatId, briefToTelegram(content), content.proposed.length > 0, date);
  await db.dailyBrief.update({ where: { id: row.id }, data: { sentAt: new Date() } });
  return content;
}
