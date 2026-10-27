import Link from "next/link";
import { AccountCard, LockBanner } from "@/components/trading";
import { Badge, Empty, PageHeader, Section } from "@/components/ui";
import { dbDate, todayISO } from "@/lib/dates";
import { getCtx } from "@/server/access";
import { db } from "@/server/db";
import { accountSnapshot } from "@/server/trading";

export const dynamic = "force-dynamic";

export default async function TradingPage() {
  const ctx = await getCtx();
  const today = todayISO();
  const [accounts, session, macro] = await Promise.all([
    db.tradingAccount.findMany({
      where: { spaceId: ctx.personalSpaceId, status: { not: "CLOSED" } },
      include: { trades: { where: { deletedAt: null } }, payouts: true, scalingTiers: true },
      orderBy: [{ status: "asc" }, { openedAt: "asc" }],
    }),
    db.tradingSession.findUnique({ where: { userId_date: { userId: ctx.userId, date: dbDate(today) } } }),
    db.macroAnalysis.findFirst({ where: { spaceId: ctx.personalSpaceId, date: dbDate(today) } }),
  ]);

  return (
    <>
      <PageHeader
        title="Trading"
        right={
          <Link href="/trading/accounts/new" className="btn-sm">
            + Compte
          </Link>
        }
      />

      <div className="mb-3 grid grid-cols-2 gap-2">
        <Link href="/trading/macro" className="card flex flex-col">
          <span className="h2 mb-0">Macro du jour</span>
          {macro ? (
            <span className="text-sm">
              <Badge tone={macro.bias === "BULLISH" ? "good" : macro.bias === "BEARISH" ? "bad" : "muted"}>{macro.bias}</Badge>{" "}
              <span className="num">{macro.score > 0 ? `+${macro.score}` : macro.score}</span>
            </span>
          ) : (
            <span className="text-sm text-warn">À faire</span>
          )}
        </Link>
        <Link href="/trading/session" className="card flex flex-col">
          <span className="h2 mb-0">Session</span>
          <span className="text-sm">
            {session?.lockedAt ? <Badge tone="bad">STOP</Badge> : session?.checklistPassedAt ? <Badge tone="good">ouverte</Badge> : <span className="text-warn">Check-list</span>}
          </span>
        </Link>
      </div>

      {session?.checklistPassedAt && <LockBanner losses={session.lossesCount} locked={!!session.lockedAt} />}

      {accounts.length === 0 && (
        <Section>
          <Empty>Aucun compte. Ajoute tes comptes Topstep, FundedNext et ton fonds perso.</Empty>
        </Section>
      )}
      {accounts.map((a) => (
        <AccountCard key={a.id} account={a} s={accountSnapshot(a)} />
      ))}

      <div className="grid grid-cols-2 gap-2">
        <Link href="/trading/stats" className="btn-ghost">
          Statistiques
        </Link>
        <Link href="/trading/config" className="btn-ghost">
          Check-list & setups
        </Link>
      </div>
    </>
  );
}
