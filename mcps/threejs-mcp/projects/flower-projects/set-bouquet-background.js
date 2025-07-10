const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8083');

ws.on('open', function() {
    console.log('🌹💐 ブーケ背景画像を設定中...');
    
    // 正しいパスで背景画像を設定
    const setBgCommand = {
        action: "setBouquetBackground",
        imagePath: "file:///Users/nukuiyuki/Dev/20250219_画像＋three.js/kamui-creative-2025-02-19T17-31-44/assets/images/flower_bouquet.png"
    };
    
    setTimeout(() => {
        ws.send(JSON.stringify(setBgCommand));
        console.log('🖼️ 花束背景画像を再設定しました');
        console.log('📁 パス: /Users/nukuiyuki/Dev/20250219_画像＋three.js/kamui-creative-2025-02-19T17-31-44/assets/images/flower_bouquet.png');
        console.log('');
        console.log('✨ ブラウザで背景が美しい花束の画像に変わったか確認してください！');
        
        setTimeout(() => {
            ws.close();
        }, 1000);
    }, 500);
});

ws.on('error', function(error) {
    console.error('WebSocket error:', error);
});