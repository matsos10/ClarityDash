// Données initiales : comptes Matias & Ana, espaces, vision 2029, 5 objectifs de couple,
// projets en cours, routine de Matias, check-list pré-session et setups de trading.
import { PrismaClient, type Domain, type ObjectiveArea, type ProjectKind } from "@prisma/client";
import { ensureUserSpaces } from "../src/server/spaces";

const db = new PrismaClient();

async function upsertUser(email: string | undefined, name: string) {
  if (!email) throw new Error(`E-mail manquant pour ${name} (MATIAS_EMAIL / ANA_EMAIL)`);
  const user = await db.user.upsert({ where: { email: email.toLowerCase() }, update: {}, create: { email: email.toLowerCase(), name } });
  await ensureUserSpaces(db, user);
  return user;
}

async function main() {
  const matias = await upsertUser(process.env.MATIAS_EMAIL, "Matias");
  await upsertUser(process.env.ANA_EMAIL, "Ana");

  const couple = await db.space.findFirstOrThrow({ where: { kind: "COUPLE" } });
  const perso = await db.space.findFirstOrThrow({ where: { kind: "PERSONAL", members: { some: { userId: matias.id } } } });

  if (await db.vision.count()) {
    console.log("Seed déjà appliqué.");
    return;
  }

  const vision = await db.vision.create({
    data: {
      spaceId: couple.id,
      title: "Vision 2029",
      targetDate: new Date("2029-05-31T00:00:00Z"),
      textFr:
        "Nous sommes en mai 2029. Nous vivons de revenus autonomes, dans la maison de nos rêves à Palmela, livrée et équipée en solaire. " +
        "Notre patrimoine net a atteint notre cible, nous sommes en pleine forme et notre association aide chaque année des enfants de la région.\n\n" +
        "(À réécrire ensemble au futur accompli.)",
      textPt: "Estamos em maio de 2029. (A reescrever juntos no futuro perfeito.)",
    },
  });

  const objectives: { area: ObjectiveArea; title: string }[] = [
    { area: "AUTONOMOUS_INCOME", title: "Revenu autonome" },
    { area: "DREAM_PROPERTY", title: "Propriété de rêve" },
    { area: "NET_WORTH", title: "Patrimoine net" },
    { area: "HEALTH", title: "Santé au top" },
    { area: "SOCIAL_IMPACT", title: "Impact social" },
  ];
  const obj: Record<ObjectiveArea, string> = {} as Record<ObjectiveArea, string>;
  for (const [i, o] of objectives.entries()) {
    const created = await db.objective.create({ data: { ...o, order: i, spaceId: couple.id, visionId: vision.id } });
    obj[o.area] = created.id;
  }

  const milestones = [
    { title: "Permis LSF obtenu (Câmara de Palmela)", dueDate: "2027-03-31", area: "DREAM_PROPERTY" },
    { title: "Premiers clients PME-IA", dueDate: "2027-01-31", area: "AUTONOMOUS_INCOME" },
    { title: "Payouts réguliers (1/mois)", dueDate: "2027-06-30", area: "AUTONOMOUS_INCOME" },
    { title: "Maison livrée", dueDate: "2028-06-30", area: "DREAM_PROPERTY" },
  ] as const;
  for (const [i, m] of milestones.entries()) {
    await db.milestone.create({
      data: { visionId: vision.id, objectiveId: obj[m.area], title: m.title, dueDate: new Date(`${m.dueDate}T00:00:00Z`), order: i },
    });
  }

  const projects: { title: string; domain: Domain; area: ObjectiveArea; kind?: ProjectKind }[] = [
    { title: "PME-IA — packaging on-premise", domain: "BUSINESS", area: "AUTONOMOUS_INCOME" },
    { title: "PME-IA — prospection imobiliárias Setúbal", domain: "BUSINESS", area: "AUTONOMOUS_INCOME" },
    { title: "OfficePulse — prospection Lisboa/Leiria", domain: "BUSINESS", area: "AUTONOMOUS_INCOME" },
    { title: "SaaS Transparência salarial", domain: "BUSINESS", area: "AUTONOMOUS_INCOME" },
    { title: "SaaS orçamentos IA", domain: "BUSINESS", area: "AUTONOMOUS_INCOME" },
    { title: "Trading prop — payouts réguliers", domain: "TRADING", area: "AUTONOMOUS_INCOME" },
    { title: "Maison LSF Algeruz — permis & devis", domain: "HOME", area: "DREAM_PROPERTY", kind: "CONSTRUCTION" },
    { title: "Solaire autoconsommation injection zéro", domain: "HOME", area: "DREAM_PROPERTY", kind: "SOLAR" },
    { title: "Rénovation 40 m² (9 étapes)", domain: "HOME", area: "NET_WORTH", kind: "RENOVATION" },
    { title: "Litige promesse de vente", domain: "HOME", area: "NET_WORTH", kind: "LITIGATION" },
    { title: "Livre de survie", domain: "PERSONAL", area: "SOCIAL_IMPACT", kind: "BOOK" },
    { title: "Association pour enfants", domain: "PERSONAL", area: "SOCIAL_IMPACT", kind: "ASSOCIATION" },
  ];
  for (const p of projects) {
    await db.project.create({
      data: { spaceId: perso.id, title: p.title, domain: p.domain, kind: p.kind ?? "GENERIC", objectiveId: obj[p.area] },
    });
  }

  const routine: { title: string; domain: Domain; days: number[]; area?: ObjectiveArea; time?: string }[] = [
    { title: "Analyse macro XAUUSD", domain: "TRADING", days: [1, 2, 3, 4, 5], area: "AUTONOMOUS_INCOME", time: "07:30" },
    { title: "Sport (marche / tennis / golf)", domain: "PERSONAL", days: [], area: "HEALTH" },
    { title: "Bloc PME-IA 90 min", domain: "BUSINESS", days: [1, 2, 3, 4, 5], area: "AUTONOMOUS_INCOME" },
    { title: "Prospection OfficePulse", domain: "BUSINESS", days: [1, 2, 3, 4, 5], area: "AUTONOMOUS_INCOME" },
    { title: "Révision Eva (português)", domain: "FAMILY", days: [1, 2, 3, 4] },
    { title: "Écriture du livre", domain: "PERSONAL", days: [], area: "SOCIAL_IMPACT" },
    { title: "Temps avec Ana", domain: "FAMILY", days: [] },
  ];
  for (const [i, r] of routine.entries()) {
    await db.routineItem.create({
      data: {
        userId: matias.id,
        title: r.title,
        domain: r.domain,
        daysOfWeek: r.days,
        timeOfDay: r.time,
        order: i,
        objectiveId: r.area ? obj[r.area] : undefined,
      },
    });
  }

  const checklist = [
    "Analyse macro du jour faite (biais + niveaux)",
    "Calendrier économique vérifié (news rouges)",
    "Distance au MLL et perte max du jour connues",
    "Setup EMA + price action identifié sur l'unité de référence",
    "Taille de position conforme au plan",
    "État émotionnel OK (pas de revanche, pas de fatigue)",
  ];
  for (const [i, label] of checklist.entries()) {
    await db.preSessionChecklistItem.create({ data: { spaceId: perso.id, label, order: i } });
  }
  for (const name of ["EMA pullback", "Cassure + retest", "Rejet de niveau clé", "Continuation tendance"]) {
    await db.tradeSetup.create({ data: { spaceId: perso.id, name } });
  }

  console.log("Seed appliqué.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
