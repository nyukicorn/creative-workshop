#!/usr/bin/env python3
"""
ローカルサーバー付きHTMLビューワー作成
CORSエラーを回避するためのHTTPサーバー統合版
"""

import os
import http.server
import socketserver
import threading
import time
import webbrowser

def create_fixed_viewer():
    """
    ローカルサーバー機能付きHTMLビューワーを作成
    """
    
    blender_dir = "/Users/nukuiyuki/Dev/mcp-tools/Blender"
    assets_dir = os.path.join(blender_dir, "assets")
    glb_file = "original_unicorn.glb"
    glb_path = os.path.join(assets_dir, glb_file)
    output_path = os.path.join(blender_dir, "projects", "fixed_unicorn_viewer.html")
    server_script_path = os.path.join(blender_dir, "projects", "start_server.py")
    
    # GLBファイルの存在確認
    if not os.path.exists(glb_path):
        print(f"❌ GLBファイルが見つかりません: {glb_path}")
        return False
    
    # GLBファイルのサイズ確認
    glb_size = os.path.getsize(glb_path)
    print(f"📊 GLBファイルサイズ: {glb_size:,} bytes ({glb_size/1024/1024:.1f} MB)")
    
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🦄 Blender → Three.js: Unicorn Viewer (Fixed)</title>
    <style>
        body {{ margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-family: 'Arial', sans-serif; }}
        #container {{ width: 100%; height: 100vh; position: relative; }}
        #info {{ 
            position: absolute; top: 15px; left: 15px; z-index: 100; 
            background: rgba(0,0,0,0.8); padding: 15px; border-radius: 10px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1);
        }}
        #info h3 {{ margin: 0 0 10px 0; color: #ff6b9d; }}
        #status {{ 
            margin: 10px 0; padding: 8px; background: rgba(255,255,255,0.1); 
            border-radius: 5px; font-weight: bold;
        }}
        #loading {{ 
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
            z-index: 99; text-align: center; background: rgba(0,0,0,0.8); 
            padding: 30px; border-radius: 15px;
        }}
        .spinner {{ 
            border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid #ff6b9d; 
            border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; 
            margin: 0 auto 20px;
        }}
        @keyframes spin {{ 0% {{ transform: rotate(0deg); }} 100% {{ transform: rotate(360deg); }} }}
        canvas {{ display: block; }}
        .error {{ color: #ff4444; background: rgba(255,68,68,0.2); }}
        .success {{ color: #44ff88; background: rgba(68,255,136,0.2); }}
        .warning {{ color: #ffaa44; background: rgba(255,170,68,0.2); }}
    </style>
</head>
<body>
    <div id="container">
        <div id="info">
            <h3>🦄 Blender → Three.js</h3>
            <p><strong>Model:</strong> {glb_file}</p>
            <p><strong>Size:</strong> {glb_size/1024/1024:.1f} MB</p>
            <p><strong>Controls:</strong></p>
            <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
                <li>🖱️ Mouse: Rotate</li>
                <li>🔄 Scroll: Zoom</li>
                <li>🎮 Drag: Pan (right click)</li>
            </ul>
            <div id="status" class="warning">Initializing...</div>
        </div>
        <div id="loading">
            <div class="spinner"></div>
            <h3>Loading 3D Model...</h3>
            <p>Please wait while we load the unicorn model</p>
            <p id="progress">0%</p>
        </div>
    </div>

    <script type="importmap">
    {{
        "imports": {{
            "three": "https://unpkg.com/three@0.170.0/build/three.module.js",
            "three/addons/": "https://unpkg.com/three@0.170.0/examples/jsm/"
        }}
    }}
    </script>

    <script type="module">
        import * as THREE from 'three';
        import {{ GLTFLoader }} from 'three/addons/loaders/GLTFLoader.js';
        import {{ OrbitControls }} from 'three/addons/controls/OrbitControls.js';

        const statusElement = document.getElementById('status');
        const loadingElement = document.getElementById('loading');
        const progressElement = document.getElementById('progress');

        function updateStatus(message, type = 'warning') {{
            statusElement.textContent = message;
            statusElement.className = type;
            console.log(`[${{type.toUpperCase()}}] ${{message}}`);
        }}

        // Scene setup
        updateStatus('Setting up 3D scene...', 'warning');
        
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x2a2a40);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({{ antialias: true, alpha: true }});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        document.getElementById('container').appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 1;
        controls.maxDistance = 50;

        // Lighting setup
        updateStatus('Setting up lighting...', 'warning');
        
        const ambientLight = new THREE.AmbientLight(0x6b73c4, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x654321, 0.4);
        scene.add(hemisphereLight);

        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshLambertMaterial({{ 
            color: 0x3a3a5c, 
            transparent: true, 
            opacity: 0.7 
        }});
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Grid helper
        const gridHelper = new THREE.GridHelper(20, 20, 0x6b73c4, 0x404064);
        gridHelper.material.opacity = 0.4;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);

        // Load GLB model with multiple fallback paths
        const loader = new GLTFLoader();
        updateStatus('Loading GLB model...', 'warning');
        
        const possiblePaths = [
            './assets/{glb_file}',           // Relative path (server)
            '../assets/{glb_file}',          // Parent directory
            'assets/{glb_file}',             // Without ./
            '/assets/{glb_file}',            // Absolute path
            'http://localhost:8000/assets/{glb_file}'  // Full URL
        ];
        
        let loadAttempt = 0;
        
        function tryLoadModel(pathIndex = 0) {{
            if (pathIndex >= possiblePaths.length) {{
                updateStatus('❌ Failed to load model from all paths', 'error');
                loadingElement.style.display = 'none';
                return;
            }}
            
            const currentPath = possiblePaths[pathIndex];
            updateStatus(`Trying path ${{pathIndex + 1}}/${{possiblePaths.length}}: ${{currentPath}}`, 'warning');
            
            loader.load(currentPath, 
                // Success callback
                (gltf) => {{
                    const model = gltf.scene;
                    scene.add(model);

                    // Auto-fit camera
                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const fov = camera.fov * (Math.PI / 180);
                    let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));
                    
                    camera.position.set(center.x + 3, center.y + 2, center.z + cameraZ * 1.5);
                    camera.lookAt(center);
                    controls.target.copy(center);

                    loadingElement.style.display = 'none';
                    updateStatus('✅ Model loaded successfully!', 'success');
                    
                    console.log('Model loaded from:', currentPath);
                    console.log('Model center:', center);
                    console.log('Model size:', size);
                    
                    // Enable shadows on model
                    model.traverse((child) => {{
                        if (child.isMesh) {{
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }}
                    }});
                    
                    // Check animations
                    if (gltf.animations && gltf.animations.length > 0) {{
                        updateStatus(`✅ Model loaded! 🎬 ${{gltf.animations.length}} animations found`, 'success');
                        
                        const mixer = new THREE.AnimationMixer(model);
                        gltf.animations.forEach((clip) => {{
                            mixer.clipAction(clip).play();
                        }});
                        
                        // Update mixer in animation loop
                        const clock = new THREE.Clock();
                        function updateMixer() {{
                            mixer.update(clock.getDelta());
                        }}
                        
                        // Add to animation loop
                        const originalAnimate = animate;
                        animate = function() {{
                            updateMixer();
                            originalAnimate();
                        }};
                    }}
                }},
                // Progress callback
                (progress) => {{
                    if (progress.total > 0) {{
                        const percent = Math.round((progress.loaded / progress.total) * 100);
                        progressElement.textContent = `${{percent}}%`;
                        updateStatus(`Loading... ${{percent}}% (${{(progress.loaded/1024/1024).toFixed(1)}}MB)`, 'warning');
                    }} else {{
                        progressElement.textContent = `${{(progress.loaded/1024/1024).toFixed(1)}}MB`;
                        updateStatus(`Loading... ${{(progress.loaded/1024/1024).toFixed(1)}}MB loaded`, 'warning');
                    }}
                }},
                // Error callback
                (error) => {{
                    console.error(`Failed to load from ${{currentPath}}:`, error);
                    updateStatus(`Failed path ${{pathIndex + 1}}, trying next...`, 'warning');
                    setTimeout(() => tryLoadModel(pathIndex + 1), 1000);
                }}
            );
        }}
        
        // Start loading
        tryLoadModel();

        // Animation loop
        function animate() {{
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }}

        // Handle window resize
        window.addEventListener('resize', () => {{
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }});

        animate();
        
        console.log('Three.js viewer initialized');
        console.log('Possible GLB paths:', possiblePaths);
    </script>
</body>
</html>"""

    # サーバー起動スクリプトも作成
    server_script = f"""#!/usr/bin/env python3
import http.server
import socketserver
import os
import webbrowser
import threading
import time

def start_server():
    PORT = 8000
    os.chdir('{blender_dir}')
    
    class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
            self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
            super().end_headers()
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🌐 Server running at http://localhost:{{PORT}}")
        print(f"📁 Serving from: {{os.getcwd()}}")
        print(f"🦄 Open: http://localhost:{{PORT}}/projects/fixed_unicorn_viewer.html")
        print("Press Ctrl+C to stop")
        
        # ブラウザを開く
        def open_browser():
            time.sleep(1)
            webbrowser.open(f'http://localhost:{{PORT}}/projects/fixed_unicorn_viewer.html')
        
        threading.Thread(target=open_browser, daemon=True).start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\\n🛑 Server stopped")

if __name__ == "__main__":
    start_server()
"""

    try:
        # HTMLファイルを書き込み
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        # サーバースクリプトを書き込み
        with open(server_script_path, 'w', encoding='utf-8') as f:
            f.write(server_script)
        
        # サーバースクリプトを実行可能にする
        os.chmod(server_script_path, 0o755)
        
        print(f"✅ 修正版HTMLビューワー作成成功: {output_path}")
        print(f"✅ サーバースクリプト作成成功: {server_script_path}")
        print(f"📁 GLBファイル: {glb_path}")
        
        return output_path, server_script_path
        
    except Exception as e:
        print(f"❌ エラー: {e}")
        return None, None

if __name__ == "__main__":
    print("🔧 ローカルサーバー付きHTMLビューワー作成")
    print("=" * 50)
    
    html_path, server_path = create_fixed_viewer()
    
    if html_path and server_path:
        print("\\n🎉 修正版ビューワー作成成功！")
        print("\\n📋 使用方法:")
        print(f"1. ターミナルで実行: python3 {server_path}")
        print("2. または手動で: http://localhost:8000/projects/fixed_unicorn_viewer.html")
        print("\\n💡 CORSエラーが解決され、GLBファイルが正常に読み込まれるはずです")
    else:
        print("\\n❌ 修正版ビューワー作成失敗")