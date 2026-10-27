"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/** Affiche ?err=… posé par guard() puis nettoie l'URL. */
export function FlashError() {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const err = params.get("err");
    if (!err) return setMsg(null);
    setMsg(err);
    const next = new URLSearchParams(params);
    next.delete("err");
    router.replace(next.size ? `${path}?${next}` : path, { scroll: false });
    const t = setTimeout(() => setMsg(null), 5000);
    return () => clearTimeout(t);
  }, [params, path, router]);

  if (!msg) return null;
  return (
    <div className="fixed inset-x-0 top-[calc(0.5rem+env(safe-area-inset-top))] z-50 flex justify-center px-4" onClick={() => setMsg(null)}>
      <div className="max-w-xl rounded-xl bg-bad px-4 py-3 text-sm font-medium text-white shadow-lg">{msg}</div>
    </div>
  );
}
