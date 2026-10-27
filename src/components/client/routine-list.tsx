"use client";

import { useState } from "react";
import { DOMAIN_COLOR } from "@/lib/labels";
import { useMutation } from "./use-mutation";

export type RoutineView = { id: string; title: string; domain: keyof typeof DOMAIN_COLOR; done: boolean; streak: number; timeOfDay: string | null };

export function RoutineList({ items, date }: { items: RoutineView[]; date: string }) {
  const { run } = useMutation();
  const [state, setState] = useState<Record<string, boolean>>(() => Object.fromEntries(items.map((i) => [i.id, i.done])));

  return (
    <ul className="grid grid-cols-1 gap-1">
      {items.map((i) => {
        const done = state[i.id] ?? i.done;
        return (
          <li key={i.id}>
            <button
              className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-1 text-left active:bg-line/50"
              onClick={() => {
                setState((s) => ({ ...s, [i.id]: !done }));
                void run("routine.toggle", { itemId: i.id, date, done: !done });
              }}
            >
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-xs ${done ? "border-good bg-good text-white" : "border-line"}`}>
                {done && "✓"}
              </span>
              <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${DOMAIN_COLOR[i.domain]}`} />
              <span className={`flex-1 text-[15px] ${done ? "text-muted line-through" : ""}`}>{i.title}</span>
              {i.timeOfDay && <span className="num text-xs text-muted">{i.timeOfDay}</span>}
              <span className="num w-10 text-right text-xs text-muted" title="Série">
                {i.streak + (done && !i.done ? 1 : !done && i.done ? -1 : 0)}🔥
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
