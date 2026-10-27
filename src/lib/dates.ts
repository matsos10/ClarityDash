// Dates "jour" manipulées en chaînes ISO (YYYY-MM-DD) dans le fuseau de l'app,
// stockées en base comme minuit UTC (@db.Date).

export const APP_TZ = process.env.TZ_APP || "Europe/Lisbon";

const fmtCache = new Map<string, Intl.DateTimeFormat>();

function parts(d: Date, tz: string) {
  let fmt = fmtCache.get(tz);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    fmtCache.set(tz, fmt);
  }
  const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour), minute: Number(p.minute) };
}

export function isoDateInTz(d: Date, tz = APP_TZ): string {
  return parts(d, tz).date;
}

export function hourInTz(d: Date, tz = APP_TZ): number {
  return parts(d, tz).hour;
}

export function todayISO(tz = APP_TZ): string {
  return isoDateInTz(new Date(), tz);
}

export function dbDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

export function isoFromDb(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, n: number): string {
  const d = dbDate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return isoFromDb(d);
}

export function diffDaysISO(a: string, b: string): number {
  return Math.round((dbDate(a).getTime() - dbDate(b).getTime()) / 86_400_000);
}

/** 1 = lundi … 7 = dimanche */
export function isoWeekday(iso: string): number {
  const wd = dbDate(iso).getUTCDay();
  return wd === 0 ? 7 : wd;
}

export function weekStartISO(iso: string): string {
  return addDaysISO(iso, 1 - isoWeekday(iso));
}

export function weekDaysISO(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i));
}

export function quarterOf(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return `${y}-Q${Math.floor((m - 1) / 3) + 1}`;
}

export function quarterRange(q: string): { start: string; end: string } {
  const [y, qq] = q.split("-Q").map(Number);
  const startMonth = (qq - 1) * 3 + 1;
  const start = `${y}-${String(startMonth).padStart(2, "0")}-01`;
  const next = qq === 4 ? `${y + 1}-01-01` : `${y}-${String(startMonth + 3).padStart(2, "0")}-01`;
  return { start, end: addDaysISO(next, -1) };
}

export function shiftQuarter(q: string, n: number): string {
  const [y, qq] = q.split("-Q").map(Number);
  const idx = y * 4 + (qq - 1) + n;
  return `${Math.floor(idx / 4)}-Q${(idx % 4) + 1}`;
}

/**
 * Journée de trading : à partir de `rolloverHour` (heure locale de `tz`), une
 * exécution compte pour le jour suivant (ex. CME : 17:00 America/Chicago).
 */
export function tradingDayOf(d: Date, tz: string, rolloverHour: number): string {
  const p = parts(d, tz);
  return rolloverHour > 0 && p.hour >= rolloverHour ? addDaysISO(p.date, 1) : p.date;
}

export function formatDayFr(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) {
  return new Intl.DateTimeFormat("fr-FR", { ...opts, timeZone: "UTC" }).format(dbDate(iso));
}

/** "YYYY-MM-DD" + "HH:MM" en heure locale de `tz` → instant UTC. */
export function zonedTimeToUtc(iso: string, hhmm: string, tz = APP_TZ): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const guess = new Date(`${iso}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00.000Z`);
  const p = parts(guess, tz);
  const asLocal = Date.UTC(+p.date.slice(0, 4), +p.date.slice(5, 7) - 1, +p.date.slice(8, 10), p.hour, p.minute);
  return new Date(guess.getTime() - (asLocal - guess.getTime()));
}

export function timeInTz(d: Date, tz = APP_TZ): string {
  const p = parts(d, tz);
  return `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}
