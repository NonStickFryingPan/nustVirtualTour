import * as THREE from 'three';
import { QualityManager } from './core/QualityManager.js';
import { AutumnSunsetSky } from './world/AutumnSunsetSky.js';
import { TestTrack } from './world/TestTrack.js';
import { ProceduralAltoModel } from './vehicle/ProceduralAltoModel.js';
import { GLTFVehicleModel } from './vehicle/GLTFVehicleModel.js';
import { VehiclePhysics } from './vehicle/VehiclePhysics.js';
import { VehicleAudio } from './vehicle/VehicleAudio.js';
import { VehicleController } from './vehicle/VehicleController.js';
import { CameraManager } from './camera/CameraManager.js';
import { HUD } from './ui/HUD.js';
import { eventBus } from './core/EventBus.js';

class GameApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    this.qualityManager = null;
    this.sky = null;
    this.track = null;

    // Both Models for the scene
    this.modelA = null; // Option A: Procedural Rigged Alto
    this.modelB = null; // Option B: Photo-Textured Rigged Alto
    this.activeModelType = 'procedural';
    this.currentModel = null;

    this.physics = null;
    this.audio = null;
    this.controller = null;
    this.cameraManager = null;
    this.hud = null;

    this.init();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera (Cinematic 56° FOV matching reference)
    const fov = 56;
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 800);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 4. Quality Manager
    this.qualityManager = new QualityManager(this.renderer);
    this.qualityManager.init();

    // 5. Atmosphere & Sky
    this.sky = new AutumnSunsetSky(this.scene, this.renderer);

    // 6. World & Test Track (Gate 2 & Grounds)
    this.track = new TestTrack(this.scene);

    // 7. Instantiate BOTH Models into the scene!
    // Model 1: Option A (Procedural Rigged Alto from alto_glb_exporter.html)
    this.modelA = new ProceduralAltoModel();
    this.scene.add(this.modelA.group);

    // Model 2: Option B (Photo-Textured Rigged Alto from generate_alto_glb.py)
    this.modelB = new GLTFVehicleModel({
      name: 'PhotoTexturedAlto',
      modelUrl: '/models/suzuki_alto_phototextured.glb',
      scale: 1.0,
      yOffset: 0,
      rotationY: 0
    });
    this.scene.add(this.modelB.group);

    // Start with Model A as the primary player vehicle in the right lane
    this.currentModel = this.modelA;

    // 8. Vehicle Physics & Audio
    this.physics = new VehiclePhysics(this.currentModel);
    // Player car spawns in lane (X = -1.2)
    this.physics.setSpawn(-1.2, 0, -5, 0);

    // Position Model B alongside in the parallel lane (X = +1.3)
    this.modelB.group.position.set(1.3, 0, -5);
    this.modelB.group.rotation.set(0, 0, 0);

    this.audio = new VehicleAudio();

    // 9. Controller (Keyboard + Touch + State Machine)
    this.controller = new VehicleController(this.physics, this.currentModel, this.audio);

    // 10. Camera Manager (Chase / Inspect 360 / Hood)
    this.cameraManager = new CameraManager(this.camera, this.renderer.domElement, this.physics);

    // 11. HUD Overlay
    this.hud = new HUD(this.qualityManager, this.controller);

    // Model switching (Keys 1 & 2 + UI buttons)
    this.setupModelSwitching();

    // Window Resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Start loop
    this.animate();
  }

  setupModelSwitching() {
    eventBus.on('vehicle:switchModel', (type) => {
      this.switchVehicle(type);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === '1') this.switchVehicle('procedural');
      if (e.key === '2') this.switchVehicle('phototextured');
    });
  }

  switchVehicle(type) {
    if (type === this.activeModelType) return;
    this.activeModelType = type;

    const currentPos = this.physics.position.clone();
    const currentRotY = this.physics.rotation.y;

    if (type === 'procedural') {
      // Park Model B in parallel lane
      this.modelB.group.position.set(1.3, 0, currentPos.z);
      this.modelB.group.rotation.set(0, currentRotY, 0);

      this.currentModel = this.modelA;
      this.physics.setModel(this.modelA);
      this.physics.position.set(-1.2, 0, currentPos.z);
      this.physics.rotation.y = currentRotY;
      this.physics.applyTransform();
    } else {
      // Park Model A in parallel lane
      this.modelA.group.position.set(-1.2, 0, currentPos.z);
      this.modelA.group.rotation.set(0, currentRotY, 0);

      this.currentModel = this.modelB;
      this.physics.setModel(this.modelB);
      this.physics.position.set(1.3, 0, currentPos.z);
      this.physics.rotation.y = currentRotY;
      this.physics.applyTransform();
    }

    this.controller.carModel = this.currentModel;
    eventBus.emit('vehicle:modelSwitched', type);
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.qualityManager.applyCurrentMode();
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const dt = Math.min(this.clock.getDelta(), 0.08); // clamp frame time

    // Update vehicle controller & physics
    this.controller.update(dt);

    // Update camera follow / inspection orbit
    this.cameraManager.update(dt);

    // Update sky / autumn drifting leaves
    this.sky.update(dt, this.physics.position);

    // Render frame
    this.renderer.render(this.scene, this.camera);
  }
}

// Launch when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
