// Contenu du brief du matin (stocké dans DailyBrief.content) et rendus texte.
import type { Proposal } from "./calc/priorities";
import { formatDayFr } from "./dates";

export type BriefContent = {
  date: string;
  vision: { title: string; text: string; daysLeft: number } | null; // lundi uniquement
  agenda: { connected: boolean; events: { time: string | null; end: string | null; title: string }[] };
  chosen: { id: string; title: string; objective: string | null }[];
  proposed: Proposal[];
  deadlines: { date: string; label: string; kind: string }[];
  routine: string[];
  outcomes: string[];
  trading: {
    macroDone: boolean;
    sessionOpen: boolean;
    yesterdayPnl: number | null;
    accounts: { name: string; distance: number | null; distancePct: number | null; payoutEligible: boolean; payoutDate: string }[];
  } | null;
  inbox: number;
  staleObjectives: { title: string; days: number | null }[];
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const usd = (n: number) => `${n < 0 ? "−" : ""}${Math.abs(Math.round(n)).toLocaleString("fr-FR")} $`;

/** Brief au format HTML Telegram (balises b / i uniquement). */
export function briefToTelegram(b: BriefContent): string {
  const L: string[] = [];
  L.push(`☀️ <b>Brief du ${esc(formatDayFr(b.date, { weekday: "long", day: "numeric", month: "long" }))}</b>`);

  if (b.vision) {
    L.push("", `🧭 <b>${esc(b.vision.title)}</b> — J-${b.vision.daysLeft}`, `<i>${esc(b.vision.text)}</i>`);
  }

  L.push("", "📅 <b>Agenda</b>");
  if (!b.agenda.connected) L.push("Google Agenda non connecté");
  else if (!b.agenda.events.length) L.push("Rien de prévu");
  else for (const e of b.agenda.events) L.push(`${e.time ? `${e.time}–${e.end}` : "journée"} · ${esc(e.title)}`);

  L.push("", "🎯 <b>Priorités</b>");
  if (b.chosen.length) b.chosen.forEach((t, i) => L.push(`${i + 1}. ${esc(t.title)}${t.objective ? ` <i>→ ${esc(t.objective)}</i>` : ""}`));
  if (b.proposed.length) {
    if (b.chosen.length) L.push("<i>Proposées en plus :</i>");
    b.proposed.forEach((p, i) => L.push(`${b.chosen.length + i + 1}. ${esc(p.title)}`, `   <i>${esc(p.reasons.join(" · ") || "backlog")}</i>`));
  }
  if (!b.chosen.length && !b.proposed.length) L.push("Backlog vide — capture tes prochaines actions.");

  if (b.deadlines.length) {
    L.push("", "⏰ <b>Échéances</b>");
    for (const d of b.deadlines) L.push(`${esc(formatDayFr(d.date, { weekday: "short", day: "numeric", month: "short" }))} · ${esc(d.label)}`);
  }

  if (b.trading) {
    const t = b.trading;
    L.push("", "📈 <b>Trading</b>");
    L.push(`${t.macroDone ? "✅" : "⬜"} Analyse macro · ${t.sessionOpen ? "✅" : "⬜"} Check-list pré-session`);
    if (t.yesterdayPnl != null) L.push(`Hier : ${t.yesterdayPnl >= 0 ? "+" : ""}${usd(t.yesterdayPnl)}`);
    for (const a of t.accounts) {
      const warn = a.distancePct != null && a.distancePct < 25 ? " ⚠️" : "";
      L.push(`• ${esc(a.name)} : MLL à ${a.distance == null ? "—" : usd(a.distance)}${warn}${a.payoutEligible ? " · payout possible ✅" : ""}`);
    }
    L.push("Règle : stop après 2 pertes.");
  }

  if (b.staleObjectives.length) {
    L.push("", "⚠️ <b>Objectifs sans action depuis 14 j</b>");
    for (const o of b.staleObjectives) L.push(`• ${esc(o.title)}${o.days != null ? ` (${o.days} j)` : ""}`);
  }

  if (b.outcomes.length) {
    L.push("", "🏁 <b>Résultats de la semaine</b>");
    b.outcomes.forEach((o) => L.push(`• ${esc(o)}`));
  }

  if (b.routine.length) L.push("", `🔁 Routine du jour : ${b.routine.length} habitude(s)`);
  if (b.inbox) L.push(`📥 Inbox : ${b.inbox} à trier`);
  return L.join("\n");
}

/** Résumé court pour la notification push. */
export function briefToPush(b: BriefContent): string {
  const parts: string[] = [];
  const prios = b.chosen.length + b.proposed.length;
  parts.push(`${prios} priorité${prios > 1 ? "s" : ""}`);
  if (b.agenda.events.length) parts.push(`${b.agenda.events.length} RDV`);
  if (b.deadlines.length) parts.push(`${b.deadlines.length} échéance${b.deadlines.length > 1 ? "s" : ""}`);
  if (b.trading && !b.trading.macroDone) parts.push("macro à faire");
  const first = b.chosen[0]?.title ?? b.proposed[0]?.title;
  return `${parts.join(" · ")}${first ? ` — d'abord : ${first}` : ""}`;
}
