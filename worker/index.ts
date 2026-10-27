import cron from "node-cron";
import { APP_TZ } from "../src/lib/dates";
import { triagePending } from "../src/server/ai/triage";
import { backup } from "./jobs/backup";
import { morningBrief } from "./jobs/brief";
import { eveningReview, tradingChecklist, weeklyReview } from "./jobs/reminders";
import { runTelegramBot, telegramApi } from "./telegram";

// Tâches de fond (fuseau de l'app) : brief du matin, rappels, tri IA de l'inbox, sauvegarde, bot Telegram.

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

// `tsx worker/index.ts --backup-now` / `--brief-now` : exécution immédiate puis sortie.
if (process.argv.includes("--backup-now")) {
  job("backup", backup)().then(() => process.exit(0));
} else if (process.argv.includes("--brief-now")) {
  job("morning-brief", morningBrief)().then(() => process.exit(0));
} else {
  start();
}

function start() {
  cron.schedule("0 7 * * *", job("morning-brief", morningBrief), opts);
  cron.schedule("15 3 * * *", job("backup", backup), opts);
  cron.schedule("45 8 * * 1-5", job("trading-checklist", tradingChecklist), opts);
  cron.schedule("0 21 * * *", job("evening-review", eveningReview), opts);
  cron.schedule("0 18 * * 0", job("weekly-review", weeklyReview), opts);

  // tri IA des captures arrivées par l'app / le partage Android
  let triaging = false;
  cron.schedule("* * * * *", async () => {
    if (triaging) return;
    triaging = true;
    await triagePending().catch((e) => console.error("[triage]", e));
    triaging = false;
  });

  const api = telegramApi();
  if (api) void runTelegramBot(api);

  console.log(`[worker] démarré (${APP_TZ})`);
}
