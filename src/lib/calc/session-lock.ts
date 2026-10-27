import type { TradeLite } from "./types";

/**
 * Nombre de pertes de la journée. Un trade répliqué sur plusieurs comptes
 * (même copyGroupId) compte pour une seule perte.
 */
export function lossCount(trades: Pick<TradeLite, "id" | "pnl" | "copyGroupId">[]): number {
  const groups = new Map<string, number>();
  for (const t of trades) {
    const key = t.copyGroupId || t.id;
    groups.set(key, (groups.get(key) ?? 0) + t.pnl);
  }
  return [...groups.values()].filter((p) => p < 0).length;
}

export function sessionLock(trades: Pick<TradeLite, "id" | "pnl" | "copyGroupId">[], maxLosses = 2) {
  const losses = lossCount(trades);
  return { losses, locked: losses >= maxLosses, remaining: Math.max(0, maxLosses - losses) };
}
