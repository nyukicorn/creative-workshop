class LumeriaV2 {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.panoramaSphere = null;
        this.controls = null;
        this.particles = null;
        this.clock = new THREE.Clock();
        
        this.init();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createPanorama();
        this.createParticles();
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
        loader.load('../shared/imagen_imagen-3.0-generate-002_20250705_113344_0.png', (texture) => {
            console.log('Panorama loaded successfully');
            const material = new THREE.MeshBasicMaterial({ map: texture });
            this.panoramaSphere = new THREE.Mesh(geometry, material);
            this.scene.add(this.panoramaSphere);
        }, undefined, (error) => {
            console.error('Error loading panorama:', error);
        });
    }

    createParticles() {
        const particleCount = 15000;
        const geometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // 中央に集中した球体状配置
            const radius = Math.random() * 5 + 1;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // ピンク系パステルカラー
            const hue = Math.random() * 80 + 300; // ピンク〜紫の範囲
            const saturation = Math.random() * 0.4 + 0.4; // より鮮やかに
            const lightness = Math.random() * 0.3 + 0.7; // 明るく
            const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            sizes[i] = Math.random() * 0.5 + 0.1;
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
            map: this.createCircleTexture()
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createCircleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // より滑らかな円形グラデーション
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(64, 64, 64, 0, Math.PI * 2);
        ctx.fill();
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    setupControls() {
        // ホワイトと同じ手動制御に変更
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.rotationX = -0.05;  // 初期視点をより上向きに
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

        // クリックでオートローテーションを切り替え
        this.renderer.domElement.addEventListener('click', () => {
            this.controls.autoRotate = !this.controls.autoRotate;
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

        // 音楽の音量調整
        bgMusic.volume = 0.3;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = this.clock.getElapsedTime();
        
        // パーティクルのアニメーション
        if (this.particles) {
            this.particles.rotation.y = time * 0.1;
            this.particles.rotation.x = Math.sin(time * 0.5) * 0.2;
        }
        
        // 自動回転（マウス操作中でない場合のみ）
        if (!this.isMouseDown) {
            this.autoRotateY -= 0.002;  // よりゆっくりと回転
            this.camera.rotation.y = this.rotationY + this.autoRotateY;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new LumeriaV2();
});