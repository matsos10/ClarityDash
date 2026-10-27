import { round2 } from "./types";

export type Tier = { order: number; label: string; capitalMin: number; lotSize: number };

export function scalingState(balance: number, tiers: Tier[]) {
  const sorted = [...tiers].sort((a, b) => a.capitalMin - b.capitalMin);
  const current = [...sorted].reverse().find((t) => balance >= t.capitalMin) ?? null;
  const next = sorted.find((t) => t.capitalMin > balance) ?? null;
  const from = current?.capitalMin ?? 0;
  const progressPct = next ? round2(Math.min(100, ((balance - from) / (next.capitalMin - from)) * 100)) : 100;
  return { current, next, missing: next ? round2(next.capitalMin - balance) : 0, progressPct };
}
