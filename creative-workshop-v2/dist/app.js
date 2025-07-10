// Three.js Interactive Apple Scene
class InteractiveAppleScene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.apple = null;
        this.ambientLight = null;
        this.directionalLight = null;
        this.audio = null;
        this.isAudioPlaying = false;

        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 5);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Add renderer to DOM
        const container = document.getElementById('scene-container');
        container.appendChild(this.renderer.domElement);

        // Controls setup (OrbitControls)
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Lighting setup
        this.setupLighting();

        // Create apple with texture
        this.createApple();

        // Audio setup
        this.setupAudio();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Ambient light
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(this.ambientLight);

        // Directional light
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(5, 5, 5);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(this.directionalLight);
    }

    createApple() {
        // Load apple texture
        const textureLoader = new THREE.TextureLoader();
        const appleTexture = textureLoader.load(
            '../assets/imagen_imagen-3.0-generate-002_20250709_224034_0.png',
            () => {
                console.log('Apple texture loaded successfully');
            },
            (progress) => {
                console.log('Loading progress:', progress);
            },
            (error) => {
                console.error('Error loading texture:', error);
            }
        );

        // Create apple geometry (sphere with slight modifications for apple shape)
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        
        // Modify geometry to create apple shape
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const y = positions[i + 1];
            // Create apple indentation at top
            if (y > 0.7) {
                const factor = (y - 0.7) / 0.3;
                positions[i] *= (1 - factor * 0.3);
                positions[i + 2] *= (1 - factor * 0.3);
            }
            // Slightly flatten bottom
            if (y < -0.7) {
                positions[i + 1] *= 0.9;
            }
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();

        // Create material with texture
        const material = new THREE.MeshPhongMaterial({
            map: appleTexture,
            shininess: 30,
            transparent: true
        });

        // Create apple mesh
        this.apple = new THREE.Mesh(geometry, material);
        this.apple.castShadow = true;
        this.apple.receiveShadow = true;
        this.scene.add(this.apple);

        // Add apple stem
        this.createAppleStem();
    }

    createAppleStem() {
        const stemGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.3, 8);
        const stemMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 }); // Brown
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 1.15;
        stem.rotation.z = Math.PI * 0.1; // Slight tilt
        this.scene.add(stem);

        // Add leaf
        const leafGeometry = new THREE.PlaneGeometry(0.3, 0.15);
        const leafMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x228B22, 
            side: THREE.DoubleSide 
        });
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leaf.position.set(0.15, 1.2, 0);
        leaf.rotation.set(0, 0, Math.PI * 0.3);
        this.scene.add(leaf);
    }

    setupAudio() {
        this.audio = document.getElementById('bgMusic');
        this.audio.volume = 0.5;
    }

    setupEventListeners() {
        // Audio controls
        document.getElementById('playButton').addEventListener('click', () => {
            if (!this.isAudioPlaying) {
                this.audio.play().then(() => {
                    this.isAudioPlaying = true;
                    console.log('Audio playing');
                }).catch(error => {
                    console.error('Error playing audio:', error);
                });
            }
        });

        document.getElementById('pauseButton').addEventListener('click', () => {
            if (this.isAudioPlaying) {
                this.audio.pause();
                this.isAudioPlaying = false;
                console.log('Audio paused');
            }
        });

        // Mouse interaction for apple rotation
        let isMouseDown = false;
        let mouseX = 0;
        let mouseY = 0;

        this.renderer.domElement.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        });

        this.renderer.domElement.addEventListener('mousemove', (event) => {
            if (isMouseDown && this.apple) {
                const deltaX = event.clientX - mouseX;
                const deltaY = event.clientY - mouseY;
                
                this.apple.rotation.y += deltaX * 0.01;
                this.apple.rotation.x += deltaY * 0.01;
                
                mouseX = event.clientX;
                mouseY = event.clientY;
            }
        });

        this.renderer.domElement.addEventListener('mouseup', () => {
            isMouseDown = false;
        });

        // Touch events for mobile
        this.renderer.domElement.addEventListener('touchstart', (event) => {
            if (event.touches.length === 1) {
                isMouseDown = true;
                mouseX = event.touches[0].clientX;
                mouseY = event.touches[0].clientY;
            }
        });

        this.renderer.domElement.addEventListener('touchmove', (event) => {
            if (isMouseDown && event.touches.length === 1 && this.apple) {
                const deltaX = event.touches[0].clientX - mouseX;
                const deltaY = event.touches[0].clientY - mouseY;
                
                this.apple.rotation.y += deltaX * 0.01;
                this.apple.rotation.x += deltaY * 0.01;
                
                mouseX = event.touches[0].clientX;
                mouseY = event.touches[0].clientY;
            }
        });

        this.renderer.domElement.addEventListener('touchend', () => {
            isMouseDown = false;
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update controls
        this.controls.update();

        // Gentle rotation animation when not being manipulated
        if (this.apple) {
            this.apple.rotation.y += 0.005;
        }

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the scene when the page loads
window.addEventListener('load', () => {
    new InteractiveAppleScene();
});