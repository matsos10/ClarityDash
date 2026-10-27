"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { flush, onPendingChange } from "@/lib/offline/queue";

/** Rejoue la file au chargement et au retour du réseau ; affiche l'état hors ligne. */
export function SyncStatus() {
  const [pending, setPending] = useState(0);
  const [online, setOnline] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const off = onPendingChange(setPending);
    const sync = async () => {
      setOnline(navigator.onLine);
      if ((await flush()) > 0) router.refresh();
    };
    void sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    const iv = setInterval(sync, 60_000);
    return () => {
      off();
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
      clearInterval(iv);
    };
  }, [router]);

  if (online && pending === 0) return null;
  return (
    <div className="sticky top-0 z-20 bg-warn/90 px-4 py-1 text-center text-xs font-medium text-black">
      {online ? `Synchronisation… ${pending} en attente` : `Hors ligne${pending ? ` · ${pending} en attente` : ""}`}
    </div>
  );
}
