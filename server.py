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

PORT = int(os.environ.get("PORT", 8000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Render.com (and most PaaS) expose the public URL via env vars.
IS_RENDER = bool(os.environ.get("RENDER"))
RENDER_EXTERNAL_URL = os.environ.get("RENDER_EXTERNAL_URL", "").rstrip("/")

class StateManager:
    def __init__(self):
        self.lock = threading.Lock()
        self.target = 32
        self.paused = False
        self.fired = False
        self.attendees = []
        self.clients = set()
        self.public_url = RENDER_EXTERNAL_URL
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

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

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
