# Blender MCP Integration Hub

3D制作とWeb技術の統合環境です。Blender、Three.js、KamuiCodeの連携プロジェクト用。

## 📁 フォルダー構造

```
Blender/
├── src/                    # MCPサーバーソース
│   └── index.ts           # Blender MCP実装
├── dist/                  # ビルド済みMCPサーバー
├── tools/                 # 設定・ドキュメント
│   ├── mcp-blender-config.json
│   └── README.md
├── scripts/               # Blenderスクリプト
│   ├── examples/          # サンプルスクリプト
│   └── *.py              # 各種操作スクリプト
├── assets/                # 3Dアセット
│   ├── unicorn1_complete/ # 完全なユニコーンアセット
│   └── *.glb             # GLBファイル
├── projects/              # Blenderプロジェクト
│   └── *.blend           # Blenderシーンファイル
└── archive_experiments/   # 実験アーカイブ
```

## 🔗 連携予定

### Three.js連携
- GLB/GLTFエクスポート → Three.jsで表示
- WebXR対応
- リアルタイムプレビュー

### KamuiCode連携  
- MCPサーバー間連携
- 自動化ワークフロー
- CI/CD統合

## 🚀 使用方法

### MCP設定
```bash
claude --mcp-config=tools/mcp-blender-config.json
```

### 開発用コマンド
```bash
npm run build    # TypeScriptビルド
npm run dev      # 開発モード
npm run start    # MCPサーバー起動
```

## 🎯 新規プロジェクトワークフロー

### 1. 新規プロジェクト作成
```bash
python3 create_new_project.py <プロジェクト名>
# 例: python3 create_new_project.py dragon_model
```

### 2. Blenderで3Dモデル制作
- `projects/<プロジェクト名>/models/` でBlendファイル作成
- モデリング・アニメーション・マテリアル設定

### 3. GLBエクスポート
```bash
python3 scripts/export_project.py <プロジェクト名>
# 自動でGLBファイルを生成・最適化
```

### 4. Three.js統合
```bash
python3 scripts/integrate_to_threejs.py <プロジェクト名>
# Three.jsビューワーに自動統合
```

### 5. Web確認
```bash
cd ../Threejs
python3 start_integrated_server.py
# ブラウザで確認: http://localhost:8090
```

### プロジェクト管理コマンド
```bash
# プロジェクト一覧
python3 create_new_project.py list

# エクスポート可能プロジェクト一覧
python3 scripts/export_project.py list

# 統合済みプロジェクト一覧
python3 scripts/integrate_to_threejs.py list
```

## 📋 主要アセット

- **original_unicorn.glb** - 高品質ユニコーンモデル（推奨）
- **unicorn1_complete/** - 完全なソースファイル一式