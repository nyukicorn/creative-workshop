const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8082');

// 各オブジェクトの初期位置
const objects = [
    { id: 'welcome_cube', basePos: [0, 1, 0], bounceHeight: 2.5 },
    { id: 'ajisai_sphere', basePos: [2, 1, 0], bounceHeight: 3.0 },
    { id: 'cosmos_cylinder', basePos: [-2, 1, 0], bounceHeight: 2.8 },
    { id: 'tsubaki_sphere', basePos: [0, 1, -2], bounceHeight: 3.2 }
];

let animationRunning = true;
let startTime = Date.now();

function bounce() {
    if (!animationRunning) return;
    
    const elapsed = (Date.now() - startTime) / 1000; // 秒
    
    objects.forEach((obj, index) => {
        // 各オブジェクトに異なる位相を与える
        const phase = (index * Math.PI / 2); // 90度ずつずらす
        const bounceY = obj.basePos[1] + Math.abs(Math.sin(elapsed * 2 + phase)) * (obj.bounceHeight - obj.basePos[1]);
        
        const moveCommand = {
            action: "moveObject",
            id: obj.id,
            position: [obj.basePos[0], bounceY, obj.basePos[2]]
        };
        
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(moveCommand));
        }
    });
    
    setTimeout(bounce, 50); // 20FPS
}

ws.on('open', function() {
    console.log('🧚‍♀️ 妖精会社バウンスアニメーション開始！');
    console.log('Press Ctrl+C to stop animation');
    
    // アニメーション開始
    setTimeout(bounce, 500);
    
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