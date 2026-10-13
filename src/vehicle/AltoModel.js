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
    // Pure Alpine White automotive paint matching reference photo
    const bodyPaint = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.18,
      metalness: 0.06,
      side: THREE.DoubleSide,
      name: 'AltoBodyWhite'
    });

    // Dark trim / unpainted plastic / underbody
    const blackTrim = new THREE.MeshStandardMaterial({
      color: 0x18191c,
      roughness: 0.75,
      metalness: 0.1,
      side: THREE.DoubleSide,
      name: 'BlackTrim'
    });

    // Chrome accents (Suzuki 'S' emblem, ALTO badge)
    const chrome = new THREE.MeshStandardMaterial({
      color: 0xf5f6fa,
      roughness: 0.08,
      metalness: 0.95,
      side: THREE.DoubleSide,
      name: 'Chrome'
    });

    // Dark tinted rear and side window glass
    const windowGlass = new THREE.MeshStandardMaterial({
      color: 0x1e242d,
      roughness: 0.06,
      metalness: 0.35,
      transparent: true,
      opacity: 0.82,
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
      roughness: 0.25,
      side: THREE.DoubleSide,
      name: 'AmberLens'
    });

    // Bumper-mounted red taillight lens
    const redTailLens = new THREE.MeshStandardMaterial({
      color: 0xd63031,
      emissive: 0x440808,
      emissiveIntensity: 0.3,
      roughness: 0.25,
      metalness: 0.2,
      side: THREE.DoubleSide,
      name: 'RedTailLens'
    });

    // High Mount Stop Lamp
    const highBrakeLens = new THREE.MeshStandardMaterial({
      color: 0xe84118,
      emissive: 0x660a0a,
      emissiveIntensity: 0.4,
      roughness: 0.20,
      side: THREE.DoubleSide,
      name: 'HighBrakeLens'
    });

    // White reverse light lens
    const reverseLens = new THREE.MeshStandardMaterial({
      color: 0xf5f6fa,
      roughness: 0.20,
      metalness: 0.3,
      side: THREE.DoubleSide,
      name: 'ReverseLens'
    });

    // Tires
    const tireRubber = new THREE.MeshStandardMaterial({
      color: 0x1e2024,
      roughness: 0.85,
      metalness: 0.05,
      name: 'TireRubber'
    });

    // Silver wheel hubcaps
    const wheelSilver = new THREE.MeshStandardMaterial({
      color: 0xdcdde1,
      roughness: 0.25,
      metalness: 0.65,
      name: 'WheelSilver'
    });

    // Steel wheel rim behind hubcap
    const wheelSteel = new THREE.MeshStandardMaterial({
      color: 0x141619,
      roughness: 0.65,
      metalness: 0.50,
      name: 'WheelSteel'
    });

    // Interior cabin plastic
    const interiorDark = new THREE.MeshStandardMaterial({
      color: 0x242830,
      roughness: 0.85,
      metalness: 0.05,
      name: 'InteriorDark'
    });

    // License plate
    const licensePlate = new THREE.MeshStandardMaterial({
      color: 0x111317,
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

    // 5. Authentic Rear Tailgate Assembly (Badges, Wiper, Dual-Chamber Taillights, Seats)
    this.buildAuthenticRearDetails(c);

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

  buildAuthenticRearDetails(parent) {
    const rearGroup = new THREE.Group();
    rearGroup.name = 'Alto_Authentic_Rear';

    // 1. High-Mount Red Stop Lamp (HMSL) centered above rear window
    const hmslGeo = new THREE.BoxGeometry(0.24, 0.038, 0.035);
    const hmslMesh = new THREE.Mesh(hmslGeo, this.materials.highBrakeLens);
    hmslMesh.position.set(0, 1.442, -1.352);
    rearGroup.add(hmslMesh);

    // 2. Rear Windshield Rubber Trim Bezel
    const windowBezelGeo = new THREE.BoxGeometry(1.22, 0.025, 0.025);
    const windowBezelTop = new THREE.Mesh(windowBezelGeo, this.materials.blackTrim);
    windowBezelTop.position.set(0, 1.435, -1.350);
    rearGroup.add(windowBezelTop);

    const windowBezelBottom = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.025, 0.025), this.materials.blackTrim);
    windowBezelBottom.position.set(0, 0.865, -1.520);
    rearGroup.add(windowBezelBottom);

    // 3. Black Horizontal Rear Wiper
    const wiperPivotGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.03, 8);
    const wiperPivot = new THREE.Mesh(wiperPivotGeo, this.materials.blackTrim);
    wiperPivot.position.set(0.0, 0.885, -1.528);
    wiperPivot.rotation.x = Math.PI / 2;
    rearGroup.add(wiperPivot);

    const wiperArmGeo = new THREE.BoxGeometry(0.28, 0.014, 0.014);
    const wiperArm = new THREE.Mesh(wiperArmGeo, this.materials.blackTrim);
    // Extending horizontally across lower rear window
    wiperArm.position.set(-0.14, 0.888, -1.530);
    rearGroup.add(wiperArm);

    // 4. Centered Suzuki Chrome 'S' Emblem
    const emblemCanvas = document.createElement('canvas');
    emblemCanvas.width = 256;
    emblemCanvas.height = 256;
    const ectx = emblemCanvas.getContext('2d');
    ectx.clearRect(0, 0, 256, 256);

    // Draw sharp metallic Suzuki 'S' emblem
    ectx.fillStyle = '#ffffff';
    ectx.beginPath();
    ectx.moveTo(60, 48);
    ectx.lineTo(210, 48);
    ectx.lineTo(170, 96);
    ectx.lineTo(105, 96);
    ectx.lineTo(175, 148);
    ectx.lineTo(196, 208);
    ectx.lineTo(46, 208);
    ectx.lineTo(86, 160);
    ectx.lineTo(151, 160);
    ectx.lineTo(81, 108);
    ectx.closePath();
    ectx.fill();

    const emblemTex = new THREE.CanvasTexture(emblemCanvas);
    const emblemMat = new THREE.MeshBasicMaterial({
      map: emblemTex,
      transparent: true,
      side: THREE.DoubleSide
    });
    const emblemMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.14), emblemMat);
    emblemMesh.rotation.y = Math.PI; // Face towards camera (-Z)
    emblemMesh.position.set(0, 0.76, -1.575);
    rearGroup.add(emblemMesh);

    // 5. Tailgate Release Button / Keyhole centered beneath emblem
    const keyholeGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.018, 12);
    const keyhole = new THREE.Mesh(keyholeGeo, this.materials.blackTrim);
    keyhole.position.set(0, 0.66, -1.605);
    keyhole.rotation.x = Math.PI / 2;
    rearGroup.add(keyhole);

    // 6. Chrome "ALTO" Badge on bottom right of tailgate (Screen Right is world -X)
    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 512;
    badgeCanvas.height = 128;
    const bctx = badgeCanvas.getContext('2d');
    bctx.clearRect(0, 0, 512, 128);
    bctx.fillStyle = '#ffffff';
    bctx.font = '900 italic 78px "Arial Black", Impact, sans-serif';
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';
    bctx.fillText('ALTO', 256, 64);

    const badgeTex = new THREE.CanvasTexture(badgeCanvas);
    const badgeMat = new THREE.MeshBasicMaterial({
      map: badgeTex,
      transparent: true,
      side: THREE.DoubleSide
    });
    const badgeMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.06), badgeMat);
    badgeMesh.rotation.y = Math.PI; // Face towards camera (-Z)
    // Screen right is -X
    badgeMesh.position.set(-0.42, 0.70, -1.585);
    rearGroup.add(badgeMesh);

    // 7. Sculpted Rear Bumper Taillight Assemblies (Left & Right)
    [-0.52, 0.52].forEach((xPos) => {
      // Outer Red Brake Chamber (further away from center)
      const outerSign = Math.sign(xPos);
      const redChamberGeo = new THREE.BoxGeometry(0.16, 0.11, 0.035);
      const redChamber = new THREE.Mesh(redChamberGeo, this.materials.redTailLens);
      redChamber.position.set(xPos + outerSign * 0.03, 0.465, -1.636);
      rearGroup.add(redChamber);

      // Inner Clear/White Reverse Chamber (closer to center)
      const revChamberGeo = new THREE.BoxGeometry(0.08, 0.11, 0.035);
      const revChamber = new THREE.Mesh(revChamberGeo, this.materials.reverseLens);
      revChamber.position.set(xPos - outerSign * 0.06, 0.465, -1.636);
      rearGroup.add(revChamber);

      // Dark housing bezel framing taillight
      const bezelGeo = new THREE.BoxGeometry(0.27, 0.125, 0.02);
      const bezel = new THREE.Mesh(bezelGeo, this.materials.blackTrim);
      bezel.position.set(xPos, 0.465, -1.63);
      rearGroup.add(bezel);
    });

    // 8. Recessed Black License Plate Frame
    const plateFrameGeo = new THREE.BoxGeometry(0.38, 0.175, 0.03);
    const plateFrame = new THREE.Mesh(plateFrameGeo, this.materials.blackTrim);
    plateFrame.position.set(0, 0.45, -1.642);
    rearGroup.add(plateFrame);

    // Black License Plate inside recess
    const plateGeo = new THREE.PlaneGeometry(0.34, 0.145);
    const plateMesh = new THREE.Mesh(plateGeo, this.materials.licensePlate);
    plateMesh.rotation.y = Math.PI;
    plateMesh.position.set(0, 0.45, -1.658);
    rearGroup.add(plateMesh);

    // 9. Lower Bumper Corner Reflectors
    [-0.64, 0.64].forEach((xPos) => {
      const refGeo = new THREE.BoxGeometry(0.05, 0.03, 0.015);
      const refMesh = new THREE.Mesh(refGeo, this.materials.redTailLens);
      refMesh.position.set(xPos, 0.31, -1.605);
      rearGroup.add(refMesh);
    });

    // 10. Angled Roof Antenna
    const antennaBaseGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.04, 8);
    const antennaBase = new THREE.Mesh(antennaBaseGeo, this.materials.blackTrim);
    antennaBase.position.set(0, 1.48, -1.18);
    rearGroup.add(antennaBase);

    const mastGeo = new THREE.CylinderGeometry(0.007, 0.01, 0.32, 6);
    const mast = new THREE.Mesh(mastGeo, this.materials.blackTrim);
    mast.position.set(0, 1.62, -1.28);
    mast.rotation.x = -0.58; // angled backwards at ~33 degrees
    rearGroup.add(mast);

    // 11. Side Rearview Mirrors (with white body and reflective mirror glass)
    [-1, 1].forEach((side) => {
      const mirrorGroup = new THREE.Group();
      mirrorGroup.position.set(side * 0.77, 1.02, 0.58);

      // White Cap
      const capGeo = new THREE.BoxGeometry(0.15, 0.10, 0.12);
      const cap = new THREE.Mesh(capGeo, this.materials.bodyPaint);
      cap.position.set(side * 0.03, 0, 0);
      mirrorGroup.add(cap);

      // Mirror Glass facing backward
      const glassGeo = new THREE.PlaneGeometry(0.12, 0.08);
      const glass = new THREE.Mesh(glassGeo, this.materials.chrome);
      glass.position.set(side * 0.03, 0, -0.061);
      glass.rotation.y = Math.PI;
      mirrorGroup.add(glass);

      // Black Stem Mount
      const stemGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.10, 8);
      const stem = new THREE.Mesh(stemGeo, this.materials.blackTrim);
      stem.position.set(-side * 0.05, -0.03, 0);
      stem.rotation.z = side * (Math.PI / 4);
      mirrorGroup.add(stem);

      rearGroup.add(mirrorGroup);
    });

    // 12. Interior Headrests & Seat Backs visible through rear glass
    [-0.28, 0.28].forEach((xPos) => {
      const headrestGeo = new THREE.BoxGeometry(0.20, 0.14, 0.09);
      const headrest = new THREE.Mesh(headrestGeo, this.materials.interiorDark);
      headrest.position.set(xPos, 1.22, 0.02);
      rearGroup.add(headrest);

      const seatBackGeo = new THREE.BoxGeometry(0.40, 0.38, 0.11);
      const seatBack = new THREE.Mesh(seatBackGeo, this.materials.interiorDark);
      seatBack.position.set(xPos, 0.94, 0.02);
      rearGroup.add(seatBack);
    });

    parent.add(rearGroup);
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
