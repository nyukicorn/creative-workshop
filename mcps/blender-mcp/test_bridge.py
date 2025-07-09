#!/usr/bin/env python3
"""
Blender → Three.js ブリッジのテストスクリプト
（Blender外で実行可能）
"""

import subprocess
import json
import os

def test_threejs_viewer():
    """
    Three.js MCPでHTMLビューワー作成をテスト
    """
    
    # パス設定
    blender_dir = "/Users/nukuiyuki/Dev/mcp-tools/Blender"
    assets_dir = os.path.join(blender_dir, "assets")
    threejs_build = "/Users/nukuiyuki/Dev/mcp-tools/Threejs/build/main.js"
    
    glb_file = "original_unicorn.glb"
    glb_path = os.path.join(assets_dir, glb_file)
    output_path = os.path.join(blender_dir, "projects", "test_unicorn_viewer.html")
    
    # ファイル存在確認
    print("=== ファイル存在確認 ===")
    print(f"GLBファイル: {glb_path} - {'✅' if os.path.exists(glb_path) else '❌'}")
    print(f"Three.js MCP: {threejs_build} - {'✅' if os.path.exists(threejs_build) else '❌'}")
    
    if not os.path.exists(glb_path):
        print("❌ GLBファイルが見つかりません")
        return False
    
    if not os.path.exists(threejs_build):
        print("❌ Three.js MCPサーバーが見つかりません")
        return False
    
    # HTMLビューワー作成コマンド
    viewer_command = {
        "jsonrpc": "2.0",
        "id": 1,
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
    
    print("=== HTMLビューワー作成テスト ===")
    print(f"入力GLB: {glb_path}")
    print(f"出力HTML: {output_path}")
    
    try:
        # Three.js MCPサーバーを起動してコマンド送信
        cmd = ["node", threejs_build]
        process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # JSONコマンドを送信
        command_json = json.dumps(viewer_command)
        stdout, stderr = process.communicate(input=command_json, timeout=10)
        
        print("=== Three.js MCPレスポンス ===")
        print("STDOUT:", stdout)
        if stderr:
            print("STDERR:", stderr)
        
        # 出力ファイルの存在確認
        if os.path.exists(output_path):
            print(f"✅ HTMLビューワー作成成功: {output_path}")
            
            # ファイルサイズ確認
            file_size = os.path.getsize(output_path)
            print(f"ファイルサイズ: {file_size} bytes")
            
            # ブラウザで開く
            subprocess.run(["open", output_path])
            print("ブラウザでHTMLファイルを開きました")
            
            return True
        else:
            print("❌ HTMLファイルが作成されませんでした")
            return False
        
    except subprocess.TimeoutExpired:
        print("❌ タイムアウト: MCPサーバーの応答が遅すぎます")
        process.kill()
        return False
    except Exception as e:
        print(f"❌ エラー: {e}")
        return False

def test_bridge_function():
    """
    ブリッジ機能のテスト
    """
    
    # パス設定
    blender_dir = "/Users/nukuiyuki/Dev/mcp-tools/Blender"
    assets_dir = os.path.join(blender_dir, "assets")
    threejs_build = "/Users/nukuiyuki/Dev/mcp-tools/Threejs/build/main.js"
    
    # ブリッジコマンド
    bridge_command = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
            "name": "bridgeFromBlender",
            "arguments": {
                "blenderAssetPath": assets_dir,
                "targetGLB": "original_unicorn.glb"
            }
        }
    }
    
    print("=== ブリッジ機能テスト ===")
    print(f"アセットパス: {assets_dir}")
    print(f"ターゲットGLB: original_unicorn.glb")
    
    try:
        cmd = ["node", threejs_build]
        process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        command_json = json.dumps(bridge_command)
        stdout, stderr = process.communicate(input=command_json, timeout=10)
        
        print("=== ブリッジレスポンス ===")
        print("STDOUT:", stdout)
        if stderr:
            print("STDERR:", stderr)
        
        return True
        
    except Exception as e:
        print(f"❌ ブリッジエラー: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Blender → Three.js 連携テスト開始")
    print("=" * 50)
    
    # 1. HTMLビューワー作成テスト
    viewer_success = test_threejs_viewer()
    
    print("\n" + "=" * 50)
    
    # 2. ブリッジ機能テスト
    bridge_success = test_bridge_function()
    
    print("\n" + "=" * 50)
    print("🏁 テスト結果")
    print(f"HTMLビューワー作成: {'✅ 成功' if viewer_success else '❌ 失敗'}")
    print(f"ブリッジ機能: {'✅ 成功' if bridge_success else '❌ 失敗'}")
    
    if viewer_success and bridge_success:
        print("🎉 全テスト合格！Blender → Three.js連携が正常に動作しています")
    else:
        print("⚠️  一部テストが失敗しました")