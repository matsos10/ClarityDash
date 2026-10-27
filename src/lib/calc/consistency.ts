import { round2, sum, type DayPnl } from "./types";

export type ConsistencyResult = {
  limitPct: number;
  totalProfit: number;
  bestDay: number;
  bestDayDate: string | null;
  bestDayPct: number | null;
  ok: boolean;
  /** Profit total nécessaire pour que la meilleure journée respecte la limite */
  requiredTotal: number;
  missingProfit: number;
  /** Profit max d'une nouvelle meilleure journée sans dépasser la limite */
  nextDayCap: number;
};

/**
 * Règle de consistance (ex. Topstep 40 %) : la meilleure journée gagnante ne
 * doit pas dépasser `limitPct` % du profit total de la période.
 */
export function consistency(days: DayPnl[], limitPct: number): ConsistencyResult {
  const p = limitPct / 100;
  const totalProfit = round2(sum(days.map((d) => d.pnl)));
  let bestDay = 0;
  let bestDayDate: string | null = null;
  for (const d of days) {
    if (d.pnl > bestDay) {
      bestDay = d.pnl;
      bestDayDate = d.day;
    }
  }
  const bestDayPct = totalProfit > 0 ? round2((bestDay / totalProfit) * 100) : null;
  const ok = totalProfit > 0 && bestDay <= totalProfit * p + 1e-9;
  const requiredTotal = round2(bestDay / p);
  return {
    limitPct,
    totalProfit,
    bestDay: round2(bestDay),
    bestDayDate,
    bestDayPct,
    ok,
    requiredTotal,
    missingProfit: round2(Math.max(0, requiredTotal - totalProfit)),
    nextDayCap: round2(Math.max(0, (totalProfit * p) / (1 - p))),
  };
}
