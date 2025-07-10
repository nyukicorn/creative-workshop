const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8083');

ws.on('open', function() {
    console.log('🌹💐 ブーケ背景画像を修正中...');
    
    // HTTPサーバー経由でアクセス可能なパスに変更
    const setBgCommand = {
        action: "setBouquetBackground",
        imagePath: "http://localhost:8084/flower_bouquet.png"
    };
    
    setTimeout(() => {
        ws.send(JSON.stringify(setBgCommand));
        console.log('🖼️ 花束背景画像をHTTPパスで設定しました');
        console.log('🌐 パス: http://localhost:8084/flower_bouquet.png');
        console.log('');
        console.log('✨ ブラウザで背景が美しい花束の画像に変わったか確認してください！');
        console.log('💡 もしまだ変わらない場合は、ブラウザの開発者ツール（F12）でエラーを確認してください');
        
        setTimeout(() => {
            ws.close();
        }, 1000);
    }, 500);
});

ws.on('error', function(error) {
    console.error('WebSocket error:', error);
});