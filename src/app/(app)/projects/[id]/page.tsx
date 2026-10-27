import { notFound } from "next/navigation";
import { Badge, Empty, PageHeader, Section } from "@/components/ui";
import { ProjectForm } from "@/components/project-form";
import { TaskRow } from "@/components/client/task-row";
import { QuickTask } from "@/components/client/quick-task";
import { quarterOf, todayISO } from "@/lib/dates";
import { PROJECT_STATUS_LABEL } from "@/lib/labels";
import { getCtx, spaceIdsFor } from "@/server/access";
import { setNextAction } from "@/server/actions/horizons";
import { db } from "@/server/db";
import { linkOptions, spaceOptions } from "@/server/horizons";
import { taskInclude, toTaskView } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const ctx = await getCtx();
  const project = await db.project.findFirst({
    where: { id: params.id, spaceId: { in: spaceIdsFor(ctx, "HORIZONS") }, deletedAt: null },
    include: { nextActionTask: true },
  });
  if (!project) notFound();
  const today = todayISO();
  const [tasks, links] = await Promise.all([
    db.task.findMany({ where: { projectId: project.id, deletedAt: null }, include: taskInclude, orderBy: [{ status: "asc" }, { createdAt: "desc" }] }),
    linkOptions(ctx, quarterOf(today)),
  ]);
  const open = tasks.filter((t) => t.status !== "DONE" && t.status !== "CANCELLED");
  const done = tasks.filter((t) => t.status === "DONE");
  const nextDone = project.nextActionTask?.status === "DONE";

  return (
    <>
      <PageHeader title={project.title} sub={<Badge>{PROJECT_STATUS_LABEL[project.status]}</Badge>} back="/projects" />

      <Section title="Prochaine action" className={!project.nextActionTask || nextDone ? "border-bad" : ""}>
        {project.nextActionTask && !nextDone ? (
          <p className="mb-2 text-[15px]">→ {project.nextActionTask.title}</p>
        ) : (
          <p className="mb-2 text-sm text-bad">{nextDone ? "Action faite — définis la suivante." : "Obligatoire : définis la prochaine action."}</p>
        )}
        <form action={setNextAction} className="space-y-2">
          <input type="hidden" name="projectId" value={project.id} />
          {open.length > 0 && (
            <select name="taskId" className="input" defaultValue="">
              <option value="">Choisir une tâche existante…</option>
              {open.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-2">
            <input name="title" className="input" placeholder="…ou nouvelle action" />
            <button className="btn shrink-0">OK</button>
          </div>
        </form>
      </Section>

      <Section title={`Tâches · ${open.length}`}>
        {open.length ? (
          <ul>
            {open.map((t) => (
              <TaskRow key={t.id} task={toTaskView(t)} mode={t.status === "TODAY" ? "today" : t.status === "WEEK" ? "week" : "backlog"} date={today} />
            ))}
          </ul>
        ) : (
          <Empty>Aucune tâche ouverte.</Empty>
        )}
        <div className="mt-3">
          <QuickTask
            date={today}
            status="BACKLOG"
            links={links.filter((l) => l.value === `p:${project.id}`)}
            spaces={spaceOptions(ctx).filter((s) => s.id === project.spaceId)}
            defaultSpaceId={project.spaceId}
            defaultLink={`p:${project.id}`}
          />
        </div>
        {done.length > 0 && <p className="mt-2 text-xs text-muted">{done.length} tâche(s) terminée(s)</p>}
      </Section>

      <details className="card mb-3">
        <summary className="cursor-pointer text-sm text-accent">Modifier le projet</summary>
        <div className="mt-3">
          <ProjectForm project={project} links={links.filter((l) => !l.value.startsWith("p:"))} spaces={spaceOptions(ctx)} />
        </div>
      </details>
    </>
  );
}
