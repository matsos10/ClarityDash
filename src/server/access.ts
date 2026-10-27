import type { Module, SpaceKind } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { cache } from "react";
import { authOptions } from "./auth";
import { db } from "./db";

export type SpaceInfo = { id: string; name: string; kind: SpaceKind; modules: Module[] };
export type Ctx = { userId: string; name: string; personalSpaceId: string; spaces: SpaceInfo[] };

async function loadCtx(userId: string): Promise<Ctx | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { memberships: { include: { space: { include: { modules: { where: { enabled: true } } } } } } },
  });
  if (!user) return null;
  const spaces = user.memberships.map((m) => ({
    id: m.space.id,
    name: m.space.name,
    kind: m.space.kind,
    modules: m.space.modules.map((x) => x.module),
  }));
  const personal = spaces.find((s) => s.kind === "PERSONAL");
  if (!personal) return null;
  return { userId, name: user.name ?? user.email, personalSpaceId: personal.id, spaces };
}

/** Contexte de l'utilisateur connecté (redirige vers /login sinon). */
export const getCtx = cache(async (): Promise<Ctx> => {
  const session = await getServerSession(authOptions);
  const ctx = session?.user?.id ? await loadCtx(session.user.id) : null;
  if (!ctx) redirect("/login");
  return ctx;
});

/** Variante pour les routes API : null au lieu d'une redirection. */
export async function getApiCtx(): Promise<Ctx | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? loadCtx(session.user.id) : null;
}

/** Espaces lisibles pour un module : le perso toujours, les partagés si le module y est activé. */
export function spacesFor(ctx: Ctx, module: Module): SpaceInfo[] {
  return ctx.spaces.filter((s) => s.kind === "PERSONAL" || s.modules.includes(module));
}

export function spaceIdsFor(ctx: Ctx, module: Module): string[] {
  return spacesFor(ctx, module).map((s) => s.id);
}

export function assertSpace(ctx: Ctx, spaceId: string, module: Module): void {
  if (!spaceIdsFor(ctx, module).includes(spaceId)) throw new Error("Accès refusé à cet espace");
}

/** Espace par défaut d'un module partagé (couple pour les horizons s'il est partagé). */
export function defaultSpaceId(ctx: Ctx, module: Module, prefer: SpaceKind = "PERSONAL"): string {
  return spacesFor(ctx, module).find((s) => s.kind === prefer)?.id ?? ctx.personalSpaceId;
}
