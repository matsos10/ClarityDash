"use client";

import { useState } from "react";
import { newId } from "@/lib/offline/queue";
import { DOMAIN_LABEL } from "@/lib/labels";
import { useMutation } from "./use-mutation";

export type LinkOption = { value: string; label: string; domain?: string };
export type SpaceOption = { id: string; name: string };

/** Ajout de tâche : titre + domaine + lien (projet/objectif) + espace. */
export function QuickTask({
  date,
  status,
  links,
  spaces,
  defaultSpaceId,
  defaultLink = "",
}: {
  date: string;
  status: "TODAY" | "WEEK" | "BACKLOG";
  links: LinkOption[];
  spaces: SpaceOption[];
  defaultSpaceId: string;
  defaultLink?: string;
}) {
  const { run, pending, error } = useMutation();
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("BUSINESS");
  const [link, setLink] = useState(defaultLink);
  const [spaceId, setSpaceId] = useState(defaultSpaceId);
  const [more, setMore] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const [kind, id] = link.split(":");
    const ok = await run("task.create", {
      id: newId(),
      title,
      domain,
      spaceId,
      status,
      plannedDate: date,
      projectId: kind === "p" ? id : null,
      objectiveId: kind === "o" ? id : null,
      keyResultId: kind === "k" ? id : null,
    });
    if (ok) setTitle("");
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex gap-2">
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nouvelle tâche…" />
        <button className="btn shrink-0" disabled={pending || !title.trim()}>
          +
        </button>
      </div>
      <button type="button" className="text-xs text-muted" onClick={() => setMore((m) => !m)}>
        {more ? "▾" : "▸"} Domaine, objectif, espace
      </button>
      {more && (
        <div className="grid grid-cols-2 gap-2">
          <select className="input" value={domain} onChange={(e) => setDomain(e.target.value)}>
            {Object.entries(DOMAIN_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select className="input" value={spaceId} onChange={(e) => setSpaceId(e.target.value)}>
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            className="input col-span-2"
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              const d = links.find((l) => l.value === e.target.value)?.domain;
              if (d) setDomain(d);
            }}
          >
            <option value="">— Sans lien (orpheline) —</option>
            {links.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      )}
      {error && <p className="text-xs text-bad">{error}</p>}
    </form>
  );
}
