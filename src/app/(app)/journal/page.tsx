import { JournalForm } from "@/components/client/journal-form";
import { PageHeader, Section } from "@/components/ui";
import { addDaysISO, dbDate, formatDayFr, isoFromDb, todayISO } from "@/lib/dates";
import { getCtx } from "@/server/access";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function JournalPage({ searchParams }: { searchParams: { d?: string } }) {
  const ctx = await getCtx();
  const today = todayISO();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.d ?? "") && searchParams.d! <= today ? searchParams.d! : today;
  const [entry, history] = await Promise.all([
    db.journalEntry.findUnique({ where: { userId_date: { userId: ctx.userId, date: dbDate(date) } } }),
    db.journalEntry.findMany({ where: { userId: ctx.userId, date: { gte: dbDate(addDaysISO(today, -30)) } }, orderBy: { date: "desc" } }),
  ]);

  return (
    <>
      <PageHeader title="Revue du soir" sub={<span className="capitalize">{formatDayFr(date, { weekday: "long", day: "numeric", month: "long" })}</span>} />
      <Section>
        <JournalForm
          key={date}
          date={date}
          initial={{ done: entry?.done ?? "", blocked: entry?.blocked ?? "", tomorrow: entry?.tomorrow ?? "", mood: entry?.mood ?? null, energy: entry?.energy ?? null }}
        />
      </Section>
      <Section title="Journal · 30 jours">
        <ul className="space-y-3">
          {history.map((h) => {
            const d = isoFromDb(h.date);
            return (
              <li key={h.id}>
                <a href={`/journal?d=${d}`} className="block">
                  <div className="flex justify-between text-xs text-muted">
                    <span className="capitalize">{formatDayFr(d)}</span>
                    <span className="num">
                      {h.mood ? `humeur ${h.mood}` : ""} {h.energy ? `· énergie ${h.energy}` : ""}
                    </span>
                  </div>
                  {h.done && <p className="line-clamp-2 text-sm">✓ {h.done}</p>}
                  {h.blocked && <p className="line-clamp-1 text-sm text-warn">⛔ {h.blocked}</p>}
                </a>
              </li>
            );
          })}
        </ul>
      </Section>
    </>
  );
}
