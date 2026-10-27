import { timeInTz } from "@/lib/dates";
import type { CalEvent } from "@/server/google";

export function AgendaList({ events, compact = false }: { events: CalEvent[]; compact?: boolean }) {
  return (
    <ul className={compact ? "space-y-0.5" : "space-y-1.5"}>
      {events.map((e) => (
        <li key={e.id} className={`flex items-baseline gap-2 ${compact ? "text-xs text-muted" : "text-[15px]"}`}>
          <span className="num w-[5.5rem] shrink-0 text-xs text-muted">{e.allDay ? "journée" : `${timeInTz(e.start)}–${timeInTz(e.end)}`}</span>
          <span className={`min-w-0 flex-1 truncate ${e.taskId ? "text-accent" : ""}`}>
            {e.taskId && "▣ "}
            {e.title}
          </span>
        </li>
      ))}
    </ul>
  );
}
