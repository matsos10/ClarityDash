import Link from "next/link";
import { StatsBlock } from "@/components/stats-block";
import { PageHeader, Section } from "@/components/ui";
import { tradeStats } from "@/lib/calc/trading-stats";
import { APP_TZ } from "@/lib/dates";
import { getCtx } from "@/server/access";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

const PERIODS = { "30": 30, "90": 90, all: null } as const;

export default async function StatsPage({ searchParams }: { searchParams: { p?: string; a?: string } }) {
  const ctx = await getCtx();
  const p = (searchParams.p ?? "90") as keyof typeof PERIODS;
  const days = PERIODS[p] ?? null;
  const accounts = await db.tradingAccount.findMany({ where: { spaceId: ctx.personalSpaceId }, orderBy: { openedAt: "asc" } });
  const accountId = accounts.some((a) => a.id === searchParams.a) ? searchParams.a : undefined;
  const trades = await db.trade.findMany({
    where: {
      deletedAt: null,
      account: { spaceId: ctx.personalSpaceId },
      ...(accountId ? { accountId } : {}),
      ...(days ? { entryAt: { gte: new Date(Date.now() - days * 86_400_000) } } : {}),
    },
    include: { setup: true },
  });
  // Sans filtre de compte : un trade copié sur N comptes compte une fois (P&L du premier).
  const seen = new Set<string>();
  const unique = accountId
    ? trades
    : trades.filter((t) => {
        if (!t.copyGroupId) return true;
        if (seen.has(t.copyGroupId)) return false;
        seen.add(t.copyGroupId);
        return true;
      });
  const stats = tradeStats(
    unique.map((t) => ({ id: t.id, pnl: Number(t.pnl), entryAt: t.entryAt, rMultiple: t.rMultiple == null ? null : Number(t.rMultiple), setup: t.setup?.name, emotion: t.emotion })),
    APP_TZ,
  );
  const q = (o: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(Object.entries({ p, a: accountId, ...o }).filter(([, v]) => v) as [string, string][]);
    return `/trading/stats?${sp}`;
  };

  return (
    <>
      <PageHeader title="Statistiques" back="/trading" />
      <div className="mb-3 flex flex-wrap gap-1">
        {Object.keys(PERIODS).map((k) => (
          <Link key={k} href={q({ p: k })} className={`btn-sm ${p === k ? "border-accent text-accent" : ""}`}>
            {k === "all" ? "Tout" : `${k} j`}
          </Link>
        ))}
        <Link href={q({ a: undefined })} className={`btn-sm ${!accountId ? "border-accent text-accent" : ""}`}>
          Tous comptes
        </Link>
        {accounts.map((a) => (
          <Link key={a.id} href={q({ a: a.id })} className={`btn-sm ${accountId === a.id ? "border-accent text-accent" : ""}`}>
            {a.name}
          </Link>
        ))}
      </div>
      <Section>
        <StatsBlock stats={stats} />
      </Section>
    </>
  );
}
