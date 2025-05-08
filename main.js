import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class BottleViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.model = null;
        this.controls = null;
        this.container = document.getElementById('model-container');
        this.animationFrameId = null;

        this.init = this.init.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.animate = this.animate.bind(this);
        this.cleanup = this.cleanup.bind(this);
    }

    init() {
        if (!this.container) return;

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = null;

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.z = 3.5;

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);

        // Load 3D model
        const loader = new GLTFLoader();
        const modelPath = './bottle.glb';

        loader.load(
            modelPath,
            (gltf) => {
                this.model = gltf.scene;
                this.centerAndScaleModel();
                this.scene.add(this.model);
            },
            undefined,
            (error) => {
                console.error('Error loading 3D model:', error);
            }
        );

        // Handle window resize
        window.addEventListener('resize', this.onWindowResize);
    }

    centerAndScaleModel() {
        if (!this.model) return;

        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.7 / maxDim;
        this.model.scale.set(scale, scale, scale);

        this.model.position.sub(center.multiplyScalar(scale));
        this.model.rotation.x = 0;
        this.model.rotation.y = 0;
    }

    onWindowResize() {
        if (!this.container || !this.camera || !this.renderer) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        this.animationFrameId = requestAnimationFrame(this.animate);

        if (this.model) {
            // Smooth rotation
            this.model.rotation.y += 0.005;
            this.model.rotation.x = 0;
        }

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    cleanup() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        window.removeEventListener('resize', this.onWindowResize);

        if (this.container && this.renderer) {
            this.container.removeChild(this.renderer.domElement);
        }

        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const bottleViewer = new BottleViewer();
    bottleViewer.init();
    bottleViewer.animate();

    // Cleanup when page is unloaded
    window.addEventListener('beforeunload', () => {
        bottleViewer.cleanup();
    });
});