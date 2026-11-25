"""Fabricante a partir do MAC, usando a lista pública de OUIs do IEEE (descarregada para disco)."""

import os
import re
import threading
import urllib.request

OUI_URL = "https://standards-oui.ieee.org/oui/oui.txt"
_LINE_RE = re.compile(r"^\s*([0-9A-Fa-f]{2})-([0-9A-Fa-f]{2})-([0-9A-Fa-f]{2})\s+\(hex\)\s+(.+?)\s*$")


class VendorDB:
    def __init__(self, path):
        self.path = path
        self.map = {}
        self.lock = threading.Lock()
        self.updating = False
        self.error = None
        self.load()

    def load(self):
        mapping = {}
        try:
            with open(self.path, encoding="utf-8", errors="replace") as f:
                for line in f:
                    m = _LINE_RE.match(line)
                    if m:
                        mapping["".join(m.group(1, 2, 3)).lower()] = m.group(4)
        except OSError:
            pass
        with self.lock:
            self.map = mapping

    def lookup(self, mac):
        if not mac:
            return None
        return self.map.get(mac.replace(":", "")[:6].lower())

    @property
    def size(self):
        return len(self.map)

    def update(self):
        """Descarrega a lista do IEEE (≈5 MB). Bloqueante."""
        self.updating, self.error = True, None
        tmp = self.path + ".tmp"
        try:
            req = urllib.request.Request(OUI_URL, headers={"User-Agent": "ClarityDash"})
            with urllib.request.urlopen(req, timeout=60) as r, open(tmp, "wb") as f:
                while chunk := r.read(65536):
                    f.write(chunk)
            os.replace(tmp, self.path)
            self.load()
        except Exception as e:  # noqa: BLE001 — qualquer falha de rede/disco fica registada
            self.error = str(e)
            if os.path.exists(tmp):
                os.remove(tmp)
        finally:
            self.updating = False
        return self.error is None

    def update_async(self):
        if not self.updating:
            threading.Thread(target=self.update, daemon=True).start()
