import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8082');

ws.on('open', function() {
    console.log('🌺🌸 妖精会社の花の庭園を作成中... 🌼🌻');
    
    // まず既存のオブジェクトをクリア
    const existingObjects = ['welcome_cube', 'ajisai_sphere', 'cosmos_cylinder', 'tsubaki_sphere'];
    
    setTimeout(() => {
        existingObjects.forEach(id => {
            const removeCommand = {
                action: "removeObject",
                id: id
            };
            ws.send(JSON.stringify(removeCommand));
        });
        console.log('🧹 既存のオブジェクトをクリアしました');
    }, 500);
    
    // 花の庭園を作成
    setTimeout(() => {
        console.log('🌱 花の庭園の建設開始！');
        
        // 中央に大きな桜の木
        const sakuraTree = {
            action: "addObject",
            id: "sakura_tree",
            type: "tree",
            position: [0, 1.5, 0],
            color: "#8B4513" // 茶色の幹
        };
        ws.send(JSON.stringify(sakuraTree));
        console.log('🌸 桜の木を植えました');
        
        // 桜の花びら（ピンク）
        const sakuraPetals = [
            { id: "sakura_petal_1", pos: [-0.5, 3, 0.3], color: "#FFB6C1" },
            { id: "sakura_petal_2", pos: [0.5, 3.2, -0.3], color: "#FFC0CB" },
            { id: "sakura_petal_3", pos: [0.3, 2.8, 0.5], color: "#FFCCCB" },
            { id: "sakura_petal_4", pos: [-0.3, 3.1, -0.4], color: "#FFB6C1" }
        ];
        
        sakuraPetals.forEach((petal, index) => {
            setTimeout(() => {
                const petalCommand = {
                    action: "addObject",
                    id: petal.id,
                    type: "petal",
                    position: petal.pos,
                    color: petal.color
                };
                ws.send(JSON.stringify(petalCommand));
            }, (index + 1) * 300);
        });
        
    }, 1500);
    
    // 紫陽花エリア
    setTimeout(() => {
        console.log('💠 紫陽花エリアを作成中...');
        
        // 紫陽花の茎
        const ajisaiStem = {
            action: "addObject",
            id: "ajisai_stem",
            type: "stem",
            position: [3, 1, 0],
            color: "#228B22" // 緑の茎
        };
        ws.send(JSON.stringify(ajisaiStem));
        
        // 紫陽花の花（小さな花の集合）
        const ajisaiFlowers = [
            { id: "ajisai_flower_1", pos: [2.8, 2.2, 0.2], color: "#9370DB" },
            { id: "ajisai_flower_2", pos: [3.2, 2.1, -0.1], color: "#8A2BE2" },
            { id: "ajisai_flower_3", pos: [3.1, 2.3, 0.1], color: "#9966CC" },
            { id: "ajisai_flower_4", pos: [2.9, 2.0, -0.2], color: "#BA55D3" }
        ];
        
        ajisaiFlowers.forEach((flower, index) => {
            setTimeout(() => {
                const flowerCommand = {
                    action: "addObject",
                    id: flower.id,
                    type: "flower",
                    position: flower.pos,
                    color: flower.color
                };
                ws.send(JSON.stringify(flowerCommand));
            }, index * 200);
        });
        
        // 紫陽花の葉っぱ
        setTimeout(() => {
            const ajisaiLeaf = {
                action: "addObject",
                id: "ajisai_leaf",
                type: "leaf",
                position: [3.5, 1.5, 0.3],
                color: "#32CD32"
            };
            ws.send(JSON.stringify(ajisaiLeaf));
        }, 1000);
        
    }, 3000);
    
    // コスモスエリア
    setTimeout(() => {
        console.log('🌼 コスモスエリアを作成中...');
        
        // コスモスの茎
        const cosmosStem = {
            action: "addObject",
            id: "cosmos_stem",
            type: "stem",
            position: [-3, 1, 0],
            color: "#228B22"
        };
        ws.send(JSON.stringify(cosmosStem));
        
        // コスモスの花びら（ピンク系）
        const cosmosPetals = [
            { id: "cosmos_petal_1", pos: [-2.8, 2.3, 0.3], color: "#FF69B4" },
            { id: "cosmos_petal_2", pos: [-3.2, 2.2, -0.2], color: "#FF1493" },
            { id: "cosmos_petal_3", pos: [-3.0, 2.4, 0], color: "#FFB6C1" },
            { id: "cosmos_petal_4", pos: [-2.9, 2.1, 0.1], color: "#FFC0CB" }
        ];
        
        cosmosPetals.forEach((petal, index) => {
            setTimeout(() => {
                const petalCommand = {
                    action: "addObject",
                    id: petal.id,
                    type: "petal",
                    position: petal.pos,
                    color: petal.color
                };
                ws.send(JSON.stringify(petalCommand));
            }, index * 200);
        });
        
    }, 5000);
    
    // 椿エリア
    setTimeout(() => {
        console.log('🌺 椿エリアを作成中...');
        
        // 椿の茎
        const tsubakiStem = {
            action: "addObject",
            id: "tsubaki_stem",
            type: "stem",
            position: [0, 1, -3],
            color: "#228B22"
        };
        ws.send(JSON.stringify(tsubakiStem));
        
        // 椿の花（深い赤）
        const tsubakiFlower = {
            action: "addObject",
            id: "tsubaki_flower",
            type: "flower",
            position: [0, 2.2, -3],
            color: "#DC143C"
        };
        ws.send(JSON.stringify(tsubakiFlower));
        
        // 椿の葉っぱ
        setTimeout(() => {
            const tsubakiLeaf = {
                action: "addObject",
                id: "tsubaki_leaf",
                type: "leaf",
                position: [0.4, 1.5, -2.7],
                color: "#006400"
            };
            ws.send(JSON.stringify(tsubakiLeaf));
        }, 500);
        
    }, 6500);
    
    // 草を追加
    setTimeout(() => {
        console.log('🌱 草を植えています...');
        
        const grassPositions = [
            [-1, 0.4, -1], [1, 0.4, 1], [-2, 0.4, 2], [2, 0.4, -2],
            [1.5, 0.4, 1.5], [-1.5, 0.4, -1.5], [0.5, 0.4, -1.5], [-0.5, 0.4, 1.5]
        ];
        
        grassPositions.forEach((pos, index) => {
            setTimeout(() => {
                const grassCommand = {
                    action: "addObject",
                    id: `grass_${index + 1}`,
                    type: "grass",
                    position: pos,
                    color: "#7CFC00"
                };
                ws.send(JSON.stringify(grassCommand));
            }, index * 100);
        });
        
    }, 8000);
    
    setTimeout(() => {
        console.log('🌺🌸🌼🌻 妖精会社の花の庭園が完成しました！ 🌻🌼🌸🌺');
        console.log('ブラウザで美しい花の庭園をお楽しみください！');
        ws.close();
    }, 10000);
});

ws.on('error', function(error) {
    console.error('WebSocket error:', error);
});