"use client";

import { useState } from "react";
import { useMutation } from "./use-mutation";

type Entry = { done: string; blocked: string; tomorrow: string; mood: number | null; energy: number | null };

function Scale({ label, value, onChange }: { label: string; value: number | null; onChange: (n: number) => void }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="grid grid-cols-5 gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => onChange(n)}
            className={`num min-h-[40px] rounded-lg border text-sm ${value === n ? "border-accent bg-accent text-white" : "border-line"}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Revue du soir en 3 questions — fonctionne hors ligne (file de mutations). */
export function JournalForm({ date, initial }: { date: string; initial: Entry }) {
  const [e, setE] = useState<Entry>(initial);
  const [saved, setSaved] = useState(false);
  const { run, pending, error } = useMutation();

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (await run("journal.upsert", { date, ...e })) setSaved(true);
  }

  const field = (k: "done" | "blocked" | "tomorrow", label: string, ph: string) => (
    <div>
      <label className="label">{label}</label>
      <textarea
        className="input min-h-[76px] py-2"
        placeholder={ph}
        value={e[k]}
        onChange={(x) => {
          setSaved(false);
          setE({ ...e, [k]: x.target.value });
        }}
      />
    </div>
  );

  return (
    <form onSubmit={save} className="space-y-3">
      {field("done", "1 · Qu'est-ce qui est fait ?", "Victoires, avancées…")}
      {field("blocked", "2 · Qu'est-ce qui bloque ?", "Obstacles, frictions…")}
      {field("tomorrow", "3 · Demain, quoi en premier ?", "Les 3 priorités de demain")}
      <div className="grid grid-cols-2 gap-3">
        <Scale label="Humeur" value={e.mood} onChange={(mood) => setE({ ...e, mood })} />
        <Scale label="Énergie" value={e.energy} onChange={(energy) => setE({ ...e, energy })} />
      </div>
      {error && <p className="text-xs text-bad">{error}</p>}
      <button className="btn w-full" disabled={pending}>
        {saved ? "Enregistré ✓" : "Enregistrer"}
      </button>
    </form>
  );
}
