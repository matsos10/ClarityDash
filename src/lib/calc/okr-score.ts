import { round2 } from "./types";

/** Score 0–1 d'un KR ; fonctionne aussi pour les KR décroissants (ex. dette). */
export function krScore(start: number, target: number, current: number): number {
  if (target === start) return current >= target ? 1 : 0;
  const s = (current - start) / (target - start);
  return round2(Math.min(1, Math.max(0, s)));
}

export function objectiveScore(scores: number[]): number {
  return scores.length ? round2(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
}
