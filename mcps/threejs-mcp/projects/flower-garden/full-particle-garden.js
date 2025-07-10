import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8082');

ws.on('open', function() {
    console.log('🌺✨ 妖精会社の完全パーティクル庭園を作成中... ✨🌼');
    
    // まず既存のオブジェクトをクリア
    setTimeout(() => {
        // 既存オブジェクトを削除
        const existingObjects = ['welcome_cube', 'ajisai_sphere', 'cosmos_cylinder', 'tsubaki_sphere'];
        existingObjects.forEach(id => {
            const removeCommand = { action: "removeObject", id: id };
            ws.send(JSON.stringify(removeCommand));
        });
        
        // 既存パーティクルも削除
        const particleIds = [
            'sakura_particle_flower', 'sakura_falling_petals',
            'ajisai_particle_1', 'ajisai_particle_2', 'ajisai_particle_3', 'ajisai_particle_4',
            'cosmos_particle_flower', 'cosmos_falling_petals',
            'tsubaki_particle_flower', 'tsubaki_falling_petals',
            'small_flower_1', 'small_flower_2', 'small_flower_3', 'small_flower_4'
        ];
        particleIds.forEach(id => {
            const removeCommand = { action: "removeParticles", id: id };
            ws.send(JSON.stringify(removeCommand));
        });
        
        console.log('🧹 既存のオブジェクトとパーティクルをクリアしました');
    }, 500);
    
    // 魔法の光の粉を最初に作成
    setTimeout(() => {
        console.log('✨ 魔法の光の粉を散布中...');
        const magicDustCommand = { action: "createMagicDust" };
        ws.send(JSON.stringify(magicDustCommand));
    }, 1000);
    
    // 中央に桜の完全パーティクル木
    setTimeout(() => {
        console.log('🌸 桜の完全パーティクル木を成長させています...');
        
        // 桜の幹をパーティクルで
        const sakuraTrunkCommand = {
            action: "createStemParticles",
            id: "sakura_trunk_particles",
            startPos: [0, 0, 0],
            endPos: [0, 3, 0],
            color: "#8B4513",
            thickness: "thick"
        };
        ws.send(JSON.stringify(sakuraTrunkCommand));
        
        // 桜の花をパーティクルで表現
        setTimeout(() => {
            const sakuraParticles = {
                action: "createFlowerParticles",
                id: "sakura_particle_flower",
                position: [0, 3.2, 0],
                color: "#FFB6C1",
                petalCount: 12
            };
            ws.send(JSON.stringify(sakuraParticles));
        }, 300);
        
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
        }, 600);
        
    }, 2000);
    
    // 紫陽花エリア（完全パーティクル）
    setTimeout(() => {
        console.log('💠 紫陽花の完全パーティクル群を作成中...');
        
        // 紫陽花の茎をパーティクルで
        const ajisaiStemCommand = {
            action: "createStemParticles",
            id: "ajisai_stem_particles",
            startPos: [3, 0, 0],
            endPos: [3, 2, 0],
            color: "#228B22",
            thickness: "medium"
        };
        ws.send(JSON.stringify(ajisaiStemCommand));
        
        // 複数の小さな紫陽花の花をパーティクルで
        const ajisaiPositions = [
            { pos: [2.8, 2.2, 0.2], id: "ajisai_particle_1" },
            { pos: [3.2, 2.1, -0.1], id: "ajisai_particle_2" },
            { pos: [3.1, 2.3, 0.1], id: "ajisai_particle_3" },
            { pos: [2.9, 2.0, -0.2], id: "ajisai_particle_4" }
        ];
        
        ajisaiPositions.forEach((flower, index) => {
            setTimeout(() => {
                const ajisaiParticles = {
                    action: "createFlowerParticles",
                    id: flower.id,
                    position: flower.pos,
                    color: "#9370DB",
                    petalCount: 6
                };
                ws.send(JSON.stringify(ajisaiParticles));
            }, index * 200);
        });
        
        // 紫陽花の葉っぱもパーティクルで
        setTimeout(() => {
            const ajisaiLeafCommand = {
                action: "createLeafParticles",
                id: "ajisai_leaf_particles",
                position: [3.5, 1.5, 0.3],
                color: "#32CD32",
                size: "large"
            };
            ws.send(JSON.stringify(ajisaiLeafCommand));
        }, 1000);
        
    }, 4000);
    
    // コスモスエリア（完全パーティクル）
    setTimeout(() => {
        console.log('🌼 コスモスの完全パーティクル花畑を作成中...');
        
        // コスモスの茎をパーティクルで
        const cosmosStemCommand = {
            action: "createStemParticles",
            id: "cosmos_stem_particles",
            startPos: [-3, 0, 0],
            endPos: [-3, 2.3, 0],
            color: "#228B22",
            thickness: "thin"
        };
        ws.send(JSON.stringify(cosmosStemCommand));
        
        // コスモスの花をパーティクルで
        setTimeout(() => {
            const cosmosParticles = {
                action: "createFlowerParticles",
                id: "cosmos_particle_flower",
                position: [-3, 2.3, 0],
                color: "#FF69B4",
                petalCount: 8
            };
            ws.send(JSON.stringify(cosmosParticles));
        }, 300);
        
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
        }, 600);
        
    }, 6000);
    
    // 椿エリア（完全パーティクル）
    setTimeout(() => {
        console.log('🌺 椿の完全パーティクル花を咲かせています...');
        
        // 椿の茎をパーティクルで
        const tsubakiStemCommand = {
            action: "createStemParticles",
            id: "tsubaki_stem_particles",
            startPos: [0, 0, -3],
            endPos: [0, 2.2, -3],
            color: "#228B22",
            thickness: "medium"
        };
        ws.send(JSON.stringify(tsubakiStemCommand));
        
        // 椿の花をパーティクルで（大きめの花びら）
        setTimeout(() => {
            const tsubakiParticles = {
                action: "createFlowerParticles",
                id: "tsubaki_particle_flower",
                position: [0, 2.2, -3],
                color: "#DC143C",
                petalCount: 10
            };
            ws.send(JSON.stringify(tsubakiParticles));
        }, 300);
        
        // 椿の葉っぱもパーティクルで
        setTimeout(() => {
            const tsubakiLeafCommand = {
                action: "createLeafParticles",
                id: "tsubaki_leaf_particles",
                position: [0.4, 1.5, -2.7],
                color: "#006400",
                size: "medium"
            };
            ws.send(JSON.stringify(tsubakiLeafCommand));
        }, 600);
        
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
        }, 900);
        
    }, 8000);
    
    // 追加の小さな花々（完全パーティクル）
    setTimeout(() => {
        console.log('🌻 小花の完全パーティクル群を散布中...');
        
        const smallFlowerData = [
            { pos: [1.5, 1.5, 1.5], color: "#FFFF00", id: "small_flower_1", stemEnd: [1.5, 0, 1.5] },
            { pos: [-1.5, 1.2, -1.5], color: "#FF4500", id: "small_flower_2", stemEnd: [-1.5, 0, -1.5] },
            { pos: [2, 1.3, -2], color: "#9ACD32", id: "small_flower_3", stemEnd: [2, 0, -2] },
            { pos: [-2, 1.4, 2], color: "#FF6347", id: "small_flower_4", stemEnd: [-2, 0, 2] }
        ];
        
        smallFlowerData.forEach((flower, index) => {
            setTimeout(() => {
                // 小花の茎
                const stemCommand = {
                    action: "createStemParticles",
                    id: `${flower.id}_stem`,
                    startPos: flower.stemEnd,
                    endPos: flower.pos,
                    color: "#228B22",
                    thickness: "thin"
                };
                ws.send(JSON.stringify(stemCommand));
                
                // 小花のパーティクル
                setTimeout(() => {
                    const smallFlowerParticles = {
                        action: "createFlowerParticles",
                        id: flower.id,
                        position: flower.pos,
                        color: flower.color,
                        petalCount: 5
                    };
                    ws.send(JSON.stringify(smallFlowerParticles));
                }, 200);
            }, index * 300);
        });
        
    }, 10000);
    
    // 草をパーティクルで
    setTimeout(() => {
        console.log('🌱 草のパーティクル群を植えています...');
        
        const grassPositions = [
            { pos: [-1, 0.4, -1], density: "normal" },
            { pos: [1, 0.4, 1], density: "dense" },
            { pos: [-2, 0.4, 2], density: "normal" },
            { pos: [2, 0.4, -2], density: "sparse" },
            { pos: [1.5, 0.4, 1.5], density: "normal" },
            { pos: [-1.5, 0.4, -1.5], density: "dense" },
            { pos: [0.5, 0.4, -1.5], density: "normal" },
            { pos: [-0.5, 0.4, 1.5], density: "sparse" }
        ];
        
        grassPositions.forEach((grass, index) => {
            setTimeout(() => {
                const grassCommand = {
                    action: "createGrassParticles",
                    id: `grass_particles_${index + 1}`,
                    position: grass.pos,
                    color: "#7CFC00",
                    density: grass.density
                };
                ws.send(JSON.stringify(grassCommand));
            }, index * 150);
        });
        
    }, 12000);
    
    setTimeout(() => {
        console.log('🌺✨🌼🌻 妖精会社の完全パーティクル庭園が完成しました！ 🌻🌼✨🌺');
        console.log('ブラウザで完全にパーティクルだけで構成された魔法の庭園をお楽しみください！');
        console.log('');
        console.log('🎭 完全パーティクル効果一覧:');
        console.log('  ✨ 魔法の光の粉 - 虹色に光る浮遊パーティクル');
        console.log('  🌸 桜 - パーティクル幹 + パーティクル花 + 舞い散る花びら');
        console.log('  💠 紫陽花 - パーティクル茎 + パーティクル小花群 + パーティクル葉');
        console.log('  🌼 コスモス - パーティクル茎 + パーティクル花 + 舞い散る効果');
        console.log('  🌺 椿 - パーティクル茎 + パーティクル花 + パーティクル葉 + 散る花びら');
        console.log('  🌻 小花群 - パーティクル茎 + 4色のパーティクル花');
        console.log('  🌱 草 - 8つのパーティクル草の束（密度バリエーション）');
        console.log('');
        console.log('🎨 全ての植物がパーティクルで構成されています！');
        ws.close();
    }, 15000);
});

ws.on('error', function(error) {
    console.error('WebSocket error:', error);
});