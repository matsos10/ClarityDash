"""Servidor HTTP: API JSON + interface web."""

import csv
import hmac
import io
import ipaddress
import json
import logging
import mimetypes
import os
import re
import secrets
import threading
import time
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

from . import netutils
from .classify import TYPES
from .store import DEFAULT_SETTINGS, EDITABLE_FIELDS

log = logging.getLogger("claritydash")
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
SESSION_TTL = 30 * 86400
MAX_BODY = 64 * 1024


class ApiError(Exception):
    def __init__(self, status, message):
        super().__init__(message)
        self.status, self.message = status, message


class App:
    def __init__(self, store, monitor, vendors, password=None):
        self.store, self.monitor, self.vendors = store, monitor, vendors
        self.password = password or None
        self.sessions = {}
        self.lock = threading.Lock()
        self.routes = []
        self._register()

    # ---------------------------------------------------------------- sessão
    def new_session(self):
        token = secrets.token_urlsafe(32)
        with self.lock:
            self.sessions[token] = time.time() + SESSION_TTL
        return token

    def valid_session(self, token):
        if not self.password:
            return True
        with self.lock:
            exp = self.sessions.get(token or "")
            if exp and exp > time.time():
                return True
            self.sessions.pop(token or "", None)
            return False

    # ---------------------------------------------------------------- rotas
    def route(self, method, pattern, public=False):
        def deco(fn):
            self.routes.append((method, re.compile(f"^{pattern}$"), fn, public))
            return fn
        return deco

    def _device_or_404(self, device_id):
        dev = self.store.device(device_id)
        if not dev:
            raise ApiError(404, "Aparelho não encontrado.")
        return dev

    def _register(self):
        r, store, mon = self.route, self.store, self.monitor

        @r("GET", "/api/session", public=True)
        def session(req, body, q):
            return {"auth_required": bool(self.password), "authenticated": req.authenticated}

        @r("POST", "/api/login", public=True)
        def login(req, body, q):
            if not self.password:
                return {"ok": True}
            if not hmac.compare_digest(str(body.get("password", "")).encode(), self.password.encode()):
                time.sleep(1)
                raise ApiError(401, "Palavra-passe incorreta.")
            req.set_cookie = self.new_session()
            return {"ok": True}

        @r("POST", "/api/logout", public=True)
        def logout(req, body, q):
            with self.lock:
                self.sessions.pop(req.session_token or "", None)
            req.set_cookie = ""
            return {"ok": True}

        @r("GET", "/api/overview")
        def overview(req, body, q):
            devices = store.devices()
            day_ago = time.time() - 86400
            return {
                "network": mon.net,
                "status": mon.status,
                "latency": mon.last_latency,
                "ping_available": netutils.PING_AVAILABLE,
                "counts": {
                    "total": len(devices),
                    "online": sum(d["online"] for d in devices),
                    "untrusted": sum(not d["trusted"] for d in devices),
                    "new_24h": sum((d["first_seen"] or 0) >= day_ago for d in devices),
                },
                "types": TYPES,
            }

        @r("POST", "/api/scan")
        def scan(req, body, q):
            mon.request_scan()
            return {"ok": True}

        @r("GET", "/api/devices")
        def devices(req, body, q):
            return {"devices": store.devices(), "types": TYPES}

        @r("POST", "/api/devices/trust-all")
        def trust_all(req, body, q):
            return {"updated": store.trust_all()}

        @r("GET", "/api/devices/(?P<id>[0-9a-f]+)")
        def device(req, body, q, id):
            dev = self._device_or_404(id)
            dev["events"] = store.events(100, device_id=id)
            return dev

        @r("PUT", "/api/devices/(?P<id>[0-9a-f]+)")
        def update_device(req, body, q, id):
            self._device_or_404(id)
            changes = {}
            for k, v in body.items():
                if k not in EDITABLE_FIELDS:
                    continue
                if k in ("trusted", "alert_offline"):
                    changes[k] = int(bool(v))
                elif k == "type":
                    if v and v not in TYPES:
                        raise ApiError(400, "Tipo inválido.")
                    changes[k] = v or ""
                else:
                    changes[k] = str(v)[:500]
            store.update_device(id, **changes)
            return self._device_or_404(id)

        @r("DELETE", "/api/devices/(?P<id>[0-9a-f]+)")
        def delete_device(req, body, q, id):
            self._device_or_404(id)
            store.delete_device(id)
            return {"ok": True}

        @r("POST", "/api/devices/(?P<id>[0-9a-f]+)/ping")
        def device_ping(req, body, q, id):
            dev = self._device_or_404(id)
            return netutils.ping_stats(dev["ip"], count=5)

        @r("POST", "/api/devices/(?P<id>[0-9a-f]+)/ports")
        def device_ports(req, body, q, id):
            dev = self._device_or_404(id)
            ports = netutils.port_scan(dev["ip"])
            store.update_device(id, open_ports=ports, ports_scanned_at=time.time())
            return {"ports": ports}

        @r("POST", "/api/devices/(?P<id>[0-9a-f]+)/wake")
        def device_wake(req, body, q, id):
            dev = self._device_or_404(id)
            if not dev["mac"]:
                raise ApiError(400, "Este aparelho não tem MAC conhecido.")
            mac = netutils.wake_on_lan(dev["mac"], self._broadcasts())
            store.add_event("wol", f"Wake-on-LAN enviado para {dev['name'] or dev['ip']} ({mac})", id)
            return {"ok": True, "mac": mac}

        @r("GET", "/api/events")
        def events(req, body, q):
            limit = min(int(q.get("limit", 200)), 1000)
            return {"events": store.events(limit, device_id=q.get("device"), kind=q.get("kind") or None)}

        @r("DELETE", "/api/events")
        def clear_events(req, body, q):
            store.clear_events()
            return {"ok": True}

        @r("GET", "/api/latency")
        def latency(req, body, q):
            hours = min(max(float(q.get("hours", 24)), 1), 24 * 14)
            return {"points": store.latency(time.time() - hours * 3600)}

        @r("GET", "/api/settings")
        def get_settings(req, body, q):
            return {"settings": store.settings(), "detected_cidr": mon.net.get("cidr"),
                    "vendors": {"count": self.vendors.size, "updating": self.vendors.updating,
                                "error": self.vendors.error}}

        @r("PUT", "/api/settings")
        def put_settings(req, body, q):
            clean = {}
            for k, v in body.items():
                if k not in DEFAULT_SETTINGS:
                    continue
                default = DEFAULT_SETTINGS[k]
                if isinstance(default, bool):
                    clean[k] = bool(v)
                elif isinstance(default, int):
                    try:
                        clean[k] = int(v)
                    except (TypeError, ValueError):
                        raise ApiError(400, f"Valor inválido em {k}.")
                else:
                    clean[k] = str(v).strip()
            if clean.get("subnet"):
                try:
                    net = ipaddress.ip_network(clean["subnet"], strict=False)
                except ValueError:
                    raise ApiError(400, "Sub-rede inválida (ex.: 192.168.1.0/24).")
                if net.version != 4 or net.prefixlen < 22:
                    raise ApiError(400, "A sub-rede tem de ser IPv4 e no máximo /22 (1024 endereços).")
                clean["subnet"] = str(net)
            if "scan_interval" in clean and not 30 <= clean["scan_interval"] <= 86400:
                raise ApiError(400, "O intervalo de varrimento tem de estar entre 30 s e 24 h.")
            if "offline_after" in clean and not 60 <= clean["offline_after"] <= 86400:
                raise ApiError(400, "O tempo até offline tem de estar entre 60 s e 24 h.")
            if clean.get("latency_target") and not netutils.valid_host(clean["latency_target"]):
                raise ApiError(400, "Alvo de latência inválido.")
            if clean.get("webhook_url") and not clean["webhook_url"].startswith(("http://", "https://")):
                raise ApiError(400, "O webhook tem de começar por http:// ou https://")
            store.save_settings(clean)
            if "subnet" in clean:
                mon.request_scan()
            return get_settings(req, body, q)

        @r("POST", "/api/settings/test-webhook")
        def test_webhook(req, body, q):
            url = body.get("url") or store.settings()["webhook_url"]
            if not url:
                raise ApiError(400, "Indica um URL de webhook.")
            try:
                status = netutils.send_webhook(url, "🔔 Teste de notificação do ClarityDash")
            except Exception as e:  # noqa: BLE001
                raise ApiError(502, f"O webhook falhou: {e}")
            return {"ok": True, "status": status}

        @r("POST", "/api/vendors/update")
        def update_vendors(req, body, q):
            self.vendors.update_async()
            return {"ok": True}

        @r("POST", "/api/tools/ping")
        def tool_ping(req, body, q):
            host = self._host(body.get("host"))
            return netutils.ping_stats(host, count=min(max(int(body.get("count", 4)), 1), 20))

        @r("POST", "/api/tools/dns")
        def tool_dns(req, body, q):
            return netutils.dns_lookup(self._host(body.get("name")))

        @r("POST", "/api/tools/ports")
        def tool_ports(req, body, q):
            host = self._host(body.get("host"))
            try:
                ports = netutils.parse_ports(body.get("ports"))
            except ValueError as e:
                raise ApiError(400, str(e) if "portas" in str(e) else "Lista de portas inválida.")
            return {"host": host, "ports": netutils.port_scan(host, ports)}

        @r("POST", "/api/tools/wake")
        def tool_wake(req, body, q):
            try:
                mac = netutils.wake_on_lan(str(body.get("mac", "")), self._broadcasts())
            except ValueError as e:
                raise ApiError(400, str(e))
            store.add_event("wol", f"Wake-on-LAN enviado para {mac}")
            return {"ok": True, "mac": mac}

        @r("GET", "/api/tools/public-ip")
        def tool_public_ip(req, body, q):
            try:
                return {"ip": netutils.public_ip()}
            except Exception as e:  # noqa: BLE001
                raise ApiError(502, f"Não foi possível obter o IP público: {e}")

        @r("GET", "/api/export")
        def export(req, body, q):
            devices = store.devices()
            if q.get("format") == "json":
                return devices
            cols = ["name", "type", "guessed_type", "ip", "mac", "hostname", "vendor", "owner", "location",
                    "trusted", "online", "first_seen", "last_seen", "notes"]
            buf = io.StringIO()
            w = csv.writer(buf)
            w.writerow(cols)
            for d in devices:
                row = dict(d)
                for k in ("first_seen", "last_seen"):
                    row[k] = time.strftime("%Y-%m-%d %H:%M", time.localtime(row[k])) if row[k] else ""
                w.writerow([row.get(c, "") for c in cols])
            req.raw_response = ("text/csv; charset=utf-8", buf.getvalue().encode("utf-8-sig"),
                                'attachment; filename="aparelhos.csv"')
            return None

    def _host(self, host):
        host = str(host or "").strip()
        if not netutils.valid_host(host):
            raise ApiError(400, "Endereço ou nome inválido.")
        return host

    def _broadcasts(self):
        b = ["255.255.255.255"]
        cidr = self.monitor.status.get("cidr") or self.monitor.net.get("cidr")
        if cidr:
            b.append(str(ipaddress.ip_network(cidr).broadcast_address))
        return b


def make_handler(app):
    class Handler(BaseHTTPRequestHandler):
        server_version = "ClarityDash"
        protocol_version = "HTTP/1.1"

        def log_message(self, fmt, *args):
            log.debug("%s - %s", self.address_string(), fmt % args)

        # ------------------------------------------------------------ util
        def _send(self, status, body, ctype="application/json; charset=utf-8", extra=None):
            self.send_response(status)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("X-Frame-Options", "DENY")
            for k, v in (extra or {}).items():
                self.send_header(k, v)
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)

        def _json(self, status, data, extra=None):
            self._send(status, json.dumps(data, ensure_ascii=False).encode(), extra=extra)

        def _static(self, path):
            name = "index.html" if path in ("/", "/index.html") else path[len("/static/"):]
            full = os.path.realpath(os.path.join(STATIC_DIR, name))
            if not full.startswith(os.path.realpath(STATIC_DIR) + os.sep) or not os.path.isfile(full):
                return self._send(404, b"Not found", "text/plain")
            ctype = mimetypes.guess_type(full)[0] or "application/octet-stream"
            if ctype.startswith("text/") or ctype.endswith("javascript"):
                ctype += "; charset=utf-8"
            with open(full, "rb") as f:
                self._send(200, f.read(), ctype)

        # ------------------------------------------------------------ dispatch
        def _handle(self):
            url = urlparse(self.path)
            if not url.path.startswith("/api/"):
                if self.command in ("GET", "HEAD"):
                    return self._static(url.path)
                return self._send(405, b"Method not allowed", "text/plain")

            cookie = SimpleCookie(self.headers.get("Cookie", ""))
            self.session_token = cookie["cd_session"].value if "cd_session" in cookie else None
            self.authenticated = app.valid_session(self.session_token)
            self.set_cookie = None
            self.raw_response = None
            q = {k: v[-1] for k, v in parse_qs(url.query).items()}

            for method, pattern, fn, public in app.routes:
                m = pattern.match(url.path)
                if not m or method != self.command:
                    continue
                try:
                    if not public and not self.authenticated:
                        raise ApiError(401, "Sessão necessária.")
                    body = self._body()
                    result = fn(self, body, q, **m.groupdict())
                except ApiError as e:
                    return self._json(e.status, {"error": e.message})
                except (ValueError, OSError) as e:
                    return self._json(400, {"error": str(e)})
                except Exception:  # noqa: BLE001
                    log.exception("Erro em %s %s", self.command, url.path)
                    return self._json(500, {"error": "Erro interno."})
                extra = {}
                if self.set_cookie is not None:
                    age = SESSION_TTL if self.set_cookie else 0
                    extra["Set-Cookie"] = (f"cd_session={self.set_cookie}; Path=/; HttpOnly; "
                                           f"SameSite=Strict; Max-Age={age}")
                if self.raw_response:
                    ctype, data, disposition = self.raw_response
                    return self._send(200, data, ctype, {"Content-Disposition": disposition})
                return self._json(200, result, extra)
            return self._json(404, {"error": "Rota desconhecida."})

        def _body(self):
            if self.command in ("GET", "HEAD", "DELETE"):
                return {}
            length = int(self.headers.get("Content-Length") or 0)
            if length > MAX_BODY:
                raise ApiError(413, "Pedido demasiado grande.")
            # Exigir JSON impede envios "simples" de outros sites (proteção CSRF).
            if not (self.headers.get("Content-Type") or "").startswith("application/json"):
                raise ApiError(415, "Usa Content-Type: application/json.")
            raw = self.rfile.read(length) if length else b"{}"
            try:
                data = json.loads(raw or b"{}")
            except json.JSONDecodeError:
                raise ApiError(400, "JSON inválido.")
            if not isinstance(data, dict):
                raise ApiError(400, "Esperava um objeto JSON.")
            return data

        do_GET = do_POST = do_PUT = do_DELETE = do_HEAD = _handle

    return Handler


def serve(app, host, port):
    httpd = ThreadingHTTPServer((host, port), make_handler(app))
    httpd.daemon_threads = True
    return httpd
