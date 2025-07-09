#!/usr/bin/env python3
"""
Blenderプロジェクト自動エクスポートスクリプト
プロジェクトからGLBファイルを自動生成
"""

import os
import sys
import subprocess
import json
from pathlib import Path
import shutil

def find_blender():
    """Blenderの実行可能ファイルを見つける"""
    possible_paths = [
        "/Applications/Blender.app/Contents/MacOS/Blender",
        "/opt/blender/blender",
        "/usr/local/bin/blender",
        "blender"  # PATH内
    ]
    
    for path in possible_paths:
        if shutil.which(path) or os.path.exists(path):
            return path
    
    return None

def create_export_script(project_name, blend_file, output_path):
    """Blender用エクスポートスクリプトを生成"""
    script_content = f'''
import bpy
import os

# すべてのオブジェクトを選択
bpy.ops.object.select_all(action='SELECT')

# GLBエクスポート設定
export_settings = {{
    'filepath': "{output_path}",
    'export_format': 'GLB',
    'use_selection': False,
    'export_materials': 'EXPORT',
    'export_cameras': True,
    'export_lights': True,
    'export_animations': True,
    'export_draco_mesh_compression_enable': True,
    'export_draco_mesh_compression_level': 6,
    'export_draco_position_quantization': 14,
    'export_draco_normal_quantization': 10,
    'export_draco_texcoord_quantization': 12,
    'export_draco_color_quantization': 10,
    'export_draco_generic_quantization': 12
}}

# エクスポート実行
try:
    bpy.ops.export_scene.gltf(**export_settings)
    print(f"✅ エクスポート成功: {output_path}")
except Exception as e:
    print(f"❌ エクスポートエラー: {{e}}")
    exit(1)

# ファイルサイズを確認
if os.path.exists("{output_path}"):
    size = os.path.getsize("{output_path}") / (1024 * 1024)  # MB
    print(f"📦 ファイルサイズ: {{size:.2f}}MB")
else:
    print("❌ エクスポートされたファイルが見つかりません")
    exit(1)
'''
    return script_content

def export_project(project_name):
    """プロジェクトをエクスポート"""
    # パス設定
    blender_dir = Path("/Users/nukuiyuki/Dev/mcp-tools/Blender")
    projects_dir = blender_dir / "projects"
    project_dir = projects_dir / project_name
    assets_dir = blender_dir / "assets"
    
    # プロジェクトディレクトリの確認
    if not project_dir.exists():
        print(f"❌ プロジェクト '{project_name}' が見つかりません")
        print(f"📁 場所: {project_dir}")
        return False
    
    # .blendファイルを探す
    blend_files = list(project_dir.glob("**/*.blend"))
    if not blend_files:
        print(f"❌ .blendファイルが見つかりません: {project_dir}")
        return False
    
    # 最新の.blendファイルを選択
    blend_file = max(blend_files, key=os.path.getmtime)
    print(f"📁 .blendファイル: {blend_file}")
    
    # Blenderを見つける
    blender_path = find_blender()
    if not blender_path:
        print("❌ Blenderが見つかりません")
        print("Blenderがインストールされていることを確認してください")
        return False
    
    print(f"🎨 Blender: {blender_path}")
    
    # エクスポート設定
    exports_dir = project_dir / "exports"
    exports_dir.mkdir(exist_ok=True)
    
    output_filename = f"{project_name}.glb"
    output_path = exports_dir / output_filename
    assets_output_path = assets_dir / output_filename
    
    # Blenderスクリプトを作成
    export_script = create_export_script(project_name, str(blend_file), str(output_path))
    temp_script = project_dir / "temp_export.py"
    
    with open(temp_script, 'w', encoding='utf-8') as f:
        f.write(export_script)
    
    try:
        print(f"🚀 エクスポート開始...")
        print(f"   入力: {blend_file}")
        print(f"   出力: {output_path}")
        
        # Blenderでエクスポートを実行
        cmd = [
            str(blender_path),
            str(blend_file),
            "--background",
            "--python", str(temp_script)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"❌ Blenderエクスポートエラー:")
            print(result.stderr)
            return False
        
        # 成功確認
        if output_path.exists():
            file_size = output_path.stat().st_size / (1024 * 1024)  # MB
            print(f"✅ エクスポート成功!")
            print(f"📦 ファイルサイズ: {file_size:.2f}MB")
            print(f"📁 保存場所: {output_path}")
            
            # assetsディレクトリにもコピー
            assets_dir.mkdir(exist_ok=True)
            shutil.copy2(output_path, assets_output_path)
            print(f"📋 アセットにコピー: {assets_output_path}")
            
            return True
        else:
            print("❌ エクスポートファイルが生成されませんでした")
            return False
            
    except Exception as e:
        print(f"❌ エクスポートエラー: {e}")
        return False
    
    finally:
        # 一時ファイルを削除
        if temp_script.exists():
            temp_script.unlink()

def list_exportable_projects():
    """エクスポート可能なプロジェクトをリスト表示"""
    projects_dir = Path("/Users/nukuiyuki/Dev/mcp-tools/Blender/projects")
    
    if not projects_dir.exists():
        print("❌ projectsディレクトリが見つかりません")
        return
    
    projects = []
    for item in projects_dir.iterdir():
        if item.is_dir() and not item.name.startswith('.'):
            blend_files = list(item.glob("**/*.blend"))
            if blend_files:
                exports_dir = item / "exports"
                exported_files = []
                if exports_dir.exists():
                    exported_files = list(exports_dir.glob("*.glb"))
                
                projects.append({
                    'name': item.name,
                    'blend_files': len(blend_files),
                    'exported': len(exported_files) > 0,
                    'exported_files': [f.name for f in exported_files]
                })
    
    if not projects:
        print("📁 エクスポート可能なプロジェクトが見つかりません")
        return
    
    print("📋 エクスポート可能なプロジェクト:")
    print("=" * 50)
    
    for project in projects:
        status = "✅ エクスポート済み" if project['exported'] else "🚧 未エクスポート"
        print(f"📁 {project['name']} ({status})")
        print(f"   .blendファイル: {project['blend_files']}個")
        
        if project['exported_files']:
            print(f"   GLBファイル: {', '.join(project['exported_files'])}")
        print()

if __name__ == "__main__":
    print("🎨 Blenderプロジェクト自動エクスポートツール")
    print("=" * 50)
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "list":
            list_exportable_projects()
        else:
            project_name = sys.argv[1]
            print(f"📦 プロジェクト '{project_name}' をエクスポート中...")
            print()
            
            success = export_project(project_name)
            
            if success:
                print()
                print("🎉 エクスポート完了!")
                print("🚀 次のステップ:")
                print(f"   python3 integrate_to_threejs.py {project_name}")
            else:
                print()
                print("💡 トラブルシューティング:")
                print("   1. .blendファイルが存在することを確認")
                print("   2. Blenderが正しくインストールされていることを確認")
                print("   3. プロジェクト名が正しいことを確認")
    else:
        print("使用方法:")
        print("  エクスポート: python3 export_project.py <プロジェクト名>")
        print("  一覧表示: python3 export_project.py list")
        print()
        print("例:")
        print("  python3 export_project.py unicorn_project")
        print("  python3 export_project.py dragon_model")
        print("  python3 export_project.py list")