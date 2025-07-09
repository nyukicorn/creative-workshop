import bpy
import subprocess
import json
import os

def bridge_to_threejs(asset_name="original_unicorn.glb", threejs_config=None):
    """
    Blender → Three.js MCP へのブリッジ機能
    
    Args:
        asset_name: エクスポートするアセット名
        threejs_config: Three.js MCPの設定パス
    """
    
    # Blenderアセットディレクトリのパス
    blender_dir = "/Users/nukuiyuki/Dev/mcp-tools/Blender"
    assets_dir = os.path.join(blender_dir, "assets")
    
    # Three.js MCPサーバーの設定
    if not threejs_config:
        threejs_config = "/Users/nukuiyuki/Dev/mcp-tools/Threejs/build/main.js"
    
    # アセットが存在するか確認
    asset_path = os.path.join(assets_dir, asset_name)
    if not os.path.exists(asset_path):
        print(f"エラー: アセットが見つかりません: {asset_path}")
        return False
    
    # Three.js MCPへのブリッジコマンドを作成
    bridge_command = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "bridgeFromBlender",
            "arguments": {
                "blenderAssetPath": assets_dir,
                "targetGLB": asset_name
            }
        }
    }
    
    print(f"Blender → Three.js ブリッジを実行中...")
    print(f"アセット: {asset_name}")
    print(f"パス: {assets_dir}")
    
    try:
        # Three.js MCPサーバーへの接続コマンド
        cmd = ["node", threejs_config]
        
        # MCPサーバーにコマンドを送信
        process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # JSONコマンドを送信
        command_json = json.dumps(bridge_command)
        stdout, stderr = process.communicate(input=command_json)
        
        print("=== Three.js MCP レスポンス ===")
        print(stdout)
        if stderr:
            print("=== エラー ===")
            print(stderr)
        
        return True
        
    except Exception as e:
        print(f"ブリッジエラー: {e}")
        return False

def create_threejs_viewer(glb_file="original_unicorn.glb", output_file="unicorn_viewer.html"):
    """
    Three.js MCPを使ってHTMLビューワーを作成
    """
    
    blender_dir = "/Users/nukuiyuki/Dev/mcp-tools/Blender"
    assets_dir = os.path.join(blender_dir, "assets")
    threejs_config = "/Users/nukuiyuki/Dev/mcp-tools/Threejs/build/main.js"
    
    glb_path = os.path.join(assets_dir, glb_file)
    output_path = os.path.join(blender_dir, "projects", output_file)
    
    # HTMLビューワー作成コマンド
    viewer_command = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
            "name": "createViewer",
            "arguments": {
                "glbPath": glb_path,
                "outputPath": output_path,
                "title": f"Blender → Three.js: {glb_file}"
            }
        }
    }
    
    print(f"HTMLビューワーを作成中...")
    print(f"GLB: {glb_path}")
    print(f"出力: {output_path}")
    
    try:
        cmd = ["node", threejs_config]
        process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        command_json = json.dumps(viewer_command)
        stdout, stderr = process.communicate(input=command_json)
        
        print("=== ビューワー作成結果 ===")
        print(stdout)
        if stderr:
            print("=== エラー ===")
            print(stderr)
        
        return output_path
        
    except Exception as e:
        print(f"ビューワー作成エラー: {e}")
        return None

# Blender内から実行する場合
if __name__ == "__main__":
    print("=== Blender → Three.js ブリッジテスト ===")
    
    # 1. アセットをThree.jsにブリッジ
    success = bridge_to_threejs("original_unicorn.glb")
    
    if success:
        print("✅ ブリッジ成功!")
        
        # 2. HTMLビューワーを作成
        viewer_path = create_threejs_viewer("original_unicorn.glb", "unicorn_viewer.html")
        
        if viewer_path:
            print(f"✅ HTMLビューワー作成成功: {viewer_path}")
            print("ブラウザでファイルを開いて確認してください")
        else:
            print("❌ HTMLビューワー作成失敗")
    else:
        print("❌ ブリッジ失敗")

print("Blender → Three.js ブリッジスクリプトが読み込まれました")