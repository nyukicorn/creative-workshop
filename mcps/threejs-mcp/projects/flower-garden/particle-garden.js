import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8082');

ws.on('open', function() {
    console.log('🌺✨ 妖精会社のパーティクル庭園を作成中... ✨🌼');
    
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
    
    // 魔法の光の粉を最初に作成
    setTimeout(() => {
        console.log('✨ 魔法の光の粉を散布中...');
        const magicDustCommand = {
            action: "createMagicDust"
        };
        ws.send(JSON.stringify(magicDustCommand));
    }, 1000);
    
    // 中央に桜のパーティクル花
    setTimeout(() => {
        console.log('🌸 桜のパーティクル花を咲かせています...');
        
        // 桜の茎
        const sakuraTree = {
            action: "addObject",
            id: "sakura_tree",
            type: "tree",
            position: [0, 1.5, 0],
            color: "#8B4513"
        };
        ws.send(JSON.stringify(sakuraTree));
        
        // 桜の花をパーティクルで表現
        const sakuraParticles = {
            action: "createFlowerParticles",
            id: "sakura_particle_flower",
            position: [0, 3.2, 0],
            color: "#FFB6C1",
            petalCount: 12
        };
        ws.send(JSON.stringify(sakuraParticles));
        
        // 桜の花びらが舞い散る効果
        setTimeout(() => {
            const fallingPetals = {
                action: "createFallingPetals",
                id: "sakura_falling_petals",
                position: [0, 4, 0],
                color: "#FFC0CB",
                count: 150
            };
            ws.send(JSON.stringify(fallingPetals));
        }, 1000);
        
    }, 2000);
    
    // 紫陽花エリア（パーティクル）
    setTimeout(() => {
        console.log('💠 紫陽花のパーティクル群を作成中...');
        
        // 紫陽花の茎
        const ajisaiStem = {
            action: "addObject",
            id: "ajisai_stem",
            type: "stem",
            position: [3, 1, 0],
            color: "#228B22"
        };
        ws.send(JSON.stringify(ajisaiStem));
        
        // 複数の小さな紫陽花の花をパーティクルで
        const ajisaiPositions = [
            [2.8, 2.2, 0.2],
            [3.2, 2.1, -0.1],
            [3.1, 2.3, 0.1],
            [2.9, 2.0, -0.2]
        ];
        
        ajisaiPositions.forEach((pos, index) => {
            setTimeout(() => {
                const ajisaiParticles = {
                    action: "createFlowerParticles",
                    id: `ajisai_particle_${index + 1}`,
                    position: pos,
                    color: "#9370DB",
                    petalCount: 6
                };
                ws.send(JSON.stringify(ajisaiParticles));
            }, index * 300);
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
        }, 1500);
        
    }, 4000);
    
    // コスモスエリア（パーティクル）
    setTimeout(() => {
        console.log('🌼 コスモスのパーティクル花畑を作成中...');
        
        // コスモスの茎
        const cosmosStem = {
            action: "addObject",
            id: "cosmos_stem",
            type: "stem",
            position: [-3, 1, 0],
            color: "#228B22"
        };
        ws.send(JSON.stringify(cosmosStem));
        
        // コスモスの花をパーティクルで
        const cosmosParticles = {
            action: "createFlowerParticles",
            id: "cosmos_particle_flower",
            position: [-3, 2.3, 0],
            color: "#FF69B4",
            petalCount: 8
        };
        ws.send(JSON.stringify(cosmosParticles));
        
        // コスモスの花びらも舞い散らせる
        setTimeout(() => {
            const cosmosFalling = {
                action: "createFallingPetals",
                id: "cosmos_falling_petals",
                position: [-3, 3, 0],
                color: "#FF1493",
                count: 80
            };
            ws.send(JSON.stringify(cosmosFalling));
        }, 800);
        
    }, 6000);
    
    // 椿エリア（パーティクル）
    setTimeout(() => {
        console.log('🌺 椿のパーティクル花を咲かせています...');
        
        // 椿の茎
        const tsubakiStem = {
            action: "addObject",
            id: "tsubaki_stem",
            type: "stem",
            position: [0, 1, -3],
            color: "#228B22"
        };
        ws.send(JSON.stringify(tsubakiStem));
        
        // 椿の花をパーティクルで（大きめの花びら）
        const tsubakiParticles = {
            action: "createFlowerParticles",
            id: "tsubaki_particle_flower",
            position: [0, 2.2, -3],
            color: "#DC143C",
            petalCount: 10
        };
        ws.send(JSON.stringify(tsubakiParticles));
        
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
        
        // 椿の花びらも少し散らす
        setTimeout(() => {
            const tsubakiFalling = {
                action: "createFallingPetals",
                id: "tsubaki_falling_petals",
                position: [0, 3, -3],
                color: "#B22222",
                count: 60
            };
            ws.send(JSON.stringify(tsubakiFalling));
        }, 1000);
        
    }, 8000);
    
    // 追加の小さな花々（パーティクル）
    setTimeout(() => {
        console.log('🌻 小花のパーティクル群を散布中...');
        
        const smallFlowerPositions = [
            { pos: [1.5, 1.5, 1.5], color: "#FFFF00", id: "small_flower_1" },
            { pos: [-1.5, 1.2, -1.5], color: "#FF4500", id: "small_flower_2" },
            { pos: [2, 1.3, -2], color: "#9ACD32", id: "small_flower_3" },
            { pos: [-2, 1.4, 2], color: "#FF6347", id: "small_flower_4" }
        ];
        
        smallFlowerPositions.forEach((flower, index) => {
            setTimeout(() => {
                const smallFlowerParticles = {
                    action: "createFlowerParticles",
                    id: flower.id,
                    position: flower.pos,
                    color: flower.color,
                    petalCount: 5
                };
                ws.send(JSON.stringify(smallFlowerParticles));
            }, index * 200);
        });
        
    }, 10000);
    
    // 草を追加（従来の方法）
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
        
    }, 12000);
    
    setTimeout(() => {
        console.log('🌺✨🌼🌻 妖精会社のパーティクル庭園が完成しました！ 🌻🌼✨🌺');
        console.log('ブラウザで魔法のような美しいパーティクル庭園をお楽しみください！');
        console.log('');
        console.log('🎭 効果一覧:');
        console.log('  ✨ 魔法の光の粉 - 虹色に光る浮遊パーティクル');
        console.log('  🌸 桜の花びら - パーティクルで描かれた花 + 舞い散る花びら');
        console.log('  💠 紫陽花の小花 - 複数のパーティクル花クラスター');
        console.log('  🌼 コスモス - パーティクル花 + 舞い散る効果');
        console.log('  🌺 椿 - 大きなパーティクル花 + 散る花びら');
        console.log('  🌻 小花群 - 4つの異なる色の小さなパーティクル花');
        ws.close();
    }, 15000);
});

ws.on('error', function(error) {
    console.error('WebSocket error:', error);
});