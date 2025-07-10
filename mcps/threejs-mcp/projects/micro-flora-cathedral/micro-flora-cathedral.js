import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class MicroFloraCathedral {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            premultipliedAlpha: false 
        });
        this.particles = [];
        this.pillarGeometries = [];
        this.pillarMaterials = [];
        this.pillarSystems = [];
        this.petalGeometries = [];
        this.petalMaterials = [];
        this.petalSystems = [];
        this.originalPillarPositions = [];
        this.originalPetalPositions = [];
        this.mouse = new THREE.Vector2();
        this.controls = null;
        this.petalTextures = [];
        
        this.init();
    }

    init() {
        console.log('MicroFloraCathedral初期化開始');
        
        // レンダラーセットアップ
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
        console.log('レンダラー設定完了');

        // カメラ位置
        this.camera.position.set(0, 0, 20);
        this.camera.lookAt(0, 0, 0);
        console.log('カメラ位置設定完了:', this.camera.position);

        // コントロール
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        console.log('コントロール設定完了');

        // ライト
        this.setupLights();
        console.log('ライト設定完了');

        // イベントリスナー
        this.setupEventListeners();
        console.log('イベントリスナー設定完了');

        // 柱生成（テクスチャ不要）
        this.createPillars();
        console.log('柱生成完了');

        // アニメーション開始
        this.animate();
        console.log('アニメーション開始');

        // テクスチャ読み込み完了後に花びら生成
        this.loadTextures();
    }

    setupLights() {
        // 環境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
        this.scene.add(ambientLight);

        // ディレクショナルライト
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // ポイントライト（カラフルな照明）
        const pointLight1 = new THREE.PointLight(0xff6b6b, 1, 20);
        pointLight1.position.set(-5, 5, 5);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x4ecdc4, 1, 20);
        pointLight2.position.set(5, 5, -5);
        this.scene.add(pointLight2);

        const pointLight3 = new THREE.PointLight(0xffe66d, 1, 20);
        pointLight3.position.set(0, 10, 0);
        this.scene.add(pointLight3);
    }

    loadTextures() {
        const textureLoader = new THREE.TextureLoader();
        const petalFiles = [
            'petal_sakura_transparent.png',
            'petal_rose_pink_transparent.png',
            'petal_ajisai_transparent.png'
        ];

        let loadedCount = 0;
        
        petalFiles.forEach((filename, index) => {
            textureLoader.load(
                filename,
                (texture) => {
                    // 読み込み成功 - チェックリスト通りの設定
                    texture.anisotropy = 0;
                    texture.magFilter = THREE.NearestFilter;
                    texture.minFilter = THREE.NearestFilter;
                    texture.wrapS = THREE.ClampToEdgeWrapping;
                    texture.wrapT = THREE.ClampToEdgeWrapping;
                    this.petalTextures[index] = texture;
                    
                    loadedCount++;
                    console.log(`テクスチャ読み込み: ${filename} (${loadedCount}/${petalFiles.length})`);
                    
                    // 全テクスチャ読み込み完了後に花びら生成
                    if (loadedCount === petalFiles.length) {
                        console.log('全テクスチャ読み込み完了、花びら生成開始');
                        this.createPetals();
                    }
                },
                undefined,
                (error) => {
                    console.error(`テクスチャ読み込み失敗: ${filename}`, error);
                }
            );
        });
    }

    createPillars() {
        console.log('柱パーティクル生成開始');

        const particleCountPerPillar = 1666;
        const pillarCount = 6;
        
        this.originalPillarPositions = [];

        // 6本の柱を作成（シンプルなパーティクル）
        for (let pillarIndex = 0; pillarIndex < pillarCount; pillarIndex++) {
            const positions = [];
            const colors = [];
            
            const pillarAngle = (pillarIndex * Math.PI * 2) / pillarCount;
            const pillarRadius = 8;

            for (let i = 0; i < particleCountPerPillar; i++) {
                const localT = i / particleCountPerPillar;
                const height = localT * 30 - 15; // 高さ -15 to 15
                const spiralAngle = localT * Math.PI * 8; // 螺旋
                const localRadius = 1.5 + Math.sin(localT * Math.PI * 4) * 0.5;
                
                // 基本位置
                const localX = Math.cos(spiralAngle) * localRadius;
                const localZ = Math.sin(spiralAngle) * localRadius;
                
                // 柱の配置
                const pillarX = Math.cos(pillarAngle) * pillarRadius;
                const pillarZ = Math.sin(pillarAngle) * pillarRadius;
                
                // 最終位置
                const x = pillarX + localX;
                const y = height;
                const z = pillarZ + localZ;
                
                positions.push(x, y, z);

                // 柱の色を生成
                const hue = (localT + pillarIndex * 0.16) % 1;
                const saturation = 0.8 + Math.sin(localT * Math.PI * 2) * 0.2;
                const lightness = 0.5 + Math.sin(localT * Math.PI * 3) * 0.3;
                
                const color = new THREE.Color().setHSL(hue, saturation, lightness);
                colors.push(color.r, color.g, color.b);
            }

            // バッファジオメトリ作成
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            // 柱のマテリアル（シンプルなパーティクル）
            const material = new THREE.PointsMaterial({ 
                size: 0.3,
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                sizeAttenuation: true
            });

            // パーティクルシステム作成
            const particleSystem = new THREE.Points(geometry, material);
            this.scene.add(particleSystem);

            // 配列に保存
            this.pillarGeometries.push(geometry);
            this.pillarMaterials.push(material);
            this.pillarSystems.push(particleSystem);
            this.originalPillarPositions.push([...positions]);
        }
        
        console.log('柱パーティクル作成完了:', pillarCount, '本の柱');
    }

    createPetals() {
        console.log('花びらパーティクル生成開始');

        const petalCountPerType = 500;
        const petalTypes = 3; // 3種類の花びらのみ
        
        this.originalPetalPositions = [];

        // 3種類の花びらを作成
        for (let petalType = 0; petalType < petalTypes; petalType++) {
            const positions = [];
            const colors = [];

            for (let i = 0; i < petalCountPerType; i++) {
                // 花びらを柱の周りに配置
                const angle = Math.random() * Math.PI * 2;
                const radius = 12 + Math.random() * 15; // 柱から離れた位置
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = (Math.random() - 0.5) * 25; // 高さランダム
                
                positions.push(x, y, z);

                // 花びらの色（テクスチャそのままを使用）
                colors.push(1.0, 1.0, 1.0);
            }

            // バッファジオメトリ作成
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            // 花びらマテリアル（最基本設定）
            const material = new THREE.PointsMaterial({ 
                map: this.petalTextures[petalType],
                transparent: true
            });

            // パーティクルシステム作成
            const particleSystem = new THREE.Points(geometry, material);
            this.scene.add(particleSystem);

            // 配列に保存
            this.petalGeometries.push(geometry);
            this.petalMaterials.push(material);
            this.petalSystems.push(particleSystem);
            this.originalPetalPositions.push([...positions]);
        }
        
        console.log('花びらパーティクル作成完了:', petalTypes, '種類の花びら');
    }

    setupEventListeners() {
        // マウス移動
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        // ウィンドウリサイズ
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    applyWindEffect() {
        const time = Date.now() * 0.001;

        // 柱のパーティクルに風エフェクトを適用（軽い動き）
        if (this.pillarSystems && this.pillarSystems.length > 0 && this.originalPillarPositions && this.originalPillarPositions.length > 0) {
            this.pillarSystems.forEach((particleSystem, pillarIndex) => {
                const positions = particleSystem.geometry.attributes.position.array;
                const originalPositions = this.originalPillarPositions[pillarIndex];

                for (let i = 0; i < positions.length; i += 3) {
                    const originalX = originalPositions[i];
                    const originalY = originalPositions[i + 1];
                    const originalZ = originalPositions[i + 2];

                    // 軽い風の影響
                    const waveX = Math.sin(time + originalY * 0.05) * 0.2;
                    const waveZ = Math.cos(time + originalY * 0.05) * 0.2;

                    positions[i] = originalX + waveX;
                    positions[i + 1] = originalY;
                    positions[i + 2] = originalZ + waveZ;
                }

                particleSystem.geometry.attributes.position.needsUpdate = true;
            });
        }

        // 花びらのパーティクルに強い風エフェクトを適用
        if (this.petalSystems && this.petalSystems.length > 0 && this.originalPetalPositions && this.originalPetalPositions.length > 0) {
            this.petalSystems.forEach((particleSystem, petalIndex) => {
                const positions = particleSystem.geometry.attributes.position.array;
                const originalPositions = this.originalPetalPositions[petalIndex];

                for (let i = 0; i < positions.length; i += 3) {
                    const originalX = originalPositions[i];
                    const originalY = originalPositions[i + 1];
                    const originalZ = originalPositions[i + 2];

                    // マウス位置による風の影響（大幅強化）
                    const mouseInfluence = 5.0;
                    const windX = this.mouse.x * mouseInfluence;
                    const windZ = this.mouse.y * mouseInfluence;

                    // 花びらの舞う動き
                    const spiralTime = time * 0.5 + petalIndex;
                    const spiralX = Math.sin(spiralTime + originalY * 0.1) * 2;
                    const spiralZ = Math.cos(spiralTime + originalY * 0.1) * 2;
                    const floatY = Math.sin(time + originalX * 0.1) * 1;

                    // 位置更新
                    positions[i] = originalX + windX + spiralX;
                    positions[i + 1] = originalY + floatY;
                    positions[i + 2] = originalZ + windZ + spiralZ;
                }

                particleSystem.geometry.attributes.position.needsUpdate = true;
            });
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // 風エフェクト適用
        this.applyWindEffect();

        // 柱の回転
        if (this.pillarSystems) {
            this.pillarSystems.forEach(particleSystem => {
                particleSystem.rotation.y += 0.002;
            });
        }

        // 花びらの異なる回転
        if (this.petalSystems) {
            this.petalSystems.forEach((particleSystem, index) => {
                particleSystem.rotation.y += 0.001 * (index + 1);
            });
        }

        // コントロール更新
        this.controls.update();

        // レンダリング
        this.renderer.render(this.scene, this.camera);
    }
}

// 初期化
const app = new MicroFloraCathedral();