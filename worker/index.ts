import cron from "node-cron";
import { APP_TZ } from "../src/lib/dates";
import { backup } from "./jobs/backup";
import { eveningReview, tradingChecklist, weeklyReview } from "./jobs/reminders";

// Planificateur des tâches de fond (fuseau de l'app). Phase 2 : brief du matin 7h + bot Telegram.

function job(name: string, fn: () => Promise<void>) {
  return async () => {
    const t = Date.now();
    try {
      await fn();
      console.log(`[${name}] ok (${Date.now() - t} ms)`);
    } catch (e) {
      console.error(`[${name}] échec`, e);
    }
  };
}

const opts = { timezone: APP_TZ };

// `tsx worker/index.ts --backup-now` : sauvegarde immédiate puis sortie.
if (process.argv.includes("--backup-now")) {
  job("backup", backup)().then(() => process.exit(0));
} else {
  start();
}

function start() {
  cron.schedule("15 3 * * *", job("backup", backup), opts);
  cron.schedule("45 8 * * 1-5", job("trading-checklist", tradingChecklist), opts);
  cron.schedule("0 21 * * *", job("evening-review", eveningReview), opts);
  cron.schedule("0 18 * * 0", job("weekly-review", weeklyReview), opts);

  console.log(`[worker] démarré (${APP_TZ})`);
}
