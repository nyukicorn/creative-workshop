#!/usr/bin/env python3
"""
シンプルなHTMLビューワー作成テスト
（MCPサーバーを使わない直接的な方法）
"""

import os

def create_simple_viewer():
    """
    Three.jsを使ったシンプルなHTMLビューワーを直接作成
    """
    
    blender_dir = "/Users/nukuiyuki/Dev/mcp-tools/Blender"
    assets_dir = os.path.join(blender_dir, "assets")
    glb_file = "original_unicorn.glb"
    glb_path = os.path.join(assets_dir, glb_file)
    output_path = os.path.join(blender_dir, "projects", "simple_unicorn_viewer.html")
    
    # GLBファイルの存在確認
    if not os.path.exists(glb_path):
        print(f"❌ GLBファイルが見つかりません: {glb_path}")
        return False
    
    # 相対パスでGLBファイルを参照
    relative_glb_path = os.path.relpath(glb_path, os.path.dirname(output_path))
    
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blender → Three.js: Unicorn Viewer</title>
    <style>
        body {{ margin: 0; padding: 0; background: #222; color: white; font-family: Arial, sans-serif; }}
        #container {{ width: 100%; height: 100vh; position: relative; }}
        #info {{ position: absolute; top: 10px; left: 10px; z-index: 100; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 5px; }}
        canvas {{ display: block; }}
        #loading {{ position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 99; }}
    </style>
</head>
<body>
    <div id="container">
        <div id="info">
            <h3>🦄 Blender → Three.js</h3>
            <p>Model: {glb_file}</p>
            <p>Controls: Mouse to rotate, scroll to zoom</p>
            <p id="status">Loading...</p>
        </div>
        <div id="loading">Loading 3D Model...</div>
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

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x333333);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({{ antialias: true }});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('container').appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Grid helper
        const gridHelper = new THREE.GridHelper(10, 10);
        gridHelper.material.opacity = 0.3;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);

        // Load GLB model
        const loader = new GLTFLoader();
        statusElement.textContent = 'Loading model...';
        
        loader.load('{relative_glb_path}', (gltf) => {{
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
            statusElement.textContent = '✅ Model loaded successfully!';
            
            console.log('Model loaded successfully');
            console.log('Model center:', center);
            console.log('Model size:', size);
            
            // Check animations
            if (gltf.animations && gltf.animations.length > 0) {{
                statusElement.innerHTML += '<br>🎬 Animations available: ' + gltf.animations.length;
                
                const mixer = new THREE.AnimationMixer(model);
                gltf.animations.forEach((clip) => {{
                    mixer.clipAction(clip).play();
                }});
                
                // Update mixer in animation loop
                function updateMixer() {{
                    mixer.update(0.016); // ~60fps
                }}
                
                // Add to animation loop
                const originalAnimate = animate;
                animate = function() {{
                    updateMixer();
                    originalAnimate();
                }};
            }}
            
        }}, (progress) => {{
            const percent = Math.round((progress.loaded / progress.total) * 100);
            statusElement.textContent = `Loading... ${{percent}}%`;
            console.log('Loading progress:', percent + '%');
        }}, (error) => {{
            loadingElement.style.display = 'none';
            statusElement.textContent = '❌ Error loading model';
            statusElement.style.color = '#ff4444';
            console.error('Error loading model:', error);
        }});

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
        console.log('GLB path:', '{relative_glb_path}');
    </script>
</body>
</html>"""

    try:
        # HTMLファイルを書き込み
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"✅ HTMLビューワー作成成功: {output_path}")
        print(f"📁 GLBファイル: {glb_path}")
        print(f"🔗 相対パス: {relative_glb_path}")
        
        # ファイルサイズを確認
        file_size = os.path.getsize(output_path)
        print(f"📊 ファイルサイズ: {file_size} bytes")
        
        # ブラウザで開く
        import subprocess
        subprocess.run(["open", output_path])
        print("🌐 ブラウザでHTMLファイルを開きました")
        
        return True
        
    except Exception as e:
        print(f"❌ エラー: {e}")
        return False

if __name__ == "__main__":
    print("🚀 シンプルHTMLビューワー作成テスト")
    print("=" * 40)
    
    success = create_simple_viewer()
    
    if success:
        print("\n🎉 テスト成功！")
        print("ブラウザでユニコーンが表示されることを確認してください")
        print("- マウスで回転")
        print("- スクロールでズーム")
        print("- アニメーション（もしあれば）が再生")
    else:
        print("\n❌ テスト失敗")