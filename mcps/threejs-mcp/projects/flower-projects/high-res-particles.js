const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8083');

ws.on('open', function() {
    console.log('🎆 高解像度パーティクル変換開始...');
    
    setTimeout(() => {
        const convertCommand = {
            action: "convertToParticles",
            imagePath: "http://localhost:8084/flower_bouquet.png",
            particleSize: 0.08,  // より小さなパーティクル
            spacing: 0.06        // より密な配置
        };
        
        ws.send(JSON.stringify(convertCommand));
        console.log('🌟 高解像度パーティクル変換コマンドを送信');
        console.log('');
        console.log('✨ 改善点:');
        console.log('   🖤 黒背景で美しいコントラスト');
        console.log('   🔬 200x200解像度で細かい詳細');
        console.log('   ⭐ 1ピクセルごとの高密度パーティクル');
        console.log('   💫 AdditiveBlendingでキラキラ効果');
        console.log('');
        console.log('🎮 さらに調整したい場合:');
        console.log('convertImageToParticles("http://localhost:8084/flower_bouquet.png", 0.05, 0.04)');
        console.log('↑ (より小さく、より密に)');
        
        setTimeout(() => {
            ws.close();
        }, 2000);
    }, 1000);
});

ws.on('error', function(error) {
    console.error('WebSocket error:', error);
});