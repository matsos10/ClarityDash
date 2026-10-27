export const DOMAINS = ["BUSINESS", "TRADING", "HOME", "FAMILY", "PERSONAL"] as const;
export type DomainKey = (typeof DOMAINS)[number];

const DEFAULT_MIN = 30;

/** Charge (minutes) par jour et par domaine pour une semaine. */
export function domainLoad(tasks: { domain: DomainKey; day: string | null; estimateMin: number | null }[], days: string[]) {
  const grid = Object.fromEntries(days.map((d) => [d, Object.fromEntries(DOMAINS.map((k) => [k, 0]))])) as Record<
    string,
    Record<DomainKey, number>
  >;
  const totals = Object.fromEntries(DOMAINS.map((k) => [k, 0])) as Record<DomainKey, number>;
  for (const t of tasks) {
    if (!t.day || !grid[t.day]) continue;
    const m = t.estimateMin ?? DEFAULT_MIN;
    grid[t.day][t.domain] += m;
    totals[t.domain] += m;
  }
  return { grid, totals };
}
