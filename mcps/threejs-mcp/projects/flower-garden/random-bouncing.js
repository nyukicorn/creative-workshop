const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8082');

// 各オブジェクトの設定（ランダム要素付き）
const objects = [
    { 
        id: 'welcome_cube', 
        basePos: [0, 1, 0], 
        bounceHeight: 2.5,
        speed: Math.random() * 2 + 1.5, // 1.5-3.5のランダム速度
        phase: Math.random() * Math.PI * 2, // ランダム初期位相
        bounceVariation: Math.random() * 0.5 + 0.8 // 0.8-1.3のランダム高さ倍率
    },
    { 
        id: 'ajisai_sphere', 
        basePos: [2, 1, 0], 
        bounceHeight: 3.0,
        speed: Math.random() * 2 + 1.5,
        phase: Math.random() * Math.PI * 2,
        bounceVariation: Math.random() * 0.5 + 0.8
    },
    { 
        id: 'cosmos_cylinder', 
        basePos: [-2, 1, 0], 
        bounceHeight: 2.8,
        speed: Math.random() * 2 + 1.5,
        phase: Math.random() * Math.PI * 2,
        bounceVariation: Math.random() * 0.5 + 0.8
    },
    { 
        id: 'tsubaki_sphere', 
        basePos: [0, 1, -2], 
        bounceHeight: 3.2,
        speed: Math.random() * 2 + 1.5,
        phase: Math.random() * Math.PI * 2,
        bounceVariation: Math.random() * 0.5 + 0.8
    }
];

let animationRunning = true;
let startTime = Date.now();
let frameCount = 0;

function randomBounce() {
    if (!animationRunning) return;
    
    const elapsed = (Date.now() - startTime) / 1000;
    frameCount++;
    
    objects.forEach((obj, index) => {
        // ランダムな速度と位相でより自然な動き
        let bounceY = obj.basePos[1] + Math.abs(Math.sin(elapsed * obj.speed + obj.phase)) * (obj.bounceHeight - obj.basePos[1]) * obj.bounceVariation;
        
        // 30フレームごとにランダムなバリエーションを追加
        if (frameCount % 30 === 0) {
            obj.bounceVariation = Math.random() * 0.5 + 0.8;
        }
        
        // 時々ランダムな高さのスパイクを追加
        if (Math.random() < 0.02) { // 2%の確率
            bounceY += Math.random() * 1.5;
        }
        
        // 小さなランダムなX,Z軸の揺れを追加
        const randomX = obj.basePos[0] + (Math.random() - 0.5) * 0.3;
        const randomZ = obj.basePos[2] + (Math.random() - 0.5) * 0.3;
        
        const moveCommand = {
            action: "moveObject",
            id: obj.id,
            position: [randomX, bounceY, randomZ]
        };
        
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(moveCommand));
        }
    });
    
    // フレームレートもランダムに変化（30-60FPS）
    const randomInterval = Math.random() * 17 + 17; // 17-34ms (30-60 FPS)
    setTimeout(randomBounce, randomInterval);
}

ws.on('open', function() {
    console.log('🧚‍♀️ 妖精会社ランダムバウンスアニメーション開始！');
    console.log('各オブジェクトがランダムな速度と高さで弾みます 🎲');
    console.log('Press Ctrl+C to stop animation');
    
    // アニメーション開始
    setTimeout(randomBounce, 500);
    
    // 30秒後に停止
    setTimeout(() => {
        console.log('アニメーション停止中...');
        animationRunning = false;
        
        // 元の位置に戻す
        setTimeout(() => {
            objects.forEach(obj => {
                const resetCommand = {
                    action: "moveObject",
                    id: obj.id,
                    position: obj.basePos
                };
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(resetCommand));
                }
            });
            
            setTimeout(() => {
                console.log('アニメーション完了！全オブジェクトを元の位置に戻しました 🌸💠🌼🌺');
                ws.close();
            }, 1000);
        }, 500);
    }, 30000);
});

ws.on('error', function(error) {
    console.error('WebSocket error:', error);
});

// Ctrl+Cで停止
process.on('SIGINT', function() {
    console.log('\nアニメーション停止中...');
    animationRunning = false;
    
    setTimeout(() => {
        objects.forEach(obj => {
            const resetCommand = {
                action: "moveObject",
                id: obj.id,
                position: obj.basePos
            };
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(resetCommand));
            }
        });
        
        setTimeout(() => {
            console.log('全オブジェクトを元の位置に戻しました');
            process.exit(0);
        }, 1000);
    }, 500);
});