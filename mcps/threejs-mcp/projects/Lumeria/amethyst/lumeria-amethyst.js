class LumeriaAmethystViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.panoramaSphere = null;
        this.controls = null;
        this.particleSystem = null;
        this.clock = new THREE.Clock();
        this.time = 0;
        this.hydrangeaClusters = [];
        
        this.init();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createPanorama();
        this.createHydrangeaParticleSystem();
        this.setupControls();
        this.setupLighting();
        this.setupEventListeners();
        this.animate();
    }

    createScene() {
        this.scene = new THREE.Scene();
        // フォグを削除して背景画像を見えるように
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
        this.renderer.setClearColor(0x1a0033);
        document.getElementById('container').appendChild(this.renderer.domElement);
    }

    createPanorama() {
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);

        const loader = new THREE.TextureLoader();
        loader.load('../shared/imagen_imagen-3.0-generate-002_20250705_101930_0.png', (texture) => {
            console.log('Texture loaded successfully');
            const material = new THREE.MeshBasicMaterial({ 
                map: texture
            });
            this.panoramaSphere = new THREE.Mesh(geometry, material);
            this.scene.add(this.panoramaSphere);
        }, (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
        }, (error) => {
            console.error('Error loading panorama texture:', error);
        });
    }

    createHydrangeaParticleSystem() {
        const clusterCount = 12;
        const particlesPerCluster = 1800;
        const totalParticles = clusterCount * particlesPerCluster;
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(totalParticles * 3);
        const colors = new Float32Array(totalParticles * 3);
        const sizes = new Float32Array(totalParticles);
        const clusterIds = new Float32Array(totalParticles);
        const randoms = new Float32Array(totalParticles * 3);

        for (let cluster = 0; cluster < clusterCount; cluster++) {
            const clusterCenter = new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40
            );
            
            this.hydrangeaClusters.push({
                center: clusterCenter,
                phase: Math.random() * Math.PI * 2,
                expansionSpeed: 0.3 + Math.random() * 0.4
            });

            for (let i = 0; i < particlesPerCluster; i++) {
                const particleIndex = cluster * particlesPerCluster + i;
                const i3 = particleIndex * 3;
                
                const localRadius = Math.random() * 3 + 0.5;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                
                positions[i3] = clusterCenter.x + localRadius * Math.sin(phi) * Math.cos(theta);
                positions[i3 + 1] = clusterCenter.y + localRadius * Math.sin(phi) * Math.sin(theta);
                positions[i3 + 2] = clusterCenter.z + localRadius * Math.cos(phi);
                
                const amethystHue = 270 + Math.random() * 60;
                const saturation = 0.6 + Math.random() * 0.4;
                const lightness = 0.4 + Math.random() * 0.4;
                
                const color = new THREE.Color().setHSL(amethystHue / 360, saturation, lightness);
                colors[i3] = color.r;
                colors[i3 + 1] = color.g;
                colors[i3 + 2] = color.b;
                
                sizes[particleIndex] = Math.random() * 0.6 + 0.3;
                clusterIds[particleIndex] = cluster;
                
                randoms[i3] = Math.random();
                randoms[i3 + 1] = Math.random();
                randoms[i3 + 2] = Math.random();
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('clusterId', new THREE.BufferAttribute(clusterIds, 1));
        geometry.setAttribute('random', new THREE.BufferAttribute(randoms, 3));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: window.devicePixelRatio },
                clusterCount: { value: clusterCount }
            },
            vertexColors: true,
            vertexShader: `
                attribute float size;
                attribute float clusterId;
                attribute vec3 random;
                uniform float time;
                uniform float clusterCount;
                varying vec3 vColor;
                varying float vAlpha;
                
                vec3 mod289(vec3 x) {
                    return x - floor(x * (1.0 / 289.0)) * 289.0;
                }
                
                vec4 mod289(vec4 x) {
                    return x - floor(x * (1.0 / 289.0)) * 289.0;
                }
                
                vec4 permute(vec4 x) {
                    return mod289(((x*34.0)+1.0)*x);
                }
                
                vec4 taylorInvSqrt(vec4 r) {
                    return 1.79284291400159 - 0.85373472095314 * r;
                }
                
                float snoise(vec3 v) {
                    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                    
                    vec3 i = floor(v + dot(v, C.yyy));
                    vec3 x0 = v - i + dot(i, C.xxx);
                    
                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min(g.xyz, l.zxy);
                    vec3 i2 = max(g.xyz, l.zxy);
                    
                    vec3 x1 = x0 - i1 + C.xxx;
                    vec3 x2 = x0 - i2 + C.yyy;
                    vec3 x3 = x0 - D.yyy;
                    
                    i = mod289(i);
                    vec4 p = permute(permute(permute(
                        i.z + vec4(0.0, i1.z, i2.z, 1.0))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                    
                    float n_ = 0.142857142857;
                    vec3 ns = n_ * D.wyz - D.xzx;
                    
                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                    
                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = floor(j - 7.0 * x_);
                    
                    vec4 x = x_ *ns.x + ns.yyyy;
                    vec4 y = y_ *ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);
                    
                    vec4 b0 = vec4(x.xy, y.xy);
                    vec4 b1 = vec4(x.zw, y.zw);
                    
                    vec4 s0 = floor(b0) * 2.0 + 1.0;
                    vec4 s1 = floor(b1) * 2.0 + 1.0;
                    vec4 sh = -step(h, vec4(0.0));
                    
                    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
                    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
                    
                    vec3 p0 = vec3(a0.xy, h.x);
                    vec3 p1 = vec3(a0.zw, h.y);
                    vec3 p2 = vec3(a1.xy, h.z);
                    vec3 p3 = vec3(a1.zw, h.w);
                    
                    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                    p0 *= norm.x;
                    p1 *= norm.y;
                    p2 *= norm.z;
                    p3 *= norm.w;
                    
                    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
                }
                
                void main() {
                    #ifdef USE_COLOR
                        vColor = color;
                    #else
                        vColor = vec3(0.6, 0.3, 0.8);
                    #endif
                    
                    vec3 pos = position;
                    
                    float clusterPhase = clusterId * 0.5 + time * 0.3;
                    float expansionFactor = sin(clusterPhase) * 0.5 + 0.5;
                    
                    vec3 centerOffset = vec3(
                        sin(time * 0.2 + clusterId) * 5.0,
                        cos(time * 0.3 + clusterId) * 5.0,
                        sin(time * 0.25 + clusterId) * 5.0
                    );
                    
                    float noise1 = snoise(pos * 0.08 + time * 0.4);
                    float noise2 = snoise(pos * 0.15 + time * 0.6);
                    
                    pos += centerOffset;
                    
                    float distanceFromCenter = length(pos);
                    pos *= 1.0 + expansionFactor * 0.4 + noise1 * 0.3;
                    
                    pos.x += sin(time * 0.4 + random.x * 6.28 + clusterId) * 1.5;
                    pos.y += cos(time * 0.5 + random.y * 6.28 + clusterId) * 1.5;
                    pos.z += sin(time * 0.6 + random.z * 6.28 + clusterId) * 1.5;
                    
                    float breathe = sin(time * 0.8 + clusterId * 0.3) * 0.3 + 0.7;
                    pos *= breathe;
                    
                    float slowRotation = 0.1;
                    float angle = time * slowRotation + clusterId * 0.2;
                    mat3 rotationMatrix = mat3(
                        cos(angle), -sin(angle), 0,
                        sin(angle), cos(angle), 0,
                        0, 0, 1
                    );
                    pos = rotationMatrix * pos;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    
                    float dynamicSize = size * (1.0 + noise2 * 0.4) * (1.0 + breathe * 0.2);
                    gl_PointSize = dynamicSize * (400.0 / -mvPosition.z);
                    
                    vAlpha = 0.2 + (noise1 * 0.15) + (expansionFactor * 0.15);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    float distance = length(gl_PointCoord - vec2(0.5));
                    if (distance > 0.5) discard;
                    
                    float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
                    alpha *= vAlpha * 0.3;
                    
                    float centerGlow = 1.0 - smoothstep(0.0, 0.3, distance);
                    vec3 finalColor = vColor + vec3(centerGlow * 0.4);
                    
                    vec3 amethystGlow = vec3(0.6, 0.3, 0.8) * centerGlow * 0.3;
                    finalColor += amethystGlow;
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
    }

    setupControls() {
        // ホワイトと同じ手動制御に変更
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.rotationX = -0.1;  // 初期視点をより水平に
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

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x9966cc, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xcc99ff, 0.6);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);
        
        const pointLight = new THREE.PointLight(0xaa66ff, 0.8, 100);
        pointLight.position.set(0, 0, 0);
        this.scene.add(pointLight);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
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

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time = this.clock.getElapsedTime();
        
        if (this.particleSystem) {
            this.particleSystem.material.uniforms.time.value = this.time;
        }
        
        // 自動回転（マウス操作中でない場合のみ）
        if (!this.isMouseDown) {
            this.autoRotateY -= 0.0015;  // 回転速度をさらにゆっくりに
            this.camera.rotation.y = this.rotationY + this.autoRotateY;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new LumeriaAmethystViewer();
});