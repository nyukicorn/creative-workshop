const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8083');

ws.on('open', function() {
    console.log('🔍 背景画像設定をデバッグ中...');
    
    // まずWebSocket接続をテスト
    setTimeout(() => {
        console.log('📡 WebSocket接続テスト');
        const testCommand = {
            action: "addObject",
            id: "test_rose",
            type: "rose",
            position: [1, 2, 0],
            color: "#00FF00"
        };
        ws.send(JSON.stringify(testCommand));
        console.log('✅ テスト用緑のバラを追加');
    }, 1000);
    
    // 背景画像設定
    setTimeout(() => {
        console.log('🖼️ 背景画像コマンド送信');
        const setBgCommand = {
            action: "setBouquetBackground",
            imagePath: "http://localhost:8084/flower_bouquet.png"
        };
        ws.send(JSON.stringify(setBgCommand));
        console.log('📤 背景画像コマンド送信完了');
    }, 2000);
    
    // ブラウザコンソールでも実行可能な直接コマンド
    setTimeout(() => {
        console.log('');
        console.log('🛠️ ブラウザで直接実行する方法:');
        console.log('1. ブラウザの開発者ツール（F12）を開く');
        console.log('2. コンソールタブに移動');
        console.log('3. 以下のコマンドを入力して実行:');
        console.log('');
        console.log('setBouquetBackground("http://localhost:8084/flower_bouquet.png")');
        console.log('');
        console.log('4. エラーメッセージがないか確認');
        
        setTimeout(() => {
            ws.close();
        }, 1000);
    }, 3000);
});

ws.on('error', function(error) {
    console.error('❌ WebSocket error:', error);
});