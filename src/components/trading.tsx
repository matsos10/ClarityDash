import Link from "next/link";
import type { TradingAccount } from "@prisma/client";
import { Badge, Progress, Stat } from "@/components/ui";
import { formatDayFr } from "@/lib/dates";
import { money, signed } from "@/lib/labels";
import type { AccountSnapshot } from "@/server/trading";

const FIRM: Record<string, string> = { TOPSTEP: "Topstep", FUNDEDNEXT: "FundedNext", PERSONAL: "Fonds perso", OTHER: "Autre" };

export function AccountCard({ account, s }: { account: TradingAccount; s: AccountSnapshot }) {
  const cur = account.currency;
  const mllPct = s.mll.distancePct;
  return (
    <Link href={`/trading/accounts/${account.id}`} className="card mb-3 block">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-medium">{account.name}</div>
          <div className="text-xs text-muted">
            {FIRM[account.firm]} · {account.type}
          </div>
        </div>
        {account.status !== "ACTIVE" ? (
          <Badge tone="bad">{account.status}</Badge>
        ) : s.payout.eligible ? (
          <Badge tone="good">payout OK</Badge>
        ) : null}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Solde" value={money(s.mll.balance, cur)} />
        <Stat label="Aujourd'hui" value={signed(s.mll.todayPnl, cur)} tone={s.mll.todayPnl > 0 ? "good" : s.mll.todayPnl < 0 ? "bad" : undefined} />
        <Stat
          label="Distance MLL"
          value={s.mll.distance == null ? "—" : money(s.mll.distance, cur)}
          tone={mllPct == null ? undefined : mllPct < 25 ? "bad" : mllPct < 50 ? "warn" : "good"}
        />
      </div>
      {mllPct != null && (
        <div className="mt-2">
          <Progress value={mllPct} tone={mllPct < 25 ? "bad" : mllPct < 50 ? "warn" : "good"} />
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
        {s.consistency && (
          <span className={s.consistency.ok ? "" : "text-warn"}>
            Consistance <span className="num">{s.consistency.bestDayPct ?? "—"} %</span> / {s.consistency.limitPct} %
          </span>
        )}
        {account.payoutMinDays != null && (
          <span>
            Jours <span className="num">{s.payout.qualifyingDays}/{s.payout.requiredDays}</span>
          </span>
        )}
        {account.payoutMinDays != null && <span>Payout ≥ {formatDayFr(s.payout.earliestDate)}</span>}
        {s.mll.dailyLossRemaining != null && (
          <span className={s.mll.dailyLossRemaining < account.dailyLossLimit!.toNumber() * 0.3 ? "text-bad" : ""}>
            Perte jour restante <span className="num">{money(s.mll.dailyLossRemaining, cur)}</span>
          </span>
        )}
      </div>
    </Link>
  );
}

export function LockBanner({ losses, locked }: { losses: number; locked: boolean }) {
  if (locked)
    return (
      <div className="mb-3 rounded-2xl border-2 border-bad bg-bad/10 p-5 text-center">
        <div className="text-4xl">⛔</div>
        <div className="mt-1 text-lg font-bold text-bad">STOP — 2 pertes</div>
        <div className="text-sm text-muted">Session verrouillée jusqu&apos;à demain. Ferme la plateforme.</div>
      </div>
    );
  return (
    <div className={`mb-3 rounded-2xl border p-3 text-center text-sm ${losses === 1 ? "border-warn bg-warn/10 text-warn" : "border-line"}`}>
      Pertes du jour : <span className="num font-semibold">{losses}/2</span>
      {losses === 1 && " — encore une et c'est fini pour aujourd'hui."}
    </div>
  );
}
