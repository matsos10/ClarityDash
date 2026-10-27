"""Transcription des notes vocales Telegram (FR / PT) avec faster-whisper, sur CPU.

POST /transcribe (multipart, champ « file », langue optionnelle) -> {"text", "language", "duration"}
Service interne : exposé uniquement sur le réseau Docker du worker.
"""

import os
import tempfile
import threading

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from faster_whisper import WhisperModel

MODEL_NAME = os.environ.get("WHISPER_MODEL", "small")
MAX_BYTES = 25 * 1024 * 1024

app = FastAPI(title="Base Palmela STT")
_model: WhisperModel | None = None
_lock = threading.Lock()


def model() -> WhisperModel:
    global _model
    with _lock:
        if _model is None:
            _model = WhisperModel(MODEL_NAME, device="cpu", compute_type="int8", download_root="/models")
        return _model


@app.get("/health")
def health() -> dict:
    return {"ok": True, "model": MODEL_NAME, "loaded": _model is not None}


@app.post("/transcribe")
def transcribe(file: UploadFile = File(...), language: str | None = Form(None)) -> dict:
    data = file.file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Fichier audio trop lourd")
    suffix = os.path.splitext(file.filename or "voice.ogg")[1] or ".ogg"
    with tempfile.NamedTemporaryFile(suffix=suffix) as tmp:
        tmp.write(data)
        tmp.flush()
        segments, info = model().transcribe(tmp.name, language=language, vad_filter=True, beam_size=1)
        text = " ".join(s.text.strip() for s in segments).strip()
    return {"text": text, "language": info.language, "duration": info.duration}
