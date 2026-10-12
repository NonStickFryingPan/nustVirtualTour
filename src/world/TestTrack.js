import * as THREE from 'three';

/**
 * Test Track & NUST Gate 2 Grounds
 * Provides:
 * - High grip asphalt circuit & open skid pad
 * - NUST Gate 2 landmark archway & SINES directional signs
 * - Slalom agility cones for steering/handling tests
 * - Suspension ramps and speed bumps
 * - Clustered low-poly autumn trees and streetlights
 */
export class TestTrack {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.cones = [];

    this.materials = this.createMaterials();
    this.buildGround();
    this.buildRoadNetwork();
    this.buildGate2Arch();
    this.buildSlalomCourse();
    this.buildSuspensionRamp();
    this.buildAutumnVegetation();
    this.buildStreetLights();
    this.buildRoadSigns();
  }

  createMaterials() {
    return {
      grass: new THREE.MeshStandardMaterial({
        color: 0x3d4a26, // dry autumn grass
        roughness: 0.9,
        metalness: 0.05
      }),
      asphalt: new THREE.MeshStandardMaterial({
        color: 0x222428,
        roughness: 0.85,
        metalness: 0.1
      }),
      roadMarking: new THREE.MeshBasicMaterial({
        color: 0xf5f6fa
      }),
      roadYellow: new THREE.MeshBasicMaterial({
        color: 0xfbc531
      }),
      curbRed: new THREE.MeshStandardMaterial({
        color: 0xc23616,
        roughness: 0.8
      }),
      curbWhite: new THREE.MeshStandardMaterial({
        color: 0xf5f6fa,
        roughness: 0.8
      }),
      coneOrange: new THREE.MeshStandardMaterial({
        color: 0xe67e22,
        roughness: 0.4
      }),
      coneWhite: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4
      }),
      gatePillar: new THREE.MeshStandardMaterial({
        color: 0xded8cc, // sand/limestone concrete
        roughness: 0.75
      }),
      gateNavy: new THREE.MeshStandardMaterial({
        color: 0x1b2838, // NUST navy
        roughness: 0.5
      }),
      treeTrunk: new THREE.MeshStandardMaterial({
        color: 0x4a3728,
        roughness: 0.9
      }),
      foliageOrange: new THREE.MeshStandardMaterial({
        color: 0xd35400,
        roughness: 0.8
      }),
      foliageGold: new THREE.MeshStandardMaterial({
        color: 0xf39c12,
        roughness: 0.8
      }),
      foliageCrimson: new THREE.MeshStandardMaterial({
        color: 0x962d22,
        roughness: 0.8
      }),
      metalPole: new THREE.MeshStandardMaterial({
        color: 0x57606f,
        roughness: 0.5,
        metalness: 0.6
      }),
      lampGlow: new THREE.MeshBasicMaterial({
        color: 0xffeaa7
      })
    };
  }

  buildGround() {
    // Vast ground terrain
    const groundGeo = new THREE.PlaneGeometry(240, 240);
    const ground = new THREE.Mesh(groundGeo, this.materials.grass);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  buildRoadNetwork() {
    // 1. Main Straight Road (Gate 2 to SINES direction)
    // 14m wide, 160m long
    const mainRoadGeo = new THREE.PlaneGeometry(14, 160);
    const mainRoad = new THREE.Mesh(mainRoadGeo, this.materials.asphalt);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.set(0, 0.01, 30);
    mainRoad.receiveShadow = true;
    this.scene.add(mainRoad);

    // Center Dashed Yellow Lines
    const dashLength = 3.5;
    const dashGap = 3.5;
    const totalDashes = 18;
    for (let i = 0; i < totalDashes; i++) {
      const dashGeo = new THREE.PlaneGeometry(0.25, dashLength);
      const dash = new THREE.Mesh(dashGeo, this.materials.roadYellow);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.02, -45 + i * (dashLength + dashGap));
      this.scene.add(dash);
    }

    // White Edge Boundary Lines
    [-6.2, 6.2].forEach((x) => {
      const edgeGeo = new THREE.PlaneGeometry(0.3, 160);
      const edgeLine = new THREE.Mesh(edgeGeo, this.materials.roadMarking);
      edgeLine.rotation.x = -Math.PI / 2;
      edgeLine.position.set(x, 0.02, 30);
      this.scene.add(edgeLine);
    });

    // 2. Large Asphalt Skid Pad / Agility Test Arena (to the right of the road)
    const padGeo = new THREE.PlaneGeometry(48, 55);
    const pad = new THREE.Mesh(padGeo, this.materials.asphalt);
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(31, 0.01, 45);
    pad.receiveShadow = true;
    this.scene.add(pad);

    // Connector road to skid pad
    const connGeo = new THREE.PlaneGeometry(14, 16);
    const conn = new THREE.Mesh(connGeo, this.materials.asphalt);
    conn.rotation.x = -Math.PI / 2;
    conn.position.set(14, 0.01, 45);
    conn.receiveShadow = true;
    this.scene.add(conn);

    // Curbs along road edges
    this.buildCurbs(-7.1, 160, 30);
    this.buildCurbs(7.1, 70, -15);
    this.buildCurbs(7.1, 60, 80);
  }

  buildCurbs(xPos, length, zCenter) {
    const curbGeo = new THREE.BoxGeometry(0.4, 0.16, length);
    const curb = new THREE.Mesh(curbGeo, this.materials.curbWhite);
    curb.position.set(xPos, 0.08, zCenter);
    curb.castShadow = true;
    curb.receiveShadow = true;
    this.scene.add(curb);
  }

  buildGate2Arch() {
    // Monumental NUST Gate 2 Gateway at Spawn (Z = -22)
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, -22);

    // Left and Right Pillars
    [-7.8, 7.8].forEach((x) => {
      // Base pedestal
      const baseGeo = new THREE.BoxGeometry(2.4, 1.2, 2.4);
      const base = new THREE.Mesh(baseGeo, this.materials.gatePillar);
      base.position.set(x, 0.6, 0);
      base.castShadow = true;
      gateGroup.add(base);

      // Main tower column
      const towerGeo = new THREE.BoxGeometry(1.8, 6.4, 1.8);
      const tower = new THREE.Mesh(towerGeo, this.materials.gatePillar);
      tower.position.set(x, 4.4, 0);
      tower.castShadow = true;
      gateGroup.add(tower);

      // Decorative top cap
      const capGeo = new THREE.BoxGeometry(2.2, 0.4, 2.2);
      const cap = new THREE.Mesh(capGeo, this.materials.gateNavy);
      cap.position.set(x, 7.8, 0);
      gateGroup.add(cap);
    });

    // Overhead Header Crossbeam
    const beamGeo = new THREE.BoxGeometry(17.4, 1.4, 1.6);
    const beam = new THREE.Mesh(beamGeo, this.materials.gateNavy);
    beam.position.set(0, 6.8, 0);
    beam.castShadow = true;
    gateGroup.add(beam);

    // Signboard banner: "NATIONAL UNIVERSITY OF SCIENCES & TECHNOLOGY"
    const signGeo = new THREE.BoxGeometry(12.0, 0.9, 0.1);
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 1024;
    signCanvas.height = 128;
    const ctx = signCanvas.getContext('2d');

    ctx.fillStyle = '#0f1a28';
    ctx.fillRect(0, 0, 1024, 128);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 1012, 116);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NUST GATE 2  •  ROUTE TO SINES', 512, 64);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex });
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(0, 6.8, 0.86);
    gateGroup.add(signMesh);

    // Security Guard Booth
    const boothGeo = new THREE.BoxGeometry(2.2, 2.8, 3.2);
    const booth = new THREE.Mesh(boothGeo, this.materials.gatePillar);
    booth.position.set(9.8, 1.4, 3.0);
    booth.castShadow = true;
    gateGroup.add(booth);

    // Booth roof
    const boothRoofGeo = new THREE.BoxGeometry(2.6, 0.3, 3.6);
    const boothRoof = new THREE.Mesh(boothRoofGeo, this.materials.gateNavy);
    boothRoof.position.set(9.8, 2.95, 3.0);
    gateGroup.add(boothRoof);

    this.scene.add(gateGroup);
  }

  buildSlalomCourse() {
    // 8 Traffic Cones in the skid pad area to test slalom maneuvering
    const coneCount = 7;
    const startZ = 24;
    const spacingZ = 6.5;

    for (let i = 0; i < coneCount; i++) {
      const coneGroup = new THREE.Group();
      // Alternating slalom lane
      const coneX = 31 + ((i % 2 === 0) ? -2.2 : 2.2);
      const coneZ = startZ + i * spacingZ;
      coneGroup.position.set(coneX, 0, coneZ);

      // Base plate
      const baseGeo = new THREE.BoxGeometry(0.48, 0.05, 0.48);
      const base = new THREE.Mesh(baseGeo, this.materials.coneOrange);
      coneGroup.add(base);

      // Cone Body
      const bodyGeo = new THREE.ConeGeometry(0.18, 0.72, 12);
      const coneBody = new THREE.Mesh(bodyGeo, this.materials.coneOrange);
      coneBody.position.y = 0.38;
      coneBody.castShadow = true;
      coneGroup.add(coneBody);

      // White reflective band
      const stripeGeo = new THREE.CylinderGeometry(0.10, 0.13, 0.16, 12);
      const stripe = new THREE.Mesh(stripeGeo, this.materials.coneWhite);
      stripe.position.y = 0.38;
      coneGroup.add(stripe);

      this.scene.add(coneGroup);
      this.cones.push(coneGroup);
    }
  }

  buildSuspensionRamp() {
    // Suspension test ramp & speed bump zone (located along main road at Z = 50)
    const rampGroup = new THREE.Group();
    rampGroup.position.set(0, 0, 68);

    // Low-poly incline wedge
    // Incline up
    const upRampGeo = new THREE.BoxGeometry(5.6, 0.32, 3.2);
    const upRamp = new THREE.Mesh(upRampGeo, this.materials.asphalt);
    upRamp.position.set(-2.8, 0.14, 0);
    upRamp.rotation.x = -0.09;
    upRamp.castShadow = true;
    rampGroup.add(upRamp);

    // Plateau
    const platGeo = new THREE.BoxGeometry(5.6, 0.32, 2.0);
    const plat = new THREE.Mesh(platGeo, this.materials.asphalt);
    plat.position.set(-2.8, 0.28, 2.5);
    plat.castShadow = true;
    rampGroup.add(plat);

    // Incline down
    const downRampGeo = new THREE.BoxGeometry(5.6, 0.32, 3.2);
    const downRamp = new THREE.Mesh(downRampGeo, this.materials.asphalt);
    downRamp.position.set(-2.8, 0.14, 5.0);
    downRamp.rotation.x = 0.09;
    downRamp.castShadow = true;
    rampGroup.add(downRamp);

    // Yellow hazard chevrons on ramp
    const markGeo = new THREE.PlaneGeometry(5.4, 0.3);
    const mark = new THREE.Mesh(markGeo, this.materials.roadYellow);
    mark.rotation.x = -Math.PI / 2 - 0.09;
    mark.position.set(-2.8, 0.30, -0.6);
    rampGroup.add(mark);

    this.scene.add(rampGroup);

    // Rubber Speed Bump at Z = 18
    const bumpGeo = new THREE.CylinderGeometry(0.18, 0.18, 12.8, 12, 1, false, 0, Math.PI);
    const bump = new THREE.Mesh(bumpGeo, this.materials.roadYellow);
    bump.rotation.z = Math.PI / 2;
    bump.position.set(0, 0.04, 18);
    bump.castShadow = true;
    this.scene.add(bump);
  }

  buildAutumnVegetation() {
    // Autumn tree placements along the avenue and around grounds
    const treePositions = [
      // Left roadside avenue
      { x: -11, z: -10, scale: 1.1, type: 'orange' },
      { x: -12, z: 12, scale: 1.3, type: 'gold' },
      { x: -11, z: 34, scale: 1.0, type: 'crimson' },
      { x: -12, z: 56, scale: 1.2, type: 'orange' },
      { x: -11, z: 78, scale: 1.4, type: 'gold' },
      { x: -12, z: 100, scale: 1.1, type: 'crimson' },

      // Right roadside avenue
      { x: 11, z: -10, scale: 1.2, type: 'gold' },
      { x: 12, z: 12, scale: 1.0, type: 'crimson' },
      { x: 12, z: 78, scale: 1.3, type: 'orange' },
      { x: 11, z: 100, scale: 1.2, type: 'gold' },

      // Skid pad outer boundary
      { x: 58, z: 30, scale: 1.3, type: 'orange' },
      { x: 59, z: 46, scale: 1.2, type: 'gold' },
      { x: 57, z: 62, scale: 1.4, type: 'crimson' },
      { x: 38, z: 76, scale: 1.1, type: 'orange' },
      { x: 22, z: 77, scale: 1.3, type: 'gold' }
    ];

    treePositions.forEach((tp) => {
      const tree = this.createLowPolyTree(tp.type);
      tree.position.set(tp.x, 0, tp.z);
      tree.scale.setScalar(tp.scale);
      this.scene.add(tree);
    });
  }

  createLowPolyTree(foliageType) {
    const treeGroup = new THREE.Group();

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.24, 0.42, 2.8, 6);
    const trunk = new THREE.Mesh(trunkGeo, this.materials.treeTrunk);
    trunk.position.y = 1.4;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Foliage Material
    let foliageMat = this.materials.foliageOrange;
    if (foliageType === 'gold') foliageMat = this.materials.foliageGold;
    if (foliageType === 'crimson') foliageMat = this.materials.foliageCrimson;

    // Multi-tier low-poly foliage (conical/dodecahedral puff layers)
    const tiers = [
      { y: 3.2, radius: 2.1, height: 2.2, sides: 7 },
      { y: 4.6, radius: 1.7, height: 2.0, sides: 6 },
      { y: 5.8, radius: 1.2, height: 1.8, sides: 5 }
    ];

    tiers.forEach((t) => {
      const coneGeo = new THREE.ConeGeometry(t.radius, t.height, t.sides);
      const foliage = new THREE.Mesh(coneGeo, foliageMat);
      foliage.position.y = t.y;
      foliage.rotation.y = Math.random() * Math.PI;
      foliage.castShadow = true;
      foliage.receiveShadow = true;
      treeGroup.add(foliage);
    });

    return treeGroup;
  }

  buildStreetLights() {
    const lightPositions = [
      { x: -8.5, z: 0 },
      { x: -8.5, z: 40 },
      { x: -8.5, z: 80 },
      { x: 8.5, z: 0 },
      { x: 8.5, z: 80 }
    ];

    lightPositions.forEach((pos) => {
      const lampGroup = new THREE.Group();
      lampGroup.position.set(pos.x, 0, pos.z);

      // Pole
      const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 6.2, 8);
      const pole = new THREE.Mesh(poleGeo, this.materials.metalPole);
      pole.position.y = 3.1;
      pole.castShadow = true;
      lampGroup.add(pole);

      // Arm extending over road
      const armDirection = pos.x < 0 ? 1 : -1;
      const armGeo = new THREE.BoxGeometry(1.6, 0.08, 0.08);
      const arm = new THREE.Mesh(armGeo, this.materials.metalPole);
      arm.position.set(armDirection * 0.7, 6.1, 0);
      lampGroup.add(arm);

      // Lamp housing
      const lampHousingGeo = new THREE.BoxGeometry(0.4, 0.12, 0.25);
      const lampHousing = new THREE.Mesh(lampHousingGeo, this.materials.metalPole);
      lampHousing.position.set(armDirection * 1.4, 6.05, 0);
      lampGroup.add(lampHousing);

      // Lamp glow lens
      const lensGeo = new THREE.BoxGeometry(0.36, 0.02, 0.22);
      const lens = new THREE.Mesh(lensGeo, this.materials.lampGlow);
      lens.position.set(armDirection * 1.4, 5.98, 0);
      lampGroup.add(lens);

      // Soft warm ground spotlight
      const spot = new THREE.SpotLight(0xffbe76, 1.2, 16, Math.PI / 4, 0.5, 1.5);
      spot.position.set(armDirection * 1.4, 5.9, 0);
      spot.target.position.set(armDirection * 1.4, 0, 0);
      lampGroup.add(spot);
      lampGroup.add(spot.target);

      this.scene.add(lampGroup);
    });
  }

  buildRoadSigns() {
    // Directional Signboard: "SINES -> 1.2 KM"
    const signGroup = new THREE.Group();
    signGroup.position.set(-8.4, 0, 15);

    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.2, 8);
    const post = new THREE.Mesh(postGeo, this.materials.metalPole);
    post.position.y = 1.6;
    post.castShadow = true;
    signGroup.add(post);

    const boardCanvas = document.createElement('canvas');
    boardCanvas.width = 512;
    boardCanvas.height = 256;
    const ctx = boardCanvas.getContext('2d');

    ctx.fillStyle = '#1b7a43'; // highway green
    ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 492, 236);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SINES', 256, 95);
    ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
    ctx.fillText('1.2 KM  ➔', 256, 175);

    const tex = new THREE.CanvasTexture(boardCanvas);
    const boardGeo = new THREE.BoxGeometry(1.6, 0.8, 0.06);
    const boardMat = new THREE.MeshBasicMaterial({ map: tex });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 2.5, 0);
    board.rotation.y = Math.PI / 2; // facing incoming car
    signGroup.add(board);

    this.scene.add(signGroup);
  }
}
