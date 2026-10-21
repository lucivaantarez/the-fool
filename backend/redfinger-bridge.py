"""Local-only bridge between The Fool and the verified Redfinger inventory reader.

The bridge never exposes credentials and deliberately advertises no remote-action
capabilities. Each configured account owns a retained headless browser session.
"""
from __future__ import annotations

import json
import os
import sys
import threading
from dataclasses import asdict
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

MANAGER_ROOT = Path(os.getenv("REDFINGER_MANAGER_ROOT", r"C:\Users\Administrator\Project\redfinger-manager"))
sys.path.insert(0, str(MANAGER_ROOT / "src"))

from redfinger_manager.adapters.browser import BrowserSession  # noqa: E402
from redfinger_manager.adapters.cloudemulator.login import login  # noqa: E402
from redfinger_manager.application.device_inventory import load_device_inventory  # noqa: E402
from redfinger_manager.credentials import Credentials  # noqa: E402

HOST = "127.0.0.1"
PORT = int(os.getenv("REDFINGER_BRIDGE_PORT", "8790"))
TOKEN = os.getenv("REDFINGER_BRIDGE_TOKEN", "").strip()
DEFAULT_ENV = MANAGER_ROOT / ".env"
ENV_FILES = [Path(value.strip()) for value in os.getenv("REDFINGER_ACCOUNT_ENV_FILES", str(DEFAULT_ENV)).split(";") if value.strip()][:5]


class AccountSession:
    def __init__(self, env_file: Path, position: int) -> None:
        self.env_file = env_file
        self.id = f"S{position}"
        self.label = f"Redfinger account {position}"
        self.browser: BrowserSession | None = None

    def ensure_login(self) -> BrowserSession:
        if self.browser is not None and self.browser.page is not None:
            return self.browser
        browser = BrowserSession(headless=True)
        browser.__enter__()
        try:
            login(browser, Credentials.from_env(self.env_file))
        except Exception:
            browser.close()
            raise
        self.browser = browser
        return browser

    def inventory(self) -> list[dict]:
        try:
            devices = load_device_inventory(self.ensure_login())
        except Exception:
            if self.browser is not None:
                self.browser.close()
                self.browser = None
            devices = load_device_inventory(self.ensure_login())
        return [{**asdict(device), "sessionId": self.id, "account": self.label, "status": "Online"} for device in devices]


ACCOUNTS = [AccountSession(path, index + 1) for index, path in enumerate(ENV_FILES)]
LOCK = threading.Lock()


class Handler(BaseHTTPRequestHandler):
    server_version = "TheFoolRedfingerBridge/1"

    def log_message(self, message: str, *args: object) -> None:
        print(f"[redfinger-bridge] {self.address_string()} {message % args}")

    def send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def authorized(self) -> bool:
        return not TOKEN or self.headers.get("Authorization") == f"Bearer {TOKEN}"

    def do_GET(self) -> None:  # noqa: N802
        if not self.authorized():
            self.send_json(401, {"error": "Unauthorized"})
            return
        if urlparse(self.path).path == "/health":
            self.send_json(200, {"ok": True, "sessions": len(ACCOUNTS)})
            return
        if urlparse(self.path).path != "/v1/inventory":
            self.send_json(404, {"error": "Not found"})
            return
        try:
            with LOCK:
                sessions, devices = [], []
                for account in ACCOUNTS:
                    account_devices = account.inventory()
                    devices.extend(account_devices)
                    sessions.append({"id": account.id, "label": account.label, "status": "healthy", "deviceCount": len(account_devices)})
            self.send_json(200, {"sessions": sessions, "devices": devices, "capabilities": {"reboot": False, "renew": False, "capture": False}})
        except Exception as error:
            self.send_json(502, {"error": f"Inventory refresh failed: {type(error).__name__}"})

    def do_POST(self) -> None:  # noqa: N802
        if not self.authorized():
            self.send_json(401, {"error": "Unauthorized"})
            return
        self.send_json(409, {"error": "This bridge currently supports verified read-only inventory only."})


if __name__ == "__main__":
    if not ACCOUNTS:
        raise SystemExit("Configure at least one Redfinger account environment file.")
    print(f"Redfinger bridge listening on http://{HOST}:{PORT} for {len(ACCOUNTS)} session(s)")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
