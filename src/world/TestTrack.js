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
    this.buildSinesBuilding();
    this.buildAutumnVegetation();
    this.buildStreetLights();
    this.buildRoadSigns();
  }

  createMaterials() {
    return {
      grass: new THREE.MeshStandardMaterial({
        color: 0x6e783a, // warm golden autumn grass
        roughness: 0.85,
        metalness: 0.05
      }),
      asphalt: new THREE.MeshStandardMaterial({
        color: 0x34383f,
        roughness: 0.80,
        metalness: 0.1
      }),
      plazaAsphalt: new THREE.MeshStandardMaterial({
        color: 0x2f333a,
        roughness: 0.82,
        metalness: 0.08
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
      buildingWall: new THREE.MeshStandardMaterial({
        color: 0xe6e2d8, // modern sandstone paneling
        roughness: 0.75
      }),
      buildingGlass: new THREE.MeshStandardMaterial({
        color: 0x1d3557, // reflective architectural glass
        roughness: 0.15,
        metalness: 0.85
      }),
      buildingTrim: new THREE.MeshStandardMaterial({
        color: 0x0f1c2e, // deep navy accent
        roughness: 0.4,
        metalness: 0.3
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
    // Vast ground terrain (800m x 800m per AGENTS.md standards)
    const groundGeo = new THREE.PlaneGeometry(800, 800);
    const ground = new THREE.Mesh(groundGeo, this.materials.grass);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.01, 100);
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  buildRoadNetwork() {
    // 1. Main Straight Avenue (Gate 2 to SINES: Z = -45 to Z = 210, 255m long)
    const mainRoadGeo = new THREE.PlaneGeometry(14, 255);
    const mainRoad = new THREE.Mesh(mainRoadGeo, this.materials.asphalt);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.set(0, 0.01, 82.5);
    mainRoad.receiveShadow = true;
    this.scene.add(mainRoad);

    // Center Dashed Yellow Lines along avenue
    const dashLength = 3.5;
    const dashGap = 3.5;
    const totalDashes = 35;
    for (let i = 0; i < totalDashes; i++) {
      const dashGeo = new THREE.PlaneGeometry(0.25, dashLength);
      const dash = new THREE.Mesh(dashGeo, this.materials.roadYellow);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.02, -40 + i * (dashLength + dashGap));
      this.scene.add(dash);
    }

    // White Edge Boundary Lines
    [-6.2, 6.2].forEach((x) => {
      const edgeGeo = new THREE.PlaneGeometry(0.3, 255);
      const edgeLine = new THREE.Mesh(edgeGeo, this.materials.roadMarking);
      edgeLine.rotation.x = -Math.PI / 2;
      edgeLine.position.set(x, 0.02, 82.5);
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

    // 3. SINES Arrival Forecourt Plaza & Roundabout (Z = 210 to Z = 275)
    const plazaGeo = new THREE.PlaneGeometry(64, 65);
    const plaza = new THREE.Mesh(plazaGeo, this.materials.plazaAsphalt);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(0, 0.012, 242.5);
    plaza.receiveShadow = true;
    this.scene.add(plaza);

    // Central Landscaped Roundabout Island (Z = 230, radius = 9m)
    const islandGeo = new THREE.CylinderGeometry(8.5, 8.5, 0.25, 32);
    const island = new THREE.Mesh(islandGeo, this.materials.grass);
    island.position.set(0, 0.125, 230);
    island.receiveShadow = true;
    this.scene.add(island);

    // Roundabout outer curb ring
    const ringGeo = new THREE.TorusGeometry(8.5, 0.2, 8, 32);
    const ring = new THREE.Mesh(ringGeo, this.materials.curbWhite);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, 0.15, 230);
    this.scene.add(ring);

    // Central Flagpole on Roundabout Island
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 9.5, 12);
    const pole = new THREE.Mesh(poleGeo, this.materials.metalPole);
    pole.position.set(0, 4.75, 230);
    pole.castShadow = true;
    this.scene.add(pole);

    // Flag (NUST Navy & Gold)
    const flagGeo = new THREE.PlaneGeometry(2.4, 1.4);
    const flagMat = new THREE.MeshStandardMaterial({
      color: 0x1b2838,
      side: THREE.DoubleSide
    });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(1.2, 8.6, 230);
    flag.castShadow = true;
    this.scene.add(flag);

    // Parking Bays / Lines along SINES plaza
    for (let i = 0; i < 6; i++) {
      [-22, 22].forEach((x) => {
        const stallGeo = new THREE.PlaneGeometry(5.2, 0.18);
        const stall = new THREE.Mesh(stallGeo, this.materials.roadMarking);
        stall.rotation.x = -Math.PI / 2;
        stall.position.set(x, 0.02, 218 + i * 4.2);
        this.scene.add(stall);
      });
    }

    // Curbs along road edges
    this.buildCurbs(-7.1, 255, 82.5);
    this.buildCurbs(7.1, 70, -15);
    this.buildCurbs(7.1, 155, 142.5);
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

  buildSinesBuilding() {
    // SINES (School of Interdisciplinary Engineering & Sciences) Landmark
    // Continuous polygonal architecture at Z = 265
    const sinesGroup = new THREE.Group();
    sinesGroup.position.set(0, 0, 265);

    // 1. Main Academic Complex Body (3-story research facility: 54m x 15m x 18m)
    const mainBodyGeo = new THREE.BoxGeometry(54, 15, 18);
    const mainBody = new THREE.Mesh(mainBodyGeo, this.materials.buildingWall);
    mainBody.position.set(0, 7.5, 0);
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    sinesGroup.add(mainBody);

    // 2. Central Glass Atrium Facade (26m wide, 13m high, projecting slightly forward)
    const glassGeo = new THREE.BoxGeometry(26, 13, 0.4);
    const glass = new THREE.Mesh(glassGeo, this.materials.buildingGlass);
    glass.position.set(0, 6.8, -9.1);
    glass.castShadow = true;
    sinesGroup.add(glass);

    // Horizontal structural floor bands across glass atrium
    [3.8, 7.8, 11.8].forEach((y) => {
      const mullionGeo = new THREE.BoxGeometry(26.4, 0.35, 0.6);
      const mullion = new THREE.Mesh(mullionGeo, this.materials.buildingTrim);
      mullion.position.set(0, y, -9.1);
      sinesGroup.add(mullion);
    });

    // Vertical structural mullions
    [-9, -4.5, 0, 4.5, 9].forEach((x) => {
      const vertMullionGeo = new THREE.BoxGeometry(0.35, 13, 0.6);
      const vertMullion = new THREE.Mesh(vertMullionGeo, this.materials.buildingTrim);
      vertMullion.position.set(x, 6.8, -9.1);
      sinesGroup.add(vertMullion);
    });

    // 3. Stepped Setback Roof Structure / Penthouse Laboratories (36m x 4.5m x 12m)
    const roofGeo = new THREE.BoxGeometry(36, 4.5, 12);
    const roof = new THREE.Mesh(roofGeo, this.materials.buildingWall);
    roof.position.set(0, 17.25, 0);
    roof.castShadow = true;
    sinesGroup.add(roof);

    // Roof Parapet Trim in NUST Navy
    const parapetGeo = new THREE.BoxGeometry(36.4, 0.6, 12.4);
    const parapet = new THREE.Mesh(parapetGeo, this.materials.buildingTrim);
    parapet.position.set(0, 19.6, 0);
    sinesGroup.add(parapet);

    // Rooftop Antenna Mast
    const mastGeo = new THREE.CylinderGeometry(0.08, 0.16, 7.5, 8);
    const mast = new THREE.Mesh(mastGeo, this.materials.metalPole);
    mast.position.set(-10, 23.2, 0);
    sinesGroup.add(mast);

    // 4. Grand Entrance Portico / Canopy
    const canopyGeo = new THREE.BoxGeometry(18, 0.6, 7.5);
    const canopy = new THREE.Mesh(canopyGeo, this.materials.buildingTrim);
    canopy.position.set(0, 4.4, -12.5);
    canopy.castShadow = true;
    sinesGroup.add(canopy);

    // Entrance Support Pillars (4 architectural pillars)
    [-7.5, -2.5, 2.5, 7.5].forEach((x) => {
      const pillarGeo = new THREE.BoxGeometry(0.8, 4.2, 0.8);
      const pillar = new THREE.Mesh(pillarGeo, this.materials.gatePillar);
      pillar.position.set(x, 2.1, -15.8);
      pillar.castShadow = true;
      sinesGroup.add(pillar);
    });

    // 5. High-Resolution Signage Banner on Canopy Front
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 1024;
    bannerCanvas.height = 192;
    const bctx = bannerCanvas.getContext('2d');

    // Navy & Gold gradient background
    bctx.fillStyle = '#0f1c2e';
    bctx.fillRect(0, 0, 1024, 192);
    bctx.strokeStyle = '#d4af37'; // gold trim
    bctx.lineWidth = 8;
    bctx.strokeRect(8, 8, 1008, 176);

    bctx.fillStyle = '#ffffff';
    bctx.font = 'bold 54px "Segoe UI", Arial, sans-serif';
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';
    bctx.fillText('S I N E S  •  N U S T', 512, 68);

    bctx.fillStyle = '#ffbe76'; // warm gold subtitle
    bctx.font = '600 24px "Segoe UI", Arial, sans-serif';
    bctx.fillText('SCHOOL OF INTERDISCIPLINARY ENGINEERING & SCIENCES', 512, 126);

    const bannerTex = new THREE.CanvasTexture(bannerCanvas);
    const bannerGeo = new THREE.PlaneGeometry(17.6, 1.6);
    const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex });
    const bannerMesh = new THREE.Mesh(bannerGeo, bannerMat);
    bannerMesh.position.set(0, 4.6, -16.26);
    sinesGroup.add(bannerMesh);

    // Sliding glass main entry doors
    const doorGeo = new THREE.PlaneGeometry(5.2, 2.8);
    const doorMat = new THREE.MeshBasicMaterial({ color: 0x81ecec, transparent: true, opacity: 0.6 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 1.4, -9.32);
    sinesGroup.add(door);

    // Warm architectural spot downlights on entrance
    const canopyLight = new THREE.SpotLight(0xffeedd, 2.5, 18, Math.PI / 3, 0.5, 1.2);
    canopyLight.position.set(0, 4.2, -12.5);
    canopyLight.target.position.set(0, 0, -12.5);
    sinesGroup.add(canopyLight);
    sinesGroup.add(canopyLight.target);

    this.scene.add(sinesGroup);
  }

  buildAutumnVegetation() {
    // Autumn tree placements along the avenue and around grounds
    const treePositions = [
      // Left roadside avenue (Gate 2 to SINES)
      { x: -11, z: -10, scale: 1.1, type: 'orange' },
      { x: -12, z: 12, scale: 1.3, type: 'gold' },
      { x: -11, z: 34, scale: 1.0, type: 'crimson' },
      { x: -12, z: 56, scale: 1.2, type: 'orange' },
      { x: -11, z: 78, scale: 1.4, type: 'gold' },
      { x: -12, z: 100, scale: 1.1, type: 'crimson' },
      { x: -11, z: 124, scale: 1.3, type: 'orange' },
      { x: -12, z: 148, scale: 1.2, type: 'gold' },
      { x: -11, z: 172, scale: 1.4, type: 'crimson' },
      { x: -12, z: 196, scale: 1.2, type: 'orange' },

      // Right roadside avenue (Gate 2 to SINES)
      { x: 11, z: -10, scale: 1.2, type: 'gold' },
      { x: 12, z: 12, scale: 1.0, type: 'crimson' },
      { x: 12, z: 78, scale: 1.3, type: 'orange' },
      { x: 11, z: 100, scale: 1.2, type: 'gold' },
      { x: 12, z: 124, scale: 1.1, type: 'crimson' },
      { x: 11, z: 148, scale: 1.3, type: 'orange' },
      { x: 12, z: 172, scale: 1.2, type: 'gold' },
      { x: 11, z: 196, scale: 1.4, type: 'crimson' },

      // Skid pad outer boundary
      { x: 58, z: 30, scale: 1.3, type: 'orange' },
      { x: 59, z: 46, scale: 1.2, type: 'gold' },
      { x: 57, z: 62, scale: 1.4, type: 'crimson' },
      { x: 38, z: 76, scale: 1.1, type: 'orange' },
      { x: 22, z: 77, scale: 1.3, type: 'gold' },

      // SINES Plaza Grounds
      { x: -28, z: 215, scale: 1.3, type: 'gold' },
      { x: -30, z: 240, scale: 1.4, type: 'orange' },
      { x: -28, z: 265, scale: 1.2, type: 'crimson' },
      { x: 28, z: 215, scale: 1.2, type: 'orange' },
      { x: 30, z: 240, scale: 1.3, type: 'crimson' },
      { x: 28, z: 265, scale: 1.4, type: 'gold' }
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
      { x: -8.5, z: 120 },
      { x: -8.5, z: 160 },
      { x: -8.5, z: 200 },
      { x: 8.5, z: 0 },
      { x: 8.5, z: 80 },
      { x: 8.5, z: 120 },
      { x: 8.5, z: 160 },
      { x: 8.5, z: 200 }
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
    // 1. Directional Signboard at Gate 2: "SINES -> 250 M"
    this.createDirectionSign(-8.4, 15, 'SINES', '250 M  ➔');

    // 2. Midpoint Signboard at Z = 110: "SINES -> 140 M"
    this.createDirectionSign(-8.4, 110, 'SINES', '140 M  ➔');

    // 3. Final Approach Signboard at Z = 185: "SINES ➔ 45 M"
    this.createDirectionSign(-8.4, 185, 'SINES', '45 M  ➔');

    // 4. Overhead Welcome Archway at Z = 208 (Plaza Entrance)
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, 208);

    [-8.2, 8.2].forEach((x) => {
      const pGeo = new THREE.CylinderGeometry(0.18, 0.22, 6.2, 12);
      const p = new THREE.Mesh(pGeo, this.materials.metalPole);
      p.position.set(x, 3.1, 0);
      p.castShadow = true;
      archGroup.add(p);
    });

    const beamGeo = new THREE.BoxGeometry(17.2, 0.8, 0.4);
    const beam = new THREE.Mesh(beamGeo, this.materials.buildingTrim);
    beam.position.set(0, 5.8, 0);
    archGroup.add(beam);

    const archCanvas = document.createElement('canvas');
    archCanvas.width = 1024;
    archCanvas.height = 128;
    const actx = archCanvas.getContext('2d');
    actx.fillStyle = '#0f1c2e';
    actx.fillRect(0, 0, 1024, 128);
    actx.strokeStyle = '#d4af37';
    actx.lineWidth = 6;
    actx.strokeRect(6, 6, 1012, 116);
    actx.fillStyle = '#ffffff';
    actx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
    actx.textAlign = 'center';
    actx.textBaseline = 'middle';
    actx.fillText('WELCOME TO SINES  •  NUST CAMPUS', 512, 64);

    const archTex = new THREE.CanvasTexture(archCanvas);
    const archSignMesh = new THREE.Mesh(new THREE.PlaneGeometry(16.0, 1.1), new THREE.MeshBasicMaterial({ map: archTex }));
    archSignMesh.position.set(0, 5.8, -0.22);
    archSignMesh.rotation.y = Math.PI; // facing car coming from Gate 2 (+Z direction)
    archGroup.add(archSignMesh);

    this.scene.add(archGroup);
  }

  createDirectionSign(x, z, topText, bottomText) {
    const signGroup = new THREE.Group();
    signGroup.position.set(x, 0, z);

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
    ctx.fillText(topText, 256, 95);
    ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
    ctx.fillText(bottomText, 256, 175);

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
