const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8082');

// 風に揺れる花のアニメーション設定
const windyFlowers = [
    // 桜の花びら - 軽やかに回転
    { id: 'sakura_petal_1', rotationSpeed: 0.02, windPattern: 'gentle' },
    { id: 'sakura_petal_2', rotationSpeed: 0.025, windPattern: 'gentle' },
    { id: 'sakura_petal_3', rotationSpeed: 0.018, windPattern: 'gentle' },
    { id: 'sakura_petal_4', rotationSpeed: 0.022, windPattern: 'gentle' },
    
    // 紫陽花の花 - ゆったり回転
    { id: 'ajisai_flower_1', rotationSpeed: 0.015, windPattern: 'slow' },
    { id: 'ajisai_flower_2', rotationSpeed: 0.012, windPattern: 'slow' },
    { id: 'ajisai_flower_3', rotationSpeed: 0.017, windPattern: 'slow' },
    { id: 'ajisai_flower_4', rotationSpeed: 0.014, windPattern: 'slow' },
    
    // コスモスの花びら - 活発に回転
    { id: 'cosmos_petal_1', rotationSpeed: 0.03, windPattern: 'lively' },
    { id: 'cosmos_petal_2', rotationSpeed: 0.028, windPattern: 'lively' },
    { id: 'cosmos_petal_3', rotationSpeed: 0.032, windPattern: 'lively' },
    { id: 'cosmos_petal_4', rotationSpeed: 0.029, windPattern: 'lively' },
    
    // 椿の花 - 重厚に回転
    { id: 'tsubaki_flower', rotationSpeed: 0.01, windPattern: 'heavy' },
    
    // 葉っぱ - 自然に揺れる
    { id: 'ajisai_leaf', rotationSpeed: 0.008, windPattern: 'leaf' },
    { id: 'tsubaki_leaf', rotationSpeed: 0.006, windPattern: 'leaf' },
    
    // 草 - 軽やかに揺れる
    { id: 'grass_1', rotationSpeed: 0.04, windPattern: 'grass' },
    { id: 'grass_2', rotationSpeed: 0.038, windPattern: 'grass' },
    { id: 'grass_3', rotationSpeed: 0.042, windPattern: 'grass' },
    { id: 'grass_4', rotationSpeed: 0.039, windPattern: 'grass' },
    { id: 'grass_5', rotationSpeed: 0.041, windPattern: 'grass' },
    { id: 'grass_6', rotationSpeed: 0.037, windPattern: 'grass' },
    { id: 'grass_7', rotationSpeed: 0.043, windPattern: 'grass' },
    { id: 'grass_8', rotationSpeed: 0.036, windPattern: 'grass' }
];

let animationRunning = true;
let windDirection = 1; // 風向き
let windStrength = 1; // 風の強さ

function createWindEffect() {
    // 風の向きと強さをランダムに変化
    if (Math.random() < 0.05) { // 5%の確率で風向き変更
        windDirection *= -1;
        console.log(`🌪️ 風向きが変わりました: ${windDirection > 0 ? '東風' : '西風'}`);
    }
    
    if (Math.random() < 0.03) { // 3%の確率で風の強さ変更
        windStrength = Math.random() * 1.5 + 0.5; // 0.5-2.0
        console.log(`💨 風の強さが変わりました: ${windStrength.toFixed(2)}`);
    }
    
    if (Math.random() < 0.01) { // 1%の確率で突風
        windStrength = Math.random() * 3 + 2; // 2-5の強風
        console.log(`🌀 突風が吹きました！強さ: ${windStrength.toFixed(2)}`);
        
        // 3秒後に風を弱める
        setTimeout(() => {
            windStrength = Math.random() * 1.2 + 0.8;
            console.log(`🍃 風が静まりました: ${windStrength.toFixed(2)}`);
        }, 3000);
    }
}

ws.on('open', function() {
    console.log('🌸💨 花の庭園に風のアニメーションを追加中... 💨🌸');
    console.log('🎭 各花が風のパターンに応じて美しく踊ります');
    console.log('風のパターン:');
    console.log('🌸 gentle: 桜の花びらの軽やかな回転');
    console.log('💠 slow: 紫陽花のゆったり回転'); 
    console.log('🌼 lively: コスモスの活発な回転');
    console.log('🌺 heavy: 椿の重厚な回転');
    console.log('🍃 leaf: 葉っぱの自然な揺れ');
    console.log('🌱 grass: 草の軽やかな揺れ');
    console.log('');
    
    // すべての花を回転開始
    setTimeout(() => {
        console.log('🌪️ 風のアニメーション開始！');
        
        windyFlowers.forEach((flower, index) => {
            setTimeout(() => {
                const startRotationCommand = {
                    action: "startRotation",
                    id: flower.id,
                    speed: flower.rotationSpeed * windDirection * windStrength
                };
                
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(startRotationCommand));
                    console.log(`🌸 ${flower.id} が${flower.windPattern}パターンで回転開始`);
                }
            }, index * 200); // 0.2秒ずつずらして開始
        });
    }, 1000);
    
    // 風の効果を定期的に更新
    const windInterval = setInterval(() => {
        if (!animationRunning) {
            clearInterval(windInterval);
            return;
        }
        
        createWindEffect();
        
        // 風の変化に応じて回転速度を更新
        windyFlowers.forEach(flower => {
            if (Math.random() < 0.3) { // 30%の確率で更新
                const newSpeed = flower.rotationSpeed * windDirection * windStrength;
                const updateCommand = {
                    action: "startRotation",
                    id: flower.id,
                    speed: newSpeed
                };
                
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(updateCommand));
                }
            }
        });
        
    }, 2000); // 2秒ごとに風をチェック
    
    // 30秒後に停止
    setTimeout(() => {
        console.log('🌅 風が静まってきました...');
        animationRunning = false;
        
        // すべての回転を停止
        setTimeout(() => {
            windyFlowers.forEach((flower, index) => {
                setTimeout(() => {
                    const stopRotationCommand = {
                        action: "stopRotation",
                        id: flower.id
                    };
                    
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify(stopRotationCommand));
                    }
                }, index * 100);
            });
            
            setTimeout(() => {
                console.log('🌸🌼🌺 風の舞が終わりました。花たちは静かに佇んでいます 🌺🌼🌸');
                ws.close();
            }, 3000);
        }, 1000);
    }, 30000);
});

ws.on('error', function(error) {
    console.error('WebSocket error:', error);
});

// Ctrl+Cで停止
process.on('SIGINT', function() {
    console.log('\n🛑 風のアニメーション停止中...');
    animationRunning = false;
    
    setTimeout(() => {
        windyFlowers.forEach(flower => {
            const stopCommand = {
                action: "stopRotation",
                id: flower.id
            };
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(stopCommand));
            }
        });
        
        setTimeout(() => {
            console.log('🌸 すべての花が静止しました');
            process.exit(0);
        }, 1000);
    }, 500);
});