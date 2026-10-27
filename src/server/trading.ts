import type { Payout, PropFirm, Trade, TradingAccount, ScalingTier } from "@prisma/client";
import { consistency } from "@/lib/calc/consistency";
import { dailyPnl } from "@/lib/calc/daily";
import { mllState } from "@/lib/calc/mll";
import { payoutCycle, payoutStatus, type PayoutLite } from "@/lib/calc/payout";
import { scalingState } from "@/lib/calc/scaling";
import { lossCount } from "@/lib/calc/session-lock";
import { APP_TZ, isoDateInTz, tradingDayOf } from "@/lib/dates";
import { db } from "./db";

export const MAX_LOSSES = 2;

/** Valeur d'un point de prix par contrat / lot (USD). */
export const POINT_VALUE: Record<string, number> = { MGC: 10, GC: 100, XAUUSD: 100, OTHER: 1 };

/**
 * Journée de trading selon la firme : CME (Topstep) bascule à 17:00 Chicago ;
 * sinon journée calendaire de Lisbonne.
 */
export function dayRule(firm: PropFirm): { tz: string; rollover: number } {
  return firm === "TOPSTEP" ? { tz: "America/Chicago", rollover: 17 } : { tz: APP_TZ, rollover: 0 };
}

export function accountDayOf(firm: PropFirm) {
  const r = dayRule(firm);
  return (d: Date) => tradingDayOf(d, r.tz, r.rollover);
}

const n = (x: unknown) => (x == null ? null : Number(x));

export type AccountFull = TradingAccount & { trades: Trade[]; payouts: Payout[]; scalingTiers: ScalingTier[] };

/** Tous les calculs d'un compte : MLL, consistance, payout, cycle, scaling. */
export function accountSnapshot(a: AccountFull, now = new Date()) {
  const dayOf = accountDayOf(a.firm);
  const currentDay = dayOf(now);
  const trades = a.trades.filter((t) => !t.deletedAt);
  const days = dailyPnl(trades.map((t) => ({ pnl: Number(t.pnl), entryAt: t.entryAt })), dayOf);
  const payoutsLite: PayoutLite[] = a.payouts.map((p) => ({
    day: dayOf(p.paidAt ?? p.requestedAt ?? now),
    amount: Number(p.amount),
    status: p.status,
  }));

  const mll = mllState({
    startingBalance: Number(a.startingBalance),
    maxLossLimit: n(a.maxLossLimit),
    drawdownType: a.drawdownType,
    mllLockBalance: n(a.mllLockBalance),
    dailyLossLimit: n(a.dailyLossLimit),
    currentDay,
    events: [
      ...trades.map((t) => ({ day: dayOf(t.entryAt), at: t.exitAt ?? t.entryAt, kind: "trade" as const, amount: Number(t.pnl) })),
      ...a.payouts
        .filter((p) => p.status === "PAID" && p.paidAt)
        .map((p) => ({ day: dayOf(p.paidAt!), at: p.paidAt!, kind: "payout" as const, amount: Number(p.amount) })),
    ],
  });

  const payout = payoutStatus(
    days,
    payoutsLite,
    { minDays: a.payoutMinDays, minDayProfit: n(a.payoutMinDayProfit), consistencyPct: a.consistencyPct },
    currentDay,
  );

  return {
    currentDay,
    days,
    mll,
    consistency: a.consistencyPct ? consistency(payout.periodStart ? days.filter((d) => d.day > payout.periodStart!) : days, a.consistencyPct) : null,
    payout,
    cycle: payoutCycle(payoutsLite),
    scaling: a.isPersonalFund && a.scalingTiers.length
      ? scalingState(
          mll.balance,
          a.scalingTiers.map((t) => ({ order: t.order, label: t.label, capitalMin: Number(t.capitalMin), lotSize: Number(t.lotSize) })),
        )
      : null,
  };
}

export type AccountSnapshot = ReturnType<typeof accountSnapshot>;

/** Met à jour le solde / plus haut en cache sur le compte. */
export async function refreshAccountCache(accountId: string) {
  const a = await db.tradingAccount.findUniqueOrThrow({ where: { id: accountId }, include: { trades: true, payouts: true, scalingTiers: true } });
  const s = accountSnapshot(a);
  await db.tradingAccount.update({
    where: { id: accountId },
    data: { balance: s.mll.balance, highWaterMark: s.mll.highWaterMark, status: s.mll.breached && a.status === "ACTIVE" ? "BREACHED" : a.status },
  });
}

/** Recalcule les pertes de la session et pose le verrou à la 2e perte. */
export async function refreshSessionLock(sessionId: string) {
  const s = await db.tradingSession.findUniqueOrThrow({ where: { id: sessionId }, include: { trades: { where: { deletedAt: null } } } });
  const losses = lossCount(s.trades.map((t) => ({ id: t.id, pnl: Number(t.pnl), copyGroupId: t.copyGroupId })));
  await db.tradingSession.update({
    where: { id: s.id },
    data: {
      lossesCount: losses,
      ...(losses >= MAX_LOSSES && !s.lockedAt ? { lockedAt: new Date(), lockReason: `${losses} pertes` } : {}),
    },
  });
}

export function sessionDay(now = new Date()) {
  return isoDateInTz(now);
}
