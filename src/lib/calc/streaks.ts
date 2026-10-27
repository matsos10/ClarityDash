import { addDaysISO, isoWeekday } from "../dates";

/**
 * Séries d'une habitude planifiée certains jours de la semaine.
 * Aujourd'hui non coché ne casse pas la série (la journée n'est pas finie).
 */
export function routineStreak(daysOfWeek: number[], checked: Set<string>, today: string) {
  const scheduled = (d: string) => daysOfWeek.length === 0 || daysOfWeek.includes(isoWeekday(d));

  let current = 0;
  let d = today;
  for (let i = 0; i < 730; i++, d = addDaysISO(d, -1)) {
    if (!scheduled(d)) continue;
    if (checked.has(d)) current++;
    else if (d !== today) break;
  }

  let best = 0;
  let run = 0;
  const first = [...checked].sort()[0];
  if (first) {
    for (let x = first; x <= today; x = addDaysISO(x, 1)) {
      if (!scheduled(x)) continue;
      if (checked.has(x)) best = Math.max(best, ++run);
      else if (x !== today) run = 0;
    }
  }
  return { current, best: Math.max(best, current) };
}
