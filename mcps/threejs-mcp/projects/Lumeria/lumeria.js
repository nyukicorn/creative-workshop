class LumeriaViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.panoramaSphere = null;
        this.controls = null;
        this.particleSystem = null;
        this.clock = new THREE.Clock();
        this.time = 0;
        
        this.init();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createPanorama();
        this.createParticleSystem();
        this.setupControls();
        this.setupLighting();
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
        loader.load('imagen_imagen-3.0-generate-002_20250705_113344_0.png', (texture) => {
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

    createParticleSystem() {
        const particleCount = 15000;
        const geometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const randoms = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // 球体状の初期配置
            const radius = Math.random() * 8 + 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // パステルカラーの設定
            const hue = Math.random() * 60 + 280; // 紫〜青の範囲
            const saturation = Math.random() * 0.3 + 0.2;
            const lightness = Math.random() * 0.3 + 0.7;
            
            const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            sizes[i] = Math.random() * 2 + 0.5;
            
            // ランダム値（シェーダーでノイズ用）
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
                attribute vec3 random;
                uniform float time;
                varying vec3 vColor;
                varying float vAlpha;
                
                // ノイズ関数
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
                    vColor = color;
                    
                    vec3 pos = position;
                    
                    // 時間による動的な変形
                    float noise1 = snoise(pos * 0.1 + time * 0.5);
                    float noise2 = snoise(pos * 0.2 + time * 0.3);
                    float noise3 = snoise(pos * 0.05 + time * 0.7);
                    
                    // 流体的な動き
                    pos.x += sin(time * 0.5 + random.x * 6.28) * noise1 * 2.0;
                    pos.y += cos(time * 0.3 + random.y * 6.28) * noise2 * 2.0;
                    pos.z += sin(time * 0.7 + random.z * 6.28) * noise3 * 2.0;
                    
                    // 呼吸するような動き
                    float breathe = sin(time * 0.8) * 0.5 + 0.5;
                    pos *= 1.0 + breathe * 0.3;
                    
                    // 回転
                    float rotationSpeed = 0.2;
                    float angle = time * rotationSpeed;
                    mat3 rotationMatrix = mat3(
                        cos(angle), -sin(angle), 0,
                        sin(angle), cos(angle), 0,
                        0, 0, 1
                    );
                    pos = rotationMatrix * pos;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    
                    // サイズの動的変化
                    float dynamicSize = size * (1.0 + noise1 * 0.5) * (1.0 + breathe * 0.3);
                    gl_PointSize = dynamicSize * (300.0 / -mvPosition.z);
                    
                    // 透明度の変化
                    vAlpha = 0.3 + (noise2 * 0.4) + (breathe * 0.3);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    // 円形のパーティクル
                    float distance = length(gl_PointCoord - vec2(0.5));
                    if (distance > 0.5) discard;
                    
                    // 柔らかなグラデーション
                    float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
                    alpha *= vAlpha;
                    
                    // 中心部分をより明るく
                    float centerGlow = 1.0 - smoothstep(0.0, 0.2, distance);
                    vec3 finalColor = vColor + vec3(centerGlow * 0.3);
                    
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
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 50;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);
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
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time = this.clock.getElapsedTime();
        
        // パーティクルシステムの時間更新
        if (this.particleSystem) {
            this.particleSystem.material.uniforms.time.value = this.time;
        }
        
        // コントロールの更新
        this.controls.update();
        
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new LumeriaViewer();
});