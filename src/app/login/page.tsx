import { Suspense } from "react";
import { LoginButtons } from "@/components/client/login-buttons";

export default function LoginPage() {
  const devLogin = process.env.DEV_LOGIN === "1" && process.env.NODE_ENV !== "production";
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">Base Palmela</h1>
      <p className="mb-8 text-sm text-muted">Jour → semaine → trimestre → 2029</p>
      <Suspense>
        <LoginButtons devLogin={devLogin} />
      </Suspense>
    </main>
  );
}
