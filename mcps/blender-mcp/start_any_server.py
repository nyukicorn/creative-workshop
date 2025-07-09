#!/usr/bin/env python3
import http.server
import socketserver
import os
import webbrowser
import threading
import time
import socket

def find_free_port():
    """使用可能なポートを見つける"""
    for port in range(8080, 8200):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except OSError:
            continue
    return None

def start_server():
    PORT = find_free_port()
    if not PORT:
        print("❌ 使用可能なポートが見つかりません")
        return
    
    os.chdir('/Users/nukuiyuki/Dev/mcp-tools/Blender')
    
    class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', '*')
            super().end_headers()
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🌐 Server running at http://localhost:{PORT}")
        print(f"📁 Serving from: {os.getcwd()}")
        print(f"🦄 Unicorn viewer: http://localhost:{PORT}/projects/fixed_unicorn_viewer.html")
        print("Press Ctrl+C to stop")
        
        # ブラウザを開く
        def open_browser():
            time.sleep(2)
            url = f'http://localhost:{PORT}/projects/fixed_unicorn_viewer.html'
            print(f"🚀 Opening browser: {url}")
            webbrowser.open(url)
        
        threading.Thread(target=open_browser, daemon=True).start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")

if __name__ == "__main__":
    start_server()