import { describe, expect, it } from "vitest";
import { krScore, objectiveScore } from "@/lib/calc/okr-score";
import { routineStreak } from "@/lib/calc/streaks";
import { domainLoad } from "@/lib/calc/load";
import { quarterOf, quarterRange, shiftQuarter, timeInTz, weekStartISO, zonedTimeToUtc } from "@/lib/dates";

describe("OKR", () => {
  it("score croissant, décroissant et borné", () => {
    expect(krScore(0, 10, 7)).toBe(0.7);
    expect(krScore(0, 10, 15)).toBe(1);
    expect(krScore(0, 10, -2)).toBe(0);
    expect(krScore(100000, 60000, 80000)).toBe(0.5); // dette à réduire
    expect(krScore(5, 5, 5)).toBe(1);
    expect(objectiveScore([0.7, 0.5, 0.3])).toBe(0.5);
  });

  it("trimestres et semaines", () => {
    expect(quarterOf("2026-10-27")).toBe("2026-Q4");
    expect(quarterRange("2026-Q4")).toEqual({ start: "2026-10-01", end: "2026-12-31" });
    expect(shiftQuarter("2026-Q4", 1)).toBe("2027-Q1");
    expect(weekStartISO("2026-11-01")).toBe("2026-10-26"); // dimanche → lundi
  });
});

describe("séries de routine", () => {
  it("série courante sans casser sur aujourd'hui non coché", () => {
    const s = routineStreak([], new Set(["2026-10-24", "2026-10-25", "2026-10-26"]), "2026-10-27");
    expect(s.current).toBe(3);
  });
  it("ignore les jours non planifiés", () => {
    // lun-ven ; coché ven 23, lun 26, mar 27 → week-end ignoré
    const s = routineStreak([1, 2, 3, 4, 5], new Set(["2026-10-22", "2026-10-23", "2026-10-26", "2026-10-27"]), "2026-10-27");
    expect(s.current).toBe(4);
  });
  it("meilleure série", () => {
    const s = routineStreak([], new Set(["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-10"]), "2026-10-11");
    expect(s.best).toBe(4);
    expect(s.current).toBe(1);
  });
});

describe("charge par domaine", () => {
  it("additionne les estimations (30 min par défaut)", () => {
    const { grid, totals } = domainLoad(
      [
        { domain: "BUSINESS", day: "2026-10-26", estimateMin: 90 },
        { domain: "BUSINESS", day: "2026-10-26", estimateMin: null },
        { domain: "FAMILY", day: "2026-10-27", estimateMin: 60 },
        { domain: "TRADING", day: null, estimateMin: 60 },
      ],
      ["2026-10-26", "2026-10-27"],
    );
    expect(grid["2026-10-26"].BUSINESS).toBe(120);
    expect(totals.FAMILY).toBe(60);
    expect(totals.TRADING).toBe(0);
  });
});

describe("fuseau Europe/Lisbon", () => {
  it("convertit heure locale ↔ UTC (été et hiver)", () => {
    expect(zonedTimeToUtc("2026-07-01", "09:00", "Europe/Lisbon").toISOString()).toBe("2026-07-01T08:00:00.000Z");
    expect(zonedTimeToUtc("2026-12-01", "09:00", "Europe/Lisbon").toISOString()).toBe("2026-12-01T09:00:00.000Z");
    expect(timeInTz(new Date("2026-07-01T08:00:00Z"), "Europe/Lisbon")).toBe("09:00");
  });
});
