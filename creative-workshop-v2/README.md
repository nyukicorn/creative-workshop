# Creative Workshop v2

## 概要
Kamui Code MCP → Three.js MCP の簡素化されたクリエイティブ制作自動化プロジェクト

## アーキテクチャ
- **ローカル**: Claude Code → 設計・YAML作成
- **GitHub Actions**: Kamui Code MCP → Three.js MCP → デプロイ

## 構成
```
creative-workshop-v2/
├── .github/workflows/     # GitHub Actions設定
├── configs/              # MCP設定ファイル
├── prompts/             # 各種プロンプト
├── assets/             # 生成素材
└── dist/              # 最終出力
```

## 簡素化されたフロー
1. **素材生成** - Kamui Code MCPで画像・音声素材作成
2. **Web統合** - Three.js MCPで統合
3. **自動デプロイ** - GitHub Actionsで配信

## 重点課題
- Kamui Code MCPの保存・ダウンロード機能の安定化
- Three.js MCPへの素材受け渡しの確実化