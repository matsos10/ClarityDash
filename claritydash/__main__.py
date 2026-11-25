"""Arranque: python3 -m claritydash [--host 0.0.0.0] [--port 8080] [--data ./data]"""

import argparse
import logging
import os

from . import __version__
from .monitor import Monitor
from .server import App, serve
from .store import Store
from .vendors import VendorDB


def main():
    p = argparse.ArgumentParser(prog="claritydash", description="Gestão da rede de casa e dos aparelhos ligados.")
    p.add_argument("--host", default=os.environ.get("CLARITYDASH_HOST", "0.0.0.0"))
    p.add_argument("--port", type=int, default=int(os.environ.get("CLARITYDASH_PORT", "8080")))
    p.add_argument("--data", default=os.environ.get("CLARITYDASH_DATA", "data"),
                   help="pasta onde ficam a base de dados e a lista de fabricantes")
    p.add_argument("--no-scan", action="store_true", help="não iniciar o varrimento automático")
    p.add_argument("-v", "--verbose", action="store_true")
    args = p.parse_args()

    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.INFO,
                        format="%(asctime)s %(levelname)s %(message)s")
    log = logging.getLogger("claritydash")

    os.makedirs(args.data, exist_ok=True)
    store = Store(os.path.join(args.data, "claritydash.db"))
    vendors = VendorDB(os.path.join(args.data, "oui.txt"))
    if vendors.size == 0:
        log.info("A descarregar a lista de fabricantes (IEEE OUI) em segundo plano…")
        vendors.update_async()

    monitor = Monitor(store, vendors)
    if not args.no_scan:
        monitor.start()

    password = os.environ.get("CLARITYDASH_PASSWORD")
    if not password:
        log.warning("Sem palavra-passe: qualquer pessoa na rede pode abrir o painel. "
                    "Define CLARITYDASH_PASSWORD para a exigir.")
    httpd = serve(App(store, monitor, vendors, password), args.host, args.port)
    log.info("ClarityDash %s em http://%s:%d  (rede detetada: %s)", __version__,
             "localhost" if args.host in ("0.0.0.0", "::") else args.host, args.port, monitor.net.get("cidr"))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
