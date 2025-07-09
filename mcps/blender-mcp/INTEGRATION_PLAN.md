# 統合プロジェクト計画

## 🎯 プロジェクト方針

このBlenderフォルダーを**3D制作ハブ**として、以下の連携を実現：

### 1. **Blender → Three.js ワークフロー**
```
Blender MCP → GLB/GLTF → Three.js → WebXR/Web表示
```

**利点**:
- Blenderで高品質3Dモデル作成
- MCPで自動エクスポート
- Three.jsでWeb表示・インタラクション
- WebXRでVR/AR対応

### 2. **KamuiCode連携**
```
KamuiCode MCP ↔ Blender MCP → 統合ワークフロー
```

**利点**:
- MCPサーバー間通信
- 自動化パイプライン
- CI/CDとの統合

## 📋 実装計画

### Phase 1: Three.js連携
1. **Three.js MCPサーバー作成**
   - GLB/GLTFローダー
   - リアルタイムプレビュー
   - WebXRサポート

2. **ブリッジ機能**
   - Blender → Three.jsの自動連携
   - ホットリロード機能

### Phase 2: KamuiCode統合
1. **MCP間通信プロトコル**
   - サーバー間データ交換
   - ワークフロー自動化

2. **統合開発環境**
   - 3D → Code → Deploy の一連の流れ

## 🗂 推奨プロジェクト構造

```
mcp-tools/
├── Blender/               # 3D制作ハブ（現在）
├── Three.js/              # Web3D表示・WebXR
├── KamuiCode/             # コード生成・自動化
└── Integrations/          # 連携プロジェクト
    ├── 3d-web-viewer/     # Blender + Three.js
    ├── auto-workflow/     # 全MCP連携
    └── shared-assets/     # 共通アセット
```

## 🔧 技術スタック

### Blender側
- **MCP Server**: TypeScript
- **出力形式**: GLB/GLTF, OBJ, FBX
- **最適化**: Draco圧縮

### Three.js側
- **MCP Server**: TypeScript
- **レンダリング**: WebGL/WebGPU
- **VR/AR**: WebXR API

### 統合
- **プロトコル**: JSON-RPC (MCP標準)
- **ファイル共有**: ローカル/クラウドストレージ
- **リアルタイム**: WebSocket (必要に応じて)

## 🚀 次のステップ

1. **Three.js MCPサーバー作成**
2. **Blender-Three.js ブリッジ実装**
3. **KamuiCode連携設計**
4. **統合テストプロジェクト**

このBlenderフォルダーは、3D制作の中心ハブとして最適な位置づけです。