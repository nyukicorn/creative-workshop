# 🌟 Three.js パーティクル変換テンプレート

## ✨ 完成した設定（コピー用）

### 🎨 最適化されたパーティクル設定
```javascript
// 最高品質パーティクル設定
const maxSize = 300;  // 超高解像度
const particleSize = 0.03;  // 極小サイズ
const alphaThreshold = 0.1;  // アルファ閾値

// マテリアル設定
const material = new THREE.PointsMaterial({
    size: 0.03,
    vertexColors: true,
    transparent: false,
    sizeAttenuation: true
});

// 位置計算（16:9背景用）
const px = ((x / canvas.width) - 0.5) * 8.0;
const py = 2 + ((0.5 - y / canvas.height) * 4.5);
const pz = -2 + (Math.random() - 0.5) * 0.2;
```

## 🖼️ 新しい画像を使う方法

### Step 1: 画像ファイル準備
1. **画像ファイル配置**: `flower_bouquet.png` を新しい画像に置き換え
2. **推奨形式**: PNG（透明背景対応）、JPG
3. **推奨サイズ**: 1024x1024 以上

### Step 2: ファイル名変更（オプション）
```javascript
// bouquet-demo.html の188行目と516行目を変更
img.src = "http://localhost:8084/YOUR_IMAGE.png";
```

### Step 3: 背景サイズ調整（必要に応じて）
```javascript
// 16:9以外のアスペクト比の場合
const planeWidth = 8;    // 幅調整
const planeHeight = 4.5; // 高さ調整
```

## 🎛️ カスタマイズオプション

### パーティクル密度調整
```javascript
const maxSize = 200;  // 標準品質（高速）
const maxSize = 300;  // 高品質（現在の設定）
const maxSize = 400;  // 最高品質（重い）
```

### パーティクルサイズ調整
```javascript
size: 0.02,  // 極小（写真的）
size: 0.03,  // 小（現在の設定）
size: 0.05,  // 中（バランス良い）
size: 0.08,  // 大（見やすい）
```

### フィルタリング調整
```javascript
if (a > 0.05) // より多くのピクセル
if (a > 0.1)  // 標準（現在の設定）
if (a > 0.3)  // 主要部分のみ
```

## 📁 ファイル構成

### 必要ファイル
```
seirei-hub/
├── bouquet-demo.html           # メインファイル
├── bouquet-websocket-server.js # WebSocketサーバー
├── cors-server.js              # CORS対応サーバー
├── YOUR_IMAGE.png              # 変換したい画像
└── PARTICLE_TEMPLATE_USAGE.md  # このファイル
```

### サーバー起動順序
```bash
# 1. CORS サーバー起動
node cors-server.js

# 2. WebSocket サーバー起動
node bouquet-websocket-server.js

# 3. ブラウザで開く
open http://localhost:8084/bouquet-demo.html
```

## 🎨 様々な画像での応用例

### 適用可能な画像タイプ
- ✅ **花・植物**: 元の花束のような自然な美しさ
- ✅ **風景写真**: 空や海のグラデーションが美しい
- ✅ **ポートレート**: 人物写真も芸術的に
- ✅ **イラスト**: アニメ調やデジタルアート
- ✅ **ロゴ・文字**: 企業ロゴやタイポグラフィ

### 推奨される画像特徴
- **高コントラスト**: パーティクルがはっきり見える
- **鮮やかな色**: より美しいパーティクル効果
- **明確な境界**: 背景との区別がつきやすい

## ⚡ パフォーマンス最適化

### 軽量化設定
```javascript
const maxSize = 150;     // 解像度を下げる
size: 0.05,             // パーティクルを大きく
for (let y = 0; y < canvas.height; y += 2)  // 間引き処理
```

### 高品質設定
```javascript
const maxSize = 400;     // 解像度を上げる
size: 0.02,             // パーティクルを小さく
for (let y = 0; y < canvas.height; y += 1)  // 全ピクセル処理
```

## 🚀 将来の拡張可能性

### 追加できる機能
- **アニメーション**: 浮遊効果、回転効果
- **インタラクション**: マウス追従、クリック効果
- **複数画像**: 画像切り替え機能
- **エクスポート**: 動画・画像出力機能
- **リアルタイム編集**: パラメータ調整UI

### Three.js 活用
- **VRモード**: WebXR対応
- **物理エンジン**: 重力・衝突判定
- **シェーダー**: カスタム視覚効果
- **ポストプロセシング**: ブルーム、DOF効果

## 💡 成功のポイント

1. **`transparent: false`**: 最重要設定
2. **適切なタイミング**: 画像読み込み後の実行
3. **座標系の一致**: 背景とパーティクルの位置合わせ
4. **段階的調整**: パラメータを少しずつ変更

---

**🎉 このテンプレートで、どんな画像でも美しいパーティクルアートが作成できます！**