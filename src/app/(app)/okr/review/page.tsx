import { PageHeader, Section, scoreTone } from "@/components/ui";
import { objectiveScore } from "@/lib/calc/okr-score";
import { quarterOf, shiftQuarter, todayISO } from "@/lib/dates";
import { defaultSpaceId, getCtx, spaceIdsFor } from "@/server/access";
import { saveQuarterlyReview } from "@/server/actions/horizons";
import { db } from "@/server/db";

export default async function QuarterReviewPage({ searchParams }: { searchParams: { q?: string } }) {
  const ctx = await getCtx();
  const quarter = /^\d{4}-Q[1-4]$/.test(searchParams.q ?? "") ? searchParams.q! : quarterOf(todayISO());
  const spaceId = defaultSpaceId(ctx, "HORIZONS", "COUPLE");
  const [objectives, review] = await Promise.all([
    db.objective.findMany({
      where: { spaceId: { in: spaceIdsFor(ctx, "HORIZONS") } },
      orderBy: { order: "asc" },
      include: { keyResults: { where: { quarter, archivedAt: null } } },
    }),
    db.quarterlyReview.findUnique({ where: { spaceId_quarter: { spaceId, quarter } } }),
  ]);
  const all = objectives.flatMap((o) => o.keyResults.map((k) => Number(k.score)));
  const global = objectiveScore(all);

  return (
    <>
      <PageHeader title={`Revue ${quarter.replace("-", " ")}`} back={`/okr?q=${quarter}`} />
      <Section title="Scores finaux" right={<span className={`num font-semibold text-${scoreTone(global)}`}>{global.toFixed(2)}</span>}>
        <ul className="space-y-2 text-sm">
          {objectives.map((o) => {
            const s = objectiveScore(o.keyResults.map((k) => Number(k.score)));
            return (
              <li key={o.id}>
                <div className="flex justify-between font-medium">
                  <span>{o.title}</span>
                  <span className={`num text-${scoreTone(s)}`}>{o.keyResults.length ? s.toFixed(2) : "—"}</span>
                </div>
                {o.keyResults.map((k) => (
                  <div key={k.id} className="flex justify-between pl-3 text-xs text-muted">
                    <span>{k.title}</span>
                    <span className="num">{Number(k.score).toFixed(2)}</span>
                  </div>
                ))}
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-muted">Repère : 0,7 = trimestre réussi ; 1,0 systématique = KR trop faciles.</p>
      </Section>
      <form action={saveQuarterlyReview}>
        <input type="hidden" name="spaceId" value={spaceId} />
        <input type="hidden" name="quarter" value={quarter} />
        <input type="hidden" name="next" value={shiftQuarter(quarter, 1)} />
        <Section title="Rétrospective">
          <label className="label">Ce qui a marché</label>
          <textarea name="wentWell" className="input mb-2 min-h-[80px] py-2" defaultValue={review?.wentWell ?? ""} />
          <label className="label">Ce qui n&apos;a pas marché</label>
          <textarea name="wentBadly" className="input mb-2 min-h-[80px] py-2" defaultValue={review?.wentBadly ?? ""} />
          <label className="label">Leçons pour le trimestre suivant</label>
          <textarea name="lessons" className="input min-h-[80px] py-2" defaultValue={review?.lessons ?? ""} />
        </Section>
        <button className="btn mb-3 w-full">Valider et définir les KR de {shiftQuarter(quarter, 1).replace("-", " ")}</button>
      </form>
    </>
  );
}
