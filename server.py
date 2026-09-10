#!/usr/bin/env python3
"""
Useless Projects 3.0 — Real-Time Server with Public Tunnel Integration
Handles real-time SSE broadcasts, REST endpoints, static files, and public internet tunnels.
"""

import http.server
import socketserver
import json
import os
import sys
import threading
import time
import urllib.parse
from datetime import datetime
import subprocess
import re
import queue
import io

PORT = int(os.environ.get("PORT", 8000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Render.com (and most PaaS) expose the public URL via env vars.
IS_RENDER = bool(os.environ.get("RENDER"))
RENDER_EXTERNAL_URL = os.environ.get("RENDER_EXTERNAL_URL", "").rstrip("/")

# Vendored segno (pure-Python QR generator) so the QR is served from THIS server
# and never depends on external image APIs that campus networks may block.
sys.path.insert(0, os.path.join(BASE_DIR, "vendor"))

ALLOWED_QR_TYPES = {"image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"}
MAX_QR_SIZE = 5 * 1024 * 1024  # 5 MB

class StateManager:
    def __init__(self):
        self.lock = threading.Lock()
        self.target = 32
        self.paused = False
        self.fired = False
        self.attendees = []
        self.clients = set()
        self.public_url = RENDER_EXTERNAL_URL
        self.custom_qr = None  # (mime_type, bytes) — admin-uploaded QR image
        self.local_ip = self._get_local_ip()
        self.default_names = [
            "aadhi", "nandana", "sreehari", "fathima", "anaswara",
            "jithin", "devika", "arjun", "meenakshi", "rahul",
            "hiba", "abhinav", "gowri", "sanjay", "aleena", "vishnu"
        ]

    def _get_local_ip(self):
        try:
            import socket
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except Exception:
            return "127.0.0.1"

    def get_state(self):
        with self.lock:
            count = len(self.attendees)
            roots_lit = min(24, round(count / self.target * 24)) if self.target > 0 else 0
            armed = count >= self.target
            return {
                "target": self.target,
                "paused": self.paused,
                "fired": self.fired,
                "attendees": list(self.attendees),
                "count": count,
                "rootsLit": roots_lit,
                "armed": armed,
                "publicUrl": self.public_url,
                "localIp": self.local_ip,
                "port": PORT
            }

    def add_client(self, client_queue):
        with self.lock:
            self.clients.add(client_queue)

    def remove_client(self, client_queue):
        with self.lock:
            self.clients.discard(client_queue)

    def broadcast(self, event_type, data):
        state = self.get_state()
        msg = f"event: {event_type}\ndata: {json.dumps({'type': event_type, 'payload': data, 'state': state})}\n\n"
        with self.lock:
            for client in list(self.clients):
                try:
                    client.put(msg)
                except Exception:
                    self.clients.discard(client)

    def scan(self, ticket=None, name=None):
        with self.lock:
            if self.paused:
                return False, "System is currently paused by admin.", self.get_state()
            if self.fired:
                return False, "Ceremony has already been fired.", self.get_state()
            if len(self.attendees) >= self.target:
                return False, "Target makers already reached!", self.get_state()

            idx = len(self.attendees)
            if not name:
                base_name = self.default_names[idx % len(self.default_names)]
                suffix = f" {idx // len(self.default_names) + 1}" if idx >= len(self.default_names) else ""
                name = f"{base_name}{suffix}"
            if not ticket:
                ticket = f"THUB-{(3210 + idx * 7)}"

            attendee = {
                "id": idx + 1,
                "name": str(name).strip(),
                "ticket": str(ticket).strip(),
                "time": datetime.now().strftime("%H:%M:%S")
            }
            self.attendees.insert(0, attendee)
        
        self.broadcast("scan", attendee)
        return True, "Scanned successfully", self.get_state()

    def set_target(self, new_target):
        try:
            val = max(1, int(new_target))
        except (ValueError, TypeError):
            return False, "Invalid target number"
        with self.lock:
            self.target = val
        self.broadcast("target", {"target": val})
        return True, "Target updated"

    def set_paused(self, is_paused):
        with self.lock:
            self.paused = bool(is_paused)
        self.broadcast("pause", {"paused": self.paused})
        return True, "Pause state updated"

    def set_fired(self, is_fired):
        with self.lock:
            self.fired = bool(is_fired)
        self.broadcast("fire", {"fired": self.fired})
        return True, "Fire state updated"

    def set_custom_qr(self, mime, data):
        """Store an admin-uploaded QR image (displayed on the main screen)."""
        with self.lock:
            self.custom_qr = (mime, data)
        self.broadcast("tunnel", {"publicUrl": self.public_url})
        return True, "Custom QR uploaded"

    def clear_custom_qr(self):
        with self.lock:
            self.custom_qr = None
        self.broadcast("tunnel", {"publicUrl": self.public_url})
        return True, "Custom QR cleared (back to auto-generated)"

    def set_custom_qr(self, mime, data):
        """Store an admin-uploaded QR image (displayed on the main screen)."""
        with self.lock:
            self.custom_qr = (mime, data)
        self.broadcast("tunnel", {"publicUrl": self.public_url})
        return True, "Custom QR uploaded"

    def clear_custom_qr(self):
        with self.lock:
            self.custom_qr = None
        self.broadcast("tunnel", {"publicUrl": self.public_url})
        return True, "Custom QR cleared (back to auto-generated)"

    def set_public_url(self, url):
        with self.lock:
            self.public_url = url.strip().rstrip("/")
        self.broadcast("tunnel", {"publicUrl": self.public_url})
        return True, "Public URL updated"

    def delete_attendee(self, attendee_id):
        with self.lock:
            self.attendees = [a for a in self.attendees if a["id"] != int(attendee_id)]
            rev = list(reversed(self.attendees))
            for i, a in enumerate(rev):
                a["id"] = i + 1
            self.attendees = list(reversed(rev))
        self.broadcast("delete", {"id": attendee_id})
        return True, "Attendee removed"

    def reset(self):
        with self.lock:
            self.attendees = []
            self.fired = False
            self.paused = False
        self.broadcast("reset", {})
        return True, "Reset successful"

state_manager = StateManager()

# Background Public Tunnel Manager (only used when running locally)
class TunnelManager(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True)
        self.proc = None

    def run(self):
        if IS_RENDER:
            # On Render the service is already public — no tunnel needed.
            if RENDER_EXTERNAL_URL:
                print(f"\n=======================================================")
                print(f"🌍 PUBLIC URL (Render): {RENDER_EXTERNAL_URL}")
                print(f"👉 Registration Link: {RENDER_EXTERNAL_URL}/scan.html")
                print(f"=======================================================\n")
                state_manager.set_public_url(RENDER_EXTERNAL_URL)
            return
        time.sleep(1)
        print("[Tunnel] Starting public internet tunnel...")
        try:
            # First try SSH tunnel via Pinggy
            cmd = ["ssh", "-p", "443", "-o", "StrictHostKeyChecking=no", "-o", "ServerAliveInterval=30", f"-R0:localhost:{PORT}", "a.pinggy.io"]
            self.proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            for line in iter(self.proc.stdout.readline, ""):
                m = re.search(r"https://[a-zA-Z0-9\.\-_]+\.(?:run\.pinggy-free\.link|a\.pinggy\.link|pinggy\.link)", line)
                if m:
                    public_url = m.group(0)
                    print(f"\n=======================================================")
                    print(f"🌍 PUBLIC INTERNET URL (WORKS ON ANY 4G/5G/WIFI):")
                    print(f"👉 {public_url}")
                    print(f"👉 Registration Link: {public_url}/scan.html")
                    print(f"=======================================================\n")
                    state_manager.set_public_url(public_url)
                    break
        except Exception as e:
            print(f"[Tunnel] Tunnel launch notice: {e}")

class CustomRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path in ("/events", "/api/events", "/ws"):
            self.handle_sse()
            return

        if path == "/api/state":
            self.send_json(200, state_manager.get_state())
            return

        if path == "/api/qr":
            self.handle_qr_image()
            return

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/qr/upload":
            self.handle_qr_upload()
            return

        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" in content_type.lower():
            self.send_json(400, {"error": "Unknown multipart endpoint"})
            return

        content_len = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_len).decode("utf-8") if content_len > 0 else "{}"
        try:
            data = json.loads(body) if body else {}
        except Exception:
            data = {}

        if path == "/api/scan":
            ticket = data.get("ticket") or urllib.parse.parse_qs(parsed.query).get("ticket", [None])[0]
            name = data.get("name") or urllib.parse.parse_qs(parsed.query).get("name", [None])[0]
            success, msg, state = state_manager.scan(ticket, name)
            self.send_json(200 if success else 400, {"success": success, "message": msg, "state": state})
            return

        if path == "/api/target":
            target = data.get("target")
            success, msg = state_manager.set_target(target)
            self.send_json(200 if success else 400, {"success": success, "message": msg, "state": state_manager.get_state()})
            return

        if path == "/api/pause":
            paused = data.get("paused")
            if paused is None:
                paused = not state_manager.paused
            success, msg = state_manager.set_paused(paused)
            self.send_json(200, {"success": success, "message": msg, "state": state_manager.get_state()})
            return

        if path == "/api/tunnel":
            url = data.get("publicUrl", "")
            success, msg = state_manager.set_public_url(url)
            self.send_json(200, {"success": success, "message": msg, "state": state_manager.get_state()})
            return

        if path == "/api/qr/clear":
            success, msg = state_manager.clear_custom_qr()
            self.send_json(200, {"success": success, "message": msg, "state": state_manager.get_state()})
            return

        if path == "/api/fire":
            fired = data.get("fired", True)
            success, msg = state_manager.set_fired(fired)
            self.send_json(200, {"success": success, "message": msg, "state": state_manager.get_state()})
            return

        if path == "/api/reset":
            success, msg = state_manager.reset()
            self.send_json(200, {"success": success, "message": msg, "state": state_manager.get_state()})
            return

        if path == "/api/attendee/delete":
            attendee_id = data.get("id")
            success, msg = state_manager.delete_attendee(attendee_id)
            self.send_json(200 if success else 400, {"success": success, "message": msg, "state": state_manager.get_state()})
            return

        self.send_json(404, {"error": "Endpoint not found"})

    def handle_qr_image(self):
        """Serve the QR shown on the big screen: admin-uploaded image if set,
        else a QR generated locally with segno (no external API calls)."""
        custom = state_manager.custom_qr
        if custom:
            mime, data = custom
            self.send_bytes(200, mime, data)
            return

        base = state_manager.public_url or f"http://{state_manager.local_ip}:{PORT}"
        scan_url = base.rstrip("/") + "/scan.html"
        try:
            import segno
            buf = io.BytesIO()
            segno.make(scan_url, error="h").save(buf, kind="png", scale=10, border=2)
            self.send_bytes(200, "image/png", buf.getvalue())
        except Exception as e:
            self.send_json(500, {"error": f"QR generation failed: {e}"})

    def handle_qr_upload(self):
        """Parse a multipart/form-data upload containing the custom QR image."""
        content_type = self.headers.get("Content-Type", "")
        try:
            length = int(self.headers.get("Content-Length", 0))
        except ValueError:
            length = 0
        if length <= 0 or length > MAX_QR_SIZE + 64 * 1024:
            self.send_json(400, {"error": "Missing or too-large upload body"})
            return
        body = self.rfile.read(length)

        m = re.search(r'boundary="?([^";]+)"?', content_type)
        if not m:
            self.send_json(400, {"error": "No multipart boundary found"})
            return

        try:
            field_name = None
            filename = None
            part_mime = None
            payload = None
            boundary = m.group(1).strip().encode("utf-8")
            delim = b"--" + boundary
            for chunk in body.split(delim):
                chunk = chunk.strip(b"\r\n")
                if not chunk or chunk == b"--":
                    continue
                header_blob, _, payload = chunk.partition(b"\r\n\r\n")
                headers = header_blob.decode("utf-8", "replace")
                nm = re.search(r'name="([^"]*)"', headers)
                fm = re.search(r'filename="([^"]*)"', headers)
                cm = re.search(r"Content-Type:\s*([^\r\n]+)", headers, re.I)
                if nm:
                    field_name = nm.group(1)
                if fm:
                    filename = fm.group(1)
                if cm:
                    part_mime = cm.group(1).strip()
                if nm and nm.group(1) == "qr" and payload is not None:
                    payload = payload.rstrip(b"\r\n")
                    break
            else:
                payload = None
        except Exception as e:
            self.send_json(400, {"error": f"Bad multipart payload: {e}"})
            return

        if not payload:
            self.send_json(400, {"error": "No file received (expected field 'qr')"})
            return

        mime = (part_mime or "").split(";")[0].strip().lower()
        if mime not in ALLOWED_QR_TYPES:
            # Fall back to sniffing from the filename/bytes
            if filename and filename.lower().endswith(".svg"):
                mime = "image/svg+xml"
            elif payload[:8] == b"\x89PNG\r\n\x1a\n":
                mime = "image/png"
            elif payload[:3] == b"\xff\xd8\xff":
                mime = "image/jpeg"
            elif payload[:4] in (b"GIF8",):
                mime = "image/gif"
            elif payload[:4] == b"RIFF" and payload[8:12] == b"WEBP":
                mime = "image/webp"
            elif b"<svg" in payload[:512]:
                mime = "image/svg+xml"
            else:
                self.send_json(400, {"error": f"Unsupported image type: {mime or 'unknown'}"})
                return

        if len(payload) > MAX_QR_SIZE:
            self.send_json(400, {"error": "Image too large (max 5 MB)"})
            return

        success, msg = state_manager.set_custom_qr(mime, payload)
        self.send_json(200, {"success": success, "message": msg, "state": state_manager.get_state()})

    def send_bytes(self, status, mime, data):
        self.send_response(status)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(data)

    def handle_sse(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.send_header("X-Accel-Buffering", "no")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        client_q = queue.Queue()
        state_manager.add_client(client_q)

        initial_msg = f"event: init\ndata: {json.dumps({'type': 'init', 'state': state_manager.get_state()})}\n\n"
        try:
            self.wfile.write(initial_msg.encode("utf-8"))
            self.wfile.flush()
        except Exception:
            state_manager.remove_client(client_q)
            return

        try:
            while True:
                try:
                    msg = client_q.get(timeout=15.0)
                    self.wfile.write(msg.encode("utf-8"))
                    self.wfile.flush()
                except queue.Empty:
                    self.wfile.write(b": ping\n\n")
                    self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, Exception):
            pass
        finally:
            state_manager.remove_client(client_q)

    def send_json(self, status, payload):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode("utf-8"))

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

def keep_alive_loop():
    """Pings itself every 10 min so Render's free tier doesn't spin down mid-event."""
    import urllib.request
    url = (RENDER_EXTERNAL_URL or f"http://localhost:{PORT}") + "/api/state"
    while True:
        time.sleep(600)
        try:
            urllib.request.urlopen(url, timeout=15).read()
            print("[KeepAlive] ping ok")
        except Exception as e:
            print(f"[KeepAlive] ping failed: {e}")

def run():
    tunnel_thread = TunnelManager()
    tunnel_thread.start()
    if IS_RENDER:
        threading.Thread(target=keep_alive_loop, daemon=True).start()

    server = ThreadedHTTPServer(("0.0.0.0", PORT), CustomRequestHandler)
    print(f"[Server] Serving on http://0.0.0.0:{PORT} (Local: http://localhost:{PORT})")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[Server] Shutting down...")
        server.server_close()

if __name__ == "__main__":
    run()
