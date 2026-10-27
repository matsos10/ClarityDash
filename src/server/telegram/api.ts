// Client minimal de la Bot API Telegram.

export type InlineButton = { text: string; callback_data: string };

export type TgUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number; type: string };
    from?: { id: number; first_name?: string };
    text?: string;
    caption?: string;
    voice?: { file_id: string; duration: number; mime_type?: string };
    audio?: { file_id: string; duration: number; mime_type?: string; file_name?: string };
  };
  callback_query?: {
    id: string;
    data?: string;
    message?: { message_id: number; chat: { id: number } };
  };
};

export class TelegramApi {
  constructor(
    private token: string,
    private base = process.env.TELEGRAM_API_BASE ?? "https://api.telegram.org",
  ) {}

  async call<T>(method: string, params: Record<string, unknown> = {}, timeoutMs = 30_000): Promise<T> {
    const res = await fetch(`${this.base}/bot${this.token}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(params, (_k, v) => (typeof v === "bigint" ? v.toString() : v)),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const j = (await res.json().catch(() => ({ ok: false, description: `HTTP ${res.status}` }))) as { ok: boolean; result: T; description?: string };
    if (!j.ok) throw new Error(`Telegram ${method} : ${j.description}`);
    return j.result;
  }

  getUpdates(offset: number | undefined, timeout = 50) {
    return this.call<TgUpdate[]>("getUpdates", { offset, timeout, allowed_updates: ["message", "callback_query"] }, (timeout + 10) * 1000);
  }

  sendMessage(chatId: number | bigint | string, html: string, buttons?: InlineButton[][]) {
    return this.call<{ message_id: number }>("sendMessage", {
      chat_id: chatId,
      text: html.slice(0, 4000),
      parse_mode: "HTML",
      disable_web_page_preview: true,
      ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}),
    });
  }

  editMessageText(chatId: number | bigint, messageId: number, html: string) {
    return this.call("editMessageText", { chat_id: chatId, message_id: messageId, text: html.slice(0, 4000), parse_mode: "HTML" });
  }

  answerCallbackQuery(id: string, text?: string) {
    return this.call("answerCallbackQuery", { callback_query_id: id, text });
  }

  setMyCommands(commands: { command: string; description: string }[]) {
    return this.call("setMyCommands", { commands });
  }

  async downloadFile(fileId: string): Promise<{ data: Buffer; path: string }> {
    const f = await this.call<{ file_path: string }>("getFile", { file_id: fileId });
    const res = await fetch(`${this.base}/file/bot${this.token}/${f.file_path}`, { signal: AbortSignal.timeout(60_000) });
    if (!res.ok) throw new Error(`Téléchargement Telegram : ${res.status}`);
    return { data: Buffer.from(await res.arrayBuffer()), path: f.file_path };
  }
}
