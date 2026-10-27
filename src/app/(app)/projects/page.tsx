import Link from "next/link";
import type { ProjectStatus } from "@prisma/client";
import { Badge, DomainDot, Empty, PageHeader, Section } from "@/components/ui";
import { PROJECT_STATUS_LABEL } from "@/lib/labels";
import { getCtx, spaceIdsFor } from "@/server/access";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

const ORDER: ProjectStatus[] = ["BLOCKED", "ACTIVE", "WAITING", "DONE"];

export default async function ProjectsPage() {
  const ctx = await getCtx();
  const projects = await db.project.findMany({
    where: { spaceId: { in: spaceIdsFor(ctx, "HORIZONS") }, deletedAt: null, status: { not: "ARCHIVED" } },
    include: { nextActionTask: true, objective: true, keyResult: { include: { objective: true } } },
    orderBy: { updatedAt: "desc" },
  });
  const active = projects.filter((p) => p.status === "ACTIVE").length;

  return (
    <>
      <PageHeader
        title="Projets"
        sub={`${active} actifs`}
        right={
          <Link href="/projects/new" className="btn-sm">
            + Projet
          </Link>
        }
      />
      {active > 7 && <p className="card mb-3 border-warn text-sm text-warn">Surcharge : {active} projets actifs. Passe-en en attente pour te concentrer.</p>}
      {ORDER.map((status) => {
        const list = projects.filter((p) => p.status === status);
        if (!list.length) return null;
        return (
          <Section key={status} title={`${PROJECT_STATUS_LABEL[status]} · ${list.length}`}>
            <ul>
              {list.map((p) => {
                const objective = p.objective?.title ?? p.keyResult?.objective.title;
                const missing = !p.nextActionTask && status !== "DONE";
                return (
                  <li key={p.id} className="border-b border-line py-2 last:border-0">
                    <Link href={`/projects/${p.id}`} className="block">
                      <div className="flex items-center gap-2">
                        <DomainDot domain={p.domain} />
                        <span className="flex-1 truncate text-[15px]">{p.title}</span>
                        {missing && <Badge tone="bad">sans action</Badge>}
                      </div>
                      <div className="ml-4 truncate text-xs text-muted">
                        {p.nextActionTask ? `→ ${p.nextActionTask.title}` : status === "BLOCKED" && p.blockedReason ? `⛔ ${p.blockedReason}` : ""}
                        {objective && <span> · {objective}</span>}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Section>
        );
      })}
      {projects.length === 0 && <Empty>Aucun projet.</Empty>}
    </>
  );
}
