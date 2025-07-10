const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8083');

ws.on('open', function() {
    console.log('🌹💐 ブーケ専用Three.jsデモに接続しました');
    console.log('');
    
    // まず背景画像を設定
    setTimeout(() => {
        const setBgCommand = {
            action: "setBouquetBackground",
            imagePath: "file:///Users/nukuiyuki/Dev/20250219_画像＋three.js/kamui-creative-2025-02-19T17-31-44/assets/images/flower_bouquet.png"
        };
        
        ws.send(JSON.stringify(setBgCommand));
        console.log('🖼️ 花束背景画像を設定しました');
    }, 500);
    
    // ブーケの3Dオブジェクトを作成
    setTimeout(() => {
        console.log('🌹 3Dブーケの作成開始...');
        
        // バラ（赤）
        const rose1 = {
            action: "addObject",
            id: "rose_red_1",
            type: "rose",
            position: [-0.3, 1.5, 0.2],
            color: "#DC143C"
        };
        ws.send(JSON.stringify(rose1));
        
        const rose2 = {
            action: "addObject", 
            id: "rose_red_2",
            type: "rose",
            position: [0.2, 1.7, 0.1],
            color: "#B22222"
        };
        ws.send(JSON.stringify(rose2));
        
    }, 1500);
    
    setTimeout(() => {
        // チューリップ（ピンク）
        const tulip1 = {
            action: "addObject",
            id: "tulip_pink_1", 
            type: "tulip",
            position: [0.4, 1.8, -0.1],
            color: "#FF69B4"
        };
        ws.send(JSON.stringify(tulip1));
        
        const tulip2 = {
            action: "addObject",
            id: "tulip_pink_2",
            type: "tulip", 
            position: [-0.1, 1.9, 0.3],
            color: "#FFB6C1"
        };
        ws.send(JSON.stringify(tulip2));
        
    }, 2000);
    
    setTimeout(() => {
        // ひまわり（黄色）
        const sunflower = {
            action: "addObject",
            id: "sunflower_yellow",
            type: "sunflower",
            position: [0, 2.1, 0],
            color: "#FFD700"
        };
        ws.send(JSON.stringify(sunflower));
        
        // ハイビスカス（オレンジ）
        const hibiscus = {
            action: "addObject",
            id: "hibiscus_orange",
            type: "hibiscus", 
            position: [-0.4, 1.6, -0.2],
            color: "#FF4500"
        };
        ws.send(JSON.stringify(hibiscus));
        
    }, 2500);
    
    setTimeout(() => {
        // 茎を追加
        const stems = [
            { id: "stem_1", pos: [-0.3, 1, 0.2], color: "#228B22" },
            { id: "stem_2", pos: [0.2, 1, 0.1], color: "#32CD32" },
            { id: "stem_3", pos: [0.4, 1, -0.1], color: "#228B22" },
            { id: "stem_4", pos: [-0.1, 1, 0.3], color: "#32CD32" },
            { id: "stem_5", pos: [0, 1, 0], color: "#228B22" }
        ];
        
        stems.forEach((stem, index) => {
            setTimeout(() => {
                const stemCommand = {
                    action: "addObject",
                    id: stem.id,
                    type: "stem",
                    position: stem.pos,
                    color: stem.color
                };
                ws.send(JSON.stringify(stemCommand));
            }, index * 200);
        });
        
    }, 3000);
    
    setTimeout(() => {
        // 葉っぱを追加
        const leaves = [
            { id: "leaf_1", pos: [-0.5, 1.2, 0.4], color: "#00FF00" },
            { id: "leaf_2", pos: [0.6, 1.3, -0.3], color: "#32CD32" },
            { id: "leaf_3", pos: [-0.2, 1.4, -0.5], color: "#00FF00" }
        ];
        
        leaves.forEach((leaf, index) => {
            setTimeout(() => {
                const leafCommand = {
                    action: "addObject",
                    id: leaf.id,
                    type: "leaf",
                    position: leaf.pos,
                    color: leaf.color
                };
                ws.send(JSON.stringify(leafCommand));
            }, index * 300);
        });
        
    }, 4000);
    
    setTimeout(() => {
        // リボンを追加
        const ribbon = {
            action: "addObject",
            id: "ribbon_bow",
            type: "ribbon",
            position: [0, 0.9, 0.3],
            color: "#FF1493"
        };
        ws.send(JSON.stringify(ribbon));
        
        console.log('🎀 リボンを追加しました');
        console.log('');
        console.log('🌹💐 ブーケが完成しました！');
        console.log('ブラウザで http://localhost:8080/bouquet-demo.html を開いて確認してください！');
        
        setTimeout(() => {
            ws.close();
        }, 1000);
        
    }, 5000);
});

ws.on('error', function(error) {
    console.error('WebSocket error:', error);
});