import { diffDaysISO } from "../dates";

export type Candidate = {
  id: string;
  title: string;
  status: "WEEK" | "BACKLOG";
  dueDate: string | null;
  plannedDate: string | null;
  createdDate: string;
  krTitle: string | null;
  objectiveTitle: string | null;
  /** Jours depuis la dernière action sur l'objectif servi (null = jamais / pas d'objectif) */
  objectiveIdleDays: number | null;
  isNextAction: boolean;
  orphan: boolean;
};

export type Proposal = { id: string; title: string; score: number; reasons: string[]; objective: string | null };

/**
 * Propose les priorités du jour : échéances, planification, KR du trimestre,
 * objectifs délaissés (≥ 14 j), prochaines actions de projet. Chaque proposition
 * est justifiée.
 */
export function proposePriorities(tasks: Candidate[], today: string, n = 3): Proposal[] {
  const scored = tasks.map((t) => {
    let score = 0;
    const reasons: string[] = [];
    if (t.dueDate) {
      const d = diffDaysISO(t.dueDate, today);
      if (d < 0) (score += 50), reasons.push(`en retard de ${-d} j`);
      else if (d === 0) (score += 40), reasons.push("échéance aujourd'hui");
      else if (d === 1) (score += 25), reasons.push("échéance demain");
      else if (d <= 7) (score += 10), reasons.push(`échéance dans ${d} j`);
    }
    if (t.plannedDate === today) (score += 30), reasons.push("prévue aujourd'hui");
    else if (t.plannedDate && t.plannedDate < today) (score += 20), reasons.push("reportée");
    if (t.status === "WEEK") (score += 15), reasons.push("dans la semaine");
    if (t.krTitle) (score += 15), reasons.push(`KR : ${t.krTitle}`);
    if (t.objectiveIdleDays != null && t.objectiveIdleDays >= 14) {
      score += 12;
      reasons.push(`« ${t.objectiveTitle} » sans action depuis ${t.objectiveIdleDays} j`);
    }
    if (t.isNextAction) (score += 10), reasons.push("prochaine action de projet");
    if (t.orphan) score -= 10;
    score += Math.min(6, Math.floor(diffDaysISO(today, t.createdDate) / 3));
    return { id: t.id, title: t.title, score, reasons, objective: t.objectiveTitle, created: t.createdDate };
  });
  return scored
    .sort((a, b) => b.score - a.score || a.created.localeCompare(b.created))
    .slice(0, Math.max(0, n))
    .map(({ created: _created, ...p }) => p);
}
