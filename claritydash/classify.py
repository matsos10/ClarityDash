"""Adivinha o tipo de aparelho a partir do hostname, fabricante e portas abertas."""

import re

TYPES = {
    "phone": "Smartphone", "tablet": "Tablet", "computer": "Computador", "server": "Servidor / NAS",
    "tv": "TV / Streaming", "console": "Consola", "speaker": "Coluna / Assistente", "camera": "Câmara",
    "printer": "Impressora", "iot": "Casa inteligente", "network": "Equipamento de rede", "other": "Outro",
}

# Palavras com mais de 4 letras procuram-se como substring; as curtas têm de ser uma "palavra" inteira.
_RULES = [
    ("network", ["router", "gateway", "access point", "repeater", "extender", "ubiquiti", "unifi",
                 "mikrotik", "netgear", "fritz", "openwrt", "mesh", "deco", "eero", "orbi", "ap"]),
    ("tablet", ["ipad", "kindle", "galaxy-tab", "tab"]),
    ("phone", ["iphone", "android", "galaxy", "pixel", "redmi", "oneplus", "motorola", "moto", "poco"]),
    ("tv", ["bravia", "chromecast", "firetv", "fire-tv", "appletv", "apple-tv", "webos", "tizen",
            "shield", "roku", "tv", "lgtv"]),
    ("printer", ["printer", "epson", "brother", "canon", "laserjet", "officejet", "deskjet",
                 "kyocera", "xerox", "lexmark"]),
    ("console", ["playstation", "nintendo", "xbox", "ps4", "ps5"]),
    ("speaker", ["sonos", "homepod", "google-home", "nest-mini", "nest-audio", "echo", "alexa"]),
    ("camera", ["camera", "ipcam", "hikvision", "dahua", "reolink", "ring", "wyze", "arlo", "eufy", "cam"]),
    ("iot", ["espressif", "tuya", "shelly", "sonoff", "tasmota", "yeelight", "philips lighting",
             "signify", "meross", "broadlink", "ecobee", "roborock", "dyson", "esp", "hue", "kasa",
             "nest", "plug", "bulb"]),
    ("server", ["raspberry", "pihole", "pi-hole", "synology", "qnap", "unraid", "truenas",
                "homeassistant", "home-assistant", "server", "nas"]),
]

_COMPUTER_WORDS = ["macbook", "imac", "mac-mini", "macmini", "desktop", "laptop", "thinkpad",
                  "notebook", "workstation", "surface", "pc", "dell", "lenovo", "asus", "hp"]

_PORT_RULES = [
    ({9100, 631, 515}, "printer"), ({62078}, "phone"), ({554}, "camera"), ({8008, 8009, 6466, 7000}, "tv"),
    ({8123, 32400, 1883}, "server"), ({3389, 445, 139}, "computer"),
]


def guess_type(hostname=None, vendor=None, ports=None, is_gateway=False, is_self=False):
    if is_gateway:
        return "network"
    if is_self:
        return "server"
    text = f"{hostname or ''} {vendor or ''}".lower()
    tokens = set(re.split(r"[^a-z0-9]+", text))

    def matches(words):
        return any((len(w) > 4 and w in text) or w in tokens for w in words)

    for kind, words in _RULES:
        if matches(words):
            return kind
    open_ports = {p["port"] if isinstance(p, dict) else p for p in (ports or [])}
    for needed, kind in _PORT_RULES:
        if open_ports & needed:
            return kind
    return "computer" if matches(_COMPUTER_WORDS) else "other"
