const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8083');

ws.on('open', function() {
    console.log('🔍 ブーケデバッグ開始...');
    
    // まず背景画像のみテスト
    setTimeout(() => {
        console.log('1️⃣ 背景画像設定テスト');
        const setBgCommand = {
            action: "setBouquetBackground",
            imagePath: "http://localhost:8084/flower_bouquet.png"
        };
        ws.send(JSON.stringify(setBgCommand));
    }, 1000);
    
    // 5秒後にパーティクルテスト
    setTimeout(() => {
        console.log('2️⃣ パーティクル変換テスト');
        const convertCommand = {
            action: "convertToParticles",
            imagePath: "http://localhost:8084/flower_bouquet.png",
            particleSize: 0.1,
            spacing: 0.1
        };
        ws.send(JSON.stringify(convertCommand));
    }, 5000);
    
    setTimeout(() => {
        console.log('');
        console.log('🛠️ ブラウザの開発者ツール（F12）で以下を確認してください:');
        console.log('1. コンソールタブでエラーメッセージをチェック');
        console.log('2. 以下のコマンドを直接実行してみてください:');
        console.log('');
        console.log('// 背景画像の状態確認');
        console.log('console.log("bgPlane:", window.bgPlane);');
        console.log('console.log("bgPlane opacity:", window.bgPlane?.material?.opacity);');
        console.log('');
        console.log('// パーティクルの状態確認');
        console.log('console.log("particleSystem:", scene.getObjectByName("particleSystem"));');
        console.log('');
        console.log('// 手動で背景画像設定');
        console.log('setBouquetBackground("http://localhost:8084/flower_bouquet.png");');
        console.log('');
        console.log('// 手動でパーティクル生成');
        console.log('convertImageToParticles("http://localhost:8084/flower_bouquet.png", 0.1, 0.1);');
        
        setTimeout(() => {
            ws.close();
        }, 2000);
    }, 7000);
});

ws.on('error', function(error) {
    console.error('WebSocket error:', error);
});