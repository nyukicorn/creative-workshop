import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class LumeriaUnicornViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.panoramaSphere = null;
        this.controls = null;
        this.particleSystem = null;
        this.unicornModel = null;
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.time = 0;
        
        this.statusElement = document.getElementById('status');
        this.modelSelector = document.getElementById('model-selector');
        this.infoPanel = document.getElementById('info');
        this.controlsPanel = document.getElementById('controls');
        
        this.lastInteractionTime = Date.now();
        this.isUserControllingCamera = false;
        
        this.init();
    }

    updateStatus(message, type = 'warning') {
        this.statusElement.textContent = message;
        this.statusElement.className = type;
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createPanorama();
        
        // パーティクルシステムを一時的に無効化
        // setTimeout(() => {
        //     this.createParticleSystem();
        // }, 100);
        this.setupControls();
        this.setupLighting();
        this.setupEventListeners();
        this.loadUnicorn('original_unicorn.glb');
        this.animate();
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x200040); // デバッグ用の紫色背景
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 0); // パノラマ球の中心に配置
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: false,
            premultipliedAlpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 最大2xに制限
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.NoToneMapping; // トーンマッピングを無効化
        this.renderer.outputEncoding = THREE.sRGBEncoding; // 色空間を明示的に設定
        document.getElementById('container').appendChild(this.renderer.domElement);
    }

    createPanorama() {
        const geometry = new THREE.SphereGeometry(50, 64, 32); // 解像度を2倍に
        // ジオメトリを内側から見えるように反転
        geometry.scale(-1, 1, 1); // X軸を反転
        
        // UVマッピングをY軸で反転（テクスチャの上下を正しく）
        const uvAttribute = geometry.attributes.uv;
        for (let i = 0; i < uvAttribute.count; i++) {
            const v = uvAttribute.getY(i);
            uvAttribute.setY(i, 1 - v); // V座標を反転
        }
        uvAttribute.needsUpdate = true;

        const loader = new THREE.TextureLoader();
        
        // テクスチャパスをデバッグ
        const texturePath = '../shared/imagen_imagen-3.0-generate-002_20250705_125719_0.png';
        console.log('Loading texture from:', texturePath);
        
        loader.load(texturePath, (texture) => {
            console.log('Lumeria texture loaded successfully:', texture);
            console.log('Texture dimensions:', texture.image.width, 'x', texture.image.height);
            
            // テクスチャのフィルタリング設定を最適化
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false; // ミップマップを無効化してシャープに
            texture.wrapS = THREE.ClampToEdgeWrap;
            texture.wrapT = THREE.ClampToEdgeWrap;
            texture.encoding = THREE.sRGBEncoding; // 色空間エンコーディング設定
            texture.flipY = false; // UVマッピングで反転しているのでfalse
            
            const material = new THREE.MeshBasicMaterial({ 
                map: texture,
                side: THREE.DoubleSide  // 両面から見えるように
            });
            
            this.panoramaSphere = new THREE.Mesh(geometry, material);
            this.panoramaSphere.position.set(0, 0, 0);
            this.panoramaSphere.scale.set(1, 1, 1);
            this.panoramaSphere.renderOrder = -1000; // 背景として最初にレンダリング
            
            // デバッグ: パノラマ球の詳細をログ出力
            console.log('Panorama sphere details:', {
                position: this.panoramaSphere.position,
                scale: this.panoramaSphere.scale,
                visible: this.panoramaSphere.visible,
                material: this.panoramaSphere.material,
                geometry: this.panoramaSphere.geometry
            });
            
            this.scene.add(this.panoramaSphere);
            
            // デバッグ: シーンの子要素を確認
            console.log('Scene children count:', this.scene.children.length);
            console.log('Camera position:', this.camera.position);
            console.log('Panorama sphere added to scene');
            this.updateStatus('Lumeria world loaded', 'success');
        }, (progress) => {
            if (progress.total > 0) {
                const percent = Math.round((progress.loaded / progress.total) * 100);
                console.log('Lumeria loading progress:', percent + '%');
            }
        }, (error) => {
            console.error('Error loading Lumeria texture:', error);
            this.updateStatus('Failed to load Lumeria world', 'error');
            
            // フォールバック: シンプルな紫のグラデーション背景
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            
            const gradient = ctx.createLinearGradient(0, 0, 0, 256);
            gradient.addColorStop(0, '#4a0080');
            gradient.addColorStop(0.5, '#8a2be2');
            gradient.addColorStop(1, '#2a0040');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 512, 256);
            
            const fallbackTexture = new THREE.CanvasTexture(canvas);
            fallbackTexture.minFilter = THREE.LinearFilter;
            fallbackTexture.magFilter = THREE.LinearFilter;
            fallbackTexture.generateMipmaps = false;
            fallbackTexture.encoding = THREE.sRGBEncoding;
            
            const fallbackMaterial = new THREE.MeshBasicMaterial({ 
                map: fallbackTexture,
                side: THREE.BackSide 
            });
            
            this.panoramaSphere = new THREE.Mesh(geometry, fallbackMaterial);
            this.scene.add(this.panoramaSphere);
            console.log('Fallback panorama sphere created');
        });
    }

    loadUnicorn(modelName) {
        // 既存のユニコーンを削除
        if (this.unicornModel) {
            this.scene.remove(this.unicornModel);
            this.unicornModel = null;
            this.mixer = null;
        }

        this.updateStatus(`Loading ${modelName}...`, 'warning');

        const loader = new GLTFLoader();
        loader.load(`../${modelName}`, 
            (gltf) => {
                this.unicornModel = gltf.scene;
                
                // ユニコーンのサイズと初期位置調整
                this.unicornModel.scale.set(0.6, 0.6, 0.6);
                // 初期位置を移動経路の開始点に設定
                this.unicornModel.position.copy(this.unicornPath.center);
                this.unicornModel.position.x += this.unicornPath.radius; // 円の開始位置
                
                // マテリアルを魔法的に調整
                this.unicornModel.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        if (child.material) {
                            // 魔法的な発光エフェクト
                            child.material.emissive = new THREE.Color(0x442288);
                            child.material.emissiveIntensity = 0.3;
                            
                            // 透明度を少し追加
                            if (child.material.transparent !== undefined) {
                                child.material.transparent = true;
                                child.material.opacity = 0.95;
                            }
                        }
                    }
                });
                
                this.scene.add(this.unicornModel);
                
                // アニメーション設定
                if (gltf.animations && gltf.animations.length > 0) {
                    this.mixer = new THREE.AnimationMixer(this.unicornModel);
                    gltf.animations.forEach((clip) => {
                        const action = this.mixer.clipAction(clip);
                        action.setEffectiveTimeScale(2.5); // アニメーション速度を2.5倍に
                        action.play();
                    });
                    this.updateStatus(`✨ ${modelName} loaded with animations!`, 'success');
                } else {
                    this.updateStatus(`✨ ${modelName} loaded successfully!`, 'success');
                }
                
                console.log('Unicorn loaded in magical Lumeria!');
            },
            (progress) => {
                if (progress.total > 0) {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    this.updateStatus(`Loading ${modelName}... ${percent}%`, 'warning');
                }
            },
            (error) => {
                console.error('Error loading unicorn:', error);
                this.updateStatus(`❌ Failed to load ${modelName}`, 'error');
            }
        );
    }

    createParticleSystem() {
        const particleCount = 6000;
        const geometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const randoms = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // 球体状の初期配置（パノラマ球の内側）
            const radius = Math.random() * 8 + 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // ユニコーン風のパステルカラー
            const hue = Math.random() * 100 + 270; // 紫〜ピンクの範囲
            const saturation = Math.random() * 0.4 + 0.3;
            const lightness = Math.random() * 0.4 + 0.6;
            
            const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            sizes[i] = Math.random() * 2.5 + 0.5;
            
            randoms[i3] = Math.random();
            randoms[i3 + 1] = Math.random();
            randoms[i3 + 2] = Math.random();
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('random', new THREE.BufferAttribute(randoms, 3));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: window.devicePixelRatio }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                attribute vec3 random;
                uniform float time;
                varying vec3 vColor;
                varying float vAlpha;
                
                // ノイズ関数（簡略版）
                float noise(vec3 p) {
                    return fract(sin(dot(p, vec3(12.9898, 78.233, 54.53))) * 43758.5453);
                }
                
                void main() {
                    vColor = color;
                    
                    vec3 pos = position;
                    
                    // 魔法的な螺旋運動
                    float spiralTime = time * 0.3;
                    float spiralRadius = length(pos.xz);
                    float spiralAngle = atan(pos.z, pos.x) + spiralTime + spiralRadius * 0.1;
                    
                    pos.x = spiralRadius * cos(spiralAngle);
                    pos.z = spiralRadius * sin(spiralAngle);
                    pos.y += sin(time * 0.8 + random.x * 6.28) * 2.0;
                    
                    // ユニコーンの周りに集まるエフェクト
                    vec3 unicornPos = vec3(0.0, -1.0, -3.0);
                    vec3 toUnicorn = unicornPos - pos;
                    float distToUnicorn = length(toUnicorn);
                    
                    if (distToUnicorn < 8.0) {
                        pos += normalize(toUnicorn) * (8.0 - distToUnicorn) * 0.02 * sin(time * 2.0);
                    }
                    
                    // 呼吸するような動き
                    float breathe = sin(time * 0.6) * 0.5 + 0.5;
                    pos *= 1.0 + breathe * 0.2;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    
                    float dynamicSize = size * (1.0 + breathe * 0.4);
                    gl_PointSize = dynamicSize * (300.0 / -mvPosition.z);
                    
                    vAlpha = 0.4 + (noise(pos * 0.1) * 0.3) + (breathe * 0.3);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    float distance = length(gl_PointCoord - vec2(0.5));
                    if (distance > 0.5) discard;
                    
                    float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
                    alpha *= vAlpha;
                    
                    // 中心部分をより明るく（星のような効果）
                    float centerGlow = 1.0 - smoothstep(0.0, 0.3, distance);
                    vec3 finalColor = vColor + vec3(centerGlow * 0.5);
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false
        });
        
        this.particleSystem = new THREE.Points(geometry, material);
        this.particleSystem.renderOrder = 100; // パノラマより後にレンダリング
        this.scene.add(this.particleSystem);
        
        console.log('Particle system added to scene');
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 15;
        this.controls.autoRotate = false; // ユニコーン追跡時はオートローテーション無効
        this.controls.autoRotateSpeed = 0.3;
        
        // 初期カメラ位置をユニコーンに向ける
        this.camera.position.set(0, 2, 5);
        this.controls.target.set(0, -1, -3); // ユニコーンの初期位置
        
        // カメラの軌道設定
        this.baseCameraRadius = 7; // 基本距離
        this.cameraRadius = 7; // 現在の距離（動的に変化）
        this.cameraHeight = 2; // カメラの高さ
        this.cameraOrbitSpeed = 0.1; // カメラの軌道速度
        
        // ダイナミックカメラ設定
        this.cameraZoomCycle = 0; // ズームサイクル
        this.lastZoomTime = 0; // 最後のズーム時間
        
        // ユニコーンの移動経路設定
        this.unicornPath = {
            center: new THREE.Vector3(0, -1, -3), // 中心位置
            radius: 8, // 移動半径
            speed: 0.08, // 移動速度
            heightVariation: 2 // 高さの変化量
        };
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // ユニコーン用の魔法的ライト
        const unicornLight1 = new THREE.PointLight(0xaa88ff, 1.5, 15);
        unicornLight1.position.set(3, 3, 6);
        this.scene.add(unicornLight1);
        
        const unicornLight2 = new THREE.PointLight(0xff88dd, 1.2, 12);
        unicornLight2.position.set(-3, 2, 4);
        this.scene.add(unicornLight2);
        
        // スポットライト
        const spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.position.set(0, 15, 5);
        spotLight.target.position.set(0, 0, 3);
        spotLight.angle = Math.PI / 6;
        spotLight.penumbra = 0.3;
        spotLight.decay = 2;
        spotLight.distance = 200;
        this.scene.add(spotLight);
        this.scene.add(spotLight.target);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // マウスクリックでオートローテーションを切り替え
        this.renderer.domElement.addEventListener('click', () => {
            this.controls.autoRotate = !this.controls.autoRotate;
            this.updateStatus(
                this.controls.autoRotate ? 'Auto-rotation ON' : 'Auto-rotation OFF', 
                'success'
            );
            this.onUserInteraction();
        });
        
        // モデルセレクター
        this.modelSelector.addEventListener('change', (e) => {
            this.loadUnicorn(e.target.value);
            this.onUserInteraction();
        });
        
        // マウス移動でUI表示
        document.addEventListener('mousemove', () => {
            this.onUserInteraction();
        });
        
        // キーボードでUI表示
        document.addEventListener('keydown', () => {
            this.onUserInteraction();
        });
        
        // マウス操作でカメラ制御を検知
        this.renderer.domElement.addEventListener('mousedown', () => {
            this.isUserControllingCamera = true;
        });
        
        this.renderer.domElement.addEventListener('mouseup', () => {
            // 3秒後に自動カメラ復活
            setTimeout(() => {
                this.isUserControllingCamera = false;
            }, 3000);
        });
    }

    onUserInteraction() {
        this.lastInteractionTime = Date.now();
        this.showUI();
    }

    showUI() {
        this.infoPanel.classList.remove('minimized');
        this.controlsPanel.classList.remove('hidden');
    }

    hideUI() {
        this.infoPanel.classList.add('minimized');
        this.controlsPanel.classList.add('hidden');
    }

    checkUIVisibility() {
        const timeSinceInteraction = Date.now() - this.lastInteractionTime;
        const hideDelay = 3000; // 3秒後に隠す
        
        if (timeSinceInteraction > hideDelay) {
            this.hideUI();
        }
    }

    updateCameraDistance() {
        // 10-15秒ごとにズームイン/アウトを行う
        const zoomInterval = 12; // 12秒間隔
        const currentZoomCycle = Math.floor(this.time / zoomInterval);
        
        if (currentZoomCycle !== this.cameraZoomCycle) {
            this.cameraZoomCycle = currentZoomCycle;
            this.lastZoomTime = this.time;
        }
        
        // ズームサイクル内での時間（0-1）
        const cycleProgress = (this.time - this.lastZoomTime) / zoomInterval;
        
        // ズームパターンを決定（偶数サイクル：近づく、奇数サイクル：離れる）
        const isZoomIn = (this.cameraZoomCycle % 2 === 0);
        
        if (isZoomIn) {
            // 近づくサイクル: 7 → 3 → 7
            if (cycleProgress < 0.4) {
                // 最初の40%で近づく
                const progress = cycleProgress / 0.4;
                const easeProgress = this.easeInOutCubic(progress);
                this.cameraRadius = this.baseCameraRadius - (4 * easeProgress); // 7 → 3
            } else if (cycleProgress < 0.8) {
                // 40%-80%で近い距離を維持
                this.cameraRadius = 3;
            } else {
                // 最後の20%で離れる
                const progress = (cycleProgress - 0.8) / 0.2;
                const easeProgress = this.easeInOutCubic(progress);
                this.cameraRadius = 3 + (4 * easeProgress); // 3 → 7
            }
        } else {
            // 離れるサイクル: 7 → 10 → 7
            if (cycleProgress < 0.3) {
                // 最初の30%で離れる
                const progress = cycleProgress / 0.3;
                const easeProgress = this.easeInOutCubic(progress);
                this.cameraRadius = this.baseCameraRadius + (3 * easeProgress); // 7 → 10
            } else if (cycleProgress < 0.7) {
                // 30%-70%で遠い距離を維持
                this.cameraRadius = 10;
            } else {
                // 最後の30%で戻る
                const progress = (cycleProgress - 0.7) / 0.3;
                const easeProgress = this.easeInOutCubic(progress);
                this.cameraRadius = 10 - (3 * easeProgress); // 10 → 7
            }
        }
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        this.time = this.clock.getElapsedTime();
        
        // パーティクルシステムの時間更新
        if (this.particleSystem && this.particleSystem.material && this.particleSystem.material.uniforms) {
            this.particleSystem.material.uniforms.time.value = this.time;
        }
        
        // ユニコーンアニメーション更新
        if (this.mixer) {
            this.mixer.update(delta);
        }
        
        // ユニコーンの移動と浮遊エフェクト
        if (this.unicornModel) {
            // 大きな円を描いて移動（進んでいる感じ）
            const pathAngle = this.time * this.unicornPath.speed;
            const baseX = this.unicornPath.center.x + Math.cos(pathAngle) * this.unicornPath.radius;
            const baseZ = this.unicornPath.center.z + Math.sin(pathAngle) * this.unicornPath.radius;
            
            // 高さの変化（山なりの飛行）
            const heightOffset = Math.sin(pathAngle * 0.7) * this.unicornPath.heightVariation;
            const baseY = this.unicornPath.center.y + heightOffset;
            
            // 細かいふわふわ動きを追加
            this.unicornModel.position.x = baseX + Math.sin(this.time * 1.2) * 0.3; // 小さな左右の揺れ
            this.unicornModel.position.y = baseY + Math.sin(this.time * 0.8) * 0.6 + Math.sin(this.time * 1.5) * 0.2; // ふわふわ
            this.unicornModel.position.z = baseZ + Math.sin(this.time * 0.9) * 0.3; // 小さな前後の揺れ
            
            // 進行方向を向く
            const nextPathAngle = pathAngle + 0.1;
            const nextX = this.unicornPath.center.x + Math.cos(nextPathAngle) * this.unicornPath.radius;
            const nextZ = this.unicornPath.center.z + Math.sin(nextPathAngle) * this.unicornPath.radius;
            const direction = new THREE.Vector3(nextX - baseX, 0, nextZ - baseZ).normalize();
            this.unicornModel.rotation.y = Math.atan2(direction.x, direction.z) + Math.sin(this.time * 0.3) * 0.1;
            
            // さらにふわふわ感を演出
            this.unicornModel.rotation.x = Math.sin(this.time * 0.6) * 0.1; // 軽い上下の傾き
            this.unicornModel.rotation.z = Math.sin(this.time * 0.4) * 0.05; // 軽い左右の傾き
            
            // カメラがユニコーンを追跡
            if (this.controls) {
                // ユニコーンの位置に向かってカメラターゲットをスムーズに移動
                const unicornPosition = this.unicornModel.position.clone();
                this.controls.target.lerp(unicornPosition, 0.02); // ゆっくり追跡
                
                // カメラがユニコーンの周りを軌道運動（手動操作していない時のみ）
                if (!this.isUserControllingCamera && this.time > 2) { // 2秒後から開始
                    // ダイナミックな距離変化
                    this.updateCameraDistance();
                    
                    // カメラの角度をユニコーンの移動に合わせて調整
                    const unicornPathAngle = this.time * this.unicornPath.speed;
                    const cameraOffset = this.time * this.cameraOrbitSpeed;
                    const angle = unicornPathAngle + cameraOffset; // ユニコーンの移動 + カメラの相対移動
                    
                    const targetCameraX = unicornPosition.x + Math.cos(angle) * this.cameraRadius;
                    const targetCameraZ = unicornPosition.z + Math.sin(angle) * this.cameraRadius;
                    // カメラの高さを距離に応じて調整（近い時は低く、遠い時は高く）
                    const heightMultiplier = (this.cameraRadius / this.baseCameraRadius);
                    const dynamicHeight = this.cameraHeight * heightMultiplier + Math.sin(this.time * 0.3) * 0.5;
                    const targetCameraY = unicornPosition.y + dynamicHeight;
                    
                    // カメラ位置をスムーズに移動
                    this.camera.position.lerp(
                        new THREE.Vector3(targetCameraX, targetCameraY, targetCameraZ), 
                        0.02 // 少し速めに移動
                    );
                }
            }
            
            // 魔法的な発光の強度を変化
            this.unicornModel.traverse((child) => {
                if (child.isMesh && child.material && child.material.emissive) {
                    const glowIntensity = 0.3 + Math.sin(this.time * 1.5) * 0.2;
                    child.material.emissiveIntensity = glowIntensity;
                }
            });
        }
        
        // UI表示管理
        this.checkUIVisibility();
        
        // コントロールの更新
        this.controls.update();
        
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new LumeriaUnicornViewer();
});