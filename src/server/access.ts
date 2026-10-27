import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { cache } from "react";
import { authOptions } from "./auth";
import { ctxForUser, type Ctx } from "./ctx";

/** Contexte de l'utilisateur connecté (redirige vers /login sinon). */
export const getCtx = cache(async (): Promise<Ctx> => {
  const session = await getServerSession(authOptions);
  const ctx = session?.user?.id ? await ctxForUser(session.user.id) : null;
  if (!ctx) redirect("/login");
  return ctx;
});

/** Variante pour les routes API : null au lieu d'une redirection. */
export async function getApiCtx(): Promise<Ctx | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? ctxForUser(session.user.id) : null;
}

export { assertSpace, ctxForUser, defaultSpaceId, spaceIdsFor, spacesFor, type Ctx, type SpaceInfo } from "./ctx";
