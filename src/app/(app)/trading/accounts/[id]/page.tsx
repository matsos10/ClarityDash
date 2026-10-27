import { notFound } from "next/navigation";
import { AccountForm } from "@/components/account-form";
import { StatsBlock } from "@/components/stats-block";
import { Badge, Empty, PageHeader, Progress, Section, Stat } from "@/components/ui";
import { tradeStats } from "@/lib/calc/trading-stats";
import { APP_TZ, formatDayFr, isoDateInTz, todayISO } from "@/lib/dates";
import { money, signed } from "@/lib/labels";
import { getCtx } from "@/server/access";
import { deleteScalingTier, deleteTrade, savePayout, saveScalingTier } from "@/server/actions/trading";
import { db } from "@/server/db";
import { accountSnapshot } from "@/server/trading";

export const dynamic = "force-dynamic";

const PAYOUT_LABEL = { PLANNED: "prévu", REQUESTED: "demandé", PAID: "payé", REJECTED: "refusé" } as const;

export default async function AccountPage({ params }: { params: { id: string } }) {
  const ctx = await getCtx();
  const a = await db.tradingAccount.findFirst({
    where: { id: params.id, spaceId: ctx.personalSpaceId },
    include: {
      trades: { where: { deletedAt: null }, include: { setup: true }, orderBy: { entryAt: "desc" } },
      payouts: { orderBy: { requestedAt: "desc" } },
      scalingTiers: { orderBy: { capitalMin: "asc" } },
    },
  });
  if (!a) notFound();
  const s = accountSnapshot(a);
  const cur = a.currency;
  const stats = tradeStats(
    a.trades.map((t) => ({ id: t.id, pnl: Number(t.pnl), entryAt: t.entryAt, rMultiple: t.rMultiple == null ? null : Number(t.rMultiple), setup: t.setup?.name, emotion: t.emotion })),
    APP_TZ,
  );

  return (
    <>
      <PageHeader title={a.name} sub={`${a.firm} · ${a.type} · ${a.status}`} back="/trading" />

      <Section title="Maximum Loss Limit">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Solde" value={money(s.mll.balance, cur)} />
          <Stat label="Niveau MLL" value={s.mll.mllLevel == null ? "—" : money(s.mll.mllLevel, cur)} />
          <Stat label="Distance" value={s.mll.distance == null ? "—" : money(s.mll.distance, cur)} tone={s.mll.breached ? "bad" : (s.mll.distancePct ?? 100) < 25 ? "bad" : undefined} />
        </div>
        {s.mll.distancePct != null && (
          <div className="mt-2">
            <Progress value={s.mll.distancePct} tone={s.mll.distancePct < 25 ? "bad" : s.mll.distancePct < 50 ? "warn" : "good"} />
          </div>
        )}
        <p className="mt-2 text-[11px] text-muted">
          Plus haut EOD <span className="num">{money(s.mll.highWaterMark, cur)}</span>
          {s.mll.locked && " · MLL figé"} · journée de trading {formatDayFr(s.currentDay)}
          {s.mll.dailyLossRemaining != null && (
            <>
              {" "}
              · perte jour restante <span className="num">{money(s.mll.dailyLossRemaining, cur)}</span>
            </>
          )}
        </p>
      </Section>

      {s.consistency && (
        <Section title={`Consistance ${s.consistency.limitPct} %`} right={s.consistency.ok ? <Badge tone="good">OK</Badge> : <Badge tone="warn">à corriger</Badge>}>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Profit période" value={money(s.consistency.totalProfit, cur)} />
            <Stat label="Meilleure journée" value={money(s.consistency.bestDay, cur)} />
            <Stat label="Part" value={s.consistency.bestDayPct == null ? "—" : `${s.consistency.bestDayPct} %`} tone={s.consistency.ok ? "good" : "warn"} />
          </div>
          <p className="mt-2 text-[11px] text-muted">
            {s.consistency.missingProfit > 0 ? (
              <>
                Il manque <span className="num">{money(s.consistency.missingProfit, cur)}</span> de profit (hors meilleure journée) pour repasser sous la limite.{" "}
              </>
            ) : null}
            Plafond conseillé d&apos;une nouvelle meilleure journée : <span className="num">{money(s.consistency.nextDayCap, cur)}</span>.
          </p>
        </Section>
      )}

      <Section title="Payout" right={s.payout.eligible ? <Badge tone="good">éligible</Badge> : <Badge>pas encore</Badge>}>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Profit depuis dernier" value={money(s.payout.periodProfit, cur)} />
          <Stat label="Jours qualifiants" value={`${s.payout.qualifyingDays}/${s.payout.requiredDays}`} />
          <Stat label="Au plus tôt" value={formatDayFr(s.payout.earliestDate, { day: "numeric", month: "short" })} />
        </div>
        {s.payout.blockers.length > 0 && (
          <ul className="mt-2 list-inside list-disc text-xs text-warn">
            {s.payout.blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
        <div className="mt-3 grid grid-cols-3 gap-3 border-t border-line pt-3">
          <Stat label="Payouts reçus" value={s.cycle.count} />
          <Stat label="Total payé" value={money(s.cycle.totalPaid, cur)} />
          <Stat label="Cycle moyen" value={s.cycle.avgIntervalDays == null ? "—" : `${s.cycle.avgIntervalDays} j`} />
        </div>
        <ul className="mt-3 space-y-1">
          {a.payouts.map((p) => (
            <li key={p.id} className="flex items-center gap-2 text-sm">
              <span className="num flex-1">{money(Number(p.amount), cur)}</span>
              <span className="text-xs text-muted">{p.requestedAt ? isoDateInTz(p.requestedAt) : ""}</span>
              <form action={savePayout} className="flex items-center gap-1">
                <input type="hidden" name="accountId" value={a.id} />
                <input type="hidden" name="id" value={p.id} />
                <select name="status" defaultValue={p.status} className="input min-h-[32px] w-auto py-0 text-xs">
                  {Object.entries(PAYOUT_LABEL).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </select>
                <button className="btn-sm">OK</button>
              </form>
            </li>
          ))}
        </ul>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-accent">+ Payout</summary>
          <form action={savePayout} className="mt-2 grid grid-cols-2 gap-2">
            <input type="hidden" name="accountId" value={a.id} />
            <input name="amount" className="input num" inputMode="decimal" placeholder="Montant" required />
            <input name="date" type="date" className="input" defaultValue={todayISO()} />
            <select name="status" className="input" defaultValue="REQUESTED">
              <option value="PLANNED">Prévu</option>
              <option value="REQUESTED">Demandé</option>
              <option value="PAID">Payé</option>
            </select>
            <button className="btn">Ajouter</button>
          </form>
        </details>
      </Section>

      {a.isPersonalFund && (
        <Section title="Plan de scaling">
          {s.scaling ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Palier actuel" value={s.scaling.current ? `${s.scaling.current.lotSize} lot` : "—"} />
                <Stat label="Palier suivant" value={s.scaling.next ? money(s.scaling.next.capitalMin, cur) : "max"} />
                <Stat label="Manque" value={money(s.scaling.missing, cur)} />
              </div>
              <div className="mt-2">
                <Progress value={s.scaling.progressPct} />
              </div>
            </>
          ) : (
            <Empty>Définis tes paliers de capital.</Empty>
          )}
          <ul className="mt-3 space-y-1 text-sm">
            {a.scalingTiers.map((t) => (
              <li key={t.id} className="flex items-center gap-2">
                <span className="num flex-1">
                  ≥ {money(Number(t.capitalMin), cur)} → {Number(t.lotSize)} lot
                </span>
                <span className="text-xs text-muted">{t.label}</span>
                <form action={deleteScalingTier}>
                  <input type="hidden" name="accountId" value={a.id} />
                  <input type="hidden" name="id" value={t.id} />
                  <button className="text-xs text-bad">✕</button>
                </form>
              </li>
            ))}
          </ul>
          <form action={saveScalingTier} className="mt-2 grid grid-cols-3 gap-2">
            <input type="hidden" name="accountId" value={a.id} />
            <input name="capitalMin" className="input num" inputMode="decimal" placeholder="Capital" required />
            <input name="lotSize" className="input num" inputMode="decimal" placeholder="Lot" defaultValue="0.01" required />
            <button className="btn">+</button>
          </form>
        </Section>
      )}

      <Section title="Statistiques">
        <StatsBlock stats={stats} currency={cur} />
      </Section>

      <Section title="P&L par journée">
        <ul className="space-y-1">
          {[...s.days].reverse().slice(0, 15).map((d) => (
            <li key={d.day} className="flex justify-between text-sm">
              <span className="capitalize text-muted">{formatDayFr(d.day)}</span>
              <span className="num text-xs text-muted">{d.trades} trade(s)</span>
              <span className={`num ${d.pnl >= 0 ? "text-good" : "text-bad"}`}>{signed(d.pnl, cur)}</span>
            </li>
          ))}
        </ul>
        {s.days.length === 0 && <Empty>Aucun trade.</Empty>}
      </Section>

      <Section title="Derniers trades">
        <ul>
          {a.trades.slice(0, 30).map((t) => (
            <li key={t.id} className="flex items-center gap-2 border-b border-line py-1.5 text-sm last:border-0">
              <span className="num text-xs text-muted">{isoDateInTz(t.entryAt).slice(5)}</span>
              <span className="text-xs">{t.direction === "LONG" ? "↑" : "↓"}</span>
              <span className="flex-1 truncate">{t.setup?.name ?? t.instrument}</span>
              {t.rMultiple != null && <span className="num text-xs text-muted">{Number(t.rMultiple)}R</span>}
              <span className={`num ${Number(t.pnl) >= 0 ? "text-good" : "text-bad"}`}>{signed(Number(t.pnl), cur)}</span>
              <form action={deleteTrade}>
                <input type="hidden" name="id" value={t.id} />
                <button className="text-xs text-bad">✕</button>
              </form>
            </li>
          ))}
        </ul>
      </Section>

      <details className="card mb-3">
        <summary className="cursor-pointer text-sm text-accent">Règles du compte</summary>
        <div className="mt-3">
          <AccountForm a={a} />
        </div>
      </details>
    </>
  );
}
