// Transcription des notes vocales (service Python faster-whisper, voir stt/).

export function sttEnabled() {
  return !!process.env.STT_URL;
}

export async function transcribe(data: Buffer, filename: string): Promise<string | null> {
  if (!process.env.STT_URL) return null;
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(data)]), filename);
  const res = await fetch(`${process.env.STT_URL}/transcribe`, { method: "POST", body: form, signal: AbortSignal.timeout(180_000) });
  if (!res.ok) throw new Error(`Transcription : erreur ${res.status}`);
  const j = (await res.json()) as { text: string };
  return j.text.trim() || null;
}
