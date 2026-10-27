"use client";

import { useEffect, useRef, useState } from "react";

/** Affiche le total des probabilités et bloque l'envoi du formulaire tant qu'il ≠ 100 %. */
export function ProbabilityGuard({ names }: { names: string[] }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const inputs = names.map((n) => form.elements.namedItem(n)).filter((x): x is HTMLInputElement => x instanceof HTMLInputElement);
    const update = () => {
      const sum = inputs.reduce((a, i) => a + (Number(i.value) || 0), 0);
      setTotal(sum);
      inputs[0]?.setCustomValidity(sum === 100 ? "" : `Total des probabilités : ${sum} % (doit faire 100 %)`);
    };
    update();
    form.addEventListener("input", update);
    return () => form.removeEventListener("input", update);
  }, [names]);

  return (
    <span ref={ref} className={`num text-xs ${total === 100 ? "text-good" : "text-bad"}`}>
      {total ?? "—"} %
    </span>
  );
}
