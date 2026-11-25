"""Persistência em SQLite (aparelhos, eventos, latência, configurações)."""

import json
import secrets
import sqlite3
import threading
import time

SCHEMA = """
CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    mac TEXT, ip TEXT, hostname TEXT, vendor TEXT,
    name TEXT DEFAULT '', type TEXT DEFAULT '', guessed_type TEXT DEFAULT 'other',
    owner TEXT DEFAULT '', location TEXT DEFAULT '', notes TEXT DEFAULT '',
    trusted INTEGER DEFAULT 0, alert_offline INTEGER DEFAULT 0, randomized INTEGER DEFAULT 0,
    online INTEGER DEFAULT 0, latency REAL,
    first_seen REAL, last_seen REAL,
    open_ports TEXT DEFAULT '[]', ports_scanned_at REAL
);
CREATE INDEX IF NOT EXISTS devices_mac ON devices(mac);
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts REAL NOT NULL, device_id TEXT, kind TEXT NOT NULL, message TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS events_ts ON events(ts);
CREATE TABLE IF NOT EXISTS latency (ts REAL NOT NULL, target TEXT NOT NULL, ms REAL);
CREATE INDEX IF NOT EXISTS latency_ts ON latency(ts);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
"""

DEFAULT_SETTINGS = {
    "subnet": "",               # vazio = detetar automaticamente
    "scan_interval": 120,       # segundos entre varrimentos
    "offline_after": 300,       # segundos sem resposta até ficar "offline"
    "latency_target": "1.1.1.1",
    "webhook_url": "",
    "notify_new_device": True,
    "notify_offline": True,     # só para aparelhos com "alertar quando offline"
}

EDITABLE_FIELDS = {"name", "type", "owner", "location", "notes", "trusted", "alert_offline"}


class Store:
    def __init__(self, path):
        self.lock = threading.RLock()
        self.db = sqlite3.connect(path, check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        with self.lock:
            self.db.execute("PRAGMA journal_mode=WAL")
            self.db.executescript(SCHEMA)
            self.db.commit()

    def _exec(self, sql, args=()):
        with self.lock:
            cur = self.db.execute(sql, args)
            self.db.commit()
            return cur

    def _all(self, sql, args=()):
        with self.lock:
            return [dict(r) for r in self.db.execute(sql, args).fetchall()]

    # ---------------------------------------------------------------- configurações
    def settings(self):
        values = dict(DEFAULT_SETTINGS)
        for row in self._all("SELECT key, value FROM settings"):
            if row["key"] in values:
                values[row["key"]] = json.loads(row["value"])
        return values

    def save_settings(self, values):
        with self.lock:
            for k, v in values.items():
                self.db.execute("INSERT OR REPLACE INTO settings(key, value) VALUES(?, ?)", (k, json.dumps(v)))
            self.db.commit()

    # ---------------------------------------------------------------- aparelhos
    @staticmethod
    def _device(row):
        row["open_ports"] = json.loads(row.get("open_ports") or "[]")
        row["trusted"], row["alert_offline"] = bool(row["trusted"]), bool(row["alert_offline"])
        row["online"], row["randomized"] = bool(row["online"]), bool(row["randomized"])
        return row

    def devices(self):
        return [self._device(r) for r in self._all("SELECT * FROM devices ORDER BY online DESC, ip")]

    def device(self, device_id):
        rows = self._all("SELECT * FROM devices WHERE id = ?", (device_id,))
        return self._device(rows[0]) if rows else None

    def count_devices(self):
        with self.lock:
            return self.db.execute("SELECT COUNT(*) FROM devices").fetchone()[0]

    def insert_device(self, **fields):
        fields.setdefault("id", secrets.token_hex(6))
        cols = ", ".join(fields)
        self._exec(f"INSERT INTO devices({cols}) VALUES({', '.join('?' * len(fields))})", tuple(fields.values()))
        return fields["id"]

    def update_device(self, device_id, **fields):
        if not fields:
            return
        if "open_ports" in fields:
            fields["open_ports"] = json.dumps(fields["open_ports"])
        sets = ", ".join(f"{k} = ?" for k in fields)
        self._exec(f"UPDATE devices SET {sets} WHERE id = ?", (*fields.values(), device_id))

    def delete_device(self, device_id):
        self._exec("DELETE FROM devices WHERE id = ?", (device_id,))
        self._exec("DELETE FROM events WHERE device_id = ?", (device_id,))

    def trust_all(self):
        return self._exec("UPDATE devices SET trusted = 1 WHERE trusted = 0").rowcount

    # ---------------------------------------------------------------- eventos
    def add_event(self, kind, message, device_id=None):
        self._exec("INSERT INTO events(ts, device_id, kind, message) VALUES(?, ?, ?, ?)",
                   (time.time(), device_id, kind, message))

    def events(self, limit=200, device_id=None, kind=None):
        sql, args = "SELECT * FROM events WHERE 1=1", []
        if device_id:
            sql += " AND device_id = ?"
            args.append(device_id)
        if kind:
            sql += " AND kind = ?"
            args.append(kind)
        sql += " ORDER BY ts DESC, id DESC LIMIT ?"
        args.append(int(limit))
        return self._all(sql, args)

    def clear_events(self):
        self._exec("DELETE FROM events")

    # ---------------------------------------------------------------- latência
    def add_latency(self, target, ms):
        self._exec("INSERT INTO latency(ts, target, ms) VALUES(?, ?, ?)", (time.time(), target, ms))

    def latency(self, since):
        return self._all("SELECT ts, target, ms FROM latency WHERE ts >= ? ORDER BY ts", (since,))

    def prune(self, latency_days=14, event_days=180):
        now = time.time()
        self._exec("DELETE FROM latency WHERE ts < ?", (now - latency_days * 86400,))
        self._exec("DELETE FROM events WHERE ts < ?", (now - event_days * 86400,))
