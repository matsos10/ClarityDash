import { hourInTz } from "../dates";
import { round2, sum, type TradeLite } from "./types";

type Bucket = { key: string; n: number; wins: number; winRate: number; pnl: number; expectancy: number };

function bucketize(trades: TradeLite[], keyOf: (t: TradeLite) => string | null | undefined): Bucket[] {
  const map = new Map<string, TradeLite[]>();
  for (const t of trades) {
    const k = keyOf(t);
    if (!k) continue;
    map.set(k, [...(map.get(k) ?? []), t]);
  }
  return [...map.entries()].map(([key, ts]) => {
    const wins = ts.filter((t) => t.pnl > 0).length;
    const pnl = round2(sum(ts.map((t) => t.pnl)));
    return { key, n: ts.length, wins, winRate: round2((wins / ts.length) * 100), pnl, expectancy: round2(pnl / ts.length) };
  });
}

export function tradeStats(trades: TradeLite[], tz: string) {
  const n = trades.length;
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);
  const grossWin = sum(wins.map((t) => t.pnl));
  const grossLoss = Math.abs(sum(losses.map((t) => t.pnl)));
  const totalPnl = round2(grossWin - grossLoss);
  const withR = trades.filter((t) => t.rMultiple != null);

  let peak = 0;
  let equity = 0;
  let maxDrawdown = 0;
  for (const t of [...trades].sort((a, b) => a.entryAt.getTime() - b.entryAt.getTime())) {
    equity += t.pnl;
    peak = Math.max(peak, equity);
    maxDrawdown = Math.max(maxDrawdown, peak - equity);
  }

  const byHour = bucketize(trades, (t) => String(hourInTz(t.entryAt, tz)).padStart(2, "0") + "h").sort((a, b) =>
    a.key.localeCompare(b.key),
  );

  return {
    n,
    wins: wins.length,
    losses: losses.length,
    winRate: n ? round2((wins.length / n) * 100) : 0,
    avgWin: wins.length ? round2(grossWin / wins.length) : 0,
    avgLoss: losses.length ? round2(-grossLoss / losses.length) : 0,
    totalPnl,
    expectancy: n ? round2(totalPnl / n) : 0,
    expectancyR: withR.length ? round2(sum(withR.map((t) => t.rMultiple!)) / withR.length) : null,
    profitFactor: grossLoss > 0 ? round2(grossWin / grossLoss) : null,
    maxDrawdown: round2(maxDrawdown),
    byHour,
    bestHours: [...byHour].filter((b) => b.n >= 3).sort((a, b) => b.expectancy - a.expectancy).slice(0, 3),
    bySetup: bucketize(trades, (t) => t.setup).sort((a, b) => b.pnl - a.pnl),
    byEmotion: bucketize(trades, (t) => t.emotion).sort((a, b) => b.pnl - a.pnl),
  };
}

export type TradeStats = ReturnType<typeof tradeStats>;
