import * as THREE from 'three';
import { eventBus } from '../core/EventBus.js';

/**
 * Autumn Sunset Sky & Atmosphere
 * Shades of saturated orange, streaming sunset light, atmospheric haze,
 * and drifting autumn leaves particles
 */
export class AutumnSunsetSky {
  constructor(scene) {
    this.scene = scene;
    this.lights = {};
    this.leafParticles = null;
    this.sunMesh = null;

    this.initSkyAndLighting();
    this.initSunDisc();
    this.initAutumnLeaves();

    eventBus.on('quality:changed', (data) => {
      this.handleQualityChange(data);
    });
  }

  initSkyAndLighting() {
    // Autumn Sunset Palette: Deep amber orange to twilight indigo
    const topColor = new THREE.Color(0xd35400); // deep saturated orange
    const bottomColor = new THREE.Color(0xf39c12); // golden amber

    // Hemisphere Light for soft warm ambient fill
    const hemiLight = new THREE.HemisphereLight(topColor, bottomColor, 0.9);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);
    this.lights.hemi = hemiLight;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xff793f, 0.45);
    this.scene.add(ambientLight);
    this.lights.ambient = ambientLight;

    // Sunset Directional Light (Sun low on the horizon, casting long warm shadows)
    const dirLight = new THREE.DirectionalLight(0xffbe76, 2.4);
    dirLight.position.set(-60, 24, -45); // low sunset angle
    dirLight.castShadow = true;

    // Shadow configuration
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 180;

    const d = 50;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0004;

    this.scene.add(dirLight);
    this.lights.sun = dirLight;

    // Autumn sunset fog / haze
    this.scene.fog = new THREE.FogExp2(0xcd6133, 0.009);

    // Dynamic Sky Dome
    this.createSkyDome();
  }

  createSkyDome() {
    const skyGeo = new THREE.SphereGeometry(140, 32, 16);
    // Invert geometry to view from inside
    skyGeo.scale(-1, 1, 1);

    // Canvas gradient for smooth saturated sunset sky
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, '#3d122e'); // twilight dusk purple
    grad.addColorStop(0.35, '#a83232'); // crimson sunset
    grad.addColorStop(0.65, '#e15f21'); // fiery saturated orange
    grad.addColorStop(0.85, '#f39c12'); // golden amber horizon
    grad.addColorStop(1.0, '#d35400'); // ground haze

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    const skyTex = new THREE.CanvasTexture(canvas);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      fog: false
    });

    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    skyDome.position.set(0, 0, 0);
    this.scene.add(skyDome);
  }

  initSunDisc() {
    // Glowing sun disc on the horizon
    const sunGroup = new THREE.Group();
    sunGroup.position.set(-90, 36, -68);

    // Central Sun Disc
    const discGeo = new THREE.CircleGeometry(6.5, 32);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0xfffae6,
      fog: false
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.lookAt(0, 0, 0);
    sunGroup.add(disc);

    // Sun Halo / Glow Ring
    const haloGeo = new THREE.RingGeometry(6.4, 18.0, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffa502,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      fog: false
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.lookAt(0, 0, 0);
    sunGroup.add(halo);

    this.scene.add(sunGroup);
    this.sunMesh = sunGroup;
  }

  initAutumnLeaves() {
    // Particle system of drifting golden and crimson leaves
    const particleCount = 280;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const leafPalettes = [
      new THREE.Color(0xe67e22), // carrot orange
      new THREE.Color(0xd35400), // rust orange
      new THREE.Color(0xf39c12), // sun gold
      new THREE.Color(0xc0392b), // maple crimson
      new THREE.Color(0xf1c40f)  // autumn yellow
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = Math.random() * 14 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;

      const col = leafPalettes[Math.floor(Math.random() * leafPalettes.length)];
      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      scales[i] = Math.random() * 0.25 + 0.15;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Simple procedural leaf texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(16, 16, 14, 8, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    const leafTex = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      size: 0.45,
      map: leafTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });

    this.leafParticles = new THREE.Points(geo, mat);
    this.scene.add(this.leafParticles);
  }

  handleQualityChange({ mode, settings }) {
    if (this.leafParticles) {
      this.leafParticles.visible = settings.particlesEnabled;
    }
    if (this.lights.sun) {
      this.lights.sun.castShadow = settings.shadows;
    }
    if (this.scene.fog) {
      this.scene.fog.density = settings.fogDensity;
    }
  }

  update(dt, carPos) {
    // Animate drifting leaves
    if (this.leafParticles && this.leafParticles.visible) {
      const positions = this.leafParticles.geometry.attributes.position.array;
      const count = positions.length / 3;

      for (let i = 0; i < count; i++) {
        // Drift with sunset wind (+X and -Z)
        positions[i * 3 + 0] += Math.sin(Date.now() * 0.001 + i) * 0.05 + 0.04;
        positions[i * 3 + 1] -= dt * 0.6; // gentle fall
        positions[i * 3 + 2] += Math.cos(Date.now() * 0.001 + i) * 0.03 + 0.02;

        // Reset if leaf touches ground
        if (positions[i * 3 + 1] < 0.1) {
          positions[i * 3 + 1] = 12 + Math.random() * 4;
          // Re-center around car
          if (carPos) {
            positions[i * 3 + 0] = carPos.x + (Math.random() - 0.5) * 80;
            positions[i * 3 + 2] = carPos.z + (Math.random() - 0.5) * 80;
          }
        }
      }
      this.leafParticles.geometry.attributes.position.needsUpdate = true;
    }
  }
}
