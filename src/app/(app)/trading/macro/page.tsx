import Link from "next/link";
import { ProbabilityGuard } from "@/components/client/probability-guard";
import { Badge, PageHeader, Section } from "@/components/ui";
import { dbDate, formatDayFr, isoFromDb, todayISO } from "@/lib/dates";
import { getCtx } from "@/server/access";
import { saveMacro } from "@/server/actions/trading";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

type News = { event: string; actual?: string | null; forecast?: string | null; previous?: string | null; impact: number };
type Levels = { resistances?: string[]; supports?: string[]; pivot?: string | null };

const DEFAULT_SCENARIOS = [
  { label: "Scénario haussier", probability: 40 },
  { label: "Scénario de range", probability: 35 },
  { label: "Scénario baissier", probability: 25 },
];

export default async function MacroPage({ searchParams }: { searchParams: { d?: string } }) {
  const ctx = await getCtx();
  const today = todayISO();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.d ?? "") ? searchParams.d! : today;
  const [a, history] = await Promise.all([
    db.macroAnalysis.findFirst({ where: { spaceId: ctx.personalSpaceId, date: dbDate(date), instrument: "XAUUSD" }, include: { scenarios: { orderBy: { order: "asc" } } } }),
    db.macroAnalysis.findMany({ where: { spaceId: ctx.personalSpaceId }, orderBy: { date: "desc" }, take: 10 }),
  ]);
  const news = ((a?.newsImpact as News[] | undefined) ?? []).concat(Array(8).fill(null)).slice(0, 8) as (News | null)[];
  const levels = (a?.levels as Levels | undefined) ?? {};
  const scenarios = [0, 1, 2].map((i) => a?.scenarios[i] ?? { ...DEFAULT_SCENARIOS[i], trigger: "", target: "", invalidation: "" });

  return (
    <>
      <PageHeader title="Analyse macro XAUUSD" sub={<span className="capitalize">{formatDayFr(date, { weekday: "long", day: "numeric", month: "long" })}</span>} back="/trading" />
      <p className="mb-3 text-xs text-muted">Top-down : géopolitique → macro US → USD → taux réels → biais or.</p>

      <form action={saveMacro}>
        <input type="hidden" name="date" value={date} />
        <input type="hidden" name="instrument" value="XAUUSD" />

        <Section title="1 · Tableau d'impact des news">
          <div className="space-y-2">
            {news.map((n, i) => (
              <div key={i} className="grid grid-cols-[1fr_4.5rem] gap-1">
                <input name={`news_event_${i}`} className="input min-h-[38px] text-sm" placeholder={i === 0 ? "CPI US, NFP, FOMC, géopolitique…" : "Événement"} defaultValue={n?.event ?? ""} />
                <select name={`news_impact_${i}`} className="input min-h-[38px] px-1 text-sm" defaultValue={String(n?.impact ?? 0)}>
                  {[2, 1, 0, -1, -2].map((v) => (
                    <option key={v} value={v}>
                      {v > 0 ? `+${v}` : v} or
                    </option>
                  ))}
                </select>
                <div className="col-span-2 grid grid-cols-3 gap-1">
                  <input name={`news_actual_${i}`} className="input num min-h-[34px] text-xs" placeholder="Réel" defaultValue={n?.actual ?? ""} />
                  <input name={`news_forecast_${i}`} className="input num min-h-[34px] text-xs" placeholder="Prévu" defaultValue={n?.forecast ?? ""} />
                  <input name={`news_previous_${i}`} className="input num min-h-[34px] text-xs" placeholder="Précédent" defaultValue={n?.previous ?? ""} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="2 · Score global (−10 → +10)">
          <input name="score" type="number" min={-10} max={10} step={1} className="input num text-center text-2xl" defaultValue={a?.score ?? 0} />
        </Section>

        <Section title="3 · Biais et niveaux">
          <div className="space-y-2">
            <select name="bias" className="input" defaultValue={a?.bias ?? "NEUTRAL"}>
              <option value="BULLISH">Haussier</option>
              <option value="NEUTRAL">Neutre</option>
              <option value="BEARISH">Baissier</option>
            </select>
            <input name="resistances" className="input num" placeholder="Résistances (séparées par ;)" defaultValue={levels.resistances?.join("; ") ?? ""} />
            <input name="supports" className="input num" placeholder="Supports (séparés par ;)" defaultValue={levels.supports?.join("; ") ?? ""} />
            <input name="pivot" className="input num" placeholder="Pivot" defaultValue={levels.pivot ?? ""} />
          </div>
        </Section>

        <Section title="4 · Chaîne causale">
          <textarea
            name="causalChain"
            className="input min-h-[110px] py-2"
            required
            placeholder="Géopolitique → macro US → USD (DXY) → taux réels (TIPS 10 ans) → or"
            defaultValue={a?.causalChain ?? ""}
          />
        </Section>

        <Section title="5 · Trois scénarios probabilisés" right={<ProbabilityGuard names={["sc_prob_0", "sc_prob_1", "sc_prob_2"]} />}>
          <div className="space-y-3">
            {scenarios.map((s, i) => (
              <div key={i} className="space-y-1 border-b border-line pb-3 last:border-0">
                <div className="grid grid-cols-[1fr_4.5rem] gap-1">
                  <input name={`sc_label_${i}`} className="input min-h-[38px] text-sm" defaultValue={s.label} />
                  <input name={`sc_prob_${i}`} className="input num min-h-[38px] text-sm" inputMode="numeric" defaultValue={s.probability} />
                </div>
                <input name={`sc_trigger_${i}`} className="input min-h-[34px] text-xs" placeholder="Déclencheur" defaultValue={s.trigger ?? ""} />
                <div className="grid grid-cols-2 gap-1">
                  <input name={`sc_target_${i}`} className="input num min-h-[34px] text-xs" placeholder="Cible" defaultValue={s.target ?? ""} />
                  <input name={`sc_invalid_${i}`} className="input num min-h-[34px] text-xs" placeholder="Invalidation" defaultValue={s.invalidation ?? ""} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="6 · Catalyseur principal">
          <input name="mainCatalyst" className="input" required placeholder="Ex. CPI US 14:30" defaultValue={a?.mainCatalyst ?? ""} />
        </Section>

        <button className="btn mb-3 w-full">Enregistrer l&apos;analyse</button>
      </form>

      <Section title="Historique">
        <ul className="space-y-1">
          {history.map((h) => {
            const d = isoFromDb(h.date);
            return (
              <li key={h.id}>
                <Link href={`/trading/macro?d=${d}`} className="flex items-center gap-2 text-sm">
                  <span className="w-24 capitalize text-muted">{formatDayFr(d)}</span>
                  <Badge tone={h.bias === "BULLISH" ? "good" : h.bias === "BEARISH" ? "bad" : "muted"}>{h.bias}</Badge>
                  <span className="num">{h.score > 0 ? `+${h.score}` : h.score}</span>
                  <span className="flex-1 truncate text-xs text-muted">{h.mainCatalyst}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>
    </>
  );
}
