"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginButtons({ devLogin }: { devLogin: boolean }) {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const error = params.get("error");
  return (
    <div className="space-y-3">
      {error && <p className="rounded-xl bg-bad/10 p-3 text-sm text-bad">Accès refusé : compte non autorisé.</p>}
      <button className="btn w-full" onClick={() => signIn("google", { callbackUrl: "/today" })}>
        Continuer avec Google
      </button>
      {devLogin && (
        <form
          className="space-y-2 pt-6"
          onSubmit={(e) => {
            e.preventDefault();
            void signIn("dev", { email, callbackUrl: "/today" });
          }}
        >
          <label className="label">Connexion de développement</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e-mail autorisé" />
          <button className="btn-ghost w-full">Entrer</button>
        </form>
      )}
    </div>
  );
}
