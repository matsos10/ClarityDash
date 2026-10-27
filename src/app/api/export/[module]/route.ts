import { NextResponse } from "next/server";
import { toCsv } from "@/lib/csv";
import { isoFromDb, todayISO } from "@/lib/dates";
import { getApiCtx, spaceIdsFor, type Ctx } from "@/server/access";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

const exporters: Record<string, (ctx: Ctx) => Promise<{ header: string[]; rows: unknown[][] }>> = {
  async tasks(ctx) {
    const tasks = await db.task.findMany({
      where: { spaceId: { in: spaceIdsFor(ctx, "HORIZONS") }, deletedAt: null },
      include: { project: true, objective: true, keyResult: true, space: true },
      orderBy: { createdAt: "asc" },
    });
    return {
      header: ["id", "titre", "domaine", "statut", "espace", "projet", "kr", "objectif", "jour_prevu", "echeance", "estimation_min", "terminee_le", "creee_le"],
      rows: tasks.map((t) => [
        t.id, t.title, t.domain, t.status, t.space.name, t.project?.title, t.keyResult?.title, t.objective?.title,
        t.plannedDate && isoFromDb(t.plannedDate), t.dueDate && isoFromDb(t.dueDate), t.estimateMin, t.completedAt, t.createdAt,
      ]),
    };
  },
  async routine(ctx) {
    const checks = await db.routineCheck.findMany({ where: { item: { userId: ctx.userId } }, include: { item: true }, orderBy: { date: "asc" } });
    return { header: ["date", "habitude", "domaine"], rows: checks.map((c) => [isoFromDb(c.date), c.item.title, c.item.domain]) };
  },
  async journal(ctx) {
    const entries = await db.journalEntry.findMany({ where: { userId: ctx.userId }, orderBy: { date: "asc" } });
    return { header: ["date", "fait", "bloque", "demain", "humeur", "energie"], rows: entries.map((e) => [isoFromDb(e.date), e.done, e.blocked, e.tomorrow, e.mood, e.energy]) };
  },
  async okr(ctx) {
    const krs = await db.keyResult.findMany({
      where: { objective: { spaceId: { in: spaceIdsFor(ctx, "HORIZONS") } } },
      include: { objective: true, owner: true },
      orderBy: [{ quarter: "asc" }, { createdAt: "asc" }],
    });
    return {
      header: ["trimestre", "objectif", "kr", "unite", "depart", "cible", "actuel", "score", "responsable", "archive"],
      rows: krs.map((k) => [k.quarter, k.objective.title, k.title, k.unit, k.startValue, k.targetValue, k.currentValue, k.score, k.owner?.name, !!k.archivedAt]),
    };
  },
  async trades(ctx) {
    const trades = await db.trade.findMany({ where: { deletedAt: null, account: { spaceId: ctx.personalSpaceId } }, include: { account: true, setup: true }, orderBy: { entryAt: "asc" } });
    return {
      header: ["id", "compte", "instrument", "sens", "entree_le", "sortie_le", "prix_entree", "prix_sortie", "stop", "objectif", "quantite", "pnl", "frais", "risque", "r", "setup", "emotion", "plan_respecte", "groupe_copie", "notes"],
      rows: trades.map((t) => [
        t.id, t.account.name, t.instrument, t.direction, t.entryAt, t.exitAt, t.entryPrice, t.exitPrice, t.stopPrice, t.targetPrice,
        t.quantity, t.pnl, t.fees, t.riskAmount, t.rMultiple, t.setup?.name, t.emotion, t.followedPlan, t.copyGroupId, t.notes,
      ]),
    };
  },
  async payouts(ctx) {
    const payouts = await db.payout.findMany({ where: { account: { spaceId: ctx.personalSpaceId } }, include: { account: true }, orderBy: { requestedAt: "asc" } });
    return { header: ["compte", "montant", "statut", "demande_le", "paye_le", "note"], rows: payouts.map((p) => [p.account.name, p.amount, p.status, p.requestedAt, p.paidAt, p.note]) };
  },
  async macro(ctx) {
    const list = await db.macroAnalysis.findMany({ where: { spaceId: ctx.personalSpaceId }, include: { scenarios: true }, orderBy: { date: "asc" } });
    return {
      header: ["date", "instrument", "score", "biais", "catalyseur", "chaine_causale", "niveaux", "scenarios"],
      rows: list.map((a) => [
        isoFromDb(a.date), a.instrument, a.score, a.bias, a.mainCatalyst, a.causalChain, JSON.stringify(a.levels),
        a.scenarios.map((s) => `${s.label} ${s.probability}%`).join(" | "),
      ]),
    };
  },
};

export async function GET(_req: Request, { params }: { params: { module: string } }) {
  const ctx = await getApiCtx();
  if (!ctx) return new NextResponse("unauthorized", { status: 401 });
  const exporter = exporters[params.module];
  if (!exporter) return new NextResponse("not found", { status: 404 });
  const { header, rows } = await exporter(ctx);
  return new NextResponse(toCsv(header, rows as never), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="palmela-${params.module}-${todayISO()}.csv"`,
    },
  });
}
