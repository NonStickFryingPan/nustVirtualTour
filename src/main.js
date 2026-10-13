import * as THREE from 'three';
import { QualityManager } from './core/QualityManager.js';
import { AutumnSunsetSky } from './world/AutumnSunsetSky.js';
import { TestTrack } from './world/TestTrack.js';
import { AltoModel } from './vehicle/AltoModel.js';
import { GLTFVehicleModel } from './vehicle/GLTFVehicleModel.js';
import { VEHICLE_CATALOG } from './vehicle/VehicleCatalog.js';
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
    this.currentModel = null;
    this.currentVehicleConfig = null;
    this.vehicleCache = new Map();

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

    // 7. Dedicated Authentic White Suzuki Alto (HA36S)
    this.altoModel = new AltoModel();
    this.currentModel = this.altoModel;
    this.scene.add(this.currentModel.group);

    // 8. Vehicle Physics & Audio
    this.physics = new VehiclePhysics(this.currentModel);
    // Spawn centered in driving lane ahead of Gate 2 facing +Z towards SINES
    this.physics.setSpawn(-2.2, 0, -5, 0);

    this.audio = new VehicleAudio();

    // 9. Controller (Keyboard + Touch + State Machine)
    this.controller = new VehicleController(this.physics, this.currentModel, this.audio);

    // 10. Camera Manager (Chase / Inspect 360 / Hood)
    this.cameraManager = new CameraManager(this.camera, this.renderer.domElement, this.physics);

    // 11. HUD Overlay
    this.hud = new HUD(this.qualityManager, this.controller);

    // Window Resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Start loop
    this.animate();
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
