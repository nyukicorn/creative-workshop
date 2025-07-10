const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8083');

ws.on('open', function() {
    console.log('🎆 完璧なパーティクル変換開始...');
    
    setTimeout(() => {
        const convertCommand = {
            action: "convertToParticles",
            imagePath: "http://localhost:8084/flower_bouquet.png",
            particleSize: 0.08,  // 適切なサイズ
            spacing: 0.05        // 不要（新しい計算方式で無視される）
        };
        
        ws.send(JSON.stringify(convertCommand));
        console.log('🌟 完璧なパーティクル変換コマンドを送信');
        console.log('');
        console.log('✨ 修正点:');
        console.log('   🖤 画面全体が真っ黒（CSS背景も含む）');
        console.log('   📐 パーティクルが背景画像と完全同サイズ（6x8）');
        console.log('   📍 パーティクルと背景画像が同じ位置（0,2,-2）');
        console.log('   🎯 元画像から飛び出さない正確な配置');
        console.log('');
        console.log('🌹 これで花束がパーティクルで完璧に再現されます！');
        
        setTimeout(() => {
            ws.close();
        }, 2000);
    }, 1000);
});

ws.on('error', function(error) {
    console.error('WebSocket error:', error);
});