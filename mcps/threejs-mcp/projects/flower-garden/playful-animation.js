const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8082');

// 各オブジェクトの個性的な設定
const objects = [
    { 
        id: 'welcome_cube', 
        basePos: [0, 1, 0], 
        personality: 'energetic', // 元気いっぱい
        jumpHeight: 3.5,
        floatRange: 0.8,
        speed: 2.5,
        phase: 0,
        nextJump: Math.random() * 3000 + 1000, // 1-4秒後にジャンプ
        isJumping: false,
        jumpStartTime: 0
    },
    { 
        id: 'ajisai_sphere', 
        basePos: [2, 1, 0], 
        personality: 'gentle', // 優雅
        jumpHeight: 2.8,
        floatRange: 1.2,
        speed: 1.8,
        phase: Math.PI / 3,
        nextJump: Math.random() * 4000 + 2000, // 2-6秒後
        isJumping: false,
        jumpStartTime: 0
    },
    { 
        id: 'cosmos_cylinder', 
        basePos: [-2, 1, 0], 
        personality: 'playful', // 遊び好き
        jumpHeight: 4.0,
        floatRange: 0.6,
        speed: 3.2,
        phase: Math.PI / 2,
        nextJump: Math.random() * 2500 + 800, // 0.8-3.3秒後
        isJumping: false,
        jumpStartTime: 0
    },
    { 
        id: 'tsubaki_sphere', 
        basePos: [0, 1, -2], 
        personality: 'dreamy', // 夢見がち
        jumpHeight: 3.2,
        floatRange: 1.5,
        speed: 1.5,
        phase: Math.PI,
        nextJump: Math.random() * 5000 + 1500, // 1.5-6.5秒後
        isJumping: false,
        jumpStartTime: 0
    }
];

let animationRunning = true;
let startTime = Date.now();

function playfulMovement() {
    if (!animationRunning) return;
    
    const elapsed = (Date.now() - startTime) / 1000;
    const currentTime = Date.now();
    
    objects.forEach((obj, index) => {
        let x = obj.basePos[0];
        let y = obj.basePos[1];
        let z = obj.basePos[2];
        
        // ジャンプのタイミングチェック
        if (!obj.isJumping && currentTime - startTime > obj.nextJump) {
            obj.isJumping = true;
            obj.jumpStartTime = currentTime;
            console.log(`🦘 ${obj.id} がジャンプ！`);
        }
        
        if (obj.isJumping) {
            // ジャンプアニメーション（放物線）
            const jumpElapsed = (currentTime - obj.jumpStartTime) / 1000;
            const jumpDuration = 1.5; // ジャンプ時間
            
            if (jumpElapsed < jumpDuration) {
                // 放物線のジャンプ
                const jumpProgress = jumpElapsed / jumpDuration;
                const jumpArc = Math.sin(jumpProgress * Math.PI);
                y = obj.basePos[1] + jumpArc * (obj.jumpHeight - obj.basePos[1]);
                
                // ジャンプ中の楽しい回転風の横移動
                x += Math.sin(jumpProgress * Math.PI * 4) * 0.5;
                z += Math.cos(jumpProgress * Math.PI * 3) * 0.3;
            } else {
                // ジャンプ終了
                obj.isJumping = false;
                obj.nextJump = currentTime - startTime + Math.random() * 4000 + 2000; // 次のジャンプ
                console.log(`✨ ${obj.id} がふわふわモードに戻った`);
            }
        } else {
            // 通常のふわふわ浮遊
            switch(obj.personality) {
                case 'energetic':
                    // 元気：小刻みに上下、左右に小さく動く
                    y += Math.sin(elapsed * obj.speed + obj.phase) * obj.floatRange;
                    x += Math.sin(elapsed * obj.speed * 1.5) * 0.2;
                    z += Math.cos(elapsed * obj.speed * 0.8) * 0.15;
                    break;
                    
                case 'gentle':
                    // 優雅：ゆったりと大きく浮遊
                    y += Math.sin(elapsed * obj.speed + obj.phase) * obj.floatRange;
                    x += Math.sin(elapsed * obj.speed * 0.7) * 0.4;
                    z += Math.sin(elapsed * obj.speed * 0.5 + Math.PI/4) * 0.3;
                    break;
                    
                case 'playful':
                    // 遊び好き：予測不能な動き
                    y += Math.sin(elapsed * obj.speed + obj.phase) * obj.floatRange;
                    y += Math.sin(elapsed * obj.speed * 3) * 0.3; // 二重波
                    x += Math.sin(elapsed * obj.speed * 2.1) * 0.3;
                    z += Math.cos(elapsed * obj.speed * 1.7) * 0.25;
                    break;
                    
                case 'dreamy':
                    // 夢見がち：ゆらゆら大きく浮遊
                    y += Math.sin(elapsed * obj.speed + obj.phase) * obj.floatRange;
                    x += Math.sin(elapsed * obj.speed * 0.6) * 0.6;
                    z += Math.cos(elapsed * obj.speed * 0.4) * 0.5;
                    break;
            }
        }
        
        // 時々の特別なふわふわエフェクト
        if (Math.random() < 0.01) { // 1%の確率
            y += Math.random() * 0.5;
            console.log(`💫 ${obj.id} に特別なふわふわ効果！`);
        }
        
        const moveCommand = {
            action: "moveObject",
            id: obj.id,
            position: [x, y, z]
        };
        
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(moveCommand));
        }
    });
    
    setTimeout(playfulMovement, 33); // 30FPS
}

ws.on('open', function() {
    console.log('🧚‍♀️✨ 妖精会社の楽しいプレイタイム開始！ ✨🧚‍♀️');
    console.log('🦘 ランダムジャンプ + 💫 ふわふわ浮遊 = 😄 楽しさ爆発！');
    console.log('各妖精の個性:');
    console.log('🟡 welcome_cube: 元気いっぱい');
    console.log('🟣 ajisai_sphere: 優雅で上品');  
    console.log('🩷 cosmos_cylinder: 遊び好き');
    console.log('🔴 tsubaki_sphere: 夢見がち');
    console.log('Press Ctrl+C to stop animation');
    
    // アニメーション開始
    setTimeout(playfulMovement, 500);
    
    // 30秒後に停止
    setTimeout(() => {
        console.log('🎭 楽しい時間が終了...');
        animationRunning = false;
        
        // 元の位置にゆっくり戻す
        setTimeout(() => {
            console.log('🏠 みんなお家に帰ります...');
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
                console.log('😊 また明日も一緒に遊ぼうね！ 🌸💠🌼🌺');
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
    console.log('\n🛑 アニメーション停止中...');
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
            console.log('😌 お疲れ様でした！');
            process.exit(0);
        }, 1000);
    }, 500);
});