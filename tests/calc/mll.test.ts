import { describe, expect, it } from "vitest";
import { mllState, type MllInput } from "@/lib/calc/mll";

const t = (day: string, amount: number, h = 14) => ({ day, at: new Date(`${day}T${String(h).padStart(2, "0")}:00:00Z`), kind: "trade" as const, amount });

const base: Omit<MllInput, "events" | "currentDay"> = {
  startingBalance: 50000,
  maxLossLimit: 2000,
  drawdownType: "TRAILING_EOD",
  mllLockBalance: 50000,
  dailyLossLimit: 1000,
};

describe("Maximum Loss Limit", () => {
  it("suit le plus haut EOD", () => {
    const s = mllState({ ...base, events: [t("2026-10-20", 600), t("2026-10-21", -300)], currentDay: "2026-10-22" });
    expect(s.balance).toBe(50300);
    expect(s.highWaterMark).toBe(50600);
    expect(s.mllLevel).toBe(48600);
    expect(s.distance).toBe(1700);
  });

  it("la journée en cours ne remonte pas le MLL", () => {
    const s = mllState({ ...base, events: [t("2026-10-22", 800)], currentDay: "2026-10-22" });
    expect(s.highWaterMark).toBe(50000);
    expect(s.mllLevel).toBe(48000);
    expect(s.todayPnl).toBe(800);
  });

  it("se fige au solde de verrouillage", () => {
    const s = mllState({ ...base, events: [t("2026-10-20", 2500)], currentDay: "2026-10-21" });
    expect(s.mllLevel).toBe(50000);
    expect(s.locked).toBe(true);
    expect(s.distance).toBe(2500);
  });

  it("détecte la violation et la perte journalière restante", () => {
    const s = mllState({ ...base, events: [t("2026-10-22", -900), t("2026-10-22", -1200, 15)], currentDay: "2026-10-22" });
    expect(s.distance).toBe(-100);
    expect(s.breached).toBe(true);
    expect(s.dailyLossRemaining).toBe(-1100);
  });

  it("intraday : suit le pic de chaque trade", () => {
    const s = mllState({
      ...base,
      drawdownType: "TRAILING_INTRADAY",
      mllLockBalance: null,
      events: [t("2026-10-22", 700), t("2026-10-22", -500, 15)],
      currentDay: "2026-10-22",
    });
    expect(s.highWaterMark).toBe(50700);
    expect(s.mllLevel).toBe(48700);
  });

  it("statique et payouts", () => {
    const s = mllState({
      ...base,
      drawdownType: "STATIC",
      events: [t("2026-10-20", 3000), { day: "2026-10-21", at: new Date("2026-10-21T10:00:00Z"), kind: "payout", amount: 1000 }],
      currentDay: "2026-10-22",
    });
    expect(s.balance).toBe(52000);
    expect(s.mllLevel).toBe(48000);
    expect(s.distance).toBe(4000);
  });
});
