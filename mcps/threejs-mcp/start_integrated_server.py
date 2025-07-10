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
    for port in range(8090, 8200):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except OSError:
            continue
    return None

def start_integrated_server():
    PORT = find_free_port()
    if not PORT:
        print("❌ 使用可能なポートが見つかりません")
        return
    
    # Threejsフォルダーをサーバールートに設定
    os.chdir('/Users/nukuiyuki/Dev/mcp-tools/Threejs')
    
    class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', '*')
            super().end_headers()
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🌐 Three.js Integrated Server running at http://localhost:{PORT}")
        print(f"📁 Serving from: {os.getcwd()}")
        print("")
        print("🎯 Available Projects:")
        print(f"  🦄 Blender Unicorn: http://localhost:{PORT}/projects/blender-unicorn/")
        print(f"  🌸 Lumeria: http://localhost:{PORT}/projects/Lumeria/")
        print(f"  ✨ Lumeria × Unicorn: http://localhost:{PORT}/projects/Lumeria/unicorn/")
        print(f"  🌺 Flower Garden: http://localhost:{PORT}/projects/flower-garden/")
        print(f"  🏛️ Flora Cathedral: http://localhost:{PORT}/projects/micro-flora-cathedral/")
        print("")
        print("Press Ctrl+C to stop")
        
        # ブラウザを開く
        def open_browser():
            time.sleep(2)
            url = f'http://localhost:{PORT}/projects/blender-unicorn/'
            print(f"🚀 Opening Blender → Three.js integration: {url}")
            webbrowser.open(url)
        
        threading.Thread(target=open_browser, daemon=True).start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")

if __name__ == "__main__":
    print("🎨 Three.js統合サーバー起動")
    print("Blender → Three.js プロジェクト統合版")
    print("=" * 50)
    start_integrated_server()