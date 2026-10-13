import * as THREE from 'three';

/**
 * Authentic NUST Gate 2 Avenue to SINES
 * Faithfully matches the reference image:
 * - Curving asphalt roadway sweeping right towards sunset
 * - Iconic alternating yellow & black hazard curb blocks
 * - Elevated sidewalk on RIGHT with stone retaining wall & bus stop shelter
 * - Gate 2 monument, pylon, and security gate on LEFT with official NUST crest
 * - Curved modern streetlights with hanging NUST navy blue banners
 * - SINES building visible down the road in the distance
 * - Low-poly white traffic car driving ahead
 * - Dense autumn trees with spreading canopies catching the sunset
 * 
 * Note on coordinate system (looking down +Z from camera):
 * - Screen LEFT corresponds to world +X
 * - Screen RIGHT corresponds to world -X
 */

export function getRoadCenter(z) {
  if (z < 25) return 0;
  const t = Math.min((z - 25) / 195, 1.0);
  // Sweeps towards screen right (-X in world coords) by ~22m
  return -t * t * 22.0;
}

export class TestTrack {
  constructor(scene) {
    this.scene = scene;
    this.materials = this.createMaterials();

    this.buildGround();
    this.buildRoadNetwork();
    this.buildGate2Monument();
    this.buildRightSidewalkAndRetainingWall();
    this.buildSinesBuilding();
    this.buildBusStopShelter();
    this.buildForwardTrafficCar();
    this.buildStreetLightsWithBanners();
    this.buildAutumnVegetation();
  }

  createMaterials() {
    return {
      grass: new THREE.MeshStandardMaterial({
        color: 0x6e7836, // warm golden autumn turf
        roughness: 0.88,
        metalness: 0.05
      }),
      asphalt: new THREE.MeshStandardMaterial({
        color: 0x363a42, // dark warm asphalt
        roughness: 0.70,
        metalness: 0.15
      }),
      roadMarking: new THREE.MeshBasicMaterial({
        color: 0xffffff
      }),
      // Pakistani / NUST Iconic Yellow & Black Hazard Curbs
      curbYellow: new THREE.MeshStandardMaterial({
        color: 0xf1c40f,
        roughness: 0.50
      }),
      curbBlack: new THREE.MeshStandardMaterial({
        color: 0x1e272e,
        roughness: 0.60
      }),
      sidewalkPaving: new THREE.MeshStandardMaterial({
        color: 0xb0b8be,
        roughness: 0.78
      }),
      retainingWallStone: new THREE.MeshStandardMaterial({
        color: 0x9e8d7a, // warm sandstone blocks
        roughness: 0.80
      }),
      wallCopingStone: new THREE.MeshStandardMaterial({
        color: 0xc4b4a0,
        roughness: 0.68
      }),
      gatePillar: new THREE.MeshStandardMaterial({
        color: 0x57606f, // modern architectural concrete
        roughness: 0.65
      }),
      gateDarkMetal: new THREE.MeshStandardMaterial({
        color: 0x22252a,
        roughness: 0.45,
        metalness: 0.80
      }),
      metalPole: new THREE.MeshStandardMaterial({
        color: 0x747d8c,
        roughness: 0.35,
        metalness: 0.75
      }),
      lampGlow: new THREE.MeshBasicMaterial({
        color: 0xfff0aa
      }),
      treeTrunk: new THREE.MeshStandardMaterial({
        color: 0x422d1e,
        roughness: 0.90
      }),
      foliageGold: new THREE.MeshStandardMaterial({
        color: 0xf39c12, // bright golden yellow
        roughness: 0.75
      }),
      foliageOrange: new THREE.MeshStandardMaterial({
        color: 0xe67e22, // fiery autumn orange
        roughness: 0.75
      }),
      foliageCrimson: new THREE.MeshStandardMaterial({
        color: 0xc0392b, // deep maple red
        roughness: 0.75
      }),
      foliageYellow: new THREE.MeshStandardMaterial({
        color: 0xf1c40f,
        roughness: 0.70
      }),
      hedgeGreen: new THREE.MeshStandardMaterial({
        color: 0x4a5822,
        roughness: 0.82
      }),
      buildingWall: new THREE.MeshStandardMaterial({
        color: 0xd6d2cb,
        roughness: 0.75
      }),
      buildingGlass: new THREE.MeshStandardMaterial({
        color: 0x22364c,
        roughness: 0.12,
        metalness: 0.85
      }),
      shelterGlass: new THREE.MeshStandardMaterial({
        color: 0x81ecec,
        transparent: true,
        opacity: 0.45,
        roughness: 0.10
      }),
      trafficCarWhite: new THREE.MeshStandardMaterial({
        color: 0xfafafa,
        roughness: 0.22,
        metalness: 0.1
      })
    };
  }

  buildGround() {
    const groundGeo = new THREE.PlaneGeometry(1000, 1000);
    const ground = new THREE.Mesh(groundGeo, this.materials.grass);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.01, 100);
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  buildRoadNetwork() {
    const roadWidth = 14.0; // wide campus avenue
    const zStart = -35;
    const zEnd = 245;
    const step = 2.0;
    const segments = Math.floor((zEnd - zStart) / step);

    // 1. Curving Asphalt Road Strip
    const roadGeo = new THREE.BufferGeometry();
    const positions = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i <= segments; i++) {
      const z = zStart + i * step;
      const cx = getRoadCenter(z);

      // In world coords: +X is screen LEFT, -X is screen RIGHT
      const xLeft = cx + roadWidth / 2;  // Screen Left
      const xRight = cx - roadWidth / 2; // Screen Right

      positions.push(xLeft, 0.01, z);
      positions.push(xRight, 0.01, z);

      uvs.push(0, (z - zStart) * 0.1);
      uvs.push(1, (z - zStart) * 0.1);

      if (i < segments) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    roadGeo.setIndex(indices);
    roadGeo.computeVertexNormals();

    const roadMesh = new THREE.Mesh(roadGeo, this.materials.asphalt);
    roadMesh.receiveShadow = true;
    this.scene.add(roadMesh);

    // 2. White Dashed Lane Dividers (Dual Lane markings)
    const dashLength = 3.6;
    const dashGap = 3.6;
    const totalDist = zEnd - zStart;
    const dashSteps = Math.floor(totalDist / (dashLength + dashGap));

    // Center dashed divider
    for (let d = 0; d < dashSteps; d++) {
      const zMid = zStart + 4 + d * (dashLength + dashGap);
      const cx = getRoadCenter(zMid);

      const dashGeo = new THREE.PlaneGeometry(0.24, dashLength);
      const dash = new THREE.Mesh(dashGeo, this.materials.roadMarking);
      dash.rotation.x = -Math.PI / 2;

      const nextX = getRoadCenter(zMid + 2);
      const angleY = Math.atan2(nextX - cx, 2);
      dash.rotation.z = -angleY;

      dash.position.set(cx, 0.02, zMid);
      this.scene.add(dash);
    }

    // 3. Iconic Pakistani Alternating Yellow & Black Curbs
    this.buildAlternatingHazardCurbs(zStart, zEnd, roadWidth);
  }

  buildAlternatingHazardCurbs(zStart, zEnd, roadWidth) {
    const curbStep = 1.35; // length of each curb block
    const curbCount = Math.floor((zEnd - zStart) / curbStep);
    const curbW = 0.38;
    const curbH = 0.18;

    for (let i = 0; i < curbCount; i++) {
      const z = zStart + i * curbStep + curbStep / 2;
      const cx = getRoadCenter(z);
      const nextCx = getRoadCenter(z + 1.5);
      const angleY = Math.atan2(nextCx - cx, 1.5);

      const isYellow = i % 2 === 0;
      const mat = isYellow ? this.materials.curbYellow : this.materials.curbBlack;

      // Screen LEFT Curb (world +X side)
      const xLeft = cx + roadWidth / 2 + curbW / 2;
      const curbLeftGeo = new THREE.BoxGeometry(curbW, curbH, curbStep * 0.98);
      const curbLeft = new THREE.Mesh(curbLeftGeo, mat);
      curbLeft.position.set(xLeft, curbH / 2, z);
      curbLeft.rotation.y = angleY;
      curbLeft.castShadow = true;
      curbLeft.receiveShadow = true;
      this.scene.add(curbLeft);

      // Screen RIGHT Curb (world -X side)
      const xRight = cx - roadWidth / 2 - curbW / 2;
      const curbRightGeo = new THREE.BoxGeometry(curbW, curbH, curbStep * 0.98);
      const curbRight = new THREE.Mesh(curbRightGeo, mat);
      curbRight.position.set(xRight, curbH / 2, z);
      curbRight.rotation.y = angleY;
      curbRight.castShadow = true;
      curbRight.receiveShadow = true;
      this.scene.add(curbRight);
    }
  }

  buildRightSidewalkAndRetainingWall() {
    // Screen RIGHT (world -X side)
    const zStart = -35;
    const zEnd = 245;
    const roadWidth = 14.0;
    const swWidth = 3.8; // pedestrian sidewalk
    const wallWidth = 0.44;
    const wallHeight = 0.90; // stone retaining wall
    const step = 2.5;
    const count = Math.floor((zEnd - zStart) / step);

    // 1. Paved Sidewalk Strip on Screen Right (-X)
    const swGeo = new THREE.BufferGeometry();
    const swPos = [];
    const swIndices = [];

    for (let i = 0; i <= count; i++) {
      const z = zStart + i * step;
      const cx = getRoadCenter(z);
      // Outer side of the right curb
      const xStart = cx - roadWidth / 2 - 0.38;
      const xEnd = xStart - swWidth;

      swPos.push(xStart, 0.12, z);
      swPos.push(xEnd, 0.12, z);

      if (i < count) {
        const base = i * 2;
        swIndices.push(base, base + 1, base + 2);
        swIndices.push(base + 1, base + 3, base + 2);
      }
    }

    swGeo.setAttribute('position', new THREE.Float32BufferAttribute(swPos, 3));
    swGeo.setIndex(swIndices);
    swGeo.computeVertexNormals();

    const swMesh = new THREE.Mesh(swGeo, this.materials.sidewalkPaving);
    swMesh.receiveShadow = true;
    this.scene.add(swMesh);

    // 2. Stone Retaining Wall on Screen Right (-X)
    for (let i = 0; i < count; i++) {
      const z = zStart + i * step + step / 2;
      const cx = getRoadCenter(z);
      const xWall = cx - roadWidth / 2 - 0.38 - swWidth - wallWidth / 2;

      const nextCx = getRoadCenter(z + 1.5);
      const angleY = Math.atan2(nextCx - cx, 1.5);

      // Wall Body (Horizontal Stone Block pattern)
      const wallGeo = new THREE.BoxGeometry(wallWidth, wallHeight, step);
      const wallMesh = new THREE.Mesh(wallGeo, this.materials.retainingWallStone);
      wallMesh.position.set(xWall, wallHeight / 2, z);
      wallMesh.rotation.y = angleY;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      this.scene.add(wallMesh);

      // Coping stone cap
      const capGeo = new THREE.BoxGeometry(wallWidth * 1.15, 0.09, step);
      const capMesh = new THREE.Mesh(capGeo, this.materials.wallCopingStone);
      capMesh.position.set(xWall, wallHeight + 0.045, z);
      capMesh.rotation.y = angleY;
      capMesh.castShadow = true;
      this.scene.add(capMesh);

      // Hedges and shrubs along the top / base of wall
      if (i % 2 === 0) {
        const hedgeGeo = new THREE.DodecahedronGeometry(0.52, 1);
        const hedge = new THREE.Mesh(hedgeGeo, this.materials.hedgeGreen);
        hedge.scale.set(1.4, 0.9, 1.8);
        hedge.position.set(xWall + 0.28, 0.40, z);
        hedge.castShadow = true;
        this.scene.add(hedge);
      }
    }
  }

  buildGate2Monument() {
    // Landmark: NUST Gate 2 Monument on Screen LEFT (world +X = +13.5, Z = 16)
    const gateGroup = new THREE.Group();
    gateGroup.position.set(13.5, 0, 16);
    gateGroup.rotation.y = -0.22; // angled slightly towards approaching traffic

    // 1. Tall Monolithic Concrete Pylon with NUST Crest & Sign
    // Wide front face (X = 4.8, Y = 8.2, Z = 2.6) facing incoming road traffic (-Z)
    const pylonGeo = new THREE.BoxGeometry(4.8, 8.2, 2.6);
    const pylon = new THREE.Mesh(pylonGeo, this.materials.gatePillar);
    pylon.position.set(0, 4.1, 0);
    pylon.castShadow = true;
    pylon.receiveShadow = true;
    gateGroup.add(pylon);

    // NUST Gate 2 Signboard Texture on front face facing the driver
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 768;
    const sctx = signCanvas.getContext('2d');

    // Dark architectural slate panel
    sctx.fillStyle = '#22272e';
    sctx.fillRect(0, 0, 512, 768);

    // Official NUST Starburst / Flower Crest in white/silver
    sctx.strokeStyle = '#ffffff';
    sctx.lineWidth = 6;
    sctx.beginPath();
    const cx = 256;
    const cy = 190;
    for (let p = 0; p < 12; p++) {
      const a = (p * Math.PI) / 6;
      sctx.moveTo(cx, cy);
      sctx.lineTo(cx + Math.cos(a) * 65, cy + Math.sin(a) * 65);
    }
    sctx.stroke();

    // Bold "NUST" typography
    sctx.fillStyle = '#ffffff';
    sctx.font = 'bold 84px "Segoe UI", Arial, sans-serif';
    sctx.textAlign = 'center';
    sctx.fillText('NUST', 256, 350);

    // Horizontal divider
    sctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    sctx.fillRect(90, 380, 332, 5);

    // "Gate 2" in bold white
    sctx.font = 'bold 74px "Segoe UI", Arial, sans-serif';
    sctx.fillText('Gate 2', 256, 500);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 5.4), signMat);
    // Positioned on the front face (-Z in local coords) facing incoming driver
    signMesh.position.set(0, 4.2, -1.31);
    signMesh.rotation.y = Math.PI;
    gateGroup.add(signMesh);

    // 2. Horizontal Canopy Beam extending over pedestrian gate entrance
    const beamGeo = new THREE.BoxGeometry(8.2, 1.3, 4.4);
    const beam = new THREE.Mesh(beamGeo, this.materials.gatePillar);
    beam.position.set(2.8, 6.8, 0);
    beam.castShadow = true;
    gateGroup.add(beam);

    // 3. Security Guard Booth
    const boothGeo = new THREE.BoxGeometry(2.8, 3.0, 3.4);
    const booth = new THREE.Mesh(boothGeo, this.materials.gatePillar);
    booth.position.set(5.2, 1.5, 0);
    booth.castShadow = true;
    gateGroup.add(booth);

    // Guard booth window facing road
    const winGeo = new THREE.PlaneGeometry(1.6, 1.2);
    const win = new THREE.Mesh(winGeo, this.materials.buildingGlass);
    win.position.set(2.79, 1.75, 0);
    win.rotation.y = -Math.PI / 2;
    gateGroup.add(win);

    // 4. Perimeter Fence Posts & Black Metal Railings
    for (let f = -4; f <= 4; f++) {
      if (Math.abs(f) < 2) continue;
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.8, 0.35), this.materials.gatePillar);
      post.position.set(0, 1.4, f * 2.2);
      gateGroup.add(post);

      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 1.8), this.materials.gateDarkMetal);
      rail.position.set(0, 1.4, f * 2.2 - 1.1);
      gateGroup.add(rail);
    }

    // Decorative shrubs around Gate 2 pylon
    for (let b = -3; b <= 3; b++) {
      const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 1), this.materials.hedgeGreen);
      bush.position.set(-1.5, 0.45, b * 1.1);
      bush.castShadow = true;
      gateGroup.add(bush);
    }

    this.scene.add(gateGroup);
  }

  buildBusStopShelter() {
    // Bus shelter on Screen RIGHT (-X side) at Z = 52
    const z = 52;
    const cx = getRoadCenter(z);
    const x = cx - 7.0 - 2.4; // Screen right sidewalk

    const shelterGroup = new THREE.Group();
    shelterGroup.position.set(x, 0.12, z);

    // Dark steel upright posts
    [-1.5, 1.5].forEach((postZ) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 8), this.materials.metalPole);
      post.position.set(-0.6, 1.3, postZ);
      post.castShadow = true;
      shelterGroup.add(post);
    });

    // Cantilever curved roof canopy
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 3.4), this.materials.metalPole);
    roof.position.set(-0.1, 2.58, 0);
    roof.castShadow = true;
    shelterGroup.add(roof);

    // Translucent glass rear panel
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 1.9), this.materials.shelterGlass);
    glass.position.set(-0.6, 1.45, 0);
    glass.rotation.y = Math.PI / 2;
    shelterGroup.add(glass);

    // Bench inside
    const bench = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 2.4), this.materials.treeTrunk);
    bench.position.set(-0.2, 0.48, 0);
    bench.castShadow = true;
    shelterGroup.add(bench);

    this.scene.add(shelterGroup);
  }

  buildForwardTrafficCar() {
    // Distant white traffic car driving ahead at Z = 74 into the sunset
    const z = 74;
    const cx = getRoadCenter(z);
    const carGroup = new THREE.Group();
    // In screen right lane (which is world -X side of center)
    carGroup.position.set(cx - 2.4, 0, z);

    // Body
    const bodyGeo = new THREE.BoxGeometry(1.48, 0.68, 3.2);
    const body = new THREE.Mesh(bodyGeo, this.materials.trafficCarWhite);
    body.position.y = 0.54;
    body.castShadow = true;
    carGroup.add(body);

    // Cabin glass
    const cabinGeo = new THREE.BoxGeometry(1.30, 0.54, 1.8);
    const cabin = new THREE.Mesh(cabinGeo, this.materials.buildingGlass);
    cabin.position.set(0, 1.02, -0.2);
    cabin.castShadow = true;
    carGroup.add(cabin);

    // Taillights
    [-0.54, 0.54].forEach((tx) => {
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.09, 0.04), this.materials.curbYellow);
      tail.position.set(tx, 0.54, -1.61);
      carGroup.add(tail);
    });

    // Wheels
    [[-0.72, 0.8], [0.72, 0.8], [-0.72, -0.9], [0.72, -0.9]].forEach(([wx, wz]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.15, 12), this.materials.curbBlack);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.26, wz);
      carGroup.add(wheel);
    });

    this.scene.add(carGroup);
  }

  buildStreetLightsWithBanners() {
    const lightZPositions = [12, 46, 84, 126, 168, 208];

    lightZPositions.forEach((z) => {
      const cx = getRoadCenter(z);

      // Screen LEFT light pole (+X side) with hanging NUST banner!
      this.createArchLightPole(cx + 7.8, z, -1, true);

      // Screen RIGHT light pole (-X side)
      this.createArchLightPole(cx - 7.8, z, 1, false);
    });
  }

  createArchLightPole(x, z, armDirection, hasBanner = false) {
    const lampGroup = new THREE.Group();
    lampGroup.position.set(x, 0, z);

    // Vertical steel pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 6.6, 8), this.materials.metalPole);
    pole.position.y = 3.3;
    pole.castShadow = true;
    lampGroup.add(pole);

    // Curved arm extending over road
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.09, 0.09), this.materials.metalPole);
    arm.position.set(armDirection * 0.85, 6.55, 0);
    lampGroup.add(arm);

    // Lamp housing & glow lens
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.13, 0.28), this.materials.metalPole);
    housing.position.set(armDirection * 1.65, 6.5, 0);
    lampGroup.add(housing);

    const lens = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.02, 0.24), this.materials.lampGlow);
    lens.position.set(armDirection * 1.65, 6.42, 0);
    lampGroup.add(lens);

    // Hanging NUST Navy Blue Banner
    if (hasBanner) {
      const bannerCanvas = document.createElement('canvas');
      bannerCanvas.width = 256;
      bannerCanvas.height = 512;
      const bctx = bannerCanvas.getContext('2d');

      // Navy background
      bctx.fillStyle = '#142032';
      bctx.fillRect(0, 0, 256, 512);

      // Gold border
      bctx.strokeStyle = '#d4af37';
      bctx.lineWidth = 5;
      bctx.strokeRect(10, 10, 236, 492);

      // White Starburst
      bctx.strokeStyle = '#ffffff';
      bctx.lineWidth = 3;
      bctx.beginPath();
      for (let p = 0; p < 8; p++) {
        const a = (p * Math.PI) / 4;
        bctx.moveTo(128, 100);
        bctx.lineTo(128 + Math.cos(a) * 35, 100 + Math.sin(a) * 35);
      }
      bctx.stroke();

      // Bold text
      bctx.fillStyle = '#ffffff';
      bctx.font = 'bold 44px "Segoe UI", Arial, sans-serif';
      bctx.textAlign = 'center';
      bctx.fillText('NUST', 128, 185);

      bctx.fillStyle = '#d4af37';
      bctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
      bctx.fillText('GATE 2', 128, 240);

      const bannerTex = new THREE.CanvasTexture(bannerCanvas);
      const bannerMat = new THREE.MeshStandardMaterial({
        map: bannerTex,
        roughness: 0.6,
        side: THREE.DoubleSide
      });

      const bannerMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 2.3), bannerMat);
      bannerMesh.position.set(0, 4.6, 0);
      bannerMesh.rotation.y = Math.PI / 2;
      lampGroup.add(bannerMesh);
    }

    this.scene.add(lampGroup);
  }

  buildSinesBuilding() {
    // SINES complex visible at end of curve at Z = 230
    const cx = getRoadCenter(230);
    const sinesGroup = new THREE.Group();
    sinesGroup.position.set(cx - 3.0, 0, 230);

    // 1. Main 3-story modernist campus building
    const bodyGeo = new THREE.BoxGeometry(52, 15, 22);
    const body = new THREE.Mesh(bodyGeo, this.materials.buildingWall);
    body.position.set(0, 7.5, 0);
    body.castShadow = true;
    sinesGroup.add(body);

    // 2. Central Glass Facade
    const glassGeo = new THREE.BoxGeometry(24, 12, 0.4);
    const glass = new THREE.Mesh(glassGeo, this.materials.buildingGlass);
    glass.position.set(0, 7.0, -11.1);
    sinesGroup.add(glass);

    // 3. High-Contrast "S I N E S" Sign on building facade
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const ctx = signCanvas.getContext('2d');
    ctx.fillStyle = '#1b2838';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 78px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S I N E S', 256, 64);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(13, 3.2), signMat);
    signMesh.position.set(0, 13.5, -11.2);
    sinesGroup.add(signMesh);

    this.scene.add(sinesGroup);
  }

  buildAutumnVegetation() {
    // Dense foliage along right sidewalk catching the bright golden sunset,
    // plus trees lining the left side behind Gate 2
    const treeConfigs = [
      // Screen RIGHT sidewalk trees (world -X, catching direct sunset rays)
      { z: -8, xOff: -14.2, scale: 1.45, type: 'gold' },
      { z: 12, xOff: -14.6, scale: 1.65, type: 'orange' },
      { z: 28, xOff: -14.8, scale: 1.80, type: 'gold' },
      { z: 46, xOff: -15.2, scale: 1.60, type: 'crimson' },
      { z: 66, xOff: -15.6, scale: 1.85, type: 'orange' },
      { z: 88, xOff: -16.0, scale: 1.70, type: 'gold' },
      { z: 115, xOff: -16.5, scale: 1.80, type: 'orange' },
      { z: 148, xOff: -17.0, scale: 1.60, type: 'gold' },
      { z: 185, xOff: -17.5, scale: 1.75, type: 'crimson' },

      // Additional foreground right canopy trees framing the sun
      { z: 2, xOff: -16.5, scale: 1.95, type: 'orange' },
      { z: 22, xOff: -17.2, scale: 2.10, type: 'gold' },
      { z: 40, xOff: -17.5, scale: 2.05, type: 'orange' },

      // Screen LEFT roadside trees (world +X, behind Gate 2)
      { z: -12, xOff: 14.5, scale: 1.40, type: 'crimson' },
      { z: 6, xOff: 16.5, scale: 1.55, type: 'orange' },
      { z: 32, xOff: 15.0, scale: 1.50, type: 'gold' },
      { z: 58, xOff: 15.2, scale: 1.65, type: 'orange' },
      { z: 92, xOff: 15.8, scale: 1.50, type: 'crimson' },
      { z: 128, xOff: 16.2, scale: 1.70, type: 'gold' },
      { z: 168, xOff: 16.5, scale: 1.60, type: 'orange' }
    ];

    treeConfigs.forEach((cfg) => {
      const cx = getRoadCenter(cfg.z);
      const tree = this.createDetailedAutumnTree(cfg.type);
      tree.position.set(cx + cfg.xOff, 0, cfg.z);
      tree.scale.setScalar(cfg.scale);
      this.scene.add(tree);
    });
  }

  createDetailedAutumnTree(type) {
    const treeGroup = new THREE.Group();

    // Trunk & Branches
    const trunkGeo = new THREE.CylinderGeometry(0.30, 0.52, 4.0, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.materials.treeTrunk);
    trunk.position.y = 2.0;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Spreading canopy branch forks
    const branch1 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 2.4, 6), this.materials.treeTrunk);
    branch1.position.set(0.45, 3.4, 0.25);
    branch1.rotation.z = -0.55;
    branch1.castShadow = true;
    treeGroup.add(branch1);

    const branch2 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 2.2, 6), this.materials.treeTrunk);
    branch2.position.set(-0.45, 3.3, -0.25);
    branch2.rotation.z = 0.52;
    branch2.castShadow = true;
    treeGroup.add(branch2);

    // Foliage materials
    let primaryMat = this.materials.foliageOrange;
    let secondaryMat = this.materials.foliageGold;
    if (type === 'gold') {
      primaryMat = this.materials.foliageGold;
      secondaryMat = this.materials.foliageYellow;
    } else if (type === 'crimson') {
      primaryMat = this.materials.foliageCrimson;
      secondaryMat = this.materials.foliageOrange;
    }

    // Clustered faceted foliage puffs
    const puffConfigs = [
      { x: 0, y: 5.0, z: 0, r: 2.3, mat: primaryMat },
      { x: 1.0, y: 4.4, z: 0.6, r: 1.9, mat: secondaryMat },
      { x: -1.0, y: 4.2, z: -0.5, r: 1.8, mat: primaryMat },
      { x: 0.3, y: 6.0, z: -0.4, r: 1.6, mat: secondaryMat },
      { x: -0.4, y: 5.4, z: 0.7, r: 1.7, mat: primaryMat },
      { x: 0.7, y: 5.2, z: -0.7, r: 1.6, mat: secondaryMat }
    ];

    puffConfigs.forEach((p) => {
      const puffGeo = new THREE.IcosahedronGeometry(p.r, 1);
      const puff = new THREE.Mesh(puffGeo, p.mat);
      puff.position.set(p.x, p.y, p.z);
      puff.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      puff.castShadow = true;
      puff.receiveShadow = true;
      treeGroup.add(puff);
    });

    return treeGroup;
  }
}
