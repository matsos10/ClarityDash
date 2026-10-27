import { round2 } from "./types";

export type DrawdownKind = "TRAILING_EOD" | "TRAILING_INTRADAY" | "STATIC";

export type MllInput = {
  startingBalance: number;
  maxLossLimit: number | null;
  drawdownType: DrawdownKind;
  /** Solde auquel le MLL arrête de suivre (ex. solde de départ chez Topstep) */
  mllLockBalance: number | null;
  dailyLossLimit?: number | null;
  /** Événements chronologiques : trades (pnl) et payouts (amount > 0, retiré du solde) */
  events: { day: string; at: Date; kind: "trade" | "payout"; amount: number }[];
  /** Journée de trading en cours : non clôturée, ne fait pas monter le plus haut EOD */
  currentDay: string;
};

export type MllState = {
  balance: number;
  highWaterMark: number;
  mllLevel: number | null;
  distance: number | null;
  distancePct: number | null;
  breached: boolean;
  locked: boolean;
  todayPnl: number;
  dailyLossRemaining: number | null;
};

export function mllState(input: MllInput): MllState {
  const events = [...input.events].sort((a, b) => a.at.getTime() - b.at.getTime());
  let balance = input.startingBalance;
  let hwm = input.startingBalance;
  let todayPnl = 0;
  let prevDay: string | null = null;

  for (const e of events) {
    // clôture EOD de la journée précédente
    if (input.drawdownType === "TRAILING_EOD" && prevDay !== null && e.day !== prevDay && prevDay < input.currentDay) {
      hwm = Math.max(hwm, balance);
    }
    prevDay = e.day;
    if (e.kind === "trade") {
      balance += e.amount;
      if (e.day === input.currentDay) todayPnl += e.amount;
      if (input.drawdownType === "TRAILING_INTRADAY") hwm = Math.max(hwm, balance);
    } else {
      balance -= e.amount;
    }
  }
  if (input.drawdownType === "TRAILING_EOD" && prevDay !== null && prevDay < input.currentDay) {
    hwm = Math.max(hwm, balance);
  }

  let mllLevel: number | null = null;
  let locked = false;
  if (input.maxLossLimit != null) {
    if (input.drawdownType === "STATIC") {
      mllLevel = input.startingBalance - input.maxLossLimit;
    } else {
      mllLevel = hwm - input.maxLossLimit;
      if (input.mllLockBalance != null && mllLevel >= input.mllLockBalance) {
        mllLevel = input.mllLockBalance;
        locked = true;
      }
    }
  }
  const distance = mllLevel == null ? null : round2(balance - mllLevel);
  return {
    balance: round2(balance),
    highWaterMark: round2(hwm),
    mllLevel: mllLevel == null ? null : round2(mllLevel),
    distance,
    distancePct: distance == null || !input.maxLossLimit ? null : round2((distance / input.maxLossLimit) * 100),
    breached: distance != null && distance <= 0,
    locked,
    todayPnl: round2(todayPnl),
    dailyLossRemaining: input.dailyLossLimit ? round2(input.dailyLossLimit + Math.min(0, todayPnl)) : null,
  };
}
