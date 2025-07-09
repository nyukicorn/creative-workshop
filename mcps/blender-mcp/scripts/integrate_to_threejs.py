#!/usr/bin/env python3
"""
Blender → Three.js 自動統合スクリプト
エクスポートされたGLBファイルをThree.jsビューワーに統合
"""

import os
import sys
import shutil
import json
from pathlib import Path
from datetime import datetime

def create_project_viewer(project_name, glb_files):
    """プロジェクト専用ビューワーを作成"""
    
    # GLBファイルのオプション作成
    model_options = []
    for i, glb_file in enumerate(glb_files):
        file_path = Path(glb_file)
        file_size = file_path.stat().st_size / (1024 * 1024)  # MB
        model_options.append(f'<option value="{file_path.name}">{file_path.stem} ({file_size:.1f}MB)</option>')
    
    options_html = '\n                '.join(model_options)
    
    viewer_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎨 {project_name} - Blender → Three.js</title>
    <style>
        body {{ 
            margin: 0; padding: 0; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; font-family: 'Arial', sans-serif; 
        }}
        #container {{ width: 100%; height: 100vh; position: relative; }}
        #info {{ 
            position: absolute; top: 15px; left: 15px; z-index: 100; 
            background: rgba(0,0,0,0.8); padding: 15px; border-radius: 10px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1);
            max-width: 300px;
        }}
        #info h3 {{ margin: 0 0 10px 0; color: #ff6b9d; }}
        #model-selector {{
            margin: 10px 0; padding: 5px; background: rgba(255,255,255,0.1); 
            border: none; border-radius: 5px; color: white; font-size: 14px;
        }}
        #model-selector option {{ background: #333; color: white; }}
        #status {{ 
            margin: 10px 0; padding: 8px; background: rgba(255,255,255,0.1); 
            border-radius: 5px; font-weight: bold; font-size: 12px;
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
        .controls {{ font-size: 11px; margin: 5px 0; }}
        .controls ul {{ margin: 0; padding-left: 15px; }}
        .project-info {{ margin: 10px 0; font-size: 11px; opacity: 0.8; }}
    </style>
</head>
<body>
    <div id="container">
        <div id="info">
            <h3>🎨 {project_name}</h3>
            <p><strong>Blender → Three.js</strong></p>
            
            <label for="model-selector">Choose Model:</label>
            <select id="model-selector">
                {options_html}
            </select>
            
            <div class="controls">
                <p><strong>Controls:</strong></p>
                <ul>
                    <li>🖱️ Mouse: Rotate</li>
                    <li>🔄 Scroll: Zoom</li>
                    <li>🎮 Right-click: Pan</li>
                </ul>
            </div>
            
            <div class="project-info">
                <p>📅 Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}</p>
                <p>📦 Models: {len(glb_files)}</p>
            </div>
            
            <div id="status" class="warning">Initializing...</div>
        </div>
        <div id="loading">
            <div class="spinner"></div>
            <h3>Loading 3D Model...</h3>
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
        const modelSelector = document.getElementById('model-selector');

        let scene, camera, renderer, controls, currentModel, mixer, clock;

        function updateStatus(message, type = 'warning') {{
            statusElement.textContent = message;
            statusElement.className = type;
            console.log(`[${{type.toUpperCase()}}] ${{message}}`);
        }}

        function initScene() {{
            // Scene setup
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x2a2a40);

            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer({{ antialias: true, alpha: true }});
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.2;
            document.getElementById('container').appendChild(renderer.domElement);

            // Controls
            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.screenSpacePanning = false;
            controls.minDistance = 1;
            controls.maxDistance = 50;

            // Lighting
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

            // Ground
            const groundGeometry = new THREE.PlaneGeometry(20, 20);
            const groundMaterial = new THREE.MeshLambertMaterial({{ 
                color: 0x3a3a5c, transparent: true, opacity: 0.7 
            }});
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.receiveShadow = true;
            scene.add(ground);

            // Grid
            const gridHelper = new THREE.GridHelper(20, 20, 0x6b73c4, 0x404064);
            gridHelper.material.opacity = 0.4;
            gridHelper.material.transparent = true;
            scene.add(gridHelper);

            // Animation clock
            clock = new THREE.Clock();

            updateStatus('Scene initialized', 'success');
        }}

        function loadModel(modelName) {{
            // Remove current model
            if (currentModel) {{
                scene.remove(currentModel);
                currentModel = null;
            }}

            loadingElement.style.display = 'block';
            updateStatus(`Loading ${{modelName}}...`, 'warning');

            const loader = new GLTFLoader();
            const modelPath = `../blender-assets/${{modelName}}`;

            loader.load(modelPath, 
                (gltf) => {{
                    currentModel = gltf.scene;
                    scene.add(currentModel);

                    // Auto-fit camera
                    const box = new THREE.Box3().setFromObject(currentModel);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const fov = camera.fov * (Math.PI / 180);
                    let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));
                    
                    camera.position.set(center.x + 3, center.y + 2, center.z + cameraZ * 1.5);
                    camera.lookAt(center);
                    controls.target.copy(center);

                    // Enable shadows
                    currentModel.traverse((child) => {{
                        if (child.isMesh) {{
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }}
                    }});

                    loadingElement.style.display = 'none';
                    
                    // Handle animations
                    if (gltf.animations && gltf.animations.length > 0) {{
                        mixer = new THREE.AnimationMixer(currentModel);
                        gltf.animations.forEach((clip) => {{
                            mixer.clipAction(clip).play();
                        }});
                        updateStatus(`✅ ${{modelName}} loaded! 🎬 ${{gltf.animations.length}} animations`, 'success');
                    }} else {{
                        mixer = null;
                        updateStatus(`✅ ${{modelName}} loaded successfully!`, 'success');
                    }}
                    
                    console.log('Model loaded:', modelName);
                    console.log('Center:', center, 'Size:', size);
                }},
                (progress) => {{
                    if (progress.total > 0) {{
                        const percent = Math.round((progress.loaded / progress.total) * 100);
                        progressElement.textContent = `${{percent}}%`;
                        updateStatus(`Loading ${{modelName}}... ${{percent}}%`, 'warning');
                    }}
                }},
                (error) => {{
                    loadingElement.style.display = 'none';
                    updateStatus(`❌ Failed to load ${{modelName}}`, 'error');
                    console.error('Load error:', error);
                }}
            );
        }}

        function animate() {{
            requestAnimationFrame(animate);
            
            // Update animations
            if (mixer) {{
                mixer.update(clock.getDelta());
            }}
            
            controls.update();
            renderer.render(scene, camera);
        }}

        // Handle window resize
        window.addEventListener('resize', () => {{
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }});

        // Model selector change
        modelSelector.addEventListener('change', (e) => {{
            loadModel(e.target.value);
        }});

        // Initialize
        updateStatus('Initializing Three.js scene...', 'warning');
        initScene();
        
        // Load default model
        loadModel(modelSelector.value);
        
        // Start animation loop
        animate();
        
        console.log('{project_name} viewer initialized');
    </script>
</body>
</html>'''
    
    return viewer_content

def integrate_to_threejs(project_name):
    """BlenderプロジェクトをThree.jsに統合"""
    
    # パス設定
    blender_dir = Path("/Users/nukuiyuki/Dev/mcp-tools/Blender")
    threejs_dir = Path("/Users/nukuiyuki/Dev/mcp-tools/Threejs")
    
    project_dir = blender_dir / "projects" / project_name
    blender_assets_dir = threejs_dir / "projects" / "blender-assets"
    threejs_projects_dir = threejs_dir / "projects"
    
    # プロジェクトの確認
    if not project_dir.exists():
        print(f"❌ プロジェクト '{project_name}' が見つかりません")
        print(f"📁 場所: {project_dir}")
        return False
    
    # エクスポートされたGLBファイルを確認
    exports_dir = project_dir / "exports"
    if not exports_dir.exists():
        print(f"❌ exportsディレクトリが見つかりません: {exports_dir}")
        print("先にプロジェクトをエクスポートしてください:")
        print(f"python3 export_project.py {project_name}")
        return False
    
    glb_files = list(exports_dir.glob("*.glb"))
    if not glb_files:
        print(f"❌ GLBファイルが見つかりません: {exports_dir}")
        print("先にプロジェクトをエクスポートしてください:")
        print(f"python3 export_project.py {project_name}")
        return False
    
    print(f"📦 GLBファイル: {len(glb_files)}個見つかりました")
    for glb in glb_files:
        size_mb = glb.stat().st_size / (1024 * 1024)
        print(f"   - {glb.name} ({size_mb:.2f}MB)")
    
    # Three.jsディレクトリの確認
    if not threejs_dir.exists():
        print(f"❌ Three.jsディレクトリが見つかりません: {threejs_dir}")
        return False
    
    # blender-assetsディレクトリを作成
    blender_assets_dir.mkdir(parents=True, exist_ok=True)
    
    # GLBファイルをコピー
    print(f"📋 GLBファイルをコピー中...")
    copied_files = []
    
    for glb_file in glb_files:
        target_path = blender_assets_dir / glb_file.name
        shutil.copy2(glb_file, target_path)
        copied_files.append(target_path)
        print(f"   ✅ {glb_file.name} → {target_path}")
    
    # プロジェクト専用ビューワーを作成
    project_viewer_dir = threejs_projects_dir / f"blender-{project_name}"
    project_viewer_dir.mkdir(parents=True, exist_ok=True)
    
    viewer_html = create_project_viewer(project_name, copied_files)
    viewer_path = project_viewer_dir / "index.html"
    
    with open(viewer_path, 'w', encoding='utf-8') as f:
        f.write(viewer_html)
    
    print(f"📄 プロジェクトビューワー作成: {viewer_path}")
    
    # メインのblender-unicornビューワーを更新（既存の統合ビューワー）
    main_viewer_path = threejs_projects_dir / "blender-unicorn" / "index.html"
    if main_viewer_path.exists():
        print(f"🔄 メインビューワーの更新中...")
        
        # 既存のHTMLを読み込んで、セレクタに新しいモデルを追加
        try:
            with open(main_viewer_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 新しいオプションを追加
            for glb_file in copied_files:
                file_size = glb_file.stat().st_size / (1024 * 1024)
                option_line = f'                <option value="{glb_file.name}">{project_name} - {glb_file.stem} ({file_size:.1f}MB)</option>'
                
                # セレクタの最後に追加
                if option_line not in content:
                    select_end = content.find('</select>')
                    if select_end != -1:
                        content = content[:select_end] + option_line + '\\n            ' + content[select_end:]
            
            with open(main_viewer_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"   ✅ メインビューワー更新完了")
            
        except Exception as e:
            print(f"   ⚠️  メインビューワー更新でエラー: {e}")
    
    # サーバー設定を更新
    server_script_path = threejs_dir / "start_integrated_server.py"
    if server_script_path.exists():
        try:
            with open(server_script_path, 'r', encoding='utf-8') as f:
                server_content = f.read()
            
            # 新しいプロジェクトのURLを追加
            project_url_line = f'        print(f"  🎨 {project_name}: http://localhost:{{PORT}}/projects/blender-{project_name}/")'
            
            if project_url_line not in server_content:
                # Available Projects:の後に追加
                projects_line = '        print("🎯 Available Projects:")'
                if projects_line in server_content:
                    insert_pos = server_content.find(projects_line) + len(projects_line)
                    next_line_pos = server_content.find('\\n', insert_pos) + 1
                    server_content = server_content[:next_line_pos] + project_url_line + '\\n' + server_content[next_line_pos:]
                    
                    with open(server_script_path, 'w', encoding='utf-8') as f:
                        f.write(server_content)
                    
                    print(f"🌐 サーバースクリプト更新完了")
        except Exception as e:
            print(f"⚠️  サーバースクリプト更新でエラー: {e}")
    
    # 完了報告
    print()
    print("🎉 Three.js統合完了!")
    print("=" * 40)
    print(f"📁 コピーされたファイル: {len(copied_files)}個")
    print(f"📄 プロジェクトビューワー: {viewer_path}")
    print()
    print("🚀 確認方法:")
    print(f"   cd {threejs_dir}")
    print("   python3 start_integrated_server.py")
    print()
    print("🌐 アクセスURL:")
    print(f"   プロジェクト専用: http://localhost:8090/projects/blender-{project_name}/")
    print("   統合ビューワー: http://localhost:8090/projects/blender-unicorn/")
    
    return True

def list_integrated_projects():
    """統合済みプロジェクトをリスト表示"""
    threejs_dir = Path("/Users/nukuiyuki/Dev/mcp-tools/Threejs")
    projects_dir = threejs_dir / "projects"
    blender_assets_dir = projects_dir / "blender-assets"
    
    if not blender_assets_dir.exists():
        print("📁 統合されたプロジェクトがありません")
        return
    
    # blender-assetsのGLBファイルを確認
    glb_files = list(blender_assets_dir.glob("*.glb"))
    
    # blender-プレフィックスのプロジェクトディレクトリを確認
    blender_projects = [d for d in projects_dir.iterdir() 
                       if d.is_dir() and d.name.startswith('blender-') and d.name != 'blender-assets']
    
    print("📋 Three.js統合済みプロジェクト:")
    print("=" * 50)
    
    if glb_files:
        print(f"📦 アセットファイル ({len(glb_files)}個):")
        for glb in glb_files:
            size_mb = glb.stat().st_size / (1024 * 1024)
            print(f"   - {glb.name} ({size_mb:.2f}MB)")
        print()
    
    if blender_projects:
        print(f"🌐 プロジェクトビューワー ({len(blender_projects)}個):")
        for project in blender_projects:
            project_name = project.name.replace('blender-', '')
            index_file = project / "index.html"
            status = "✅ 利用可能" if index_file.exists() else "❌ 不完全"
            print(f"   - {project_name} ({status})")
        print()
    
    print("🚀 サーバー起動:")
    print("   python3 start_integrated_server.py")

if __name__ == "__main__":
    print("🌐 Blender → Three.js 統合ツール")
    print("=" * 50)
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "list":
            list_integrated_projects()
        else:
            project_name = sys.argv[1]
            print(f"🔄 プロジェクト '{project_name}' をThree.jsに統合中...")
            print()
            
            success = integrate_to_threejs(project_name)
            
            if success:
                print()
                print("🎊 統合完了!")
                print("次のステップ:")
                print("   cd /Users/nukuiyuki/Dev/mcp-tools/Threejs")
                print("   python3 start_integrated_server.py")
            else:
                print()
                print("💡 トラブルシューティング:")
                print("   1. プロジェクトが存在することを確認")
                print("   2. 先にエクスポートを実行")
                print(f"      python3 export_project.py {project_name}")
                print("   3. Three.jsディレクトリが存在することを確認")
    else:
        print("使用方法:")
        print("  統合: python3 integrate_to_threejs.py <プロジェクト名>")
        print("  一覧: python3 integrate_to_threejs.py list")
        print()
        print("例:")
        print("  python3 integrate_to_threejs.py unicorn_project")
        print("  python3 integrate_to_threejs.py dragon_model")
        print("  python3 integrate_to_threejs.py list")