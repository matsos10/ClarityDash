import { Stat } from "@/components/ui";
import type { TradeStats } from "@/lib/calc/trading-stats";
import { EMOTION_LABEL, money, signed } from "@/lib/labels";

function Table({ title, rows, label = (k: string) => k, currency }: { title: string; rows: TradeStats["byHour"]; label?: (k: string) => string; currency: string }) {
  if (!rows.length) return null;
  return (
    <div className="mt-3">
      <div className="h2">{title}</div>
      <table className="w-full text-xs">
        <thead className="text-muted">
          <tr>
            <th className="text-left font-normal" />
            <th className="text-right font-normal">n</th>
            <th className="text-right font-normal">win</th>
            <th className="text-right font-normal">esp.</th>
            <th className="text-right font-normal">P&amp;L</th>
          </tr>
        </thead>
        <tbody className="num">
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-line">
              <td className="py-1 font-sans">{label(r.key)}</td>
              <td className="text-right">{r.n}</td>
              <td className="text-right">{r.winRate}%</td>
              <td className={`text-right ${r.expectancy >= 0 ? "text-good" : "text-bad"}`}>{money(r.expectancy, currency)}</td>
              <td className={`text-right ${r.pnl >= 0 ? "text-good" : "text-bad"}`}>{signed(r.pnl, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatsBlock({ stats, currency = "USD" }: { stats: TradeStats; currency?: string }) {
  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Trades" value={stats.n} />
        <Stat label="Win rate" value={`${stats.winRate} %`} />
        <Stat label="P&L" value={signed(stats.totalPnl, currency)} tone={stats.totalPnl >= 0 ? "good" : "bad"} />
        <Stat label="Espérance" value={money(stats.expectancy, currency)} tone={stats.expectancy >= 0 ? "good" : "bad"} />
        <Stat label="Espérance R" value={stats.expectancyR == null ? "—" : `${stats.expectancyR} R`} />
        <Stat label="Profit factor" value={stats.profitFactor ?? "—"} />
        <Stat label="Gain moyen" value={money(stats.avgWin, currency)} />
        <Stat label="Perte moyenne" value={money(stats.avgLoss, currency)} />
        <Stat label="Drawdown max" value={money(stats.maxDrawdown, currency)} />
      </div>
      {stats.bestHours.length > 0 && (
        <p className="mt-3 text-xs">
          Meilleurs créneaux : <span className="num font-semibold">{stats.bestHours.map((b) => b.key).join(" · ")}</span>
        </p>
      )}
      <Table title="Par heure (Lisbonne)" rows={stats.byHour} currency={currency} />
      <Table title="Par setup" rows={stats.bySetup} currency={currency} />
      <Table title="Par émotion" rows={stats.byEmotion} label={(k) => EMOTION_LABEL[k] ?? k} currency={currency} />
    </>
  );
}
