"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { mutate, newId } from "@/lib/offline/queue";

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
};

/** Bouton central : capture en < 10 s (texte ou dictée), envoi immédiat ou mise en file hors ligne. */
export function CaptureButton() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [voice, setVoice] = useState(false);
  const [listening, setListening] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const recRef = useRef<SpeechRec | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // raccourci Android « Capture » : /today?capture=1
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("capture") === "1") {
      setOpen(true);
      url.searchParams.delete("capture");
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  function toggleMic() {
    const W = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) return setToast("Dictée indisponible sur cet appareil");
    if (listening) return recRef.current?.stop();
    const rec = new Ctor();
    rec.lang = "fr-FR";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const said = Array.from(e.results).map((r) => r[0].transcript).join(" ");
      setText((t) => (t ? `${t} ${said}` : said));
      setVoice(true);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  async function submit() {
    const value = text.trim();
    if (!value) return;
    const r = await mutate("capture.create", { id: newId(), text: value, source: voice ? "VOICE" : "APP" });
    setText("");
    setVoice(false);
    setOpen(false);
    setToast(r === "sent" ? "Capturé → inbox" : "Hors ligne : en file");
    // hors ligne, un refresh déclencherait un rechargement complet de la page
    if (r === "sent") router.refresh();
  }

  return (
    <>
      <button
        aria-label="Capture rapide"
        onClick={() => setOpen(true)}
        className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="w-full rounded-t-3xl border-t border-line bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto max-w-xl">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">Capture rapide</span>
                <span className="text-xs text-muted">→ inbox</span>
              </div>
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void submit();
                  }
                }}
                rows={3}
                placeholder="Idée, tâche, relance, note de trade…"
                className="input min-h-[96px] resize-none py-2"
              />
              <div className="mt-3 grid grid-cols-[auto_1fr] gap-2">
                <button type="button" onClick={toggleMic} className={`btn-ghost w-14 ${listening ? "border-bad text-bad" : ""}`} aria-label="Dicter">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm7 9a7 7 0 0 1-14 0m7 7v3" />
                  </svg>
                </button>
                <button type="button" onClick={submit} disabled={!text.trim()} className="btn">
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center">
          <div className="rounded-full bg-fg px-4 py-2 text-sm text-bg shadow">{toast}</div>
        </div>
      )}
    </>
  );
}
