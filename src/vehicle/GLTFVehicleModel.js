import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Universal GLTF Vehicle Model Wrapper
 * Standardizes any external GLTF/GLB vehicle (Alto, Fire Truck, F1, Hatchback)
 * to work seamlessly with the game's physics, lighting, audio, and camera systems.
 */
export class GLTFVehicleModel {
  constructor(config = {}) {
    this.name = config.name || 'GLTFVehicle';
    this.modelUrl = config.modelUrl;
    this.scale = config.scale || 1.0;
    this.yOffset = config.yOffset !== undefined ? config.yOffset : 0;
    this.rotationY = config.rotationY || 0;

    this.group = new THREE.Group();
    this.group.name = this.name;

    this.chassisGroup = new THREE.Group();
    this.chassisGroup.name = 'ChassisGroup';
    this.group.add(this.chassisGroup);

    this.wheels = {
      fl: { pivot: null, spinner: null },
      fr: { pivot: null, spinner: null },
      rl: { pivot: null, spinner: null },
      rr: { pivot: null, spinner: null }
    };

    this.headlightSpots = [];
    this.headlightCones = [];
    this.brakeLights = [];
    this.reverseLights = [];
    this.boostFlames = [];

    this.isLoaded = false;
    this.loadPromise = this.loadModel();
  }

  async loadModel() {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        this.modelUrl,
        (gltf) => {
          this.setupModel(gltf.scene);
          this.isLoaded = true;
          resolve(this);
        },
        undefined,
        (err) => {
          console.error(`[GLTFVehicleModel] Failed to load ${this.modelUrl}:`, err);
          reject(err);
        }
      );
    });
  }

  setupModel(scene) {
    scene.scale.setScalar(this.scale);
    scene.rotation.y = this.rotationY;
    scene.position.y = this.yOffset;

    // Enable shadows & environment reflection on all meshes
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.envMapIntensity = 1.2;
          child.material.needsUpdate = true;
        }
      }
    });

    this.chassisGroup.add(scene);

    // Identify wheel nodes if present (e.g. Kenney models)
    this.detectAndSetupWheels(scene);

    // Build contact shadow, headlights, and boost flame effects
    this.buildGroundShadow();
    this.buildLighting();
    this.buildBoostEffects();
  }

  detectAndSetupWheels(scene) {
    // Look for wheel nodes
    const wheelNodes = {
      fl: null,
      fr: null,
      rl: null,
      rr: null
    };

    scene.traverse((child) => {
      const name = child.name.toLowerCase();
      if (name.includes('front') && (name.includes('left') || name.includes('-l') || name.includes('_l'))) {
        wheelNodes.fl = child;
      } else if (name.includes('front') && (name.includes('right') || name.includes('-r') || name.includes('_r'))) {
        wheelNodes.fr = child;
      } else if ((name.includes('back') || name.includes('rear')) && (name.includes('left') || name.includes('-l') || name.includes('_l'))) {
        wheelNodes.rl = child;
      } else if ((name.includes('back') || name.includes('rear')) && (name.includes('right') || name.includes('-r') || name.includes('_r'))) {
        wheelNodes.rr = child;
      }
    });

    for (const [key, node] of Object.entries(wheelNodes)) {
      if (node) {
        this.wheels[key] = {
          pivot: node,
          spinner: node,
          isFront: key.startsWith('f')
        };
      }
    }
  }

  buildGroundShadow() {
    const shadowGeo = new THREE.PlaneGeometry(1.8, 3.6);
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(64, 64, 18, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(canvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    });

    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.name = 'CarGroundShadow';
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, 0.02, 0);
    this.group.add(shadowMesh);
  }

  buildLighting() {
    // Dynamic Headlights (flanking front nose)
    [-0.55, 0.55].forEach((x) => {
      const spot = new THREE.SpotLight(0xfffaea, 0, 42, Math.PI / 6, 0.45, 1.2);
      spot.position.set(x, 0.70, 1.60);
      spot.target.position.set(x, 0, 18);
      this.chassisGroup.add(spot);
      this.chassisGroup.add(spot.target);
      this.headlightSpots.push(spot);

      const coneGeo = new THREE.ConeGeometry(2.2, 14, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0xfff6dd,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(x, 0.70, 8.5);
      cone.rotation.x = -Math.PI / 2;
      cone.visible = false;
      this.chassisGroup.add(cone);
      this.headlightCones.push(cone);
    });

    // Dynamic Red Brake Lights (at rear)
    [-0.50, 0.50].forEach((x) => {
      const brakeMat = new THREE.MeshBasicMaterial({
        color: 0xff1118,
        transparent: true,
        opacity: 0
      });
      const brakeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.04), brakeMat);
      brakeMesh.position.set(x, 0.55, -1.65);
      this.chassisGroup.add(brakeMesh);
      this.brakeLights.push(brakeMesh);
    });
  }

  buildBoostEffects() {
    // Twin Nitro Exhaust Flames at rear bottom
    [-0.28, 0.28].forEach((x) => {
      const flameGeo = new THREE.ConeGeometry(0.12, 0.9, 12, 1, true);
      const flameMat = new THREE.MeshBasicMaterial({
        color: 0x00d2d3, // fiery cyan/nitro blue
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(x, 0.30, -1.95);
      flame.rotation.x = Math.PI / 2; // points backwards
      this.chassisGroup.add(flame);
      this.boostFlames.push(flame);
    });
  }

  // --- Dynamic Lighting & Controls ---
  setHeadlights(enabled) {
    const intensity = enabled ? 3.5 : 0;
    this.headlightSpots.forEach((spot) => (spot.intensity = intensity));
    this.headlightCones.forEach((cone) => {
      cone.visible = enabled;
      cone.material.opacity = enabled ? 0.16 : 0;
    });
  }

  toggleHeadlights() {
    const isCurrentlyOn = this.headlightSpots[0]?.intensity > 0;
    this.setHeadlights(!isCurrentlyOn);
    return !isCurrentlyOn;
  }

  setBrakeLights(enabled) {
    this.brakeLights.forEach((mesh) => {
      mesh.material.opacity = enabled ? 0.95 : 0;
    });
  }

  setReverseLights(enabled) {
    // If reverse lights exist
    this.reverseLights.forEach((mesh) => {
      mesh.material.opacity = enabled ? 0.95 : 0;
    });
  }

  setSteeringAngle(angle) {
    if (this.wheels.fl?.pivot) this.wheels.fl.pivot.rotation.y = angle;
    if (this.wheels.fr?.pivot) this.wheels.fr.pivot.rotation.y = angle;
  }

  spinWheels(distanceTraveled) {
    const deltaAngle = distanceTraveled / 0.28;
    for (const w of Object.values(this.wheels)) {
      if (w?.spinner) {
        w.spinner.rotation.x += deltaAngle;
      }
    }
  }

  setChassisDynamics(pitch, roll) {
    this.chassisGroup.rotation.x = pitch;
    this.chassisGroup.rotation.z = roll;
  }

  setBoost(active) {
    this.boostFlames.forEach((flame) => {
      flame.visible = active;
      flame.material.opacity = active ? 0.85 : 0;
      if (active) {
        // Random flickering length
        const flicker = 0.8 + Math.random() * 0.4;
        flame.scale.set(flicker, flicker * (1.0 + Math.random() * 0.5), flicker);
      }
    });
  }
}
