import Link from "next/link";
import { Badge, Empty, PageHeader, Progress, Section, scoreTone } from "@/components/ui";
import { objectiveScore } from "@/lib/calc/okr-score";
import { diffDaysISO, quarterOf, quarterRange, shiftQuarter, todayISO } from "@/lib/dates";
import { AREA_LABEL } from "@/lib/labels";
import { getCtx, spacesFor } from "@/server/access";
import { addKeyResult, archiveKeyResult, checkinKeyResult, saveObjective } from "@/server/actions/horizons";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

const fmt = (n: unknown) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(Number(n));

export default async function OkrPage({ searchParams }: { searchParams: { q?: string } }) {
  const ctx = await getCtx();
  const today = todayISO();
  const quarter = /^\d{4}-Q[1-4]$/.test(searchParams.q ?? "") ? searchParams.q! : quarterOf(today);
  const spaces = spacesFor(ctx, "HORIZONS");
  const { start, end } = quarterRange(quarter);
  const elapsed = Math.min(1, Math.max(0, (diffDaysISO(today, start) + 1) / (diffDaysISO(end, start) + 1)));

  const [objectives, users] = await Promise.all([
    db.objective.findMany({
      where: { spaceId: { in: spaces.map((s) => s.id) } },
      orderBy: [{ spaceId: "asc" }, { order: "asc" }],
      include: {
        space: { select: { name: true, kind: true } },
        keyResults: {
          where: { quarter },
          orderBy: { createdAt: "asc" },
          include: { owner: { select: { name: true } }, checkins: { orderBy: { weekStart: "desc" }, take: 1 } },
        },
      },
    }),
    db.user.findMany({ where: { memberships: { some: { spaceId: { in: spaces.filter((s) => s.kind !== "PERSONAL").map((s) => s.id) } } } } }),
  ]);
  const staleDays = 14;

  return (
    <>
      <PageHeader
        title={`OKR ${quarter.replace("-", " ")}`}
        sub={`${Math.round(elapsed * 100)} % du trimestre écoulé`}
        right={
          <div className="flex gap-1">
            <Link className="btn-sm" href={`/okr?q=${shiftQuarter(quarter, -1)}`}>
              ←
            </Link>
            <Link className="btn-sm" href={`/okr?q=${shiftQuarter(quarter, 1)}`}>
              →
            </Link>
          </div>
        }
      />
      <Link href={`/okr/review?q=${quarter}`} className="card mb-3 flex items-center justify-between">
        <div>
          <div className="h2 mb-0">Revue trimestrielle</div>
          <div className="text-sm">Rétrospective + nouveaux KR</div>
        </div>
        <span className="text-muted">→</span>
      </Link>

      {objectives.map((o) => {
        const active = o.keyResults.filter((k) => !k.archivedAt);
        const score = objectiveScore(active.map((k) => Number(k.score)));
        const stale = !o.lastActionAt || (Date.now() - o.lastActionAt.getTime()) / 86_400_000 > staleDays;
        return (
          <Section
            key={o.id}
            title={o.title}
            right={
              <div className="flex items-center gap-2">
                {o.space.kind !== "PERSONAL" && <Badge tone="accent">{o.space.name}</Badge>}
                <span className={`num text-sm font-semibold text-${scoreTone(score)}`}>{score.toFixed(2)}</span>
              </div>
            }
          >
            <div className="mb-2 text-xs text-muted">
              {AREA_LABEL[o.area]}
              {stale && <span className="ml-2 text-warn">· aucune action depuis {staleDays} j+</span>}
            </div>
            {active.length === 0 && <Empty>Aucun KR ce trimestre.</Empty>}
            <ul className="space-y-3">
              {o.keyResults.map((k) => {
                const s = Number(k.score);
                return (
                  <li key={k.id} className={k.archivedAt ? "opacity-50" : ""}>
                    <div className="flex items-start justify-between gap-2 text-[15px]">
                      <span>{k.title}</span>
                      <span className={`num shrink-0 text-sm text-${scoreTone(s)}`}>{s.toFixed(2)}</span>
                    </div>
                    <Progress value={s * 100} tone={s >= elapsed ? "good" : s >= elapsed * 0.6 ? "warn" : "bad"} />
                    <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
                      <span className="num">
                        {fmt(k.currentValue)} / {fmt(k.targetValue)} {k.unit ?? ""} (départ {fmt(k.startValue)})
                      </span>
                      <span>{k.owner?.name ?? ""}</span>
                    </div>
                    {!k.archivedAt && (
                      <details className="mt-1">
                        <summary className="cursor-pointer text-xs text-accent">Mise à jour hebdo</summary>
                        <form action={checkinKeyResult} className="mt-2 flex gap-2">
                          <input type="hidden" name="id" value={k.id} />
                          <input name="value" className="input num" inputMode="decimal" defaultValue={fmt(k.currentValue).replace(/\s/g, "")} />
                          <input name="note" className="input" placeholder="Note" />
                          <button className="btn shrink-0">OK</button>
                        </form>
                        <form action={archiveKeyResult} className="mt-1">
                          <input type="hidden" name="id" value={k.id} />
                          <button className="text-xs text-muted">Archiver</button>
                        </form>
                      </details>
                    )}
                  </li>
                );
              })}
            </ul>
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-accent">+ Key result</summary>
              <form action={addKeyResult} className="mt-2 space-y-2">
                <input type="hidden" name="objectiveId" value={o.id} />
                <input type="hidden" name="quarter" value={quarter} />
                <input name="title" className="input" placeholder="Ex. 3 clients PME-IA signés" required />
                <div className="grid grid-cols-3 gap-2">
                  <input name="startValue" className="input num" inputMode="decimal" placeholder="Départ" />
                  <input name="targetValue" className="input num" inputMode="decimal" placeholder="Cible" required />
                  <input name="unit" className="input" placeholder="Unité" />
                </div>
                <select name="ownerId" className="input" defaultValue={ctx.userId}>
                  <option value="">Responsable : commun</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name ?? u.email}
                    </option>
                  ))}
                </select>
                <button className="btn w-full">Ajouter</button>
              </form>
            </details>
          </Section>
        );
      })}

      <details className="card mb-3">
        <summary className="cursor-pointer text-sm text-accent">+ Objectif</summary>
        <form action={saveObjective} className="mt-2 space-y-2">
          <input name="title" className="input" placeholder="Titre" required />
          <select name="area" className="input">
            {Object.entries(AREA_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select name="spaceId" className="input">
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.kind === "PERSONAL" ? "Perso" : s.name}
              </option>
            ))}
          </select>
          <button className="btn w-full">Créer</button>
        </form>
      </details>
    </>
  );
}
