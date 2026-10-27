import { describe, expect, it } from "vitest";
import { payoutCycle, payoutStatus } from "@/lib/calc/payout";

const d = (day: string, pnl: number) => ({ day, pnl, trades: 2 });
const rules = { minDays: 3, minDayProfit: null, consistencyPct: 40 };

describe("payout", () => {
  it("éligible : 3 jours, profit > 0, consistance OK", () => {
    const s = payoutStatus([d("2026-10-20", 300), d("2026-10-21", 300), d("2026-10-22", 400)], [], rules, "2026-10-23");
    expect(s.eligible).toBe(true);
    expect(s.qualifyingDays).toBe(3);
    expect(s.earliestDate).toBe("2026-10-23");
    expect(s.blockers).toEqual([]);
  });

  it("ne compte que les jours après le dernier payout", () => {
    const s = payoutStatus(
      [d("2026-10-19", 500), d("2026-10-20", 300), d("2026-10-21", 200)],
      [{ day: "2026-10-19", amount: 400, status: "PAID" }],
      rules,
      "2026-10-21",
    );
    expect(s.periodStart).toBe("2026-10-19");
    expect(s.qualifyingDays).toBe(2);
    expect(s.periodProfit).toBe(500);
    expect(s.eligible).toBe(false);
    // aujourd'hui (mercredi) déjà tradé → 1 jour manquant = jeudi
    expect(s.earliestDate).toBe("2026-10-22");
  });

  it("projette la date en sautant le week-end", () => {
    const s = payoutStatus([d("2026-10-23", 300)], [], rules, "2026-10-23"); // vendredi tradé
    expect(s.qualifyingDays).toBe(1);
    expect(s.earliestDate).toBe("2026-10-27"); // lun 26 + mar 27
  });

  it("jours qualifiants avec profit minimum", () => {
    const s = payoutStatus(
      [d("2026-10-20", 100), d("2026-10-21", 200), d("2026-10-22", 250), d("2026-10-23", 160)],
      [],
      { minDays: 3, minDayProfit: 150, consistencyPct: null },
      "2026-10-23",
    );
    expect(s.qualifyingDays).toBe(3);
    expect(s.eligible).toBe(true);
  });

  it("bloqué par la consistance", () => {
    const s = payoutStatus([d("2026-10-20", 1000), d("2026-10-21", 50), d("2026-10-22", 50)], [], rules, "2026-10-22");
    expect(s.daysOk).toBe(true);
    expect(s.eligible).toBe(false);
    expect(s.blockers[0]).toMatch(/Consistance/);
  });

  it("cycle de payouts", () => {
    const c = payoutCycle([
      { day: "2026-09-01", amount: 500, status: "PAID" },
      { day: "2026-09-15", amount: 700, status: "PAID" },
      { day: "2026-10-05", amount: 900, status: "PAID" },
      { day: "2026-10-20", amount: 1000, status: "REQUESTED" },
    ]);
    expect(c.count).toBe(3);
    expect(c.totalPaid).toBe(2100);
    expect(c.avgAmount).toBe(700);
    expect(c.intervals).toEqual([14, 20]);
    expect(c.avgIntervalDays).toBe(17);
    expect(c.lastPaid).toBe("2026-10-05");
  });
});
