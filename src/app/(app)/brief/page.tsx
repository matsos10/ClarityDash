import Link from "next/link";
import { Badge, Empty, PageHeader, Section } from "@/components/ui";
import { formatDayFr, timeInTz, todayISO } from "@/lib/dates";
import { signed } from "@/lib/labels";
import { getCtx } from "@/server/access";
import { acceptBriefPriorities, regenerateBrief } from "@/server/actions/brief";
import { getBrief } from "@/server/brief";

export const dynamic = "force-dynamic";

export default async function BriefPage() {
  const ctx = await getCtx();
  const today = todayISO();
  const { row, content: b } = await getBrief(ctx, today);

  return (
    <>
      <PageHeader
        title="Brief du matin"
        sub={<span className="capitalize">{formatDayFr(today, { weekday: "long", day: "numeric", month: "long" })}</span>}
        right={
          <form action={regenerateBrief}>
            <button className="btn-sm">↻ Actualiser</button>
          </form>
        }
      />
      <p className="mb-3 text-[11px] text-muted">
        Généré à <span className="num">{timeInTz(row.updatedAt ?? row.date)}</span>
        {row.sentAt ? " · envoyé (push / Telegram)" : ""}
      </p>

      {b.vision && (
        <Section title={`${b.vision.title} · J-${b.vision.daysLeft}`}>
          <p className="whitespace-pre-line text-[15px] italic leading-relaxed">{b.vision.text}</p>
        </Section>
      )}

      <Section title="Priorités">
        {b.chosen.length > 0 && (
          <ol className="mb-2 space-y-1">
            {b.chosen.map((t, i) => (
              <li key={t.id} className="text-[15px]">
                <span className="num text-muted">{i + 1}.</span> {t.title}
                {t.objective && <span className="text-xs text-muted"> → {t.objective}</span>}
              </li>
            ))}
          </ol>
        )}
        {b.proposed.length > 0 ? (
          <>
            <div className="h2">{b.chosen.length ? "Proposées en plus" : "Proposées"}</div>
            <ol className="space-y-2">
              {b.proposed.map((p, i) => (
                <li key={p.id}>
                  <div className="text-[15px]">
                    <span className="num text-muted">{b.chosen.length + i + 1}.</span> {p.title}
                  </div>
                  <div className="text-xs text-muted">{p.reasons.join(" · ") || "backlog"}</div>
                </li>
              ))}
            </ol>
            <form action={acceptBriefPriorities} className="mt-3">
              <button className="btn w-full">Prendre ces priorités</button>
            </form>
          </>
        ) : (
          !b.chosen.length && <Empty>Backlog vide.</Empty>
        )}
      </Section>

      <Section title="Agenda">
        {!b.agenda.connected ? (
          <Link href="/settings" className="text-sm text-accent">
            Connecter Google Agenda →
          </Link>
        ) : b.agenda.events.length ? (
          <ul className="space-y-1 text-[15px]">
            {b.agenda.events.map((e, i) => (
              <li key={i} className="flex gap-2">
                <span className="num w-[5.5rem] shrink-0 text-xs text-muted">{e.time ? `${e.time}–${e.end}` : "journée"}</span>
                {e.title}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Rien de prévu.</Empty>
        )}
      </Section>

      {b.deadlines.length > 0 && (
        <Section title="Échéances">
          <ul className="space-y-1 text-sm">
            {b.deadlines.map((d, i) => (
              <li key={i} className="flex gap-2">
                <span className="w-20 shrink-0 capitalize text-muted">{formatDayFr(d.date)}</span>
                <span className="flex-1">{d.label}</span>
                <Badge>{d.kind}</Badge>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {b.trading && (
        <Section title="Trading">
          <div className="flex gap-2 text-sm">
            <Badge tone={b.trading.macroDone ? "good" : "warn"}>{b.trading.macroDone ? "macro faite" : "macro à faire"}</Badge>
            <Badge tone={b.trading.sessionOpen ? "good" : "warn"}>{b.trading.sessionOpen ? "check-list OK" : "check-list à faire"}</Badge>
          </div>
          {b.trading.yesterdayPnl != null && (
            <p className="mt-2 text-sm">
              Hier : <span className={`num ${b.trading.yesterdayPnl >= 0 ? "text-good" : "text-bad"}`}>{signed(b.trading.yesterdayPnl)}</span>
            </p>
          )}
          <ul className="mt-2 space-y-1 text-sm">
            {b.trading.accounts.map((a) => (
              <li key={a.name} className="flex justify-between gap-2">
                <span className="truncate">{a.name}</span>
                <span className={`num ${a.distancePct != null && a.distancePct < 25 ? "text-bad" : "text-muted"}`}>
                  MLL {a.distance == null ? "—" : signed(a.distance).replace("+", "")}
                  {a.payoutEligible && " · payout ✓"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">Règle : stop après 2 pertes.</p>
        </Section>
      )}

      {b.staleObjectives.length > 0 && (
        <Section title="Objectifs sans action depuis 14 j">
          <ul className="space-y-1 text-sm text-warn">
            {b.staleObjectives.map((o) => (
              <li key={o.title}>
                {o.title} {o.days != null && <span className="num">({o.days} j)</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {b.outcomes.length > 0 && (
        <Section title="Résultats de la semaine">
          <ul className="space-y-1 text-sm">
            {b.outcomes.map((o) => (
              <li key={o}>• {o}</li>
            ))}
          </ul>
        </Section>
      )}

      <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
        <Link href="/today" className="btn-ghost">
          Routine : {b.routine.length} à faire
        </Link>
        <Link href="/inbox" className="btn-ghost">
          Inbox : {b.inbox}
        </Link>
      </div>
    </>
  );
}
