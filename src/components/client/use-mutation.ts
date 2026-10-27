"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { mutate } from "@/lib/offline/queue";

/** mutate() + rafraîchissement + message d'erreur. */
export function useMutation() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  async function run(kind: string, payload: unknown) {
    setError(null);
    try {
      if ((await mutate(kind, payload)) === "sent") start(() => router.refresh());
      return true;
    } catch (e) {
      setError((e as Error).message);
      setTimeout(() => setError(null), 3000);
      return false;
    }
  }
  return { run, pending, error };
}
