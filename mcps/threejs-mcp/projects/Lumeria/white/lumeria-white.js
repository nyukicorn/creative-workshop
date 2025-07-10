class LumeriaWhite {
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
        loader.load('../shared/imagen_imagen-3.0-generate-002_20250705_102806_0.png', (texture) => {
            console.log('White panorama loaded successfully');
            const material = new THREE.MeshBasicMaterial({ map: texture });
            this.panoramaSphere = new THREE.Mesh(geometry, material);
            this.scene.add(this.panoramaSphere);
        }, undefined, (error) => {
            console.error('Error loading white panorama:', error);
        });
    }

    createParticles() {
        const particleCount = 12000;
        const geometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const velocities = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Spiral upward movement pattern
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 8 + 2;
            const height = (Math.random() - 0.5) * 10;
            
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = height;
            positions[i3 + 2] = Math.sin(angle) * radius;
            
            // White color palette
            const purity = Math.random() * 0.1 + 0.9;
            colors[i3] = purity;
            colors[i3 + 1] = purity;
            colors[i3 + 2] = purity;
            
            sizes[i] = Math.random() * 0.8 + 0.4;
            
            // Spiral velocities
            velocities[i3] = (Math.random() - 0.5) * 0.015;
            velocities[i3 + 1] = Math.random() * 0.02 + 0.01;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.015;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (100.0 / -mvPosition.z) * (1.0 + sin(time * 2.0 + position.x * 0.1) * 0.1);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    if (dist > 0.5) discard;
                    
                    float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
                    gl_FragColor = vec4(vColor, alpha * 0.3);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
        
        this.velocities = velocities;
    }

    setupControls() {
        // シンプルな手動制御のみ使用
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.rotationX = -0.3;  // 初期視点を少し下向きに（床の花が見える）
        this.rotationY = 0;
        
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
                // ズームアウト
                this.camera.fov = Math.min(maxFov, this.camera.fov + zoomSpeed * 10);
            } else {
                // ズームイン
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

        document.addEventListener('click', (event) => {
            // 音楽ボタン以外のクリックで自動回転をトグル
            if (event.target.id !== 'audioBtn') {
                this.controls.autoRotate = !this.controls.autoRotate;
            }
        });

        const audioBtn = document.getElementById('audioBtn');
        const bgMusic = document.getElementById('bgMusic');
        
        if (audioBtn && bgMusic) {
            let isPlaying = false;
            
            audioBtn.addEventListener('click', () => {
                if (isPlaying) {
                    bgMusic.pause();
                    audioBtn.textContent = '🎵';
                    isPlaying = false;
                } else {
                    bgMusic.play().catch(e => console.log('Audio play failed:', e));
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
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = this.clock.getElapsedTime();
        
        // Update shader time uniform
        if (this.particles && this.particles.material.uniforms) {
            this.particles.material.uniforms.time.value = time;
        }
        
        // Update particle positions with spiral motion
        const positions = this.particles.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            const idx = i / 3;
            
            // Spiral upward motion
            positions[i] += this.velocities[i] + Math.sin(time + idx * 0.01) * 0.002;
            positions[i + 1] += this.velocities[i + 1];
            positions[i + 2] += this.velocities[i + 2] + Math.cos(time + idx * 0.01) * 0.002;
            
            // Reset particles that float too high
            if (positions[i + 1] > 15) {
                positions[i + 1] = -15;
                positions[i] = (Math.random() - 0.5) * 16;
                positions[i + 2] = (Math.random() - 0.5) * 16;
            }
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
        
        // Rotate particle system
        this.particles.rotation.y += 0.001;
        
        // Auto-rotate panorama sphere
        if (this.panoramaSphere) {
            this.panoramaSphere.rotation.y += 0.002;
        }
        
        // Manual controls - no update needed
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the white world
new LumeriaWhite();