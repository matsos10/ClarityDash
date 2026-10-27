import { describe, expect, it } from "vitest";
import { proposePriorities, type Candidate } from "@/lib/calc/priorities";

const base: Omit<Candidate, "id" | "title"> = {
  status: "BACKLOG",
  dueDate: null,
  plannedDate: null,
  createdDate: "2026-10-27",
  krTitle: null,
  objectiveTitle: null,
  objectiveIdleDays: null,
  isNextAction: false,
  orphan: false,
};
const t = (id: string, extra: Partial<Candidate> = {}): Candidate => ({ ...base, id, title: id, ...extra });

describe("priorités proposées", () => {
  const today = "2026-10-27";

  it("classe par urgence puis par alignement OKR", () => {
    const p = proposePriorities(
      [
        t("backlog"),
        t("semaine", { status: "WEEK" }),
        t("kr", { krTitle: "3 clients PME-IA" }),
        t("retard", { dueDate: "2026-10-25" }),
        t("demain", { dueDate: "2026-10-28" }),
      ],
      today,
    );
    expect(p.map((x) => x.id)).toEqual(["retard", "demain", "semaine"]);
    expect(p[0].reasons).toContain("en retard de 2 j");
  });

  it("met en avant un objectif délaissé depuis 14 j et justifie", () => {
    const p = proposePriorities(
      [t("a", { status: "WEEK" }), t("b", { objectiveTitle: "Santé au top", objectiveIdleDays: 16, isNextAction: true })],
      today,
      1,
    );
    expect(p[0].id).toBe("b");
    expect(p[0].reasons).toEqual(["« Santé au top » sans action depuis 16 j", "prochaine action de projet"]);
  });

  it("pénalise les tâches orphelines et respecte n", () => {
    const p = proposePriorities([t("orph", { orphan: true, status: "WEEK" }), t("liee", { status: "WEEK", objectiveTitle: "X", objectiveIdleDays: 2 })], today, 1);
    expect(p.map((x) => x.id)).toEqual(["liee"]);
    expect(proposePriorities([t("x")], today, 0)).toEqual([]);
  });

  it("l'ancienneté départage (plafonnée)", () => {
    const p = proposePriorities([t("recente"), t("ancienne", { createdDate: "2026-09-01" })], today);
    expect(p[0].id).toBe("ancienne");
    expect(p[0].score).toBe(6);
  });
});
