import * as THREE from 'three';
import { ALTO_VERTICES, ALTO_GROUPS } from './AltoMeshDef.js';

/**
 * Authentic Polygonal Suzuki Alto (HA36S) 3D Model
 * Built using unified continuous polygonal geometry:
 * - Seamless monocoque body shell (Paint_White)
 * - Authentic asymmetric front grille (4 vertical louvers + Suzuki emblem + horizontal slot)
 * - Trapezoidal clear headlights with amber corner indicators
 * - Signature upward-kink rear door beltline window and thick C-pillar
 * - Bumper-mounted horizontal taillights & recessed license plate
 * - High-mounted rear stop lamp & rear wiper
 * - Authentic 4-slot silver hubcaps over dark steel wheels
 * - Interior dashboard, RHD steering wheel, front bucket seats with headrests
 * - Dynamic interactive lighting: headlights, brake lights, reverse lights, steering
 */
export class AltoModel {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'SuzukiAlto_HA36';

    // Sub-assembly that pitches and rolls with suspension dynamics
    this.chassisGroup = new THREE.Group();
    this.group.add(this.chassisGroup);

    this.wheels = {
      fl: { pivot: null, spinner: null },
      fr: { pivot: null, spinner: null },
      rl: { pivot: null, spinner: null },
      rr: { pivot: null, spinner: null }
    };

    this.materials = this.createMaterials();
    this.interactiveLights = {
      headlightsOn: false,
      brakeLightsOn: false,
      reverseLightsOn: false,
      spotLights: [],
      beamCones: []
    };

    this.buildCar();
  }

  createMaterials() {
    // Alpine White automotive body paint with realistic clearcoat reflection
    const bodyPaint = new THREE.MeshStandardMaterial({
      color: 0xf6f8fc,
      roughness: 0.20,
      metalness: 0.10,
      side: THREE.DoubleSide,
      name: 'AltoBodyWhite'
    });

    // Dark trim / unpainted plastic / underbody
    const blackTrim = new THREE.MeshStandardMaterial({
      color: 0x1c1e22,
      roughness: 0.70,
      metalness: 0.15,
      side: THREE.DoubleSide,
      name: 'BlackTrim'
    });

    // Chrome accents (Suzuki 'S' emblem, badges, grille slits)
    const chrome = new THREE.MeshStandardMaterial({
      color: 0xebf0f8,
      roughness: 0.10,
      metalness: 0.95,
      side: THREE.DoubleSide,
      name: 'Chrome'
    });

    // Dark tinted glass
    const windowGlass = new THREE.MeshStandardMaterial({
      color: 0x1a1e24,
      roughness: 0.08,
      metalness: 0.40,
      transparent: true,
      opacity: 0.86,
      side: THREE.DoubleSide,
      name: 'WindowGlass'
    });

    // Headlight outer lens
    const headlightGlass = new THREE.MeshStandardMaterial({
      color: 0xf5f8fe,
      roughness: 0.10,
      metalness: 0.35,
      transparent: true,
      opacity: 0.70,
      side: THREE.DoubleSide,
      name: 'HeadlightGlass'
    });

    // Amber turn indicators
    const amberLens = new THREE.MeshStandardMaterial({
      color: 0xf39c12,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.25,
      side: THREE.DoubleSide,
      name: 'AmberLens'
    });

    // Bumper-mounted red taillight lens
    const redTailLens = new THREE.MeshStandardMaterial({
      color: 0xc0392b,
      emissive: 0x220505,
      emissiveIntensity: 0.2,
      roughness: 0.30,
      side: THREE.DoubleSide,
      name: 'RedTailLens'
    });

    // High Mount Stop Lamp
    const highBrakeLens = new THREE.MeshStandardMaterial({
      color: 0xd63031,
      emissive: 0x220505,
      emissiveIntensity: 0.2,
      roughness: 0.25,
      side: THREE.DoubleSide,
      name: 'HighBrakeLens'
    });

    // White reverse light lens
    const reverseLens = new THREE.MeshStandardMaterial({
      color: 0xeef2f7,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.25,
      side: THREE.DoubleSide,
      name: 'ReverseLens'
    });

    // Tires
    const tireRubber = new THREE.MeshStandardMaterial({
      color: 0x222326,
      roughness: 0.85,
      metalness: 0.05,
      name: 'TireRubber'
    });

    // Silver wheel hubcaps
    const wheelSilver = new THREE.MeshStandardMaterial({
      color: 0xd8dde4,
      roughness: 0.25,
      metalness: 0.65,
      name: 'WheelSilver'
    });

    // Steel wheel rim behind hubcap
    const wheelSteel = new THREE.MeshStandardMaterial({
      color: 0x1e2024,
      roughness: 0.65,
      metalness: 0.50,
      name: 'WheelSteel'
    });

    // Interior cabin plastic
    const interiorDark = new THREE.MeshStandardMaterial({
      color: 0x24262b,
      roughness: 0.90,
      metalness: 0.05,
      name: 'InteriorDark'
    });

    // License plate
    const licensePlate = new THREE.MeshStandardMaterial({
      color: 0x18191c,
      roughness: 0.60,
      metalness: 0.10,
      side: THREE.DoubleSide,
      name: 'LicensePlate'
    });

    // Headlight beam cone
    const beamConeMat = new THREE.MeshBasicMaterial({
      color: 0xfff6dd,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    return {
      bodyPaint,
      blackTrim,
      chrome,
      windowGlass,
      headlightGlass,
      amberLens,
      redTailLens,
      highBrakeLens,
      reverseLens,
      tireRubber,
      wheelSilver,
      wheelSteel,
      interiorDark,
      licensePlate,
      beamConeMat
    };
  }

  buildCar() {
    const c = this.chassisGroup;

    // 1. Build all polygonal body components from ALTO_GROUPS
    this.buildPolygonalBody(c);

    // 2. Headlight Beams & Volumetric Cones
    this.buildHeadlightBeams(c);

    // 3. Authentic Wheels with 4-Slot Silver Hubcaps
    this.buildWheels();

    // 4. Ground Contact Shadow
    this.buildGroundShadowPlane();

    // Enable shadows on all relevant meshes
    this.chassisGroup.traverse((obj) => {
      if (obj.isMesh && obj.name !== 'CarGroundShadow') {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }

  buildPolygonalBody(parent) {
    const groupMaterialMap = {
      'Car_Body': this.materials.bodyPaint,
      'Car_Underbody': this.materials.blackTrim,
      'Car_Windows': this.materials.windowGlass,
      'Car_BPillars': this.materials.blackTrim,
      'Car_Grille': this.materials.blackTrim,
      'Car_Grille_Slits': this.materials.chrome,
      'Car_Headlights': this.materials.headlightGlass,
      'Car_TurnSignals': this.materials.amberLens,
      'Car_LowerIntake': this.materials.blackTrim,
      'Car_LicensePlate': this.materials.licensePlate,
      'Car_Taillights_Red': this.materials.redTailLens,
      'Car_Taillights_Clear': this.materials.reverseLens,
      'Car_HighBrake': this.materials.highBrakeLens,
      'Car_RearPlate': this.materials.licensePlate,
      'Car_RearBadges': this.materials.chrome,
      'Car_Mirrors': this.materials.bodyPaint,
      'Car_MirrorGlass': this.materials.chrome,
      'Car_DoorHandles': this.materials.chrome,
      'Car_Interior': this.materials.interiorDark,
      'Car_Antenna': this.materials.blackTrim
    };

    const verts = ALTO_VERTICES;

    for (const [groupName, faces] of Object.entries(ALTO_GROUPS)) {
      const mat = groupMaterialMap[groupName] || this.materials.bodyPaint;

      const positions = [];
      for (const face of faces) {
        if (face.length === 3) {
          const [i0, i1, i2] = face;
          positions.push(...verts[i0], ...verts[i1], ...verts[i2]);
        } else if (face.length === 4) {
          const [i0, i1, i2, i3] = face;
          // Triangle 1
          positions.push(...verts[i0], ...verts[i1], ...verts[i2]);
          // Triangle 2
          positions.push(...verts[i0], ...verts[i2], ...verts[i3]);
        }
      }

      if (positions.length > 0) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.computeVertexNormals();

        const mesh = new THREE.Mesh(geo, mat);
        mesh.name = groupName;
        parent.add(mesh);
      }
    }
  }

  buildHeadlightBeams(parent) {
    [-1, 1].forEach((side) => {
      const spot = new THREE.SpotLight(0xfffaea, 0, 38, Math.PI / 6, 0.45, 1.2);
      spot.position.set(side * 0.52, 0.74, 1.74);
      spot.target.position.set(side * 0.52, 0, 18);
      parent.add(spot);
      parent.add(spot.target);
      this.interactiveLights.spotLights.push(spot);

      const coneGeo = new THREE.ConeGeometry(2.2, 14, 16, 1, true);
      const beamCone = new THREE.Mesh(coneGeo, this.materials.beamConeMat);
      beamCone.position.set(side * 0.52, 0.74, 8.5);
      beamCone.rotation.x = -Math.PI / 2;
      beamCone.visible = false;
      parent.add(beamCone);
      this.interactiveLights.beamCones.push(beamCone);
    });
  }

  buildWheels() {
    // Axle positions matching wheel arch centers
    // Front: Z = 1.08, Rear: Z = -1.14
    // Width: X = ±0.66, Ground: Y = 0.28
    const wheelConfigs = [
      { key: 'fl', x: -0.66, y: 0.28, z: 1.08, isFront: true },
      { key: 'fr', x: 0.66, y: 0.28, z: 1.08, isFront: true },
      { key: 'rl', x: -0.66, y: 0.28, z: -1.14, isFront: false },
      { key: 'rr', x: 0.66, y: 0.28, z: -1.14, isFront: false }
    ];

    wheelConfigs.forEach((cfg) => {
      const steeringPivot = new THREE.Group();
      steeringPivot.name = `Steer_${cfg.key}`;
      steeringPivot.position.set(cfg.x, cfg.y, cfg.z);
      this.group.add(steeringPivot);

      const spinPivot = new THREE.Group();
      spinPivot.name = `Spin_${cfg.key}`;
      steeringPivot.add(spinPivot);

      const wheelMesh = this.createAuthenticAltoWheel(cfg.x > 0);
      spinPivot.add(wheelMesh);

      this.wheels[cfg.key] = {
        pivot: steeringPivot,
        spinner: spinPivot,
        isFront: cfg.isFront
      };
    });
  }

  createAuthenticAltoWheel(isRightSide) {
    const wheelGroup = new THREE.Group();
    const tireRadius = 0.28;
    const tireWidth = 0.16;

    // 1. Rubber Tire with Low-Poly Faceted Bevels
    const tireGeo = new THREE.CylinderGeometry(tireRadius, tireRadius, tireWidth, 22, 1);
    const tire = new THREE.Mesh(tireGeo, this.materials.tireRubber);
    tire.rotation.z = Math.PI / 2;
    wheelGroup.add(tire);

    // Chamfered tire shoulder
    const shoulderGeo = new THREE.CylinderGeometry(tireRadius * 0.94, tireRadius * 0.98, tireWidth * 1.03, 22, 1);
    const shoulder = new THREE.Mesh(shoulderGeo, this.materials.tireRubber);
    shoulder.rotation.z = Math.PI / 2;
    wheelGroup.add(shoulder);

    // 2. Dark Steel Rim Base
    const rimGeo = new THREE.CylinderGeometry(0.20, 0.20, tireWidth * 0.96, 16);
    const rim = new THREE.Mesh(rimGeo, this.materials.wheelSteel);
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);

    // ==========================================
    // 3. AUTHENTIC 4-SLOT SILVER ALTO HUBCAP
    // Features 4 wide symmetric cutouts showing the dark rim inside
    // and a raised center hub with chrome Suzuki accent
    // ==========================================
    const hubcapGroup = new THREE.Group();
    const capX = isRightSide ? (tireWidth / 2 + 0.005) : (-tireWidth / 2 - 0.005);
    hubcapGroup.position.set(capX, 0, 0);

    // Silver Face Disc
    const capDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.014, 16), this.materials.wheelSilver);
    capDisc.rotation.z = Math.PI / 2;
    hubcapGroup.add(capDisc);

    // 4 Slots / Cutouts exposing dark steel behind
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.038, 0.075), this.materials.wheelSteel);
      slot.position.set(0, Math.sin(angle) * 0.11, Math.cos(angle) * 0.11);
      slot.rotation.x = angle;
      hubcapGroup.add(slot);
    }

    // Center Hub with Chrome Accent
    const hubNut = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.05, 0.022, 12), this.materials.wheelSilver);
    hubNut.rotation.z = Math.PI / 2;
    hubcapGroup.add(hubNut);

    const logoDot = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.026, 8), this.materials.chrome);
    logoDot.rotation.z = Math.PI / 2;
    hubcapGroup.add(logoDot);

    wheelGroup.add(hubcapGroup);
    return wheelGroup;
  }

  buildGroundShadowPlane() {
    const shadowGeo = new THREE.PlaneGeometry(1.68, 3.48);
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(64, 64, 18, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.3)');
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
    shadowMesh.position.set(0, 0.02, -0.02);
    this.group.add(shadowMesh);
  }

  // --- Dynamic Lighting Controls ---
  setHeadlights(enabled) {
    this.interactiveLights.headlightsOn = enabled;
    const intensity = enabled ? 3.5 : 0;

    this.interactiveLights.spotLights.forEach((spot) => {
      spot.intensity = intensity;
    });

    this.interactiveLights.beamCones.forEach((beam) => {
      beam.visible = enabled;
      this.materials.beamConeMat.opacity = enabled ? 0.15 : 0;
    });
  }

  toggleHeadlights() {
    this.setHeadlights(!this.interactiveLights.headlightsOn);
    return this.interactiveLights.headlightsOn;
  }

  setBrakeLights(enabled) {
    this.interactiveLights.brakeLightsOn = enabled;
    if (enabled) {
      this.materials.redTailLens.emissive.setHex(0xff1118);
      this.materials.redTailLens.emissiveIntensity = 2.4;
      this.materials.highBrakeLens.emissive.setHex(0xff1118);
      this.materials.highBrakeLens.emissiveIntensity = 2.8;
    } else {
      this.materials.redTailLens.emissive.setHex(0x220505);
      this.materials.redTailLens.emissiveIntensity = 0.2;
      this.materials.highBrakeLens.emissive.setHex(0x220505);
      this.materials.highBrakeLens.emissiveIntensity = 0.2;
    }
  }

  setReverseLights(enabled) {
    this.interactiveLights.reverseLightsOn = enabled;
    if (enabled) {
      this.materials.reverseLens.emissive.setHex(0xffffff);
      this.materials.reverseLens.emissiveIntensity = 2.0;
    } else {
      this.materials.reverseLens.emissive.setHex(0x000000);
      this.materials.reverseLens.emissiveIntensity = 0;
    }
  }

  setSteeringAngle(angle) {
    this.wheels.fl.pivot.rotation.y = angle;
    this.wheels.fr.pivot.rotation.y = angle;
  }

  spinWheels(distanceTraveled) {
    const tireRadius = 0.28;
    const deltaAngle = distanceTraveled / tireRadius;
    this.wheels.fl.spinner.rotation.x += deltaAngle;
    this.wheels.fr.spinner.rotation.x += deltaAngle;
    this.wheels.rl.spinner.rotation.x += deltaAngle;
    this.wheels.rr.spinner.rotation.x += deltaAngle;
  }

  setChassisDynamics(pitch, roll) {
    this.chassisGroup.rotation.x = pitch;
    this.chassisGroup.rotation.z = roll;
  }
}
