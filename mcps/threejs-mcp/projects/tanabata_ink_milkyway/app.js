class TanabataInkMilkyway {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.inkParticles = null;
        this.tanzakuObjects = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.wishes = [
            "健康で幸せな毎日を送れますように",
            "家族みんなが笑顔でいられますように",
            "夢が叶いますように",
            "愛する人との絆が深まりますように",
            "平和な世界になりますように",
            "困っている人を助けられますように",
            "新しい出会いに恵まれますように",
            "心穏やかに過ごせますように"
        ];
        this.currentWish = null;
        
        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupBackground();
        this.setupInkParticles();
        this.setupTanzaku();
        this.setupEventListeners();
        this.animate();
        
        // ローディング画面を隠す
        document.getElementById('loading').style.display = 'none';
    }

    setupScene() {
        this.scene = new THREE.Scene();
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('canvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 50;
    }

    setupBackground() {
        const textureLoader = new THREE.TextureLoader();
        
        // 夜空のグラデーション背景を作成
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // 天の川のグラデーション
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0a0a15');
        gradient.addColorStop(0.3, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(0.7, '#1a1a2e');
        gradient.addColorStop(1, '#0a0a15');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 星を追加
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 2 + 0.5;
            const opacity = Math.random() * 0.8 + 0.2;
            
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const backgroundTexture = new THREE.CanvasTexture(canvas);
        
        const sphereGeometry = new THREE.SphereGeometry(100, 32, 32);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            map: backgroundTexture,
            side: THREE.BackSide
        });
        
        const backgroundSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.scene.add(backgroundSphere);
    }

    setupInkParticles() {
        const particleCount = 50000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const velocities = new Float32Array(particleCount * 3);
        
        // 天の川の形状を作成
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // 天の川の帯状分布
            const t = Math.random() * Math.PI * 2;
            const radius = Math.random() * 30 + 10;
            const height = (Math.random() - 0.5) * 5;
            
            // 墨の流れのような分布
            const flowOffset = Math.sin(t * 3) * 2;
            
            positions[i3] = Math.cos(t) * radius + flowOffset;
            positions[i3 + 1] = height + Math.sin(t * 2) * 2;
            positions[i3 + 2] = Math.sin(t) * radius + flowOffset;
            
            // 墨のような色合い
            const grayValue = Math.random() * 0.3 + 0.1;
            colors[i3] = grayValue;
            colors[i3 + 1] = grayValue;
            colors[i3 + 2] = grayValue;
            
            sizes[i] = Math.random() * 2 + 0.5;
            
            // 左から右への流れ
            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.005;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
        }
        
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // 墨のようなテクスチャを作成
        const particleTexture = this.createInkTexture();
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.5,
            map: particleTexture,
            transparent: true,
            opacity: 0.8,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.inkParticles = new THREE.Points(particleGeometry, particleMaterial);
        this.inkParticles.userData = { velocities: velocities };
        this.scene.add(this.inkParticles);
    }

    createInkTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // 墨のにじみ効果
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        return new THREE.CanvasTexture(canvas);
    }

    setupTanzaku() {
        const tanzakuColors = [
            0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4,
            0xffeaa7, 0xdda0dd, 0xffa07a, 0x98d8c8
        ];
        
        for (let i = 0; i < 8; i++) {
            const geometry = new THREE.PlaneGeometry(2, 4);
            const material = new THREE.MeshBasicMaterial({
                color: tanzakuColors[i],
                transparent: true,
                opacity: 0.9,
                side: THREE.DoubleSide
            });
            
            const tanzaku = new THREE.Mesh(geometry, material);
            
            // ランダムな位置に配置
            const angle = (i / 8) * Math.PI * 2;
            const radius = 15 + Math.random() * 10;
            tanzaku.position.set(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 10,
                Math.sin(angle) * radius
            );
            
            // ランダムな回転
            tanzaku.rotation.x = (Math.random() - 0.5) * 0.5;
            tanzaku.rotation.y = (Math.random() - 0.5) * 0.5;
            tanzaku.rotation.z = (Math.random() - 0.5) * 0.2;
            
            tanzaku.userData = { 
                wishIndex: i,
                originalPosition: tanzaku.position.clone(),
                floatOffset: Math.random() * Math.PI * 2
            };
            
            this.tanzakuObjects.push(tanzaku);
            this.scene.add(tanzaku);
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
        
        this.renderer.domElement.addEventListener('mouseout', () => {
            this.hideWishText();
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.tanzakuObjects);
        
        if (intersects.length > 0) {
            const intersectedTanzaku = intersects[0].object;
            const wishIndex = intersectedTanzaku.userData.wishIndex;
            this.showWishText(this.wishes[wishIndex]);
        } else {
            this.hideWishText();
        }
    }

    showWishText(wish) {
        if (this.currentWish !== wish) {
            this.currentWish = wish;
            const wishElement = document.getElementById('wishText');
            wishElement.textContent = wish;
            wishElement.style.opacity = '1';
        }
    }

    hideWishText() {
        this.currentWish = null;
        const wishElement = document.getElementById('wishText');
        wishElement.style.opacity = '0';
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.updateInkParticles();
        this.updateTanzaku();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    updateInkParticles() {
        const positions = this.inkParticles.geometry.attributes.position.array;
        const velocities = this.inkParticles.userData.velocities;
        
        for (let i = 0; i < positions.length; i += 3) {
            // 左から右への流れ
            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];
            
            // 境界を超えたら反対側に戻す
            if (positions[i] > 50) positions[i] = -50;
            if (positions[i] < -50) positions[i] = 50;
            if (positions[i + 1] > 20) positions[i + 1] = -20;
            if (positions[i + 1] < -20) positions[i + 1] = 20;
            if (positions[i + 2] > 50) positions[i + 2] = -50;
            if (positions[i + 2] < -50) positions[i + 2] = 50;
        }
        
        this.inkParticles.geometry.attributes.position.needsUpdate = true;
    }

    updateTanzaku() {
        const time = Date.now() * 0.001;
        
        this.tanzakuObjects.forEach((tanzaku, index) => {
            // 浮遊効果
            const floatY = Math.sin(time + tanzaku.userData.floatOffset) * 0.5;
            tanzaku.position.y = tanzaku.userData.originalPosition.y + floatY;
            
            // 微細な回転
            tanzaku.rotation.z += 0.002;
        });
    }
}

// アプリケーションの初期化
window.addEventListener('DOMContentLoaded', () => {
    new TanabataInkMilkyway();
});