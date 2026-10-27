import { addDaysISO, diffDaysISO, isoWeekday } from "../dates";
import { consistency, type ConsistencyResult } from "./consistency";
import { round2, sum, type DayPnl } from "./types";

export type PayoutLite = { day: string; amount: number; status: "PLANNED" | "REQUESTED" | "PAID" | "REJECTED" };

export type PayoutRules = {
  /** Nombre min. de jours (qualifiants) de trading entre deux payouts */
  minDays: number | null;
  /** Profit min. pour qu'une journée compte ; null = toute journée tradée compte */
  minDayProfit: number | null;
  consistencyPct: number | null;
};

export type PayoutStatus = {
  periodStart: string | null;
  periodProfit: number;
  qualifyingDays: number;
  requiredDays: number;
  daysOk: boolean;
  consistency: ConsistencyResult | null;
  eligible: boolean;
  /** Date (jour de trading) à laquelle la condition de jours est/sera remplie au plus tôt */
  earliestDate: string;
  blockers: string[];
};

function nextWeekday(iso: string): string {
  let d = addDaysISO(iso, 1);
  while (isoWeekday(d) > 5) d = addDaysISO(d, 1);
  return d;
}

export function payoutStatus(days: DayPnl[], payouts: PayoutLite[], rules: PayoutRules, today: string): PayoutStatus {
  const last = payouts
    .filter((p) => p.status === "PAID" || p.status === "REQUESTED")
    .sort((a, b) => a.day.localeCompare(b.day))
    .at(-1);
  const period = last ? days.filter((d) => d.day > last.day) : days;
  const periodProfit = round2(sum(period.map((d) => d.pnl)));
  const qualifying = period.filter((d) => (rules.minDayProfit != null ? d.pnl >= rules.minDayProfit : d.trades > 0));
  const requiredDays = rules.minDays ?? 0;
  const daysOk = qualifying.length >= requiredDays;
  const cons = rules.consistencyPct ? consistency(period, rules.consistencyPct) : null;

  let earliestDate: string;
  if (daysOk) {
    earliestDate = requiredDays > 0 ? qualifying[requiredDays - 1].day : today;
    if (earliestDate < today) earliestDate = today;
  } else {
    const remaining = requiredDays - qualifying.length;
    const todayCounted = qualifying.some((d) => d.day === today);
    let d = todayCounted || isoWeekday(today) > 5 ? nextWeekday(today) : today;
    for (let i = 1; i < remaining; i++) d = nextWeekday(d);
    earliestDate = d;
  }

  const blockers: string[] = [];
  if (periodProfit <= 0) blockers.push("Profit de la période ≤ 0");
  if (!daysOk) blockers.push(`${requiredDays - qualifying.length} jour(s) qualifiant(s) manquant(s)`);
  if (cons && !cons.ok && periodProfit > 0) blockers.push(`Consistance : meilleure journée ${cons.bestDayPct} % > ${cons.limitPct} %`);

  return {
    periodStart: last ? last.day : null,
    periodProfit,
    qualifyingDays: qualifying.length,
    requiredDays,
    daysOk,
    consistency: cons,
    eligible: blockers.length === 0,
    earliestDate,
    blockers,
  };
}

export type PayoutCycle = {
  count: number;
  totalPaid: number;
  avgAmount: number;
  avgIntervalDays: number | null;
  lastPaid: string | null;
  intervals: number[];
};

export function payoutCycle(payouts: PayoutLite[]): PayoutCycle {
  const paid = payouts.filter((p) => p.status === "PAID").sort((a, b) => a.day.localeCompare(b.day));
  const intervals = paid.slice(1).map((p, i) => diffDaysISO(p.day, paid[i].day));
  const totalPaid = round2(sum(paid.map((p) => p.amount)));
  return {
    count: paid.length,
    totalPaid,
    avgAmount: paid.length ? round2(totalPaid / paid.length) : 0,
    avgIntervalDays: intervals.length ? round2(sum(intervals) / intervals.length) : null,
    lastPaid: paid.at(-1)?.day ?? null,
    intervals,
  };
}
