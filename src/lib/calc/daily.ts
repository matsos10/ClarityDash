import { round2, type DayPnl, type TradeLite } from "./types";

/** Agrège le P&L net par journée de trading, trié chronologiquement. */
export function dailyPnl(trades: Pick<TradeLite, "pnl" | "entryAt">[], dayOf: (d: Date) => string): DayPnl[] {
  const map = new Map<string, DayPnl>();
  for (const t of trades) {
    const day = dayOf(t.entryAt);
    const cur = map.get(day) ?? { day, pnl: 0, trades: 0 };
    cur.pnl = round2(cur.pnl + t.pnl);
    cur.trades += 1;
    map.set(day, cur);
  }
  return [...map.values()].sort((a, b) => a.day.localeCompare(b.day));
}
