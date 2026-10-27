import { TelegramApi } from "../src/server/telegram/api";
import { COMMANDS, handleUpdate } from "../src/server/telegram/bot";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function telegramApi(): TelegramApi | null {
  return process.env.TELEGRAM_BOT_TOKEN ? new TelegramApi(process.env.TELEGRAM_BOT_TOKEN) : null;
}

/** Long polling (pas de webhook à exposer derrière le proxy). */
export async function runTelegramBot(api: TelegramApi) {
  await api.setMyCommands(COMMANDS).catch((e) => console.error("[telegram] setMyCommands", e.message));
  console.log("[telegram] bot démarré");
  let offset: number | undefined;
  for (;;) {
    try {
      const updates = await api.getUpdates(offset);
      for (const u of updates) {
        offset = u.update_id + 1;
        try {
          await handleUpdate(api, u);
        } catch (e) {
          console.error(`[telegram] update ${u.update_id}`, e);
        }
      }
    } catch (e) {
      console.error("[telegram] getUpdates", (e as Error).message);
      await sleep(5000);
    }
  }
}
