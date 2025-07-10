class LumeriaColorful {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.panoramaSphere = null;
        this.controls = null;
        this.fireworksParticles = [];
        this.ambientParticles = null;
        this.clock = new THREE.Clock();
        this.fireworksQueue = [];
        
        this.init();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createPanorama();
        this.createAmbientParticles();
        this.setupControls();
        this.setupEventListeners();
        this.startFireworksShow();
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
        this.renderer.setClearColor(0x000000, 1.0);  // 黒背景設定
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        document.getElementById('container').appendChild(this.renderer.domElement);
    }

    createPanorama() {
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);

        const loader = new THREE.TextureLoader();
        loader.load('../shared/imagen_imagen-3.0-generate-002_20250705_101618_0.png', (texture) => {
            console.log('Colorful panorama loaded successfully');
            const material = new THREE.MeshBasicMaterial({ map: texture });
            this.panoramaSphere = new THREE.Mesh(geometry, material);
            this.panoramaSphere.position.set(0, 0, 0);  // 明示的に中心に配置
            this.scene.add(this.panoramaSphere);
        }, undefined, (error) => {
            console.error('Error loading colorful panorama:', error);
        });
    }

    createAmbientParticles() {
        const particleCount = 3000;
        const geometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        // ステンドグラス色彩パレット
        const stainedGlassColors = [
            { r: 0.8, g: 0.1, b: 0.2 }, // 深紅・ルビー
            { r: 0.1, g: 0.7, b: 0.3 }, // エメラルドグリーン
            { r: 0.2, g: 0.3, b: 0.9 }, // サファイアブルー
            { r: 0.9, g: 0.7, b: 0.1 }, // アンバー・金色
            { r: 0.6, g: 0.2, b: 0.8 }, // バイオレット
            { r: 0.9, g: 0.4, b: 0.6 }  // ローズピンク
        ];
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // ランダムな球体配置
            const radius = Math.random() * 15 + 5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // ステンドグラス色をランダム選択
            const colorIndex = Math.floor(Math.random() * stainedGlassColors.length);
            const selectedColor = stainedGlassColors[colorIndex];
            
            colors[i3] = selectedColor.r;
            colors[i3 + 1] = selectedColor.g;
            colors[i3 + 2] = selectedColor.b;
            
            sizes[i] = Math.random() * 0.5 + 0.2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            map: this.createStainedGlassTexture()
        });
        
        this.ambientParticles = new THREE.Points(geometry, material);
        this.scene.add(this.ambientParticles);
    }

    createFirework(x = 0, y = 0, z = 0) {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const lifetimes = new Float32Array(particleCount);
        
        // より鮮やかな花火色
        const colorTypes = [
            {r: 1.0, g: 0.2, b: 0.3},  // 赤
            {r: 0.2, g: 1.0, b: 0.3},  // 緑
            {r: 0.3, g: 0.2, b: 1.0},  // 青
            {r: 1.0, g: 1.0, b: 0.2},  // 黄
            {r: 1.0, g: 0.3, b: 1.0},  // マゼンタ
            {r: 0.3, g: 1.0, b: 1.0}   // シアン
        ];
        const fireworkColor = colorTypes[Math.floor(Math.random() * colorTypes.length)];
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // 中心位置から開始
            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;
            
            // 球状に爆発する速度
            const speed = Math.random() * 15 + 5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            velocities[i3] = speed * Math.sin(phi) * Math.cos(theta);
            velocities[i3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
            velocities[i3 + 2] = speed * Math.cos(phi);
            
            // 各パーティクルをカラフルに
            const particleColor = colorTypes[Math.floor(Math.random() * colorTypes.length)];
            colors[i3] = particleColor.r + (Math.random() - 0.5) * 0.2;
            colors[i3 + 1] = particleColor.g + (Math.random() - 0.5) * 0.2;
            colors[i3 + 2] = particleColor.b + (Math.random() - 0.5) * 0.2;
            
            sizes[i] = Math.random() * 1.5 + 0.8;  // パーティクルサイズを大きく
            lifetimes[i] = Math.random() * 4 + 3; // 3-7秒のライフタイム（長く）
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 0.3,  // サイズを大きく
            vertexColors: true,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            map: this.createFireworkTexture()
        });
        
        const firework = new THREE.Points(geometry, material);
        firework.userData = {
            age: 0,
            maxAge: 5,
            gravity: -0.02
        };
        
        this.scene.add(firework);
        this.fireworksParticles.push(firework);
        
        return firework;
    }

    createStainedGlassTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // ステンドグラス風の複雑なグラデーション
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(64, 64, 64, 0, Math.PI * 2);
        ctx.fill();
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createFireworkTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // 花火の星のような形
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(32, 32, 32, 0, Math.PI * 2);
        ctx.fill();
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    launchRandomFirework() {
        const x = (Math.random() - 0.5) * 20;
        const y = (Math.random() - 0.5) * 10;
        const z = (Math.random() - 0.5) * 20;
        
        this.createFirework(x, y, z);
    }

    startFireworksShow() {
        // 定期的に花火を打ち上げる
        setInterval(() => {
            this.launchRandomFirework();
        }, 1000 + Math.random() * 2000); // 1-3秒間隔（より頻繁に）
    }

    setupControls() {
        // 他の世界と同じ手動制御に変更
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.rotationX = -0.05;  // 初期視点を少し上向きに
        this.rotationY = 0;
        this.autoRotateY = 0;  // 自動回転用
        
        // 初期カメラ角度を設定
        this.camera.rotation.x = this.rotationX;
        this.camera.rotation.y = this.rotationY;
        
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('mousedown', (event) => {
            this.isMouseDown = true;
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;
            event.preventDefault();
        });
        
        canvas.addEventListener('mousemove', (event) => {
            if (!this.isMouseDown) return;
            
            const deltaX = event.clientX - this.mouseX;
            const deltaY = event.clientY - this.mouseY;
            
            this.rotationY += deltaX * 0.005;
            this.rotationX += deltaY * 0.005;
            
            // Limit vertical rotation
            this.rotationX = Math.max(-Math.PI/3, Math.min(Math.PI/3, this.rotationX));
            
            this.camera.rotation.x = this.rotationX;
            this.camera.rotation.y = this.rotationY;
            
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;
            
            event.preventDefault();
        });
        
        canvas.addEventListener('mouseup', (event) => {
            this.isMouseDown = false;
            event.preventDefault();
        });
        
        canvas.addEventListener('mouseleave', () => {
            this.isMouseDown = false;
        });
        
        // ズーム機能追加
        canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            
            const zoomSpeed = 0.1;
            const minFov = 30;
            const maxFov = 120;
            
            if (event.deltaY > 0) {
                this.camera.fov = Math.min(maxFov, this.camera.fov + zoomSpeed * 10);
            } else {
                this.camera.fov = Math.max(minFov, this.camera.fov - zoomSpeed * 10);
            }
            
            this.camera.updateProjectionMatrix();
        });
        
        console.log('Manual camera controls with zoom initialized');
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // クリックで花火を打ち上げ
        this.renderer.domElement.addEventListener('click', (event) => {
            const x = (Math.random() - 0.5) * 30;
            const y = (Math.random() - 0.5) * 15;
            const z = (Math.random() - 0.5) * 30;
            this.createFirework(x, y, z);
        });

        // 音楽コントロール
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

    updateFireworks(deltaTime) {
        for (let i = this.fireworksParticles.length - 1; i >= 0; i--) {
            const firework = this.fireworksParticles[i];
            const userData = firework.userData;
            
            userData.age += deltaTime;
            
            // 寿命が尽きた花火を削除
            if (userData.age > userData.maxAge) {
                this.scene.remove(firework);
                this.fireworksParticles.splice(i, 1);
                continue;
            }
            
            const positions = firework.geometry.attributes.position.array;
            const velocities = firework.geometry.attributes.velocity.array;
            const lifetimes = firework.geometry.attributes.lifetime.array;
            
            // パーティクルを更新
            for (let j = 0; j < positions.length; j += 3) {
                const particleIndex = j / 3;
                
                // 位置更新
                positions[j] += velocities[j] * deltaTime;
                positions[j + 1] += velocities[j + 1] * deltaTime;
                positions[j + 2] += velocities[j + 2] * deltaTime;
                
                // 重力適用
                velocities[j + 1] += userData.gravity * deltaTime;
                
                // 減衰
                velocities[j] *= 0.98;
                velocities[j + 1] *= 0.98;
                velocities[j + 2] *= 0.98;
                
                // ライフタイム減少
                lifetimes[particleIndex] -= deltaTime;
            }
            
            // 透明度をライフタイムに基づいて調整
            const lifeRatio = 1 - (userData.age / userData.maxAge);
            firework.material.opacity = Math.max(0, lifeRatio);
            
            firework.geometry.attributes.position.needsUpdate = true;
            firework.geometry.attributes.velocity.needsUpdate = true;
            firework.geometry.attributes.lifetime.needsUpdate = true;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        const time = this.clock.getElapsedTime();
        
        // 環境パーティクルのアニメーション
        if (this.ambientParticles) {
            const positions = this.ambientParticles.geometry.attributes.position.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                const particleIndex = i / 3;
                
                // ゆっくりとした浮遊アニメーション
                positions[i + 1] += Math.sin(time * 0.5 + particleIndex * 0.1) * 0.01;
                positions[i] += Math.cos(time * 0.3 + particleIndex * 0.05) * 0.005;
                positions[i + 2] += Math.sin(time * 0.4 + particleIndex * 0.08) * 0.005;
            }
            
            this.ambientParticles.geometry.attributes.position.needsUpdate = true;
            this.ambientParticles.rotation.y = time * 0.02;
        }
        
        // 花火アニメーション更新
        this.updateFireworks(deltaTime);
        
        // 自動回転（マウス操作中でない場合のみ）
        if (!this.isMouseDown) {
            this.autoRotateY -= 0.002;  // よりゆっくりと回転
            this.camera.rotation.y = this.rotationY + this.autoRotateY;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new LumeriaColorful();
});