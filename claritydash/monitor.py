"""Varrimento periódico da rede, deteção de entradas/saídas e medição de latência."""

import concurrent.futures as cf
import ipaddress
import logging
import threading
import time

from . import netutils
from .classify import guess_type

log = logging.getLogger("claritydash")

# Estados do vizinho (Linux `ip neigh`) que provam presença; None = plataforma sem estados.
ALIVE_STATES = {None, "REACHABLE", "PERMANENT", "NOARP"}
UNSETTLED_STATES = {"STALE", "DELAY", "PROBE", "INCOMPLETE"}


def device_label(d):
    return d.get("name") or d.get("hostname") or d.get("vendor") or d.get("ip") or d.get("mac") or "Aparelho"


class Monitor:
    def __init__(self, store, vendors):
        self.store = store
        self.vendors = vendors
        self.pool = cf.ThreadPoolExecutor(max_workers=64, thread_name_prefix="scan")
        self.net = netutils.network_info()
        self.status = {"scanning": False, "last_scan": None, "duration": None,
                       "cidr": None, "hosts": 0, "found": 0, "error": None}
        self.last_latency = {"gateway": None, "internet": None}
        self._wake = threading.Event()
        self._scan_lock = threading.Lock()

    def start(self):
        threading.Thread(target=self._scan_loop, name="scanner", daemon=True).start()
        threading.Thread(target=self._latency_loop, name="latency", daemon=True).start()

    def request_scan(self):
        self._wake.set()

    # ---------------------------------------------------------------- ciclos
    def _scan_loop(self):
        while True:
            try:
                self.scan()
            except Exception as e:  # noqa: BLE001 — o ciclo nunca pode morrer
                log.exception("Falha no varrimento")
                self.status["error"] = str(e)
            interval = max(30, int(self.store.settings()["scan_interval"]))
            self._wake.wait(interval)
            self._wake.clear()

    def _latency_loop(self):
        last_prune = 0
        while True:
            try:
                target = self.store.settings()["latency_target"] or "1.1.1.1"
                gw = self.net.get("gateway")
                self.last_latency["gateway"] = netutils.ping_once(gw, 1.5) if gw else None
                self.last_latency["internet"] = netutils.ping_once(target, 2.0)
                if gw:
                    self.store.add_latency("gateway", self.last_latency["gateway"])
                self.store.add_latency("internet", self.last_latency["internet"])
                if time.time() - last_prune > 3600:
                    self.store.prune()
                    last_prune = time.time()
            except Exception:  # noqa: BLE001
                log.exception("Falha na medição de latência")
            time.sleep(60)

    # ---------------------------------------------------------------- varrimento
    def scan(self):
        if not self._scan_lock.acquire(blocking=False):
            return
        started = time.time()
        self.status.update(scanning=True, error=None)
        try:
            settings = self.store.settings()
            self.net = netutils.network_info()
            cidr, targets = netutils.scan_targets(settings["subnet"] or self.net["cidr"], self.net["local_ip"])
            self.status.update(cidr=cidr, hosts=len(targets))
            target_set = set(targets)

            latencies = dict(zip(targets, self.pool.map(lambda ip: netutils.ping_once(ip, 1.0), targets)))
            replied = {ip: ms for ip, ms in latencies.items() if ms is not None}

            arp = netutils.arp_table()
            if any(ip in target_set and ip not in replied and st in UNSETTLED_STATES
                   for ip, (_, st) in arp.items()):
                time.sleep(9)  # dá tempo ao kernel para confirmar/descartar vizinhos antigos
                arp = netutils.arp_table()

            alive = {}
            for ip in targets:
                mac, state = arp.get(ip, (None, "NONE"))
                if ip in replied or state in ALIVE_STATES:
                    alive[ip] = mac
            local = self.net["local_ip"]
            if local in target_set:
                alive[local] = self.net.get("mac")
                replied.setdefault(local, 0.0)

            names = netutils.reverse_dns_many(list(alive), self.pool)
            self._reconcile(alive, replied, names, settings, cidr)
            self.status.update(found=len(alive))
        finally:
            self.status.update(scanning=False, last_scan=time.time(), duration=round(time.time() - started, 1))
            self._scan_lock.release()

    def _reconcile(self, alive, replied, names, settings, cidr):
        now = time.time()
        first_run = self.store.count_devices() == 0
        devices = self.store.devices()
        by_mac = {d["mac"]: d for d in devices if d["mac"]}
        by_ip = {}
        for d in sorted(devices, key=lambda d: d["last_seen"] or 0):
            by_ip[d["ip"]] = d
        seen, new_count = set(), 0
        gateway, local = self.net.get("gateway"), self.net.get("local_ip")

        for ip, mac in alive.items():
            dev = by_mac.get(mac) if mac else None
            if dev is None:
                candidate = by_ip.get(ip)
                # Sem MAC só se associa pelo IP; com MAC, só se o registo antigo não tinha MAC.
                if candidate and (mac is None or not candidate["mac"]) and candidate["id"] not in seen:
                    dev = candidate
            hostname = names.get(ip)
            if dev is None:
                vendor = self.vendors.lookup(mac)
                dev_id = self.store.insert_device(
                    mac=mac, ip=ip, hostname=hostname, vendor=vendor,
                    guessed_type=guess_type(hostname, vendor, None, ip == gateway, ip == local),
                    randomized=int(netutils.is_randomized_mac(mac)) if mac else 0,
                    online=1, latency=replied.get(ip), first_seen=now, last_seen=now,
                    trusted=int(first_run or ip == local),
                )
                seen.add(dev_id)
                new_count += 1
                if not first_run:
                    d = {"hostname": hostname, "vendor": vendor, "ip": ip, "mac": mac}
                    name = device_label(d)
                    msg = f"Novo aparelho na rede: {name}" + ("" if name == ip else f" — IP {ip}") \
                        + (f", MAC {mac}" if mac else "")
                    self.store.add_event("new_device", msg, dev_id)
                    if settings["notify_new_device"]:
                        self.notify(settings, "⚠️ " + msg)
                continue

            seen.add(dev["id"])
            changes = {"last_seen": now, "online": 1, "latency": replied.get(ip)}
            if mac and not dev["mac"]:
                changes.update(mac=mac, randomized=int(netutils.is_randomized_mac(mac)))
            if hostname and hostname != dev["hostname"]:
                changes["hostname"] = hostname
            vendor = dev["vendor"] or self.vendors.lookup(mac or dev["mac"])
            if vendor and vendor != dev["vendor"]:
                changes["vendor"] = vendor
            if dev["ip"] != ip:
                changes["ip"] = ip
                self.store.add_event("ip_change", f"{device_label(dev)} mudou de IP: {dev['ip']} → {ip}", dev["id"])
            changes["guessed_type"] = guess_type(changes.get("hostname", dev["hostname"]), vendor,
                                                 dev["open_ports"], ip == gateway, ip == local)
            if not dev["online"]:
                self.store.add_event("online", f"{device_label(dev)} voltou a ficar online ({ip})", dev["id"])
                if dev["alert_offline"] and settings["notify_offline"]:
                    self.notify(settings, f"✅ {device_label(dev)} voltou a ficar online")
            self.store.update_device(dev["id"], **changes)

        net = ipaddress.ip_network(cidr)
        for dev in devices:
            if dev["id"] in seen or not dev["online"]:
                continue
            in_scope = dev["ip"] and ipaddress.ip_address(dev["ip"]) in net
            if in_scope and now - (dev["last_seen"] or 0) < int(settings["offline_after"]):
                continue
            self.store.update_device(dev["id"], online=0, latency=None)
            self.store.add_event("offline", f"{device_label(dev)} ficou offline", dev["id"])
            if dev["alert_offline"] and settings["notify_offline"]:
                self.notify(settings, f"🔴 {device_label(dev)} ficou offline")

        if first_run and new_count:
            self.store.add_event("info", f"Descoberta inicial: {new_count} aparelhos encontrados em {cidr}. "
                                         "Foram marcados como confiáveis.")

    def notify(self, settings, text):
        url = settings.get("webhook_url")
        if not url:
            return
        def send():
            try:
                netutils.send_webhook(url, text)
            except Exception as e:  # noqa: BLE001
                log.warning("Webhook falhou: %s", e)
        self.pool.submit(send)
