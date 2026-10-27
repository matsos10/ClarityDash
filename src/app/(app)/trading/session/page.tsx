import Link from "next/link";
import { LockBanner } from "@/components/trading";
import { Badge, Empty, PageHeader, Section } from "@/components/ui";
import { dbDate, timeInTz, todayISO } from "@/lib/dates";
import { EMOTION_LABEL, signed } from "@/lib/labels";
import { getCtx } from "@/server/access";
import { deleteTrade, startSession } from "@/server/actions/trading";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function SessionPage() {
  const ctx = await getCtx();
  const today = todayISO();
  const [session, items, macro] = await Promise.all([
    db.tradingSession.findUnique({
      where: { userId_date: { userId: ctx.userId, date: dbDate(today) } },
      include: { trades: { where: { deletedAt: null }, include: { account: true, setup: true }, orderBy: { entryAt: "asc" } } },
    }),
    db.preSessionChecklistItem.findMany({ where: { spaceId: ctx.personalSpaceId, active: true }, orderBy: { order: "asc" } }),
    db.macroAnalysis.findFirst({ where: { spaceId: ctx.personalSpaceId, date: dbDate(today) }, include: { scenarios: { orderBy: { order: "asc" } } } }),
  ]);

  if (!session?.checklistPassedAt) {
    return (
      <>
        <PageHeader title="Check-list pré-session" sub="Bloquante : aucun trade sans elle" back="/trading" />
        {!macro && (
          <Link href="/trading/macro" className="card mb-3 block border-warn text-sm text-warn">
            Analyse macro du jour non faite → la faire d&apos;abord
          </Link>
        )}
        <Section>
          <form action={startSession} className="space-y-1">
            {items.map((i) => (
              <label key={i.id} className="flex min-h-[48px] items-center gap-3 text-[15px]">
                <input type="checkbox" name={`item_${i.id}`} className="h-6 w-6 shrink-0" />
                <span className="flex-1">{i.label}</span>
                {!i.required && <span className="text-xs text-muted">optionnel</span>}
              </label>
            ))}
            <button className="btn mt-3 w-full">Ouvrir la session</button>
          </form>
        </Section>
      </>
    );
  }

  // une ligne par trade réel (les copies multi-comptes sont regroupées)
  const groups = new Map<string, typeof session.trades>();
  for (const t of session.trades) groups.set(t.copyGroupId ?? t.id, [...(groups.get(t.copyGroupId ?? t.id) ?? []), t]);
  const locked = !!session.lockedAt;

  return (
    <>
      <PageHeader title="Session du jour" back="/trading" />
      <LockBanner losses={session.lossesCount} locked={locked} />

      {macro && (
        <Section title="Plan macro">
          <div className="flex items-center gap-2 text-sm">
            <Badge tone={macro.bias === "BULLISH" ? "good" : macro.bias === "BEARISH" ? "bad" : "muted"}>{macro.bias}</Badge>
            <span className="num">score {macro.score > 0 ? `+${macro.score}` : macro.score}</span>
            <span className="truncate text-muted">· {macro.mainCatalyst}</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-muted">
            {macro.scenarios.map((s) => (
              <li key={s.id}>
                <span className="num">{s.probability} %</span> {s.label} — {s.trigger}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {locked ? (
        <details className="mb-3">
          <summary className="cursor-pointer text-center text-xs text-muted">J&apos;ai quand même pris un trade (à journaliser)</summary>
          <Link href="/trading/trade/new?violation=1" className="btn-ghost mt-2 w-full border-bad text-bad">
            Enregistrer une violation
          </Link>
        </details>
      ) : (
        <Link href="/trading/trade/new" className="btn mb-3 w-full">
          + Nouveau trade
        </Link>
      )}

      <Section title={`Trades · ${groups.size}`}>
        {groups.size === 0 && <Empty>Aucun trade aujourd&apos;hui.</Empty>}
        <ul>
          {[...groups.values()].map((ts) => {
            const t = ts[0];
            const pnl = Number(t.pnl);
            return (
              <li key={t.id} className="border-b border-line py-2 last:border-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="num text-xs text-muted">{timeInTz(t.entryAt)}</span>
                  <Badge tone={t.direction === "LONG" ? "good" : "bad"}>{t.direction}</Badge>
                  <span className="font-medium">{t.instrument}</span>
                  <span className="flex-1 truncate text-xs text-muted">{t.setup?.name}</span>
                  <span className={`num font-semibold ${pnl >= 0 ? "text-good" : "text-bad"}`}>{signed(pnl)}</span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                  {t.rMultiple != null && <span className="num">{Number(t.rMultiple)} R</span>}
                  {t.emotion && <span>{EMOTION_LABEL[t.emotion]}</span>}
                  <span>{ts.map((x) => x.account.name).join(" + ")}</span>
                  {t.screenshotUrl && (
                    <a href={t.screenshotUrl} target="_blank" className="text-accent">
                      capture
                    </a>
                  )}
                  <form action={deleteTrade} className="ml-auto">
                    {ts.map((x) => (
                      <input key={x.id} type="hidden" name="id" value={x.id} />
                    ))}
                    <button className="text-bad">suppr.</button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>
    </>
  );
}
