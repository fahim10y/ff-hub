#!/usr/bin/env python3
"""
FF Hub Server — Custom HTTP Server with File-Based Data Persistence
Replaces: python -m http.server 8000

All data (users, matches, deposits, settings, etc.) is saved to db.json
on your hard drive so it survives server restarts, browser closes, and
PC shutdowns.
"""

import json
import os
import sys
import mimetypes
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

# Directory where this script lives (FF Hub root)
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(ROOT_DIR, 'db.json')


class FFHubHandler(BaseHTTPRequestHandler):

    # ── CORS headers (must be called AFTER send_response) ──
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Max-Age', '86400')

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    # ── GET: serve static files OR return the database ──
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # ── API: Get the full database ──
        if path == '/api/data':
            self.send_response(200)
            self._send_cors_headers()
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            if os.path.exists(DB_FILE):
                with open(DB_FILE, 'r', encoding='utf-8') as f:
                    self.wfile.write(f.read().encode('utf-8'))
            else:
                # Return empty object if no db file exists yet
                self.wfile.write(b'{}')
            return

        # ── Serve Static Files ──
        # Default to index.html for root
        if path == '/' or path == '':
            path = '/index.html'

        file_path = os.path.join(ROOT_DIR, path.lstrip('/'))

        # Security: prevent directory traversal
        real_path = os.path.realpath(file_path)
        if not real_path.startswith(os.path.realpath(ROOT_DIR)):
            self.send_error(403, 'Forbidden')
            return

        # ── Directory index support ──
        # If path is a directory, serve index.html inside it (e.g. /admin/ → admin/index.html)
        if os.path.isdir(real_path):
            index_path = os.path.join(real_path, 'index.html')
            if os.path.isfile(index_path):
                real_path = index_path
            else:
                self.send_error(404, 'Not Found')
                return

        if not os.path.isfile(real_path):
            self.send_error(404, 'Not Found')
            return

        # Guess content type
        content_type, _ = mimetypes.guess_type(real_path)
        if content_type is None:
            content_type = 'application/octet-stream'

        self.send_response(200)
        self.send_header('Content-Type', content_type)
        # No caching so that changes are always picked up
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.end_headers()

        with open(real_path, 'rb') as f:
            self.wfile.write(f.read())

    # ── POST: save the database to disk ──
    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == '/api/data':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)

            try:
                data = json.loads(body.decode('utf-8'))
                # Write to file with pretty-print for readability
                with open(DB_FILE, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                self.send_response(200)
                self._send_cors_headers()
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(
                    json.dumps({'status': 'ok', 'message': 'Data saved'}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self._send_cors_headers()
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(
                    json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
            return

        self.send_error(404, 'Not Found')

    def log_message(self, format, *args):
        """Nicer coloured-ish logging."""
        try:
            # Standard python HTTP server log formatting
            print(f"  [LOG] {format % args}")
        except Exception:
            print(f"  [LOG] {format} {args}")


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

    server = HTTPServer(('0.0.0.0', port), FFHubHandler)

    if sys.stdout.encoding.lower() != 'utf-8':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except AttributeError:
            pass # Python < 3.7

    print()
    print('╔══════════════════════════════════════════════════╗')
    print('║       🔥 FF HUB — PERSISTENT LOCAL SERVER       ║')
    print('╠══════════════════════════════════════════════════╣')
    print(f'║   Main App:  http://localhost:{port}                ║')
    print(f'║   Admin:     http://localhost:{port}/admin/         ║')
    print(f'║   DB File:   {os.path.basename(DB_FILE)}                      ║')
    print('╠══════════════════════════════════════════════════╣')
    print('║  ✅ Data now persists on disk!                  ║')
    print('║  ✅ Restart server / close browser → data safe! ║')
    print('║  ═══════════════════════════════════════════════ ║')
    print('║  Press Ctrl+C to stop the server                ║')
    print('╚══════════════════════════════════════════════════╝')
    print()

    # Open browser tabs
    webbrowser.open(f'http://localhost:{port}')
    webbrowser.open(f'http://localhost:{port}/admin/')

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n[FF Hub] Server stopped. All data saved in db.json ✓')
        server.server_close()


if __name__ == '__main__':
    main()
