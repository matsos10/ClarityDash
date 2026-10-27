import { dbDate, isoWeekday, todayISO } from "../../src/lib/dates";
import { db } from "../../src/server/db";
import { sendPush } from "../../src/server/push";

/** 21:00 — revue du soir si pas encore faite. */
export async function eveningReview() {
  const date = dbDate(todayISO());
  const users = await db.user.findMany({ where: { pushSubscriptions: { some: {} }, journalEntries: { none: { date } } } });
  for (const u of users) await sendPush(u.id, { title: "Revue du soir", body: "Fait / bloqué / demain — 1 minute.", url: "/journal", tag: "evening" });
}

/** Dimanche 18:00 — revue hebdo. */
export async function weeklyReview() {
  const users = await db.user.findMany({ where: { pushSubscriptions: { some: {} } } });
  for (const u of users) {
    await sendPush(u.id, { title: "Revue hebdo", body: "Bilan routine, P&L, projets et 5 résultats de la semaine.", url: "/week/review", tag: "weekly" });
  }
}

/** Jours ouvrés 08:45 — check-list pré-session si comptes actifs et session non ouverte. */
export async function tradingChecklist() {
  const today = todayISO();
  if (isoWeekday(today) > 5) return;
  const users = await db.user.findMany({
    where: {
      pushSubscriptions: { some: {} },
      tradingSessions: { none: { date: dbDate(today), checklistPassedAt: { not: null } } },
      memberships: { some: { space: { kind: "PERSONAL", tradingAccounts: { some: { status: "ACTIVE" } } } } },
    },
  });
  for (const u of users) {
    await sendPush(u.id, { title: "Trading", body: "Analyse macro + check-list pré-session avant tout trade.", url: "/trading/session", tag: "trading" });
  }
}
