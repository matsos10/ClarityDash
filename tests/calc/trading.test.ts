import { describe, expect, it } from "vitest";
import { sessionLock } from "@/lib/calc/session-lock";
import { scalingState } from "@/lib/calc/scaling";
import { tradeStats } from "@/lib/calc/trading-stats";

const tr = (id: string, pnl: number, iso: string, extra: object = {}) => ({ id, pnl, entryAt: new Date(iso), ...extra });

describe("stop après 2 pertes", () => {
  it("verrouille à la 2e perte", () => {
    expect(sessionLock([tr("a", -100, "2026-10-27T09:00:00Z")]).locked).toBe(false);
    expect(sessionLock([tr("a", -100, "2026-10-27T09:00:00Z"), tr("b", 50, "2026-10-27T10:00:00Z"), tr("c", -20, "2026-10-27T11:00:00Z")]).locked).toBe(true);
  });

  it("un trade copié sur plusieurs comptes = une perte", () => {
    const s = sessionLock([
      tr("a", -100, "2026-10-27T09:00:00Z", { copyGroupId: "g1" }),
      tr("b", -100, "2026-10-27T09:00:00Z", { copyGroupId: "g1" }),
    ]);
    expect(s.losses).toBe(1);
    expect(s.locked).toBe(false);
    expect(s.remaining).toBe(1);
  });
});

describe("statistiques", () => {
  it("win rate, espérance, profit factor, drawdown, créneaux", () => {
    const s = tradeStats(
      [
        tr("1", 200, "2026-10-26T13:35:00Z", { rMultiple: 2, setup: "EMA pullback" }),
        tr("2", -100, "2026-10-26T13:50:00Z", { rMultiple: -1, setup: "EMA pullback" }),
        tr("3", 150, "2026-10-26T14:10:00Z", { rMultiple: 1.5, setup: "Breakout" }),
        tr("4", -100, "2026-10-26T14:30:00Z", { rMultiple: -1, setup: "Breakout" }),
      ],
      "Europe/Lisbon",
    );
    expect(s.n).toBe(4);
    expect(s.winRate).toBe(50);
    expect(s.totalPnl).toBe(150);
    expect(s.expectancy).toBe(37.5);
    expect(s.expectancyR).toBe(0.38);
    expect(s.profitFactor).toBe(1.75);
    expect(s.avgWin).toBe(175);
    expect(s.avgLoss).toBe(-100);
    expect(s.maxDrawdown).toBe(100);
    expect(s.byHour.map((b) => b.key)).toEqual(["13h", "14h"]); // Lisbonne en WET (UTC+0) depuis le 25/10
  });
});

describe("scaling fonds perso", () => {
  const tiers = [
    { order: 1, label: "P1", capitalMin: 500, lotSize: 0.01 },
    { order: 2, label: "P2", capitalMin: 1000, lotSize: 0.02 },
    { order: 3, label: "P3", capitalMin: 2000, lotSize: 0.04 },
  ];
  it("palier courant et suivant", () => {
    const s = scalingState(1500, tiers);
    expect(s.current?.label).toBe("P2");
    expect(s.next?.label).toBe("P3");
    expect(s.missing).toBe(500);
    expect(s.progressPct).toBe(50);
  });
  it("sous le premier palier", () => {
    const s = scalingState(250, tiers);
    expect(s.current).toBeNull();
    expect(s.progressPct).toBe(50);
  });
});
