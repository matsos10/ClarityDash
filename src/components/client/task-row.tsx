"use client";

import Link from "next/link";
import type { TaskView } from "@/server/queries";
import { DOMAIN_COLOR } from "@/lib/labels";
import { useMutation } from "./use-mutation";

type Mode = "today" | "backlog" | "week" | "done";

export function TaskRow({ task, mode, date, rank, canPromote = true }: { task: TaskView; mode: Mode; date: string; rank?: number; canPromote?: boolean }) {
  const { run, pending, error } = useMutation();
  const setStatus = (status: string) => run("task.status", { taskId: task.id, status, date });

  return (
    <li className={`border-b border-line py-2 last:border-0 ${pending ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-3">
        <button
          aria-label={mode === "done" ? "Rouvrir" : "Terminer"}
          onClick={() => setStatus(mode === "done" ? "TODAY" : "DONE")}
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${mode === "done" ? "border-good bg-good text-white" : "border-line"}`}
        >
          {mode === "done" && "✓"}
          {mode === "today" && rank != null && <span className="num text-xs text-muted">{rank}</span>}
        </button>
        <div className="min-w-0 flex-1">
          <Link href={`/tasks/${task.id}`} className={`block text-[15px] leading-snug ${mode === "done" ? "text-muted line-through" : ""}`}>
            {task.title}
          </Link>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
            <span className={`inline-block h-2 w-2 rounded-full ${DOMAIN_COLOR[task.domain]}`} />
            {task.objective ? <span>→ {task.objective}</span> : null}
            {task.project ? <span className="truncate">· {task.project}</span> : null}
            {task.orphan && <span className="badge bg-warn/15 text-warn">orpheline</span>}
            {task.shared && <span className="badge bg-accent/15 text-accent">{task.shared}</span>}
            {mode === "today" && task.plannedDate && task.plannedDate < date && <span className="badge bg-line">reportée</span>}
          </div>
          {error && <div className="mt-1 text-xs text-bad">{error}</div>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {mode === "today" && (
            <>
              <button className="btn-sm px-2" aria-label="Monter" onClick={() => run("task.move", { taskId: task.id, direction: "up" })}>
                ↑
              </button>
              <button className="btn-sm px-2" aria-label="Retirer d'aujourd'hui" onClick={() => setStatus("WEEK")}>
                ✕
              </button>
            </>
          )}
          {(mode === "backlog" || mode === "week") && (
            <button className="btn-sm" disabled={!canPromote} onClick={() => setStatus("TODAY")}>
              → Auj.
            </button>
          )}
          {mode === "backlog" && (
            <button className="btn-sm" onClick={() => setStatus("WEEK")}>
              Sem.
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
