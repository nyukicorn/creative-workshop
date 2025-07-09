#!/usr/bin/env python3
"""
新規3Dプロジェクト作成スクリプト
Blender → Three.js 統合ワークフロー用
"""

import os
import sys
import shutil
from datetime import datetime

def create_new_project(project_name):
    """
    新規プロジェクトを作成
    """
    if not project_name:
        print("❌ プロジェクト名が必要です")
        return False
    
    # パス設定
    blender_dir = "/Users/nukuiyuki/Dev/mcp-tools/Blender"
    projects_dir = os.path.join(blender_dir, "projects")
    project_dir = os.path.join(projects_dir, project_name)
    
    # プロジェクトディレクトリの存在確認
    if os.path.exists(project_dir):
        print(f"❌ プロジェクト '{project_name}' は既に存在します")
        return False
    
    # プロジェクトディレクトリを作成
    os.makedirs(project_dir, exist_ok=True)
    
    # サブディレクトリを作成
    subdirs = ['models', 'textures', 'animations', 'exports', 'references']
    for subdir in subdirs:
        os.makedirs(os.path.join(project_dir, subdir), exist_ok=True)
    
    # プロジェクト設定ファイルを作成
    project_config = f"""# {project_name} プロジェクト

作成日: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 📁 ディレクトリ構造

- `models/` - Blenderファイル(.blend)
- `textures/` - テクスチャファイル
- `animations/` - アニメーションファイル
- `exports/` - エクスポートされたGLB/OBJファイル
- `references/` - 参考画像・資料

## 🚀 使用方法

### 1. 3Dモデル制作
```bash
# Blender MCPでモデル作成
cd {project_dir}
# models/フォルダーに.blendファイルを保存
```

### 2. エクスポート
```bash
# GLBエクスポート
python3 ../../scripts/export_project.py {project_name}
```

### 3. Three.js統合
```bash
# 自動統合
python3 ../../scripts/integrate_to_threejs.py {project_name}
```

### 4. Web確認
```bash
# サーバー起動
cd ../../Threejs
python3 start_integrated_server.py
```

## 📋 チェックリスト

- [ ] 3Dモデル作成完了
- [ ] テクスチャ設定完了
- [ ] アニメーション設定完了
- [ ] GLBエクスポート完了
- [ ] Three.js統合完了
- [ ] Web表示確認完了
"""

    readme_path = os.path.join(project_dir, "README.md")
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(project_config)
    
    # Blenderスクリプトテンプレートを作成
    blender_script = f'''import bpy

# {project_name} プロジェクト用Blenderスクリプト

def setup_scene():
    """
    シーンの基本セットアップ
    """
    # 既存オブジェクトを削除
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # カメラを追加
    bpy.ops.object.camera_add(location=(7, -7, 5))
    camera = bpy.context.active_object
    camera.rotation_euler = (1.1, 0, 0.785)
    
    # ライトを追加
    bpy.ops.object.light_add(type='SUN', location=(4, 4, 6))
    light = bpy.context.active_object
    light.data.energy = 3
    
    print("シーンセットアップ完了")

def export_model(filename="{project_name}.glb"):
    """
    モデルをエクスポート
    """
    export_path = "exports/" + filename
    
    # GLBエクスポート
    bpy.ops.export_scene.gltf(
        filepath=export_path,
        export_format='GLB',
        use_selection=False,
        export_materials='EXPORT',
        export_cameras=True,
        export_lights=True,
        export_animations=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6
    )
    
    print(f"エクスポート完了: {{export_path}}")

# 初期セットアップを実行
if __name__ == "__main__":
    setup_scene()
    print("プロジェクト '{project_name}' の準備完了!")
'''

    script_path = os.path.join(project_dir, f"{project_name}_setup.py")
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(blender_script)
    
    # プロジェクト作成完了
    print(f"✅ プロジェクト '{project_name}' を作成しました")
    print(f"📁 場所: {project_dir}")
    print("")
    print("📋 作成されたファイル:")
    print(f"  - README.md (プロジェクト説明)")
    print(f"  - {project_name}_setup.py (Blenderセットアップスクリプト)")
    print("")
    print("📁 作成されたディレクトリ:")
    for subdir in subdirs:
        print(f"  - {subdir}/")
    print("")
    print("🚀 次のステップ:")
    print(f"1. cd {project_dir}")
    print(f"2. Blender MCPで3Dモデルを作成")
    print(f"3. python3 ../../scripts/export_project.py {project_name}")
    print(f"4. python3 ../../scripts/integrate_to_threejs.py {project_name}")
    
    return True

def list_projects():
    """
    既存プロジェクトをリスト表示
    """
    projects_dir = "/Users/nukuiyuki/Dev/mcp-tools/Blender/projects"
    
    if not os.path.exists(projects_dir):
        print("❌ projectsディレクトリが見つかりません")
        return
    
    projects = [d for d in os.listdir(projects_dir) 
                if os.path.isdir(os.path.join(projects_dir, d)) and not d.startswith('.')]
    
    if not projects:
        print("📁 プロジェクトが見つかりません")
        return
    
    print("📋 既存プロジェクト:")
    for i, project in enumerate(projects, 1):
        project_path = os.path.join(projects_dir, project)
        
        # エクスポートファイルの確認
        exports_dir = os.path.join(project_path, "exports")
        glb_files = []
        if os.path.exists(exports_dir):
            glb_files = [f for f in os.listdir(exports_dir) if f.endswith('.glb')]
        
        status = "✅ 完成" if glb_files else "🚧 作業中"
        print(f"  {i}. {project} ({status})")
        
        if glb_files:
            print(f"     GLBファイル: {', '.join(glb_files)}")

if __name__ == "__main__":
    print("🎨 新規3Dプロジェクト作成ツール")
    print("=" * 40)
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "list":
            list_projects()
        else:
            project_name = sys.argv[1]
            create_new_project(project_name)
    else:
        print("使用方法:")
        print("  新規作成: python3 create_new_project.py <プロジェクト名>")
        print("  一覧表示: python3 create_new_project.py list")
        print("")
        print("例:")
        print("  python3 create_new_project.py dragon")
        print("  python3 create_new_project.py car_model")
        print("  python3 create_new_project.py list")