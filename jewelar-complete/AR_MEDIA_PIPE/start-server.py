#!/usr/bin/env python3
"""
JewelAR Dev Server
Run this file to serve the prototype over localhost.
Usage: python start-server.py
"""
import http.server, socketserver, webbrowser, os, threading

PORT = 8080
FILE = "jewelar-prototype.html"

os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # suppress request logs

def open_browser():
    import time; time.sleep(0.8)
    webbrowser.open(f"http://localhost:{PORT}/{FILE}")

print(f"\n  ✦  JewelAR prototype server")
print(f"  →  http://localhost:{PORT}/{FILE}")
print(f"  Press Ctrl+C to stop\n")

threading.Thread(target=open_browser, daemon=True).start()

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  Server stopped.")
