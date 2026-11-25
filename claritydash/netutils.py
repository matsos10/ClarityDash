"""Descoberta e ferramentas de rede (apenas biblioteca padrão)."""

import concurrent.futures as cf
import ipaddress
import json
import platform
import re
import shutil
import socket
import struct
import subprocess
import time
import urllib.request

SYSTEM = platform.system()
MAX_HOSTS = 1024
PING_AVAILABLE = shutil.which("ping") is not None

COMMON_PORTS = {
    21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS", 80: "HTTP",
    110: "POP3", 139: "NetBIOS", 143: "IMAP", 443: "HTTPS", 445: "SMB",
    515: "LPD (impressora)", 548: "AFP", 554: "RTSP (câmara)", 631: "IPP (impressora)",
    1883: "MQTT", 3000: "HTTP alt", 3306: "MySQL", 3389: "RDP (área de trabalho remota)",
    5000: "HTTP alt / UPnP", 5432: "PostgreSQL", 5900: "VNC", 6466: "Android TV remote",
    7000: "AirPlay", 8008: "Chromecast", 8009: "Chromecast", 8080: "HTTP alt",
    8123: "Home Assistant", 8443: "HTTPS alt", 8883: "MQTT TLS", 9000: "HTTP alt",
    9100: "Impressora (RAW)", 32400: "Plex", 49152: "UPnP", 62078: "iPhone/iPad (sync)",
}
WEB_PORTS = {80: "http", 443: "https", 3000: "http", 5000: "http", 8080: "http",
             8123: "http", 8443: "https", 9000: "http", 32400: "http"}

_HEX = r"[0-9a-fA-F]{1,2}"
_MAC_RE = re.compile(rf"(?<![0-9a-fA-F])({_HEX})[:-]({_HEX})[:-]({_HEX})[:-]({_HEX})[:-]({_HEX})[:-]({_HEX})(?![0-9a-fA-F])")
_IP_RE = re.compile(r"\b(\d{1,3}(?:\.\d{1,3}){3})\b")
_TIME_RE = re.compile(r"[=<]\s*([\d.,]+)\s*ms", re.I)
_HOST_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9.\-:]{0,252}$")


def _run(cmd, timeout=5.0):
    try:
        return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, errors="replace")
    except (OSError, subprocess.SubprocessError):
        return None


def valid_host(host):
    """Aceita apenas IP/hostname simples (nunca algo que pareça uma opção de comando)."""
    return bool(host) and bool(_HOST_RE.match(host))


def normalize_mac(text):
    m = _MAC_RE.search(text or "")
    if not m:
        return None
    return ":".join(p.zfill(2) for p in m.groups()).lower()


def valid_mac(mac):
    return bool(mac) and mac not in ("00:00:00:00:00:00", "ff:ff:ff:ff:ff:ff") \
        and not mac.startswith(("01:00:5e", "33:33"))


def is_randomized_mac(mac):
    """MAC "localmente administrado" — típico de telemóveis com MAC privado/aleatório."""
    try:
        return bool(int(mac.split(":")[0], 16) & 0x02)
    except (ValueError, AttributeError, IndexError):
        return False


# ---------------------------------------------------------------- ping / alcance

def _ping_cmd(host, timeout):
    if SYSTEM == "Windows":
        return ["ping", "-n", "1", "-w", str(int(timeout * 1000)), host]
    if SYSTEM == "Darwin":
        return ["ping", "-n", "-c", "1", "-W", str(int(timeout * 1000)), host]
    return ["ping", "-n", "-c", "1", "-W", str(max(1, round(timeout))), host]


def _tcp_probe(host, timeout):
    """Alternativa ao ping: uma ligação recusada também prova que o aparelho existe."""
    for port in (80, 443, 22, 445, 62078):
        start = time.perf_counter()
        try:
            with socket.create_connection((host, port), timeout=timeout):
                pass
            return round((time.perf_counter() - start) * 1000, 2)
        except ConnectionRefusedError:
            return round((time.perf_counter() - start) * 1000, 2)
        except OSError:
            continue
    return None


def ping_once(host, timeout=1.0):
    """Latência em ms, ou None se não houver resposta."""
    if not valid_host(host):
        return None
    if not PING_AVAILABLE:
        return _tcp_probe(host, timeout / 2)
    start = time.perf_counter()
    r = _run(_ping_cmd(host, timeout), timeout=timeout + 2)
    if r is None or r.returncode != 0 or "ttl" not in r.stdout.lower():
        return None
    m = _TIME_RE.search(r.stdout)
    if m:
        try:
            return float(m.group(1).replace(",", "."))
        except ValueError:
            pass
    return round((time.perf_counter() - start) * 1000, 2)


def ping_stats(host, count=4, timeout=1.0):
    results = []
    for i in range(count):
        results.append(ping_once(host, timeout))
        if i < count - 1:
            time.sleep(0.2)
    ok = [r for r in results if r is not None]
    return {
        "host": host,
        "sent": count,
        "received": len(ok),
        "loss": round(100 * (count - len(ok)) / count),
        "min": min(ok) if ok else None,
        "avg": round(sum(ok) / len(ok), 2) if ok else None,
        "max": max(ok) if ok else None,
        "results": results,
    }


# ---------------------------------------------------------------- tabela ARP

def arp_table():
    """{ip: (mac, estado)}. O estado só existe em Linux com `ip neigh` (senão None)."""
    table = {}
    if SYSTEM == "Linux":
        r = _run(["ip", "-4", "neigh", "show"]) if shutil.which("ip") else None
        if r is not None and r.returncode == 0:
            for line in r.stdout.splitlines():
                parts = line.split()
                if "lladdr" not in parts:
                    continue
                mac = normalize_mac(parts[parts.index("lladdr") + 1])
                if valid_mac(mac):
                    table[parts[0]] = (mac, parts[-1].upper())
            return table
        try:
            with open("/proc/net/arp") as f:
                next(f, None)
                for line in f:
                    cols = line.split()
                    if len(cols) >= 4 and cols[2] != "0x0":
                        mac = normalize_mac(cols[3])
                        if valid_mac(mac):
                            table[cols[0]] = (mac, None)
            return table
        except OSError:
            pass
    r = _run(["arp", "-a"])
    if r is not None:
        for line in r.stdout.splitlines():
            ip, mac = _IP_RE.search(line), normalize_mac(line)
            if ip and valid_mac(mac):
                table[ip.group(1)] = (mac, None)
    return table


# ---------------------------------------------------------------- informação da rede

def _local_ip_fallback():
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("10.254.254.254", 1))
            return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"


def _hex_le_ip(value):
    return socket.inet_ntoa(struct.pack("<L", int(value, 16)))


def network_info():
    info = {"interface": None, "local_ip": None, "prefix": None, "gateway": None, "mac": None}

    if SYSTEM == "Linux":
        if shutil.which("ip"):
            r = _run(["ip", "-4", "route", "show", "default"])
            m = r and re.search(r"default via (\S+) dev (\S+)", r.stdout)
            if m:
                info["gateway"], info["interface"] = m.group(1), m.group(2)
            if info["interface"]:
                r = _run(["ip", "-o", "-4", "addr", "show", "dev", info["interface"]])
                m = r and re.search(r"inet (\d+\.\d+\.\d+\.\d+)/(\d+)", r.stdout)
                if m:
                    info["local_ip"], info["prefix"] = m.group(1), int(m.group(2))
        if not info["gateway"]:
            try:
                with open("/proc/net/route") as f:
                    rows = [line.split() for line in f.readlines()[1:]]
                local = _local_ip_fallback()
                for row in rows:
                    if row[1] == "00000000" and row[7] == "00000000":
                        info["gateway"], info["interface"] = _hex_le_ip(row[2]), row[0]
                for row in rows:
                    if row[0] == info["interface"] and row[1] != "00000000":
                        mask = int(row[7], 16)
                        net = ipaddress.ip_network(f"{_hex_le_ip(row[1])}/{bin(mask).count('1')}", strict=False)
                        if ipaddress.ip_address(local) in net:
                            info["local_ip"], info["prefix"] = local, net.prefixlen
            except (OSError, ValueError, IndexError):
                pass
        if info["interface"]:
            try:
                with open(f"/sys/class/net/{info['interface']}/address") as f:
                    info["mac"] = normalize_mac(f.read())
            except OSError:
                pass

    elif SYSTEM == "Darwin":
        r = _run(["route", "-n", "get", "default"])
        if r:
            g, i = re.search(r"gateway:\s*(\S+)", r.stdout), re.search(r"interface:\s*(\S+)", r.stdout)
            info["gateway"] = g.group(1) if g else None
            info["interface"] = i.group(1) if i else None
        if info["interface"]:
            r = _run(["ifconfig", info["interface"]])
            if r:
                m = re.search(r"inet (\d+\.\d+\.\d+\.\d+) netmask (0x[0-9a-fA-F]+)", r.stdout)
                if m:
                    info["local_ip"], info["prefix"] = m.group(1), bin(int(m.group(2), 16)).count("1")
                e = re.search(r"ether (\S+)", r.stdout)
                info["mac"] = normalize_mac(e.group(1)) if e else None

    elif SYSTEM == "Windows":
        r = _run(["route", "print", "-4", "0.0.0.0"])
        m = r and re.search(r"^\s*0\.0\.0\.0\s+0\.0\.0\.0\s+(\d+\.\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+\.\d+)",
                            r.stdout, re.M)
        if m:
            info["gateway"], info["local_ip"] = m.group(1), m.group(2)

    info["local_ip"] = info["local_ip"] or _local_ip_fallback()
    info["prefix"] = info["prefix"] or 24
    info["cidr"] = str(ipaddress.ip_interface(f"{info['local_ip']}/{info['prefix']}").network)
    return info


def scan_targets(cidr, local_ip=None):
    """Lista de IPs a varrer (limitada a MAX_HOSTS; redes maiores ficam pelo /24 local)."""
    net = ipaddress.ip_network(cidr, strict=False)
    if net.num_addresses > MAX_HOSTS + 2 and local_ip:
        net = ipaddress.ip_network(f"{local_ip}/24", strict=False)
    return str(net), [str(h) for h in net.hosts()][:MAX_HOSTS]


def reverse_dns_many(ips, pool, timeout=4.0):
    def lookup(ip):
        try:
            return socket.gethostbyaddr(ip)[0]
        except (OSError, UnicodeError):
            return None

    futures = {pool.submit(lookup, ip): ip for ip in ips}
    done, _ = cf.wait(futures, timeout=timeout)
    return {futures[f]: f.result() for f in done if f.result()}


# ---------------------------------------------------------------- ferramentas

def parse_ports(text, limit=2048):
    if not text or not str(text).strip():
        return sorted(COMMON_PORTS)
    ports = set()
    for part in str(text).replace(" ", "").split(","):
        if not part:
            continue
        if "-" in part:
            a, b = part.split("-", 1)
            ports.update(range(int(a), int(b) + 1))
        else:
            ports.add(int(part))
    ports = sorted(p for p in ports if 0 < p < 65536)
    if not ports or len(ports) > limit:
        raise ValueError(f"Indica entre 1 e {limit} portas.")
    return ports


def port_scan(host, ports=None, timeout=0.6):
    if not valid_host(host):
        raise ValueError("Endereço inválido.")
    ip = socket.gethostbyname(host)
    ports = ports or sorted(COMMON_PORTS)

    def check(port):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(timeout)
            return port if s.connect_ex((ip, port)) == 0 else None

    with cf.ThreadPoolExecutor(max_workers=min(128, len(ports))) as ex:
        found = [p for p in ex.map(check, ports) if p]
    return [{"port": p, "service": COMMON_PORTS.get(p, ""), "web": WEB_PORTS.get(p)} for p in found]


def wake_on_lan(mac, broadcasts=("255.255.255.255",)):
    mac = normalize_mac(mac)
    if not valid_mac(mac):
        raise ValueError("MAC inválido.")
    packet = b"\xff" * 6 + bytes.fromhex(mac.replace(":", "")) * 16
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        for addr in dict.fromkeys(broadcasts):
            for port in (9, 7):
                try:
                    s.sendto(packet, (addr, port))
                except OSError:
                    pass
    return mac


def dns_lookup(name):
    if not valid_host(name):
        raise ValueError("Nome inválido.")
    start = time.perf_counter()
    try:
        infos = socket.getaddrinfo(name, None)
    except socket.gaierror as e:
        return {"name": name, "addresses": [], "ms": None, "error": str(e)}
    addrs = list(dict.fromkeys(i[4][0] for i in infos))
    return {"name": name, "addresses": addrs, "ms": round((time.perf_counter() - start) * 1000, 1)}


def public_ip():
    req = urllib.request.Request("https://api.ipify.org?format=json", headers={"User-Agent": "ClarityDash"})
    with urllib.request.urlopen(req, timeout=6) as r:
        return json.loads(r.read().decode())["ip"]


def send_webhook(url, text):
    """Envia uma notificação. ntfy recebe texto simples; o resto (Discord, Slack, genérico) recebe JSON."""
    if not url.startswith(("http://", "https://")):
        raise ValueError("O URL do webhook tem de começar por http:// ou https://")
    if "ntfy" in url:
        body, ctype = text.encode(), "text/plain; charset=utf-8"
    else:
        body = json.dumps({"text": text, "content": text, "message": text}).encode()
        ctype = "application/json"
    req = urllib.request.Request(url, data=body, method="POST",
                                 headers={"Content-Type": ctype, "User-Agent": "ClarityDash"})
    with urllib.request.urlopen(req, timeout=8) as r:
        return r.status
