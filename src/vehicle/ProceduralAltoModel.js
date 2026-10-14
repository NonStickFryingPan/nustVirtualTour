import * as THREE from 'three';

/**
 * Model 1: Procedural Rigged Suzuki Alto (HA36S)
 * Based on the precise metric dimensions from reference images:
 * - Length: 3.395m (Z: -1.6975 to +1.6975)
 * - Height: 1.475m (Y: 0.0 to 1.475m)
 * - Width: 1.475m (X: -0.7375 to +0.7375)
 * - Wheelbase: 2.426m (Axles at Z = ±1.213m)
 * - Tyre Radius: 0.366m
 * 
 * Hierarchy:
 * Suzuki_Alto_Root (0, 0, 0)
 * ├── Car_Body (Lofted body shell, recessed wheel wells, windows, grille, lights, mirrors)
 * ├── Wheel_FL (+0.645, 0.366, +1.213)
 * ├── Wheel_FR (-0.645, 0.366, +1.213)
 * ├── Wheel_RL (+0.645, 0.366, -1.213)
 * └── Wheel_RR (-0.645, 0.366, -1.213)
 */
export class ProceduralAltoModel {
  constructor() {
    this.name = 'ProceduralAlto';
    this.group = new THREE.Group();
    this.group.name = 'Suzuki_Alto_Root';

    this.chassisGroup = new THREE.Group();
    this.chassisGroup.name = 'Car_Body';
    this.group.add(this.chassisGroup);

    this.materials = this.createMaterials();

    this.wheelNodes = {
      fl: null,
      fr: null,
      rl: null,
      rr: null
    };

    this.wheelRotations = {
      fl: 0,
      fr: 0,
      rl: 0,
      rr: 0
    };

    this.steeringAngle = 0;

    this.headlightSpots = [];
    this.headlightCones = [];
    this.taillightMeshes = [];

    this.buildCarBody();
    this.buildWheels();
    this.buildGroundShadow();
    this.buildLighting();
  }

  createMaterials() {
    const paintMat = new THREE.MeshStandardMaterial({
      color: 0xf7f8fa,
      roughness: 0.22,
      metalness: 0.08,
      name: 'White_Paint'
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x22262d,
      roughness: 0.08,
      metalness: 0.35,
      transparent: true,
      opacity: 0.85,
      name: 'Tinted_Glass'
    });

    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x181a1f,
      roughness: 0.70,
      metalness: 0.10,
      name: 'Black_Trim'
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xdde2ea,
      roughness: 0.15,
      metalness: 0.90,
      name: 'Chrome_Badge'
    });

    const silverRimMat = new THREE.MeshStandardMaterial({
      color: 0xc8cdd4,
      roughness: 0.32,
      metalness: 0.50,
      name: 'Hubcap_Silver'
    });

    const tyreMat = new THREE.MeshStandardMaterial({
      color: 0x202328,
      roughness: 0.85,
      metalness: 0.05,
      name: 'Tyre_Rubber'
    });

    const headLightMat = new THREE.MeshStandardMaterial({
      color: 0xdbe4f0,
      roughness: 0.12,
      metalness: 0.60,
      name: 'Headlight_Lens'
    });

    const amberMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.25,
      metalness: 0.20,
      name: 'Turn_Signal'
    });

    const tailLightMat = new THREE.MeshStandardMaterial({
      color: 0xd63031,
      emissive: 0x440808,
      emissiveIntensity: 0.35,
      roughness: 0.20,
      metalness: 0.20,
      name: 'Taillight_Red'
    });

    const handleMat = new THREE.MeshStandardMaterial({
      color: 0xcfd3d8,
      roughness: 0.35,
      metalness: 0.25,
      name: 'Door_Handle'
    });

    return {
      paintMat,
      glassMat,
      darkTrimMat,
      chromeMat,
      silverRimMat,
      tyreMat,
      headLightMat,
      amberMat,
      tailLightMat,
      handleMat
    };
  }

  buildCarBody() {
    const m = this.materials;
    const bodyGroup = this.chassisGroup;

    // Exact Suzuki Alto HA36S side profile lofted across width with tumblehome
    const zSlices = [
      // [z, yBottom, yBelt, yTop, halfWidthBottom, halfWidthBelt, halfWidthTop]
      [-1.697, 0.34, 0.76, 0.84, 0.64, 0.68, 0.63], // Rear bumper tip
      [-1.630, 0.27, 0.88, 1.15, 0.70, 0.72, 0.62], // Rear tailgate lower
      [-1.500, 0.28, 0.94, 1.44, 0.72, 0.735, 0.54], // Rear window top / spoiler
      [-1.213, 0.52, 0.93, 1.470, 0.735, 0.738, 0.545], // Rear axle center (arch raised)
      [-0.850, 0.21, 0.91, 1.475, 0.735, 0.738, 0.55], // Rear door
      [-0.150, 0.21, 0.89, 1.475, 0.735, 0.738, 0.55], // B-pillar
      [ 0.550, 0.21, 0.86, 1.455, 0.735, 0.738, 0.54], // A-pillar top / windshield top
      [ 0.920, 0.21, 0.84, 0.90, 0.735, 0.735, 0.67], // Base of windshield / cowl
      [ 1.213, 0.52, 0.81, 0.87, 0.735, 0.735, 0.66], // Front axle center (arch raised)
      [ 1.560, 0.23, 0.72, 0.80, 0.70, 0.70, 0.63], // Front headlight line
      [ 1.697, 0.26, 0.62, 0.71, 0.62, 0.63, 0.58]  // Front bumper nose
    ];

    function sampleProfile(z) {
      for (let i = 0; i < zSlices.length - 1; i++) {
        const a = zSlices[i], b = zSlices[i + 1];
        if (z >= a[0] && z <= b[0]) {
          const t = (z - a[0]) / (b[0] - a[0]);
          const s = t * t * (3 - 2 * t);
          return a.map((v, idx) => v + (b[idx] - v) * s);
        }
      }
      return zSlices[zSlices.length - 1];
    }

    // Generate continuous body shell with recessed wheel arches
    const nz = 96, nv = 48;
    const positions = [];
    const indices = [];
    const zMin = -1.697, zMax = 1.697;

    for (let i = 0; i <= nz; i++) {
      const u = i / nz;
      const z = zMin + u * (zMax - zMin);
      const [_, yBotBase, yBelt, yTop, hwBot, hwBelt, hwTop] = sampleProfile(z);

      // Carve circular wheel arches at front (z=1.213) and rear (z=-1.213)
      let yBot = 0.21;
      for (const wz of [-1.213, 1.213]) {
        const dz = z - wz;
        const rArch = 0.415;
        if (Math.abs(dz) < rArch) {
          const archY = 0.366 + Math.sqrt(Math.max(0, rArch * rArch - dz * dz));
          yBot = Math.max(yBot, archY);
        }
      }
      if (z < -1.55 || z > 1.55) yBot = Math.max(yBot, 0.24);

      for (let j = 0; j <= nv; j++) {
        const v = j / nv;
        const sym = Math.abs(v - 0.5) * 2;
        const sideSign = v < 0.5 ? 1 : -1;

        let x, y;
        if (sym < 0.28) {
          const t = sym / 0.28;
          x = sideSign * t * hwTop;
          y = yTop - 0.018 * (1 - t * t);
        } else if (sym < 0.58) {
          const t = (sym - 0.28) / 0.30;
          x = sideSign * (hwTop + t * (hwBelt - hwTop));
          y = yTop - t * (yTop - yBelt);
        } else if (sym < 0.88) {
          const t = (sym - 0.58) / 0.30;
          x = sideSign * (hwBelt + Math.sin(t * Math.PI) * 0.015 - t * (hwBelt - hwBot));
          y = yBelt - t * (yBelt - yBot);
        } else {
          const t = (sym - 0.88) / 0.12;
          x = sideSign * (1 - t) * hwBot;
          y = yBot;
        }
        positions.push(x, y, z);
      }
    }

    for (let i = 0; i < nz; i++) {
      for (let j = 0; j < nv; j++) {
        const a = i * (nv + 1) + j;
        const b = (i + 1) * (nv + 1) + j;
        const c = (i + 1) * (nv + 1) + (j + 1);
        const d = i * (nv + 1) + (j + 1);
        indices.push(a, b, c, a, c, d);
      }
    }

    const bodyGeo = new THREE.BufferGeometry();
    bodyGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    bodyGeo.setIndex(indices);
    bodyGeo.computeVertexNormals();

    const bodyMesh = new THREE.Mesh(bodyGeo, m.paintMat);
    bodyMesh.name = 'Body_Shell';
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bodyGroup.add(bodyMesh);

    // Recessed Dark Wheel Wells
    for (const wz of [-1.213, 1.213]) {
      const wellGeo = new THREE.CylinderGeometry(0.41, 0.41, 1.38, 28);
      wellGeo.rotateZ(Math.PI / 2);
      const well = new THREE.Mesh(wellGeo, m.darkTrimMat);
      well.position.set(0, 0.366, wz);
      well.name = wz > 0 ? 'Wheel_Well_Front' : 'Wheel_Well_Rear';
      bodyGroup.add(well);
    }

    // Windshield
    const wsGeo = new THREE.PlaneGeometry(1.12, 0.66);
    const ws = new THREE.Mesh(wsGeo, m.glassMat);
    ws.position.set(0, 1.16, 0.74);
    ws.rotation.x = -0.68;
    ws.name = 'Windshield';
    bodyGroup.add(ws);

    // Rear Window
    const rwGeo = new THREE.PlaneGeometry(1.06, 0.48);
    const rw = new THREE.Mesh(rwGeo, m.glassMat);
    rw.position.set(0, 1.18, -1.56);
    rw.rotation.x = Math.PI + 0.32;
    rw.name = 'Rear_Window';
    bodyGroup.add(rw);

    // Side windows, mirrors, door handles, headlights, taillights
    for (const sign of [-1, 1]) {
      const swGeo = new THREE.PlaneGeometry(1.75, 0.42);
      const sw = new THREE.Mesh(swGeo, m.glassMat);
      sw.position.set(sign * 0.655, 1.15, -0.25);
      sw.rotation.y = sign > 0 ? Math.PI / 2 : -Math.PI / 2;
      sw.rotation.x = sign * -0.24;
      bodyGroup.add(sw);

      // Side Mirrors
      const mirGroup = new THREE.Group();
      mirGroup.position.set(sign * 0.78, 0.92, 0.68);
      const mirHousing = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.11, 0.12), m.paintMat);
      mirGroup.add(mirHousing);
      const mirGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.08), m.chromeMat);
      mirGlass.position.set(0, 0, -0.061);
      mirGlass.rotation.y = Math.PI;
      mirGroup.add(mirGlass);
      bodyGroup.add(mirGroup);

      // Door Handles
      for (const hz of [0.05, -0.78]) {
        const hdl = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.045, 0.14), m.handleMat);
        hdl.position.set(sign * 0.742, 0.80, hz);
        bodyGroup.add(hdl);
      }

      // Headlights with inner amber signals
      const hlBox = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.17, 0.08), m.headLightMat);
      hlBox.position.set(sign * 0.48, 0.68, 1.63);
      bodyGroup.add(hlBox);

      const ambBox = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.09), m.amberMat);
      ambBox.position.set(sign * 0.37, 0.65, 1.635);
      bodyGroup.add(ambBox);

      // Rear Bumper Combination Taillights
      const tlBox = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.09, 0.06), m.tailLightMat);
      tlBox.position.set(sign * 0.42, 0.44, -1.675);
      bodyGroup.add(tlBox);
      this.taillightMeshes.push(tlBox);
    }

    // Distinctive asymmetrical 4 vertical grille slots + 1 horizontal slot
    for (let k = 0; k < 4; k++) {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.095, 0.04), m.darkTrimMat);
      slot.position.set(0.14 + k * 0.04, 0.63, 1.682);
      bodyGroup.add(slot);
    }
    const hSlot = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.028, 0.04), m.darkTrimMat);
    hSlot.position.set(-0.20, 0.64, 1.682);
    bodyGroup.add(hSlot);

    // Front Lower Intake & License Plate Mount
    const lowerGrille = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.18, 0.04), m.darkTrimMat);
    lowerGrille.position.set(0, 0.39, 1.68);
    bodyGroup.add(lowerGrille);

    const frontPlate = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.15, 0.06), m.darkTrimMat);
    frontPlate.position.set(0.03, 0.40, 1.695);
    bodyGroup.add(frontPlate);

    const rearPlate = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.05), m.darkTrimMat);
    rearPlate.position.set(0, 0.40, -1.685);
    bodyGroup.add(rearPlate);

    // Suzuki 'S' Badges (Front & Rear) + Rear Tailgate Handle
    for (const bz of [1.685, -1.66]) {
      const badge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.03), m.chromeMat);
      badge.position.set(0, bz > 0 ? 0.63 : 0.82, bz);
      badge.rotation.z = Math.PI / 4;
      bodyGroup.add(badge);
    }

    const rearHandle = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.04), m.darkTrimMat);
    rearHandle.position.set(0, 0.71, -1.665);
    bodyGroup.add(rearHandle);
  }

  buildWheels() {
    const m = this.materials;

    const createWheel = (name, x, y, z, isLeft) => {
      const wheelNode = new THREE.Group();
      wheelNode.name = name;
      wheelNode.position.set(x, y, z);

      // Tyre cylinder centered at local (0, 0, 0), axis along X
      const tyreGeo = new THREE.CylinderGeometry(0.366, 0.366, 0.175, 36);
      tyreGeo.rotateZ(Math.PI / 2);
      const tyreMesh = new THREE.Mesh(tyreGeo, m.tyreMat);
      tyreMesh.name = name + '_Tyre';
      tyreMesh.castShadow = true;
      wheelNode.add(tyreMesh);

      // Silver hubcap base disc
      const hubSign = isLeft ? 1 : -1;
      const rimGeo = new THREE.CylinderGeometry(0.255, 0.255, 0.182, 24);
      rimGeo.rotateZ(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, m.darkTrimMat);
      wheelNode.add(rimMesh);

      const centerCapGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.19, 24);
      centerCapGeo.rotateZ(Math.PI / 2);
      wheelNode.add(new THREE.Mesh(centerCapGeo, m.silverRimMat));

      const outerRingGeo = new THREE.TorusGeometry(0.23, 0.025, 12, 28);
      outerRingGeo.rotateY(Math.PI / 2);
      const outerRing = new THREE.Mesh(outerRingGeo, m.silverRimMat);
      outerRing.position.x = hubSign * 0.088;
      wheelNode.add(outerRing);

      // 6-spoke wheel cover
      for (let s = 0; s < 6; s++) {
        const angle = (s / 6) * Math.PI * 2;
        const spokeGeo = new THREE.BoxGeometry(0.025, 0.23, 0.058);
        const spoke = new THREE.Mesh(spokeGeo, m.silverRimMat);
        spoke.position.set(hubSign * 0.088, Math.cos(angle) * 0.12, Math.sin(angle) * 0.12);
        spoke.rotation.x = -angle;
        wheelNode.add(spoke);
      }

      this.group.add(wheelNode);
      return wheelNode;
    };

    this.wheelNodes.fl = createWheel('Wheel_FL',  0.645, 0.366,  1.213, true);
    this.wheelNodes.fr = createWheel('Wheel_FR', -0.645, 0.366,  1.213, false);
    this.wheelNodes.rl = createWheel('Wheel_RL',  0.645, 0.366, -1.213, true);
    this.wheelNodes.rr = createWheel('Wheel_RR', -0.645, 0.366, -1.213, false);
  }

  buildGroundShadow() {
    const shadowGeo = new THREE.PlaneGeometry(1.75, 3.5);
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
    [-0.50, 0.50].forEach((x) => {
      const spot = new THREE.SpotLight(0xfffaea, 0, 40, Math.PI / 6, 0.45, 1.2);
      spot.position.set(x, 0.68, 1.65);
      spot.target.position.set(x, 0, 18);
      this.chassisGroup.add(spot);
      this.chassisGroup.add(spot.target);
      this.headlightSpots.push(spot);

      const coneGeo = new THREE.ConeGeometry(2.0, 14, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0xfff6dd,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(x, 0.68, 8.5);
      cone.rotation.x = -Math.PI / 2;
      cone.visible = false;
      this.chassisGroup.add(cone);
      this.headlightCones.push(cone);
    });
  }

  setSteeringAngle(angle) {
    this.steeringAngle = angle;
    if (this.wheelNodes.fl) {
      this.wheelNodes.fl.rotation.set(this.wheelRotations.fl, angle, 0, 'YXZ');
    }
    if (this.wheelNodes.fr) {
      this.wheelNodes.fr.rotation.set(this.wheelRotations.fr, angle, 0, 'YXZ');
    }
  }

  spinWheels(distanceTraveled) {
    const deltaAngle = distanceTraveled / 0.366;
    for (const key of ['fl', 'fr', 'rl', 'rr']) {
      this.wheelRotations[key] += deltaAngle;
      const node = this.wheelNodes[key];
      if (node) {
        const steer = key.startsWith('f') ? this.steeringAngle : 0;
        node.rotation.set(this.wheelRotations[key], steer, 0, 'YXZ');
      }
    }
  }

  setChassisDynamics(pitch, roll) {
    this.chassisGroup.rotation.x = pitch;
    this.chassisGroup.rotation.z = roll;
  }

  setHeadlights(enabled) {
    const intensity = enabled ? 3.5 : 0;
    this.headlightSpots.forEach((spot) => (spot.intensity = intensity));
    this.headlightCones.forEach((cone) => {
      cone.visible = enabled;
      cone.material.opacity = enabled ? 0.16 : 0;
    });
  }

  setBrakeLights(enabled) {
    this.materials.tailLightMat.emissiveIntensity = enabled ? 2.5 : 0.35;
    this.materials.tailLightMat.emissive.setHex(enabled ? 0xff1118 : 0x440808);
  }

  setReverseLights(enabled) {}

  setBoost(active) {}
}
