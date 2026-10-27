import { describe, expect, it } from "vitest";
import { briefToPush, briefToTelegram, type BriefContent } from "@/lib/brief";

const base: BriefContent = {
  date: "2026-10-26",
  vision: { title: "Vision 2029", text: "Nous vivons de revenus autonomes.", daysLeft: 947 },
  agenda: { connected: true, events: [{ time: "09:30", end: "10:30", title: "Visite chantier <LSF> & devis" }] },
  chosen: [{ id: "t1", title: "Appeler la Câmara", objective: "Propriété de rêve" }],
  proposed: [{ id: "t2", title: "Relancer fornecedor", score: 40, reasons: ["échéance aujourd'hui", "KR : permis"], objective: null }],
  deadlines: [{ date: "2026-10-28", label: "Teste de português (Eva)", kind: "école" }],
  routine: ["Sport", "Macro"],
  outcomes: ["Envoyer 10 messages OfficePulse"],
  trading: {
    macroDone: false,
    sessionOpen: false,
    yesterdayPnl: -250,
    accounts: [{ name: "XFA #1", distance: 400, distancePct: 20, payoutEligible: true, payoutDate: "2026-10-26" }],
  },
  inbox: 3,
  staleObjectives: [{ title: "Santé au top", days: 16 }],
};

describe("brief du matin", () => {
  it("rendu Telegram : sections, vision du lundi, échappement HTML", () => {
    const html = briefToTelegram(base);
    expect(html).toContain("<b>Brief du lundi 26 octobre</b>");
    expect(html).toContain("J-947");
    expect(html).toContain("09:30–10:30 · Visite chantier &lt;LSF&gt; &amp; devis");
    expect(html).toContain("1. Appeler la Câmara <i>→ Propriété de rêve</i>");
    expect(html).toContain("2. Relancer fornecedor");
    expect(html).toContain("échéance aujourd'hui · KR : permis");
    expect(html).toContain("⬜ Analyse macro");
    expect(html).toContain("Hier : −250 $");
    expect(html).toContain("XFA #1 : MLL à 400 $ ⚠️ · payout possible ✅");
    expect(html).toContain("Santé au top (16 j)");
    expect(html).toContain("📥 Inbox : 3 à trier");
    expect(html).not.toMatch(/<(?!\/?(b|i)>)/);
  });

  it("sans agenda connecté ni trading", () => {
    const html = briefToTelegram({ ...base, vision: null, agenda: { connected: false, events: [] }, trading: null, chosen: [], proposed: [] });
    expect(html).toContain("Google Agenda non connecté");
    expect(html).toContain("Backlog vide");
    expect(html).not.toContain("Trading");
  });

  it("résumé push", () => {
    expect(briefToPush(base)).toBe("2 priorités · 1 RDV · 1 échéance · macro à faire — d'abord : Appeler la Câmara");
  });
});
