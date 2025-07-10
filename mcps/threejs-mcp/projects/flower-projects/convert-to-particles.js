const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8083');

ws.on('open', function() {
    console.log('🎆 画像をパーティクルに変換中...');
    
    setTimeout(() => {
        const convertCommand = {
            action: "convertToParticles",
            imagePath: "http://localhost:8084/flower_bouquet.png",
            particleSize: 0.15,  // より大きなパーティクルサイズ
            spacing: 0.12        // 適切な間隔
        };
        
        ws.send(JSON.stringify(convertCommand));
        console.log('🌟 パーティクル変換コマンドを送信しました');
        console.log('');
        console.log('✨ ブラウザで確認してください:');
        console.log('   - 花束の各ピクセルが3Dパーティクルとして表示');
        console.log('   - 元の色を保持したパーティクルクラウド');
        console.log('   - マウスで回転してパーティクルの立体感を確認');
        console.log('');
        console.log('🎮 ブラウザコンソールで調整可能:');
        console.log('convertImageToParticles("http://localhost:8084/flower_bouquet.png", 0.05, 0.1)');
        console.log('↑ (画像パス, パーティクルサイズ, 間隔)');
        
        setTimeout(() => {
            ws.close();
        }, 2000);
    }, 1000);
});

ws.on('error', function(error) {
    console.error('WebSocket error:', error);
});