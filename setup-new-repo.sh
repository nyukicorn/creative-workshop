#!/bin/bash

# 新規GitHubリポジトリ接続スクリプト
# リポジトリ作成後に実行してください

USERNAME="nyukicorn"  # あなたのGitHubユーザー名
REPO_NAME="creative-workshop"

echo "Setting up new repository: ${USERNAME}/${REPO_NAME}"

# リモートリポジトリを追加
git remote add origin https://github.com/${USERNAME}/${REPO_NAME}.git

# メインブランチ設定
git branch -M main

# 初回コミット
git commit -m "Initial creative workshop setup with integrated MCP tools

- Integrated Kamui Code MCP (images, music, 3D, video)
- Integrated Blender MCP (3D optimization)  
- Integrated Three.js MCP (web integration)
- GitHub Actions workflow for automated production
- Modular prompt system for flexible content generation
- Quality assessment and deployment automation

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# プッシュ
git push -u origin main

echo "Repository setup complete!"
echo "🌐 Repository URL: https://github.com/${USERNAME}/${REPO_NAME}"