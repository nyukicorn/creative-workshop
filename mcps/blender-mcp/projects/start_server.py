#!/usr/bin/env python3
import http.server
import socketserver
import os
import webbrowser
import threading
import time

def start_server():
    PORT = 8000
    os.chdir('/Users/nukuiyuki/Dev/mcp-tools/Blender')
    
    class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
            self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
            super().end_headers()
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🌐 Server running at http://localhost:{PORT}")
        print(f"📁 Serving from: {os.getcwd()}")
        print(f"🦄 Open: http://localhost:{PORT}/projects/fixed_unicorn_viewer.html")
        print("Press Ctrl+C to stop")
        
        # ブラウザを開く
        def open_browser():
            time.sleep(1)
            webbrowser.open(f'http://localhost:{PORT}/projects/fixed_unicorn_viewer.html')
        
        threading.Thread(target=open_browser, daemon=True).start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")

if __name__ == "__main__":
    start_server()
