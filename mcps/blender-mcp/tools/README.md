# Blender MCP Server

Blender用のMCPサーバーです。Blenderの自動化とPythonスクリプトの実行を可能にします。

## 機能

- BlenderでのPythonスクリプト実行
- シーンのレンダリング
- Python式の評価
- スクリプトファイルの作成

## セットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. ビルド:
```bash
npm run build
```

3. 開発モード:
```bash
npm run dev
```

## 使用方法

### Claude MCPクライアントでの設定

`~/.claude/mcp_settings.json`に以下を追加:

```json
{
  "mcpServers": {
    "blender": {
      "command": "node",
      "args": ["/path/to/mcp-tools/Blender/dist/index.js"]
    }
  }
}
```

### 利用可能なツール

1. **execute_blender_script**: BlenderでPythonスクリプトを実行
2. **render_scene**: Blenderシーンをレンダリング
3. **create_blender_script**: Pythonスクリプトファイルを作成
4. **run_python_expression**: Python式を評価

## 例

```python
# キューブを作成するスクリプト
import bpy

# デフォルトキューブを削除
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# 新しいキューブを作成
bpy.ops.mesh.primitive_cube_add(location=(0, 0, 0))
```

## 注意事項

- Blenderのパスは`/Applications/Blender.app/Contents/MacOS/Blender`に設定されています
- 必要に応じてパスを変更してください
- Blenderがインストールされている必要があります