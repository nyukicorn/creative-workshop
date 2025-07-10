class LumeriaAqua {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.panoramaSphere = null;
        this.controls = null;
        this.waterParticles = null;
        this.rainParticles = null;
        this.clock = new THREE.Clock();
        
        this.init();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createPanorama();
        this.createWaterParticles();
        this.createRainParticles();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
    }

    createScene() {
        this.scene = new THREE.Scene();
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 0);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('container').appendChild(this.renderer.domElement);
    }

    createPanorama() {
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);

        const loader = new THREE.TextureLoader();
        loader.load('../shared/imagen_imagen-3.0-generate-002_20250705_102017_0.png', (texture) => {
            console.log('Aqua panorama loaded successfully');
            const material = new THREE.MeshBasicMaterial({ map: texture });
            this.panoramaSphere = new THREE.Mesh(geometry, material);
            this.scene.add(this.panoramaSphere);
        }, undefined, (error) => {
            console.error('Error loading aqua panorama:', error);
        });
    }

    createWaterParticles() {
        const particleCount = 8000;
        const geometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const velocities = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // 水の流れをイメージした配置
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 40 + 10;
            const height = (Math.random() - 0.5) * 6;
            
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = height;
            positions[i3 + 2] = Math.sin(angle) * radius;
            
            // 水色・青色・ターコイズブルー系の色
            const hue = Math.random() * 60 + 180; // 青〜シアンの範囲
            const saturation = Math.random() * 0.5 + 0.5;
            const lightness = Math.random() * 0.4 + 0.6;
            const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            sizes[i] = Math.random() * 0.8 + 0.2;
            
            // 水の流れの速度
            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            map: this.createWaterTexture()
        });
        
        this.waterParticles = new THREE.Points(geometry, material);
        this.scene.add(this.waterParticles);
    }

    createRainParticles() {
        const particleCount = 5000;
        const geometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const velocities = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // 上から降ってくる雨のような配置 - より広い範囲に分散
            positions[i3] = (Math.random() - 0.5) * 80;
            positions[i3 + 1] = Math.random() * 40 + 10;
            positions[i3 + 2] = (Math.random() - 0.5) * 80;
            
            // 透明な青色
            const hue = Math.random() * 30 + 200; // 青系
            const saturation = Math.random() * 0.3 + 0.7;
            const lightness = Math.random() * 0.3 + 0.7;
            const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            sizes[i] = Math.random() * 0.3 + 0.1;
            velocities[i] = Math.random() * 0.05 + 0.02;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));
        
        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            map: this.createRainTexture()
        });
        
        this.rainParticles = new THREE.Points(geometry, material);
        this.scene.add(this.rainParticles);
    }

    createWaterTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // 水滴のような円形グラデーション
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, 'rgba(100, 200, 255, 1)');
        gradient.addColorStop(0.4, 'rgba(100, 200, 255, 0.8)');
        gradient.addColorStop(0.7, 'rgba(100, 200, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(64, 64, 64, 0, Math.PI * 2);
        ctx.fill();
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createRainTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // 雨滴のような小さな円形
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(200, 230, 255, 1)');
        gradient.addColorStop(0.6, 'rgba(200, 230, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(200, 230, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(32, 32, 32, 0, Math.PI * 2);
        ctx.fill();
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    setupControls() {
        // OrbitControlsに戻して自動カメラ移動を追加
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 50;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.6;
        
        // 初期視点を下向きに設定
        this.controls.minPolarAngle = 0; // ほぼ真下向き
        this.controls.maxPolarAngle = 0; // 初期は真下向きに固定
        this.controls.target.set(0, -3, 0); // 下を見る
        
        // 自動カメラ移動用の変数
        this.cameraTransitionComplete = false;
        this.initialPolarAngle = 0;  // ほぼ真下から開始
        this.targetPolarAngle = Math.PI * 0.25;  // 45度で停止
        
        console.log('OrbitControls with auto transition initialized');
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        this.renderer.domElement.addEventListener('click', () => {
            this.controls.autoRotate = !this.controls.autoRotate;
        });

        const audioBtn = document.getElementById('audioBtn');
        const bgMusic = document.getElementById('bgMusic');
        let isPlaying = false;

        audioBtn.addEventListener('click', () => {
            if (isPlaying) {
                bgMusic.pause();
                audioBtn.textContent = '🎵';
                isPlaying = false;
            } else {
                bgMusic.play().catch(e => {
                    console.log('Audio play failed:', e);
                });
                audioBtn.textContent = '⏸️';
                isPlaying = true;
            }
        });

        bgMusic.volume = 0.3;
        
        // 自動再生を試行
        setTimeout(() => {
            bgMusic.play().then(() => {
                audioBtn.textContent = '⏸️';
                isPlaying = true;
            }).catch(e => {
                console.log('Auto play failed:', e);
            });
        }, 1000);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = this.clock.getElapsedTime();
        
        // 水の精霊パーティクルアニメーション - 優雅で幻想的な動き
        if (this.waterParticles) {
            const positions = this.waterParticles.geometry.attributes.position.array;
            const velocities = this.waterParticles.geometry.attributes.velocity.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                const particleIndex = i / 3;
                
                // より優雅な渦巻きの動き - 速度を上げる
                const spiralTime = time * 0.2 + particleIndex * 0.05;
                const radius = Math.sqrt(positions[i] * positions[i] + positions[i + 2] * positions[i + 2]);
                const angle = Math.atan2(positions[i + 2], positions[i]);
                
                // 水の精霊のような螺旋状の動き - より明確なトルネード
                const newAngle = angle + Math.sin(spiralTime) * 0.01;
                const newRadius = radius + Math.cos(spiralTime * 0.8) * 0.1;
                
                positions[i] = newRadius * Math.cos(newAngle);
                positions[i + 2] = newRadius * Math.sin(newAngle);
                
                // 妖精のような上下の浮遊感 - よりゆっくり
                positions[i + 1] += Math.sin(time * 0.6 + particleIndex * 0.05) * 0.008;
                
                // 水の精霊同士の共鳴 - より穏やかな相互作用
                if (i > 0) {
                    const prevX = positions[i - 3];
                    const prevY = positions[i - 2];
                    const prevZ = positions[i - 1];
                    
                    const distance = Math.sqrt(
                        Math.pow(positions[i] - prevX, 2) +
                        Math.pow(positions[i + 1] - prevY, 2) +
                        Math.pow(positions[i + 2] - prevZ, 2)
                    );
                    
                    if (distance < 2.0) {
                        const attraction = 0.0003;
                        positions[i] += (prevX - positions[i]) * attraction;
                        positions[i + 1] += (prevY - positions[i + 1]) * attraction;
                        positions[i + 2] += (prevZ - positions[i + 2]) * attraction;
                    }
                }
                
                // 境界での優雅な反発
                if (Math.abs(positions[i]) > 60) {
                    positions[i] *= -0.95;
                    velocities[i] *= -0.9;
                }
                if (Math.abs(positions[i + 1]) > 6) {
                    positions[i + 1] *= -0.95;
                    velocities[i + 1] *= -0.9;
                }
                if (Math.abs(positions[i + 2]) > 60) {
                    positions[i + 2] *= -0.95;
                    velocities[i + 2] *= -0.9;
                }
            }
            
            this.waterParticles.geometry.attributes.position.needsUpdate = true;
            this.waterParticles.rotation.y = time * 0.01; // 非常にゆっくりとした回転
        }
        
        // 水の妖精の雨パーティクルアニメーション - 優雅で幻想的な動き
        if (this.rainParticles) {
            const positions = this.rainParticles.geometry.attributes.position.array;
            const velocities = this.rainParticles.geometry.attributes.velocity.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                const particleIndex = i / 3;
                
                // 非常に緩やかな重力加速
                velocities[particleIndex] += 0.0001;
                
                // 妖精の涙のようにゆっくりと舞い降りる
                positions[i + 1] -= velocities[particleIndex];
                positions[i] += Math.sin(time * 0.2 + particleIndex * 0.05) * 0.008; // より広い微風の影響
                positions[i + 2] += Math.cos(time * 0.15 + particleIndex * 0.03) * 0.006; // より広い螺旋の動き
                
                // 水の妖精が地面に触れたような優雅な再生
                if (positions[i + 1] < -20) {
                    positions[i + 1] = 40 + Math.random() * 15;
                    positions[i] = (Math.random() - 0.5) * 80;
                    positions[i + 2] = (Math.random() - 0.5) * 80;
                    velocities[particleIndex] = Math.random() * 0.005 + 0.001; // より穏やかな速度リセット
                    
                    // 優雅な波紋効果をシミュレート
                    for (let j = 0; j < 3; j++) {
                        const rippleIndex = (particleIndex + j * 150) % (positions.length / 3);
                        const rippleI = rippleIndex * 3;
                        if (rippleI < positions.length) {
                            const distance = Math.sqrt(
                                Math.pow(positions[i] - positions[rippleI], 2) +
                                Math.pow(positions[i + 2] - positions[rippleI + 2], 2)
                            );
                            if (distance < 8) {
                                positions[rippleI + 1] += Math.sin(time * 3) * 0.03 * (1 - distance / 8);
                            }
                        }
                    }
                }
                
                // 落下中の水滴の優雅な形状変化
                const fallSpeed = velocities[particleIndex];
                const sizeMultiplier = 1 + fallSpeed * 1.5;
                if (this.rainParticles.geometry.attributes.size) {
                    this.rainParticles.geometry.attributes.size.array[particleIndex] = 
                        (Math.random() * 0.25 + 0.08) * sizeMultiplier;
                }
            }
            
            this.rainParticles.geometry.attributes.position.needsUpdate = true;
            if (this.rainParticles.geometry.attributes.size) {
                this.rainParticles.geometry.attributes.size.needsUpdate = true;
            }
        }
        
        // 自動カメラ移動（最初の3秒間）
        if (!this.cameraTransitionComplete) {
            const elapsed = time; // clock.getElapsedTime()を使用
            const transitionDuration = 5.0; // 5秒かけて遷移
            
            if (elapsed < transitionDuration) {
                // OrbitControlsのpolarAngleを徐々に変更
                const progress = elapsed / transitionDuration;
                const currentPolarAngle = this.initialPolarAngle + (this.targetPolarAngle - this.initialPolarAngle) * progress;
                
                this.controls.minPolarAngle = currentPolarAngle;
                this.controls.maxPolarAngle = currentPolarAngle;
                
                console.log(`Camera transition: ${elapsed.toFixed(2)}s, progress: ${progress.toFixed(3)}, polarAngle: ${currentPolarAngle.toFixed(3)}`);
            } else {
                this.cameraTransitionComplete = true;
                // 遷移完了後は自由に動かせるように
                this.controls.minPolarAngle = 0;
                this.controls.maxPolarAngle = Math.PI;
                // target は変更しない（ワープを防ぐ）
                console.log('Camera transition complete!');
            }
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new LumeriaAqua();
});