"use client";

import { signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { saveTheme } from "@/server/actions/daily";

type Theme = "SYSTEM" | "LIGHT" | "DARK";

export function ThemePicker() {
  const [theme, setTheme] = useState<Theme>("SYSTEM");
  useEffect(() => {
    try {
      setTheme((localStorage.getItem("theme") as Theme) || "SYSTEM");
    } catch {}
  }, []);
  function apply(t: Theme) {
    setTheme(t);
    try {
      localStorage.setItem("theme", t);
    } catch {}
    const dark = t === "DARK" || (t === "SYSTEM" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    void saveTheme(t);
  }
  return (
    <div className="grid grid-cols-3 gap-2">
      {(
        [
          ["SYSTEM", "Auto"],
          ["LIGHT", "Clair"],
          ["DARK", "Sombre"],
        ] as const
      ).map(([k, v]) => (
        <button key={k} onClick={() => apply(k)} className={`btn-ghost ${theme === k ? "border-accent text-accent" : ""}`}>
          {v}
        </button>
      ))}
    </div>
  );
}

function urlB64ToUint8Array(b64: string) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function PushToggle({ publicKey }: { publicKey: string | null }) {
  const [state, setState] = useState<"unknown" | "on" | "off" | "unsupported" | "denied">("unknown");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !publicKey) return setState("unsupported");
    if (Notification.permission === "denied") return setState("denied");
    navigator.serviceWorker.getRegistration().then(async (reg) => {
      if (!reg) return setState("unsupported");
      setState((await reg.pushManager.getSubscription()) ? "on" : "off");
    });
  }, [publicKey]);

  async function enable() {
    const reg = await navigator.serviceWorker.ready;
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return setState("denied");
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(publicKey!) });
    await fetch("/api/push/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(sub) });
    setState("on");
  }

  async function disable() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/push/subscribe", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
      await sub.unsubscribe();
    }
    setState("off");
  }

  async function test() {
    await fetch("/api/push/subscribe?test=1", { method: "PUT" });
  }

  if (state === "unsupported") return <p className="text-sm text-muted">Indisponible ici (service worker inactif en dev ou clé VAPID absente).</p>;
  if (state === "denied") return <p className="text-sm text-bad">Notifications bloquées dans les réglages Android.</p>;
  return state === "on" ? (
    <div className="grid grid-cols-2 gap-2">
      <button className="btn-ghost" onClick={test}>
        Tester
      </button>
      <button className="btn-ghost" onClick={disable}>
        Désactiver
      </button>
    </div>
  ) : (
    <button className="btn w-full" onClick={enable} disabled={state === "unknown"}>
      Activer les notifications
    </button>
  );
}

export function LogoutButton() {
  return (
    <button className="btn-ghost w-full" onClick={() => signOut({ callbackUrl: "/login" })}>
      Se déconnecter
    </button>
  );
}

export function GoogleConnectButton({ label }: { label: string }) {
  return (
    <button className="btn w-full" onClick={() => signIn("google", { callbackUrl: "/settings" })}>
      {label}
    </button>
  );
}
