import { describe, expect, it } from "vitest";
import { consistency } from "@/lib/calc/consistency";
import { dailyPnl } from "@/lib/calc/daily";
import { tradingDayOf } from "@/lib/dates";

const d = (day: string, pnl: number) => ({ day, pnl, trades: 1 });

describe("consistance 40 %", () => {
  it("valide quand la meilleure journée ≤ 40 % du total", () => {
    const r = consistency([d("2026-10-01", 400), d("2026-10-02", 300), d("2026-10-05", 300)], 40);
    expect(r.totalProfit).toBe(1000);
    expect(r.bestDay).toBe(400);
    expect(r.bestDayPct).toBe(40);
    expect(r.ok).toBe(true);
    expect(r.missingProfit).toBe(0);
  });

  it("échoue et calcule le profit manquant", () => {
    const r = consistency([d("2026-10-01", 900), d("2026-10-02", 200), d("2026-10-05", -100)], 40);
    expect(r.totalProfit).toBe(1000);
    expect(r.bestDayPct).toBe(90);
    expect(r.ok).toBe(false);
    expect(r.requiredTotal).toBe(2250);
    expect(r.missingProfit).toBe(1250);
    expect(r.bestDayDate).toBe("2026-10-01");
  });

  it("plafond de la prochaine meilleure journée", () => {
    // total 600 avant aujourd'hui : X ≤ 0,4 × (600 + X) ⇒ X ≤ 400
    const r = consistency([d("2026-10-01", 300), d("2026-10-02", 300)], 40);
    expect(r.nextDayCap).toBe(400);
  });

  it("profit nul ou négatif : jamais valide", () => {
    expect(consistency([d("2026-10-01", -200)], 40).ok).toBe(false);
    expect(consistency([], 40).ok).toBe(false);
  });

  it("agrège par journée CME (bascule 17:00 Chicago)", () => {
    const dayOf = (x: Date) => tradingDayOf(x, "America/Chicago", 17);
    const days = dailyPnl(
      [
        { pnl: 100, entryAt: new Date("2026-10-26T21:30:00Z") }, // 16:30 CT lundi → lundi
        { pnl: 50, entryAt: new Date("2026-10-26T22:30:00Z") }, // 17:30 CT lundi → mardi
        { pnl: 25, entryAt: new Date("2026-10-27T14:00:00Z") }, // mardi
      ],
      dayOf,
    );
    expect(days).toEqual([
      { day: "2026-10-26", pnl: 100, trades: 1 },
      { day: "2026-10-27", pnl: 75, trades: 2 },
    ]);
  });
});
