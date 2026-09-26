import json
import os
import secrets
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data" / "store.json"
KEY_FILE = ROOT / "data" / "studio.key"
STATUSES = {"received", "confirmed", "packed", "shipped"}
PAGES = [
    "", "objects.html", "art.html", "design.html", "services.html",
    "work.html", "privacy.html",
]


def studio_key():
    env = os.environ.get("MONOLITH_STUDIO_KEY")
    if env:
        return env
    if KEY_FILE.exists():
        return KEY_FILE.read_text(encoding="utf-8").strip()
    KEY_FILE.parent.mkdir(exist_ok=True)
    key = secrets.token_urlsafe(18)
    KEY_FILE.write_text(key, encoding="utf-8")
    print(f"Studio key written to {KEY_FILE}")
    return key


def load():
    if not DATA.exists():
        store = {"seq": 1041, "orders": [], "interest": [], "follows": [], "inquiries": []}
    else:
        store = json.loads(DATA.read_text(encoding="utf-8"))
    store.setdefault("interest", [])
    store.setdefault("follows", [])
    store.setdefault("inquiries", [])
    return store


def save(store):
    DATA.parent.mkdir(exist_ok=True)
    DATA.write_text(json.dumps(store, ensure_ascii=False, indent=2), encoding="utf-8")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def read_json(self):
        length = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(length) or b"{}")

    def send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.startswith("/api/orders/"):
            token = self.path.rsplit("/", 1)[-1]
            store = load()
            order = next((item for item in store["orders"] if item["token"] == token), None)
            if not order:
                self.send_json({"error": "missing"}, 404)
                return
            public = {key: order[key] for key in ("code", "items", "status", "address", "carrier", "tracking")}
            self.send_json(public)
            return
        if self.path.split("?", 1)[0] == "/api/admin/orders":
            if self.headers.get("X-Studio-Key") != studio_key():
                self.send_json({"error": "unauthorized"}, 401)
                return
            store = load()
            self.send_json({
                "orders": store["orders"],
                "interest": store["interest"],
                "follows": store["follows"],
                "inquiries": store["inquiries"],
            })
            return
        if self.path.split("?", 1)[0] == "/sitemap.xml":
            host = self.headers.get("Host", "127.0.0.1:8765")
            scheme = "https" if self.headers.get("X-Forwarded-Proto") == "https" else "http"
            urls = "\n".join(
                f"  <url><loc>{scheme}://{host}/{page}</loc></url>" for page in PAGES
            )
            body = f"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n{urls}\n</urlset>\n".encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/xml")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        local = self.translate_path(self.path)
        if os.path.isdir(local):
            super().do_GET()
            return
        if not os.path.isfile(local):
            self.serve_page("404.html", 404)
            return
        super().do_GET()

    def serve_page(self, name, status):
        body = (ROOT / name).read_bytes()
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/orders":
            body = self.read_json()
            store = load()
            store["seq"] += 1
            order = {
                "code": f"ML-{store['seq']}",
                "token": secrets.token_urlsafe(18),
                "name": body.get("name", ""),
                "email": body.get("email", ""),
                "phone": body.get("phone", ""),
                "address": body.get("address", ""),
                "note": body.get("note", ""),
                "items": body.get("items", []),
                "status": "received",
                "carrier": "",
                "tracking": "",
            }
            store["orders"].append(order)
            save(store)
            self.send_json({"code": order["code"], "token": order["token"]})
            return
        if path == "/api/interest":
            body = self.read_json()
            store = load()
            store["interest"].append({
                "object": body.get("object", ""),
                "email": body.get("email", ""),
                "note": body.get("note", ""),
            })
            save(store)
            self.send_json({"ok": True})
            return
        if path == "/api/follow":
            body = self.read_json()
            email = str(body.get("email", "")).strip()
            if "@" not in email:
                self.send_json({"error": "email"}, 400)
                return
            store = load()
            if email.lower() not in {item["email"].lower() for item in store["follows"]}:
                store["follows"].append({"email": email})
            save(store)
            self.send_json({"ok": True})
            return
        if path == "/api/inquire":
            body = self.read_json()
            email = str(body.get("email", "")).strip()
            note = str(body.get("note", "")).strip()
            if "@" not in email or not note:
                self.send_json({"error": "incomplete"}, 400)
                return
            store = load()
            store["inquiries"].append({
                "subject": str(body.get("subject", "")).strip(),
                "name": str(body.get("name", "")).strip(),
                "email": email,
                "phone": str(body.get("phone", "")).strip(),
                "line": str(body.get("line", "")).strip(),
                "note": note,
            })
            save(store)
            self.send_json({"ok": True})
            return
        if path.startswith("/api/admin/orders/"):
            if self.headers.get("X-Studio-Key") != studio_key():
                self.send_json({"error": "unauthorized"}, 401)
                return
            token = self.path.rsplit("/", 1)[-1]
            body = self.read_json()
            store = load()
            order = next((item for item in store["orders"] if item["token"] == token), None)
            if not order:
                self.send_json({"error": "missing"}, 404)
                return
            status = body.get("status", order["status"])
            if status in STATUSES:
                order["status"] = status
            order["carrier"] = body.get("carrier", order["carrier"])
            order["tracking"] = body.get("tracking", order["tracking"])
            save(store)
            self.send_json({"ok": True})
            return
        self.send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 8765), Handler).serve_forever()
