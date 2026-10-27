import type { PrismaClient } from "@prisma/client";

/**
 * Garantit l'espace personnel de l'utilisateur et son adhésion aux espaces
 * partagés Couple et Famille (créés au besoin). Idempotent.
 */
export async function ensureUserSpaces(db: PrismaClient, user: { id: string; name?: string | null }) {
  const memberships = await db.spaceMember.findMany({ where: { userId: user.id }, include: { space: true } });

  if (!memberships.some((m) => m.space.kind === "PERSONAL")) {
    await db.space.create({
      data: {
        name: `Perso ${user.name?.split(" ")[0] ?? ""}`.trim(),
        kind: "PERSONAL",
        members: { create: { userId: user.id, role: "OWNER" } },
      },
    });
  }

  for (const kind of ["COUPLE", "FAMILY"] as const) {
    if (memberships.some((m) => m.space.kind === kind)) continue;
    const existing = await db.space.findFirst({ where: { kind } });
    if (existing) {
      await db.spaceMember.create({ data: { spaceId: existing.id, userId: user.id } });
    } else {
      await db.space.create({
        data: {
          name: kind === "COUPLE" ? "Couple" : "Famille",
          kind,
          members: { create: { userId: user.id, role: "OWNER" } },
          // partage par défaut : horizons en couple, horizons + famille pour la famille
          modules: {
            create: kind === "COUPLE" ? [{ module: "HORIZONS" }] : [{ module: "HORIZONS" }, { module: "FAMILY" }],
          },
        },
      });
    }
  }
}
