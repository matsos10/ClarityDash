import { headers } from "next/headers";
import { isRedirectError } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

// Petits utilitaires de lecture de FormData pour les server actions.

export const str = (f: FormData, k: string) => {
  const v = f.get(k);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
};

export const req = (f: FormData, k: string) => {
  const v = str(f, k);
  if (v == null) throw new Error(`Champ requis : ${k}`);
  return v;
};

export const num = (f: FormData, k: string) => {
  const v = str(f, k);
  if (v == null) return null;
  const n = Number(v.replace(",", "."));
  if (Number.isNaN(n)) throw new Error(`Nombre invalide : ${k}`);
  return n;
};

export const int = (f: FormData, k: string) => {
  const n = num(f, k);
  return n == null ? null : Math.round(n);
};

export const bool = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "true";

export function oneOf<T extends string>(f: FormData, k: string, values: readonly T[], fallback?: T): T {
  const v = str(f, k);
  if (v && (values as readonly string[]).includes(v)) return v as T;
  if (fallback !== undefined) return fallback;
  throw new Error(`Valeur invalide : ${k}`);
}

/**
 * Exécute une server action ; une erreur métier renvoie sur la page d'origine
 * avec ?err=… (affiché par <FlashError />) au lieu de l'écran d'erreur générique.
 */
export async function guard(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (e) {
    if (isRedirectError(e)) throw e;
    const message = e instanceof ZodError ? "Données invalides" : e instanceof Error ? e.message : "Erreur";
    const ref = headers().get("referer");
    const url = new URL(ref ?? "/today", "http://local");
    url.searchParams.set("err", message.slice(0, 200));
    redirect(`${url.pathname}${url.search}`);
  }
}
