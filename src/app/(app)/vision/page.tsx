import { Badge, PageHeader, Section } from "@/components/ui";
import { diffDaysISO, formatDayFr, isoFromDb, todayISO } from "@/lib/dates";
import { getCtx, spaceIdsFor } from "@/server/access";
import { addMilestone, saveVision, toggleMilestone } from "@/server/actions/horizons";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function VisionPage({ searchParams }: { searchParams: { lang?: string; edit?: string } }) {
  const ctx = await getCtx();
  const vision = await db.vision.findFirst({
    where: { spaceId: { in: spaceIdsFor(ctx, "HORIZONS") } },
    include: { milestones: { orderBy: { dueDate: "asc" }, include: { objective: true } }, objectives: { orderBy: { order: "asc" } } },
  });
  if (!vision) return <PageHeader title="Vision 2029" sub="Aucune vision — lance le seed." />;

  const today = todayISO();
  const target = isoFromDb(vision.targetDate);
  const daysLeft = diffDaysISO(target, today);
  const pt = searchParams.lang === "pt";
  const text = pt ? vision.textPt ?? vision.textFr : vision.textFr;
  const editing = searchParams.edit === "1";
  const first = vision.milestones[0] ? isoFromDb(vision.milestones[0].dueDate) : today;
  const span = Math.max(1, diffDaysISO(target, first < today ? first : today));
  const origin = first < today ? first : today;

  return (
    <>
      <PageHeader title={vision.title} sub={`Échéance ${formatDayFr(target, { day: "numeric", month: "long", year: "numeric" })}`} />

      <div className="card mb-3 text-center">
        <div className="num text-4xl font-semibold">{daysLeft}</div>
        <div className="text-xs text-muted">
          jours · {Math.floor(daysLeft / 7)} semaines · {(daysLeft / 30.44).toFixed(1)} mois
        </div>
      </div>

      <Section
        title="Vision au futur accompli"
        right={
          <div className="flex gap-1 text-xs">
            <a href="/vision" className={`btn-sm ${!pt ? "border-accent text-accent" : ""}`}>
              FR
            </a>
            <a href="/vision?lang=pt" className={`btn-sm ${pt ? "border-accent text-accent" : ""}`}>
              PT
            </a>
            <a href="/vision?edit=1" className="btn-sm">
              ✎
            </a>
          </div>
        }
      >
        {editing ? (
          <form action={saveVision} className="space-y-2">
            <input type="hidden" name="id" value={vision.id} />
            <label className="label">Français</label>
            <textarea name="textFr" className="input min-h-[200px] py-2" defaultValue={vision.textFr} required />
            <label className="label">Português</label>
            <textarea name="textPt" className="input min-h-[160px] py-2" defaultValue={vision.textPt ?? ""} />
            <label className="label">Date cible</label>
            <input type="date" name="targetDate" className="input" defaultValue={target} />
            <button className="btn w-full">Enregistrer</button>
          </form>
        ) : (
          <div className="whitespace-pre-line text-[15px] leading-relaxed">{text}</div>
        )}
      </Section>

      <Section title="Jalons">
        <div className="relative mb-4 mt-2 h-2 rounded-full bg-line">
          <div className="absolute inset-y-0 left-0 rounded-full bg-accent/40" style={{ width: `${(diffDaysISO(today, origin) / span) * 100}%` }} />
          {vision.milestones.map((m) => {
            const pos = Math.min(100, Math.max(0, (diffDaysISO(isoFromDb(m.dueDate), origin) / span) * 100));
            return (
              <span
                key={m.id}
                title={m.title}
                className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card ${m.doneAt ? "bg-good" : "bg-accent"}`}
                style={{ left: `${pos}%` }}
              />
            );
          })}
        </div>
        <ul className="space-y-1">
          {vision.milestones.map((m) => {
            const due = isoFromDb(m.dueDate);
            const late = !m.doneAt && due < today;
            return (
              <li key={m.id}>
                <form action={toggleMilestone} className="flex min-h-[44px] items-center gap-3">
                  <input type="hidden" name="id" value={m.id} />
                  <button className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs ${m.doneAt ? "border-good bg-good text-white" : "border-line"}`}>
                    {m.doneAt && "✓"}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className={`text-[15px] ${m.doneAt ? "text-muted line-through" : ""}`}>{m.title}</div>
                    <div className="text-[11px] text-muted">{m.objective?.title}</div>
                  </div>
                  <span className="num text-xs text-muted">{formatDayFr(due, { month: "short", year: "2-digit" })}</span>
                  {late && <Badge tone="bad">retard</Badge>}
                </form>
              </li>
            );
          })}
        </ul>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-accent">+ Jalon</summary>
          <form action={addMilestone} className="mt-2 space-y-2">
            <input type="hidden" name="visionId" value={vision.id} />
            <input name="title" className="input" placeholder="Ex. Permis LSF obtenu" required />
            <div className="grid grid-cols-2 gap-2">
              <input name="dueDate" type="date" className="input" required />
              <select name="objectiveId" className="input">
                <option value="">Objectif</option>
                {vision.objectives.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn w-full">Ajouter</button>
          </form>
        </details>
      </Section>
    </>
  );
}
