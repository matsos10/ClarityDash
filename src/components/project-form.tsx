import type { Project } from "@prisma/client";
import { DOMAIN_LABEL, PROJECT_STATUS_LABEL } from "@/lib/labels";
import { isoFromDb } from "@/lib/dates";
import { saveProject } from "@/server/actions/horizons";

export function ProjectForm({
  project,
  links,
  spaces,
}: {
  project?: Project;
  links: { value: string; label: string }[];
  spaces: { id: string; name: string }[];
}) {
  const link = project?.keyResultId ? `k:${project.keyResultId}` : project?.objectiveId ? `o:${project.objectiveId}` : "";
  return (
    <form action={saveProject} className="space-y-2">
      {project && <input type="hidden" name="id" value={project.id} />}
      <input name="title" className="input" placeholder="Titre" defaultValue={project?.title} required />
      <div className="grid grid-cols-2 gap-2">
        <select name="domain" className="input" defaultValue={project?.domain ?? "BUSINESS"}>
          {Object.entries(DOMAIN_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select name="status" className="input" defaultValue={project?.status ?? "ACTIVE"}>
          {Object.entries(PROJECT_STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <select name="link" className="input" defaultValue={link}>
        <option value="">Sert à… (objectif / KR)</option>
        {links.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>
      {!project && (
        <select name="spaceId" className="input">
          {spaces.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      )}
      <input name="blockedReason" className="input" placeholder="Raison du blocage / de l'attente" defaultValue={project?.blockedReason ?? ""} />
      <div>
        <label className="label">Échéance</label>
        <input name="dueDate" type="date" className="input" defaultValue={project?.dueDate ? isoFromDb(project.dueDate) : ""} />
      </div>
      <textarea name="description" className="input min-h-[70px] py-2" placeholder="Description" defaultValue={project?.description ?? ""} />
      <button className="btn w-full">{project ? "Enregistrer" : "Créer"}</button>
    </form>
  );
}
