import { notFound } from "next/navigation";
import { PageHeader, Section } from "@/components/ui";
import { isoFromDb, quarterOf, timeInTz, todayISO } from "@/lib/dates";
import { DOMAIN_LABEL } from "@/lib/labels";
import { getCtx, spaceIdsFor } from "@/server/access";
import { deleteTask, saveTask } from "@/server/actions/horizons";
import { db } from "@/server/db";
import { linkOptions } from "@/server/horizons";

export default async function TaskPage({ params, searchParams }: { params: { id: string }; searchParams: { back?: string } }) {
  const ctx = await getCtx();
  const task = await db.task.findFirst({ where: { id: params.id, spaceId: { in: spaceIdsFor(ctx, "HORIZONS") }, deletedAt: null } });
  if (!task) notFound();
  const links = await linkOptions(ctx, quarterOf(todayISO()));
  const link = task.projectId ? `p:${task.projectId}` : task.keyResultId ? `k:${task.keyResultId}` : task.objectiveId ? `o:${task.objectiveId}` : "";
  const back = searchParams.back?.startsWith("/") ? searchParams.back : "/today";

  return (
    <>
      <PageHeader title="Tâche" back={back} />
      <Section>
        <form action={saveTask} className="space-y-3">
          <input type="hidden" name="id" value={task.id} />
          <input type="hidden" name="back" value={back} />
          <div>
            <label className="label">Titre</label>
            <input className="input" name="title" defaultValue={task.title} required />
          </div>
          <div>
            <label className="label">Sert à (projet / KR / objectif)</label>
            <select className="input" name="link" defaultValue={link}>
              <option value="">— Orpheline —</option>
              {links.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Domaine</label>
              <select className="input" name="domain" defaultValue={task.domain}>
                {Object.entries(DOMAIN_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Estimation (min)</label>
              <input className="input num" name="estimateMin" inputMode="numeric" defaultValue={task.estimateMin ?? ""} />
            </div>
            <div>
              <label className="label">Jour prévu</label>
              <input className="input" type="date" name="plannedDate" defaultValue={task.plannedDate ? isoFromDb(task.plannedDate) : ""} />
            </div>
            <div>
              <label className="label">Échéance</label>
              <input className="input" type="date" name="dueDate" defaultValue={task.dueDate ? isoFromDb(task.dueDate) : ""} />
            </div>
            <div>
              <label className="label">Bloc début</label>
              <input className="input" type="time" name="timeboxStart" defaultValue={task.timeboxStart ? timeInTz(task.timeboxStart) : ""} />
            </div>
            <div>
              <label className="label">Bloc fin</label>
              <input className="input" type="time" name="timeboxEnd" defaultValue={task.timeboxEnd ? timeInTz(task.timeboxEnd) : ""} />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input min-h-[80px] py-2" name="notes" defaultValue={task.notes ?? ""} />
          </div>
          <button className="btn w-full">Enregistrer</button>
        </form>
      </Section>
      <form action={deleteTask}>
        <input type="hidden" name="id" value={task.id} />
        <input type="hidden" name="back" value={back} />
        <button className="btn-ghost w-full text-bad">Supprimer</button>
      </form>
    </>
  );
}
