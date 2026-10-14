import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { eventBus } from '../core/EventBus.js';

/**
 * High-Fidelity Autumn Sunset Sky & Atmosphere
 * Features:
 * - Low-angle golden sunset sun positioned in the upper right behind trees
 * - Visible glowing sun orb & radiant atmospheric flare
 * - Diagonal volumetric god rays streaming through right tree branches across road
 * - Warm autumn skybox & environment lighting
 * - Fluffy sunset clouds catching golden hour backlight
 * - Fluttering autumn leaves particle system
 * 
 * Coordinate system convention:
 * - When looking along +Z:
 *   Screen LEFT is world +X
 *   Screen RIGHT is world -X
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

    // 2. Directional Sun Light (Warm golden sunlight shining from Screen Right / -X)
    this.dirLight = new THREE.DirectionalLight(0xffbe76, 3.6);
    this.dirLight.position.set(-36, 26, 52);
    this.dirLight.target.position.set(0, 0, 15);
    this.scene.add(this.dirLight.target);
    this.dirLight.castShadow = true;

    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 1.0;
    this.dirLight.shadow.camera.far = 320;

    const d = 55;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0003;

    this.scene.add(this.dirLight);

    // 3. Balanced Ambient & Hemisphere Fill
    this.hemiLight = new THREE.HemisphereLight(0xffdcb4, 0x424e5e, 1.45);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    this.ambientLight = new THREE.AmbientLight(0xfff5ea, 0.45);
    this.scene.add(this.ambientLight);

    // 4. Distance Atmospheric Sunset Fog
    this.scene.fog = new THREE.Fog(0xe67e22, 65, 420);

    // 5. Glowing Sun Orb & Volumetric God Rays on Screen Right
    this.buildGlowingSunAndGodRays();
  }

  buildGlowingSunAndGodRays() {
    const sunGroup = new THREE.Group();
    sunGroup.name = 'SunsetSunAndGodRays';

    // 1. Brilliant Glowing Sun Orb (visible shining right through tree branches on Screen Right)
    const sunOrbGeo = new THREE.SphereGeometry(2.6, 24, 24);
    const sunOrbMat = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });
    const sunOrb = new THREE.Mesh(sunOrbGeo, sunOrbMat);
    sunOrb.position.set(-28, 19, 44);
    sunGroup.add(sunOrb);

    // Sun Corona / Radial Glow Sprite
    const flareCanvas = document.createElement('canvas');
    flareCanvas.width = 512;
    flareCanvas.height = 512;
    const fctx = flareCanvas.getContext('2d');
    const fgrad = fctx.createRadialGradient(256, 256, 10, 256, 256, 248);
    fgrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    fgrad.addColorStop(0.12, 'rgba(255, 242, 165, 0.95)');
    fgrad.addColorStop(0.35, 'rgba(255, 175, 55, 0.70)');
    fgrad.addColorStop(0.65, 'rgba(235, 95, 20, 0.30)');
    fgrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    fctx.fillStyle = fgrad;
    fctx.fillRect(0, 0, 512, 512);

    const flareTex = new THREE.CanvasTexture(flareCanvas);
    const flareMat = new THREE.MeshBasicMaterial({
      map: flareTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const flareMesh = new THREE.Mesh(new THREE.PlaneGeometry(36, 36), flareMat);
    flareMesh.position.set(-28, 19, 43.8);
    sunGroup.add(flareMesh);

    // 2. Volumetric God Rays (Soft feathered light shafts radiating down-left across road)
    function createFeatheredRayTexture() {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 512;
      const g = c.getContext('2d');

      // Vertical falloff (bright at top -> fading out down the road)
      const vGrad = g.createLinearGradient(0, 0, 0, 512);
      vGrad.addColorStop(0.00, 'rgba(255, 240, 180, 0.85)');
      vGrad.addColorStop(0.25, 'rgba(255, 215, 140, 0.65)');
      vGrad.addColorStop(0.60, 'rgba(255, 180, 80, 0.25)');
      vGrad.addColorStop(1.00, 'rgba(255, 140, 50, 0.00)');
      g.fillStyle = vGrad;
      g.fillRect(0, 0, 128, 512);

      // Horizontal feathering so rays don't have harsh polygonal edges
      const hGrad = g.createLinearGradient(0, 0, 128, 0);
      hGrad.addColorStop(0.00, 'rgba(0, 0, 0, 1.0)');
      hGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0.0)');
      hGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.0)');
      hGrad.addColorStop(1.00, 'rgba(0, 0, 0, 1.0)');
      g.globalCompositeOperation = 'destination-out';
      g.fillStyle = hGrad;
      g.fillRect(0, 0, 128, 512);

      const tex = new THREE.CanvasTexture(c);
      return tex;
    }

    const rayTex = createFeatheredRayTexture();
    const rayMat = new THREE.MeshBasicMaterial({
      map: rayTex,
      color: 0xffeaa7,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const rayConfigs = [
      // Fan of distinct diagonal light shafts beaming from sun down-left across road
      { x: -22, y: 15.0, z: 32, rotZ: 0.52, rotY: -0.30, w: 9, l: 34, op: 0.18 },
      { x: -16, y: 11.5, z: 24, rotZ: 0.48, rotY: -0.35, w: 12, l: 38, op: 0.20 },
      { x: -11, y: 9.0, z: 16, rotZ: 0.54, rotY: -0.28, w: 8, l: 30, op: 0.15 },
      { x: -24, y: 16.0, z: 38, rotZ: 0.44, rotY: -0.36, w: 14, l: 42, op: 0.16 },
      { x: -18, y: 12.5, z: 28, rotZ: 0.50, rotY: -0.32, w: 10, l: 36, op: 0.16 }
    ];

    rayConfigs.forEach((cfg) => {
      const planeGeo = new THREE.PlaneGeometry(cfg.w, cfg.l);
      const meshMat = rayMat.clone();
      meshMat.opacity = cfg.op;
      const mesh = new THREE.Mesh(planeGeo, meshMat);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.rotation.z = cfg.rotZ;
      mesh.rotation.y = cfg.rotY;
      mesh.rotation.x = -0.28;
      sunGroup.add(mesh);
    });

    this.scene.add(sunGroup);
  }

  createSunsetSkyboxTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Rich sunset sky gradient: Dusk violet-purple zenith -> Warm crimson -> Saturated orange -> Golden horizon
    const grad = ctx.createLinearGradient(0, 0, 0, 1024);
    grad.addColorStop(0.00, '#35184a'); // deep violet dusk at zenith
    grad.addColorStop(0.20, '#5e2348'); // twilight mauve
    grad.addColorStop(0.38, '#9c382e'); // autumn crimson
    grad.addColorStop(0.54, '#d85818'); // saturated sunset orange
    grad.addColorStop(0.68, '#f59318'); // radiant golden amber
    grad.addColorStop(0.74, '#f8b428'); // brilliant sunset glow
    grad.addColorStop(0.80, '#f27822'); // warm horizon haze
    grad.addColorStop(1.00, '#422212'); // ground fill

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Glowing Sun Disc on Screen Right (+Z, -X direction: center around X = 1240)
    const sunX = 1240;
    const sunY = 1024 * 0.44;

    // Wide atmospheric corona
    const glowGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 480);
    glowGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    glowGrad.addColorStop(0.14, 'rgba(255, 240, 170, 0.95)');
    glowGrad.addColorStop(0.35, 'rgba(255, 170, 50, 0.70)');
    glowGrad.addColorStop(0.65, 'rgba(225, 80, 20, 0.30)');
    glowGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 480, 0, Math.PI * 2);
    ctx.fill();

    // Intense brilliant sun core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 36, 0, Math.PI * 2);
    ctx.fill();

    // Layered, fluffy sunset cumulus clouds across the sky
    const clouds = [
      // Left side clouds (softer, catching pinkish amber light)
      { x: 420, y: 380, rx: 180, ry: 45, col: 'rgba(230, 130, 70, 0.45)' },
      { x: 620, y: 350, rx: 220, ry: 50, col: 'rgba(240, 150, 75, 0.50)' },
      { x: 800, y: 400, rx: 190, ry: 42, col: 'rgba(245, 160, 80, 0.55)' },
      // Center / Right clouds (bright golden illuminated undersides)
      { x: 1020, y: 370, rx: 240, ry: 55, col: 'rgba(255, 190, 90, 0.60)' },
      { x: 1200, y: 330, rx: 200, ry: 48, col: 'rgba(255, 220, 120, 0.70)' },
      { x: 1400, y: 360, rx: 260, ry: 58, col: 'rgba(255, 185, 85, 0.65)' },
      { x: 1620, y: 390, rx: 210, ry: 46, col: 'rgba(235, 140, 70, 0.50)' }
    ];

    clouds.forEach((cl) => {
      ctx.fillStyle = cl.col;
      ctx.beginPath();
      ctx.ellipse(cl.x, cl.y, cl.rx, cl.ry, 0.03, 0, Math.PI * 2);
      ctx.fill();

      // Cloud billows / tops
      ctx.fillStyle = 'rgba(255, 215, 130, 0.25)';
      ctx.beginPath();
      ctx.ellipse(cl.x + cl.rx * 0.2, cl.y - cl.ry * 0.35, cl.rx * 0.6, cl.ry * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  initAutumnLeaves() {
    const count = 320;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color(0xd35400),
      new THREE.Color(0xf39c12),
      new THREE.Color(0xc0392b),
      new THREE.Color(0xe67e22)
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = Math.random() * 18 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const c = document.createElement('canvas');
    c.width = 32;
    c.height = 32;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(16, 16, 13, 8, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.PointsMaterial({
      size: 0.32,
      map: tex,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      opacity: 0.85
    });

    this.leafParticles = new THREE.Points(geo, mat);
    this.scene.add(this.leafParticles);
  }

  update(dt, playerPosition) {
    if (!this.leafParticles) return;

    const positions = this.leafParticles.geometry.attributes.position.array;
    const count = positions.length / 3;

    for (let i = 0; i < count; i++) {
      // Gentle downward flutter
      positions[i * 3 + 1] -= dt * (0.85 + (i % 5) * 0.22);
      // Wind drift along X and Z
      positions[i * 3 + 0] += Math.sin(positions[i * 3 + 1] * 2.0 + i) * dt * 0.45;
      positions[i * 3 + 2] += dt * 0.35;

      // Reset when touching ground
      if (positions[i * 3 + 1] < 0.1) {
        positions[i * 3 + 1] = 16.0 + Math.random() * 4.0;
        if (playerPosition) {
          positions[i * 3 + 0] = playerPosition.x + (Math.random() - 0.5) * 60;
          positions[i * 3 + 2] = playerPosition.z + (Math.random() - 0.5) * 60;
        }
      }
    }

    this.leafParticles.geometry.attributes.position.needsUpdate = true;
  }

  handleQualityChange(data) {
    if (!this.dirLight) return;
    if (data.mode === 'performance') {
      this.dirLight.castShadow = false;
      if (this.leafParticles) this.leafParticles.visible = false;
    } else {
      this.dirLight.castShadow = true;
      if (this.leafParticles) this.leafParticles.visible = true;
    }
  }
}
