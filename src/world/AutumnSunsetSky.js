import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { eventBus } from '../core/EventBus.js';

/**
 * High-Fidelity Autumn Sunset Sky & Atmosphere
 * Features:
 * - Physically-based Rayleigh/Mie atmospheric scattering sunset sky
 * - Equirectangular sunset skybox & environment map for realistic car reflections
 * - Golden-hour low sun casting long warm shadows
 * - Warm ambient ground bounce lighting
 * - Subtle autumn falling leaves particle system
 */
export class AutumnSunsetSky {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;

    this.sky = null;
    this.sunVector = new THREE.Vector3();
    this.dirLight = null;
    this.hemiLight = null;
    this.ambientLight = null;
    this.leafParticles = null;

    this.initSkyboxAndLighting();
    this.initAutumnLeaves();

    eventBus.on('quality:changed', (data) => {
      this.handleQualityChange(data);
    });
  }

  initSkyboxAndLighting() {
    // 1. Create Equirectangular Sunset Skybox Texture
    const envTexture = this.createSunsetSkyboxTexture();
    this.scene.background = envTexture;
    this.scene.environment = envTexture;

    // 2. Physical Sky Dome (Rayleigh & Mie Scattering for realistic sunset atmosphere)
    this.sky = new Sky();
    this.sky.scale.setScalar(400000);
    this.scene.add(this.sky);

    // Sun position: Low sunset elevation (3.8 degrees above horizon)
    const elevation = 3.8;
    const azimuth = 210; // South-West

    const phi = THREE.MathUtils.degToRad(90 - elevation);
    const theta = THREE.MathUtils.degToRad(azimuth);
    this.sunVector.setFromSphericalCoords(1, phi, theta);

    const uniforms = this.sky.material.uniforms;
    uniforms['turbidity'].value = 8.0;
    uniforms['rayleigh'].value = 3.2; // intense orange/red sky scattering
    uniforms['mieCoefficient'].value = 0.006;
    uniforms['mieDirectionalG'].value = 0.82; // prominent sun halo
    uniforms['sunPosition'].value.copy(this.sunVector);

    // 3. Directional Sun Light (Low-angle warm golden sunlight)
    this.dirLight = new THREE.DirectionalLight(0xffbe76, 2.6);
    this.dirLight.position.copy(this.sunVector).multiplyScalar(90);
    this.dirLight.castShadow = true;

    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 1.0;
    this.dirLight.shadow.camera.far = 250;

    const d = 55;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0003;

    this.scene.add(this.dirLight);

    // 4. Soft Warm Ambient Fill Light (prevents black shadow pitch)
    this.hemiLight = new THREE.HemisphereLight(0xff8c42, 0x4a2a18, 1.1);
    this.hemiLight.position.set(0, 60, 0);
    this.scene.add(this.hemiLight);

    this.ambientLight = new THREE.AmbientLight(0xff9944, 0.45);
    this.scene.add(this.ambientLight);

    // 5. Atmospheric Sunset Horizon Fog
    this.scene.fog = new THREE.FogExp2(0xd35400, 0.007);
  }

  createSunsetSkyboxTexture() {
    // Generates a rich 360-degree panorama of a saturated autumn sunset
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Sky gradient: Zenith dusk purple -> Crimson -> Fiery Saturated Orange -> Golden Amber Horizon -> Warm ground
    const grad = ctx.createLinearGradient(0, 0, 0, 1024);
    grad.addColorStop(0.00, '#1a0b2e'); // deep dusk violet at zenith
    grad.addColorStop(0.20, '#4a153b'); // purple crimson
    grad.addColorStop(0.40, '#8c2424'); // autumn red
    grad.addColorStop(0.55, '#d35400'); // saturated autumn orange
    grad.addColorStop(0.68, '#f39c12'); // golden amber sun horizon
    grad.addColorStop(0.72, '#ffbe76'); // glowing sunset band
    grad.addColorStop(0.75, '#b04a1b'); // horizon warm haze
    grad.addColorStop(1.00, '#3d2012'); // ground reflection

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Sun disc and volumetric glow at azimuth ~ 210 degrees (X ~ 1200)
    const sunX = (210 / 360) * 2048;
    const sunY = 1024 * 0.69;

    // Wide atmospheric glow
    const glowGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 480);
    glowGrad.addColorStop(0.0, 'rgba(255, 255, 230, 1.0)');
    glowGrad.addColorStop(0.15, 'rgba(255, 200, 100, 0.85)');
    glowGrad.addColorStop(0.4, 'rgba(235, 94, 40, 0.55)');
    glowGrad.addColorStop(0.8, 'rgba(200, 60, 20, 0.15)');
    glowGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 480, 0, Math.PI * 2);
    ctx.fill();

    // Intense core sun disc
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 32, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  initAutumnLeaves() {
    const count = 300;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color(0xd35400), // rust orange
      new THREE.Color(0xf39c12), // sun gold
      new THREE.Color(0xc0392b), // maple red
      new THREE.Color(0xe67e22)  // amber
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 110;
      positions[i * 3 + 1] = Math.random() * 16 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 110;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Leaf particle texture
    const c = document.createElement('canvas');
    c.width = 32;
    c.height = 32;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(16, 16, 13, 7, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(c);

    const mat = new THREE.PointsMaterial({
      size: 0.42,
      map: tex,
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
    if (this.dirLight) {
      this.dirLight.castShadow = settings.shadows;
    }
    if (this.scene.fog) {
      this.scene.fog.density = settings.fogDensity;
    }
  }

  update(dt, carPos) {
    if (this.leafParticles && this.leafParticles.visible) {
      const pos = this.leafParticles.geometry.attributes.position.array;
      const count = pos.length / 3;

      for (let i = 0; i < count; i++) {
        pos[i * 3 + 0] += Math.sin(Date.now() * 0.001 + i) * 0.04 + 0.03;
        pos[i * 3 + 1] -= dt * 0.55;
        pos[i * 3 + 2] += Math.cos(Date.now() * 0.001 + i) * 0.03 + 0.02;

        if (pos[i * 3 + 1] < 0.1) {
          pos[i * 3 + 1] = 14 + Math.random() * 4;
          if (carPos) {
            pos[i * 3 + 0] = carPos.x + (Math.random() - 0.5) * 80;
            pos[i * 3 + 2] = carPos.z + (Math.random() - 0.5) * 80;
          }
        }
      }
      this.leafParticles.geometry.attributes.position.needsUpdate = true;
    }
  }
}
