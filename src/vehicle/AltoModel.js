import * as THREE from 'three';

/**
 * Highly detailed Low-Poly Suzuki Alto (HA36S / Pak Suzuki Alto) 3D Model
 * Accurately reproduces:
 * - Asymmetric front grille (4 vertical louvers on driver side, Suzuki emblem, horizontal slit)
 * - Large trapezoidal headlights with amber turn signal corners
 * - Signature rear door upward-kink beltline & C-pillar
 * - Bumper-mounted horizontal taillights & recessed license plate
 * - High-mounted rear stop lamp & wiper
 * - Authentic silver slotted hubcaps & steel wheels
 * - Interior hints (seats, dashboard, steering wheel)
 * - Interactive headlights, brake lights, reverse lights, and steering
 */
export class AltoModel {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'SuzukiAlto';

    // Sub-assemblies
    this.chassisGroup = new THREE.Group(); // allows pitch and roll independent of root
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
      leftBlinkerOn: false,
      rightBlinkerOn: false,
      headlightBeams: [],
      spotLights: []
    };

    this.buildCar();
  }

  createMaterials() {
    // Body paint: Pure Alpine White with subtle metallic sheen
    const bodyPaint = new THREE.MeshStandardMaterial({
      color: 0xf3f5f8,
      roughness: 0.28,
      metalness: 0.08,
      name: 'AltoBodyWhite'
    });

    // Dark trim / unpainted plastic / pillars
    const blackTrim = new THREE.MeshStandardMaterial({
      color: 0x18191c,
      roughness: 0.85,
      metalness: 0.1,
      name: 'BlackTrim'
    });

    // Chrome / Suzuki emblem / badging
    const chrome = new THREE.MeshStandardMaterial({
      color: 0xdde2ea,
      roughness: 0.18,
      metalness: 0.85,
      name: 'Chrome'
    });

    // Tinted window glass
    const glass = new THREE.MeshStandardMaterial({
      color: 0x1c2128,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.82,
      name: 'WindowGlass'
    });

    // Headlight cover glass
    const headlightGlass = new THREE.MeshStandardMaterial({
      color: 0xeef5fc,
      roughness: 0.12,
      metalness: 0.3,
      transparent: true,
      opacity: 0.7,
      name: 'HeadlightGlass'
    });

    // Headlight chrome reflector cup
    const reflector = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.2,
      metalness: 0.8,
      name: 'Reflector'
    });

    // Headlight emitter (bulb)
    const headlightBulb = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.3,
      name: 'HeadlightBulb'
    });

    // Amber indicator lens
    const amberLens = new THREE.MeshStandardMaterial({
      color: 0xf58c14,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.3,
      name: 'AmberIndicator'
    });

    // Red taillight lens (bumper mounted)
    const redTailLens = new THREE.MeshStandardMaterial({
      color: 0xaa1116,
      emissive: 0x330002,
      emissiveIntensity: 0.2,
      roughness: 0.35,
      name: 'RedTailLens'
    });

    // High Mount Stop Lamp
    const highBrakeLens = new THREE.MeshStandardMaterial({
      color: 0xb51218,
      emissive: 0x220000,
      emissiveIntensity: 0.1,
      roughness: 0.3,
      name: 'HighBrakeLens'
    });

    // Reverse light lens
    const reverseLens = new THREE.MeshStandardMaterial({
      color: 0xe8edf2,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.3,
      name: 'ReverseLens'
    });

    // Tires
    const tireRubber = new THREE.MeshStandardMaterial({
      color: 0x242528,
      roughness: 0.9,
      metalness: 0.05,
      name: 'TireRubber'
    });

    // Wheels: silver hubcap
    const wheelSilver = new THREE.MeshStandardMaterial({
      color: 0xc4c9d1,
      roughness: 0.35,
      metalness: 0.5,
      name: 'WheelSilver'
    });

    // Steel rim behind hubcap
    const wheelSteel = new THREE.MeshStandardMaterial({
      color: 0x1f2023,
      roughness: 0.7,
      metalness: 0.4,
      name: 'WheelSteel'
    });

    // Interior cabin plastic
    const interiorDark = new THREE.MeshStandardMaterial({
      color: 0x282a30,
      roughness: 0.85,
      metalness: 0.05,
      name: 'InteriorDark'
    });

    // License plates (Pakistani style white & green or black)
    const licensePlate = new THREE.MeshStandardMaterial({
      color: 0x151618,
      roughness: 0.6,
      metalness: 0.1,
      name: 'LicensePlate'
    });

    // Light beam cone material
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0xfffae8,
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
      glass,
      headlightGlass,
      reflector,
      headlightBulb,
      amberLens,
      redTailLens,
      highBrakeLens,
      reverseLens,
      tireRubber,
      wheelSilver,
      wheelSteel,
      interiorDark,
      licensePlate,
      beamMaterial
    };
  }

  buildCar() {
    // Proportions:
    // Car length: 3.4m (Z from -1.7 to +1.7)
    // Car width: 1.48m (X from -0.74 to +0.74)
    // Car height: 1.50m (Y from ground 0 to 1.50)
    // Ground clearance: ~0.18m
    // Wheelbase: 2.44m (Front axle at Z = +1.10, Rear axle at Z = -1.14)
    // Track width: 1.30m (Wheels at X = ±0.65)

    const c = this.chassisGroup;

    this.buildBodyShell(c);
    this.buildFrontFascia(c);
    this.buildRearFascia(c);
    this.buildCabinAndWindows(c);
    this.buildInterior(c);
    this.buildExteriorDetails(c);
    this.buildHeadlightBeams(c);
    this.buildWheels();

    // Enable shadows on all relevant meshes
    this.chassisGroup.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    // Add faint ambient occlusion shadow plane beneath car
    this.buildCarGroundShadow();
  }

  buildBodyShell(parent) {
    const mat = this.materials.bodyPaint;

    // 1. Lower Body / Floor / Rocker Panelling
    // Main lower tub
    const lowerBodyGeo = new THREE.BoxGeometry(1.44, 0.44, 3.28);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, mat);
    lowerBody.position.set(0, 0.44, -0.02);
    parent.add(lowerBody);

    // 2. Mid Body / Beltline Waist
    const midBodyGeo = new THREE.BoxGeometry(1.42, 0.32, 3.20);
    const midBody = new THREE.Mesh(midBodyGeo, mat);
    midBody.position.set(0, 0.72, -0.02);
    parent.add(midBody);

    // 3. Front Hood (Slopes down to meet the upper grille)
    // Low-poly sloping hood
    const hoodGeo = new THREE.BoxGeometry(1.36, 0.16, 0.92);
    const hood = new THREE.Mesh(hoodGeo, mat);
    hood.position.set(0, 0.79, 1.12);
    hood.rotation.x = 0.08; // subtle slope downward
    parent.add(hood);

    // Hood side ridges (authentic Alto hood crease)
    [-0.58, 0.58].forEach((x) => {
      const ridgeGeo = new THREE.BoxGeometry(0.04, 0.03, 0.88);
      const ridge = new THREE.Mesh(ridgeGeo, mat);
      ridge.position.set(x, 0.84, 1.12);
      ridge.rotation.x = 0.08;
      parent.add(ridge);
    });

    // 4. Roof Assembly
    // Flat Kei-car roof with subtle downward taper at rear
    const roofGeo = new THREE.BoxGeometry(1.24, 0.07, 1.76);
    const roof = new THREE.Mesh(roofGeo, mat);
    roof.position.set(0, 1.46, -0.26);
    roof.rotation.x = -0.015;
    parent.add(roof);

    // Roof longitudinal ribs (stiffener flutes on Alto roof)
    [-0.32, 0, 0.32].forEach((x) => {
      const fluteGeo = new THREE.BoxGeometry(0.025, 0.015, 1.6);
      const flute = new THREE.Mesh(fluteGeo, mat);
      flute.position.set(x, 1.50, -0.26);
      parent.add(flute);
    });

    // 5. Wheel Arch Flares (Front and Rear Fenders)
    const wheelArchPositions = [
      { x: -0.73, z: 1.10, isFront: true },
      { x: 0.73, z: 1.10, isFront: true },
      { x: -0.73, z: -1.14, isFront: false },
      { x: 0.73, z: -1.14, isFront: false }
    ];

    wheelArchPositions.forEach((pos) => {
      const archGeo = new THREE.BoxGeometry(0.04, 0.36, 0.68);
      const arch = new THREE.Mesh(archGeo, mat);
      arch.position.set(pos.x, 0.47, pos.z);
      parent.add(arch);

      // Dark under-wheel liner
      const linerGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.16, 12, 1, false, 0, Math.PI);
      const linerMat = this.materials.blackTrim;
      const liner = new THREE.Mesh(linerGeo, linerMat);
      liner.rotation.z = Math.PI / 2;
      liner.position.set(pos.x > 0 ? 0.65 : -0.65, 0.32, pos.z);
      parent.add(liner);
    });

    // 6. Underbody Skid Plate / Chassis Bottom (Dark)
    const underbodyGeo = new THREE.BoxGeometry(1.30, 0.08, 3.10);
    const underbody = new THREE.Mesh(underbodyGeo, this.materials.blackTrim);
    underbody.position.set(0, 0.22, -0.02);
    parent.add(underbody);
  }

  buildFrontFascia(parent) {
    const mat = this.materials.bodyPaint;
    const blackMat = this.materials.blackTrim;
    const chromeMat = this.materials.chrome;

    // 1. Upper Front Fascia Header (Connects hood and bumper)
    const upperHeaderGeo = new THREE.BoxGeometry(1.38, 0.22, 0.16);
    const upperHeader = new THREE.Mesh(upperHeaderGeo, mat);
    upperHeader.position.set(0, 0.74, 1.62);
    parent.add(upperHeader);

    // ==========================================
    // 2. ICONIC ASYMMETRIC ALTO GRILLE
    // Looking at the front of the car:
    // Left side (driver's side in RHD Pakistan / viewer's left in front photo):
    // 4 vertical air slats!
    // Center: Suzuki 'S' chrome emblem
    // Right side: Single horizontal slot
    // ==========================================
    const grilleBackplateGeo = new THREE.BoxGeometry(0.72, 0.14, 0.04);
    const grilleBackplate = new THREE.Mesh(grilleBackplateGeo, blackMat);
    grilleBackplate.position.set(0, 0.73, 1.705);
    parent.add(grilleBackplate);

    // 4 Vertical Slits on the Left (x from -0.30 to -0.12)
    const slitWidth = 0.018;
    const slitHeight = 0.09;
    const slitDepth = 0.035;
    [-0.28, -0.23, -0.18, -0.13].forEach((x) => {
      const slitGeo = new THREE.BoxGeometry(slitWidth, slitHeight, slitDepth);
      const slit = new THREE.Mesh(slitGeo, blackMat);
      slit.position.set(x, 0.73, 1.72);
      parent.add(slit);

      // Silver trim accents around slits
      const slatRimGeo = new THREE.BoxGeometry(slitWidth * 1.3, slitHeight * 1.1, 0.01);
      const slatRim = new THREE.Mesh(slatRimGeo, chromeMat);
      slatRim.position.set(x, 0.73, 1.73);
      parent.add(slatRim);
    });

    // Suzuki 'S' Emblem in Center
    const emblemCenter = new THREE.Group();
    emblemCenter.position.set(-0.01, 0.73, 1.73);

    // Stylized low-poly Suzuki S (two diagonal angled bars)
    const sBar1Geo = new THREE.BoxGeometry(0.065, 0.02, 0.015);
    const sBar1 = new THREE.Mesh(sBar1Geo, chromeMat);
    sBar1.rotation.z = 0.52;
    emblemCenter.add(sBar1);

    const sBar2Geo = new THREE.BoxGeometry(0.065, 0.02, 0.015);
    const sBar2 = new THREE.Mesh(sBar2Geo, chromeMat);
    sBar2.rotation.z = -0.52;
    emblemCenter.add(sBar2);

    const sPlateGeo = new THREE.BoxGeometry(0.075, 0.075, 0.008);
    const sPlate = new THREE.Mesh(sPlateGeo, chromeMat);
    emblemCenter.add(sPlate);
    parent.add(emblemCenter);

    // Horizontal slot on passenger side (x = +0.18)
    const horizSlotGeo = new THREE.BoxGeometry(0.12, 0.024, 0.03);
    const horizSlot = new THREE.Mesh(horizSlotGeo, blackMat);
    horizSlot.position.set(0.18, 0.73, 1.72);
    parent.add(horizSlot);

    // 3. HEADLIGHT ASSEMBLIES
    // Large trapezoidal clear housings flanking the grille
    [-1, 1].forEach((side) => {
      const headGroup = new THREE.Group();
      headGroup.position.set(side * 0.52, 0.73, 1.67);

      // Headlight Housing Box / Bezel
      const housingGeo = new THREE.BoxGeometry(0.24, 0.17, 0.08);
      const housing = new THREE.Mesh(housingGeo, this.materials.reflector);
      headGroup.add(housing);

      // Circular Projector Reflector Bowl
      const reflectorGeo = new THREE.CylinderGeometry(0.055, 0.065, 0.04, 16);
      const reflectorMesh = new THREE.Mesh(reflectorGeo, this.materials.reflector);
      reflectorMesh.rotation.x = Math.PI / 2;
      reflectorMesh.position.set(-side * 0.02, 0.01, 0.02);
      headGroup.add(reflectorMesh);

      // Bulb center (illuminates when lights on)
      const bulbGeo = new THREE.SphereGeometry(0.025, 12, 12);
      const bulb = new THREE.Mesh(bulbGeo, this.materials.headlightBulb);
      bulb.position.set(-side * 0.02, 0.01, 0.04);
      headGroup.add(bulb);

      // Amber Turn Indicator Polygon at outer corner
      const indicatorGeo = new THREE.BoxGeometry(0.05, 0.05, 0.03);
      const indicator = new THREE.Mesh(indicatorGeo, this.materials.amberLens);
      indicator.position.set(side * 0.08, -0.04, 0.03);
      headGroup.add(indicator);

      // Clear Glass Outer Lens
      const lensGeo = new THREE.BoxGeometry(0.25, 0.18, 0.02);
      const lens = new THREE.Mesh(lensGeo, this.materials.headlightGlass);
      lens.position.set(0, 0, 0.045);
      headGroup.add(lens);

      parent.add(headGroup);
    });

    // 4. FRONT LOWER BUMPER
    // White upper chin
    const bumperChinGeo = new THREE.BoxGeometry(1.42, 0.24, 0.14);
    const bumperChin = new THREE.Mesh(bumperChinGeo, mat);
    bumperChin.position.set(0, 0.44, 1.64);
    parent.add(bumperChin);

    // Lower Central Air Intake Recess (Wide black rectangular slot)
    const lowerIntakeGeo = new THREE.BoxGeometry(0.96, 0.16, 0.08);
    const lowerIntake = new THREE.Mesh(lowerIntakeGeo, blackMat);
    lowerIntake.position.set(0, 0.38, 1.68);
    parent.add(lowerIntake);

    // Horizontal intake grille slats
    [-0.04, 0.04].forEach((yOff) => {
      const slatGeo = new THREE.BoxGeometry(0.94, 0.015, 0.02);
      const slat = new THREE.Mesh(slatGeo, mat);
      slat.position.set(0, 0.38 + yOff, 1.72);
      parent.add(slat);
    });

    // Front License Plate Holder (Black rectangular plate)
    const plateGeo = new THREE.BoxGeometry(0.36, 0.14, 0.025);
    const plate = new THREE.Mesh(plateGeo, this.materials.licensePlate);
    plate.position.set(0, 0.38, 1.735);
    parent.add(plate);

    // Front Bumper Lower Lip / Air Dam
    const lowerLipGeo = new THREE.BoxGeometry(1.40, 0.08, 0.10);
    const lowerLip = new THREE.Mesh(lowerLipGeo, mat);
    lowerLip.position.set(0, 0.24, 1.63);
    parent.add(lowerLip);

    // Corner fog light / reflector pockets
    [-0.56, 0.56].forEach((x) => {
      const pocketGeo = new THREE.BoxGeometry(0.08, 0.08, 0.04);
      const pocket = new THREE.Mesh(pocketGeo, blackMat);
      pocket.position.set(x, 0.36, 1.67);
      parent.add(pocket);
    });
  }

  buildRearFascia(parent) {
    const mat = this.materials.bodyPaint;
    const blackMat = this.materials.blackTrim;
    const chromeMat = this.materials.chrome;

    // 1. Vertical Rear Tailgate
    const tailgateGeo = new THREE.BoxGeometry(1.36, 0.68, 0.12);
    const tailgate = new THREE.Mesh(tailgateGeo, mat);
    tailgate.position.set(0, 0.78, -1.60);
    parent.add(tailgate);

    // 2. Rear Suzuki 'S' Chrome Emblem on Tailgate
    const rearEmblem = new THREE.Mesh(
      new THREE.BoxGeometry(0.065, 0.065, 0.015),
      chromeMat
    );
    rearEmblem.position.set(0, 0.82, -1.67);
    parent.add(rearEmblem);

    // 3. Black Tailgate Handle / Hatch Opener Button
    const handleGeo = new THREE.BoxGeometry(0.18, 0.045, 0.025);
    const handle = new THREE.Mesh(handleGeo, blackMat);
    handle.position.set(0, 0.72, -1.67);
    parent.add(handle);

    // 4. "ALTO" Chrome Badge on Right Side
    const badgeGeo = new THREE.BoxGeometry(0.16, 0.035, 0.015);
    const badge = new THREE.Mesh(badgeGeo, chromeMat);
    badge.position.set(0.44, 0.68, -1.67);
    parent.add(badge);

    // ==========================================
    // 5. ICONIC REAR BUMPER-MOUNTED TAILLIGHTS
    // In Suzuki Alto HA36, taillights are located IN THE LOWER BUMPER!
    // Flanking the recessed license plate holder.
    // ==========================================
    const rearBumperGeo = new THREE.BoxGeometry(1.42, 0.34, 0.16);
    const rearBumper = new THREE.Mesh(rearBumperGeo, mat);
    rearBumper.position.set(0, 0.40, -1.58);
    parent.add(rearBumper);

    // Rear bumper taillight units (left and right)
    [-0.48, 0.48].forEach((x) => {
      const tailGroup = new THREE.Group();
      tailGroup.position.set(x, 0.44, -1.66);

      // Outer Red Brake / Tail Light section
      const redSectionGeo = new THREE.BoxGeometry(0.18, 0.07, 0.025);
      const redMesh = new THREE.Mesh(redSectionGeo, this.materials.redTailLens);
      redMesh.position.set(x < 0 ? -0.05 : 0.05, 0, 0);
      tailGroup.add(redMesh);

      // Inner Clear / White Reverse & Turn Signal section
      const clearSectionGeo = new THREE.BoxGeometry(0.08, 0.07, 0.025);
      const clearMesh = new THREE.Mesh(clearSectionGeo, this.materials.reverseLens);
      clearMesh.position.set(x < 0 ? 0.06 : -0.06, 0, 0);
      tailGroup.add(clearMesh);

      parent.add(tailGroup);
    });

    // Recessed Rear License Plate Well & Plate
    const plateWellGeo = new THREE.BoxGeometry(0.48, 0.18, 0.06);
    const plateWell = new THREE.Mesh(plateWellGeo, mat);
    plateWell.position.set(0, 0.32, -1.64);
    parent.add(plateWell);

    const rearPlateGeo = new THREE.BoxGeometry(0.38, 0.14, 0.02);
    const rearPlate = new THREE.Mesh(rearPlateGeo, this.materials.licensePlate);
    rearPlate.position.set(0, 0.32, -1.675);
    parent.add(rearPlate);

    // Exhaust Pipe Tip under rear bumper (bottom left)
    const exhaustGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.12, 8);
    const exhaust = new THREE.Mesh(exhaustGeo, chromeMat);
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(-0.46, 0.20, -1.56);
    parent.add(exhaust);
  }

  buildCabinAndWindows(parent) {
    const glassMat = this.materials.glass;
    const trimMat = this.materials.blackTrim;
    const bodyMat = this.materials.bodyPaint;

    // 1. Windshield (Front Rake)
    const windshieldGeo = new THREE.BoxGeometry(1.22, 0.58, 0.05);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, 1.16, 0.78);
    windshield.rotation.x = -0.56; // angled windshield
    parent.add(windshield);

    // Dual Windshield Wipers
    [-0.22, 0.22].forEach((x) => {
      const wiperArmGeo = new THREE.BoxGeometry(0.02, 0.32, 0.015);
      const wiper = new THREE.Mesh(wiperArmGeo, trimMat);
      wiper.position.set(x, 0.98, 1.05);
      wiper.rotation.x = -0.56;
      wiper.rotation.z = -0.65;
      parent.add(wiper);
    });

    // 2. A-Pillars (Body colored white)
    [-0.62, 0.62].forEach((x) => {
      const aPillarGeo = new THREE.BoxGeometry(0.07, 0.64, 0.07);
      const aPillar = new THREE.Mesh(aPillarGeo, bodyMat);
      aPillar.position.set(x, 1.16, 0.76);
      aPillar.rotation.x = -0.56;
      aPillar.rotation.y = x > 0 ? -0.1 : 0.1;
      parent.add(aPillar);
    });

    // 3. Side Windows: Front Doors (Horizontal beltline)
    [-0.67, 0.67].forEach((x) => {
      const frontWindowGeo = new THREE.BoxGeometry(0.03, 0.42, 0.72);
      const frontWindow = new THREE.Mesh(frontWindowGeo, glassMat);
      frontWindow.position.set(x, 1.18, 0.22);
      parent.add(frontWindow);
    });

    // 4. B-Pillars (Matte Black Vinyl Trim)
    [-0.675, 0.675].forEach((x) => {
      const bPillarGeo = new THREE.BoxGeometry(0.04, 0.48, 0.12);
      const bPillar = new THREE.Mesh(bPillarGeo, trimMat);
      bPillar.position.set(x, 1.18, -0.18);
      parent.add(bPillar);
    });

    // ==========================================
    // 5. SIGNATURE REAR DOOR WINDOW WITH UPWARD KINK!
    // The lower edge sweeps upward sharply towards the C-pillar.
    // Modeled using a customized low-poly wedge shape.
    // ==========================================
    [-1, 1].forEach((side) => {
      const rearWindowGroup = new THREE.Group();
      rearWindowGroup.position.set(side * 0.67, 1.18, -0.62);

      // Main rear window section
      const rearWindowGeo = new THREE.BoxGeometry(0.03, 0.42, 0.64);
      const rearWindow = new THREE.Mesh(rearWindowGeo, glassMat);
      rearWindowGroup.add(rearWindow);

      // Upward Kink Body Infill Wedge (creates the famous angled cutoff on the Alto)
      const wedgeGeo = new THREE.BoxGeometry(0.04, 0.22, 0.32);
      const wedge = new THREE.Mesh(wedgeGeo, bodyMat);
      wedge.position.set(0, -0.12, -0.18);
      wedge.rotation.x = -0.42; // upward slant!
      rearWindowGroup.add(wedge);

      // Black rubber trim frame
      const frameGeo = new THREE.BoxGeometry(0.035, 0.04, 0.36);
      const frame = new THREE.Mesh(frameGeo, trimMat);
      frame.position.set(0, -0.01, -0.18);
      frame.rotation.x = -0.42;
      rearWindowGroup.add(frame);

      parent.add(rearWindowGroup);
    });

    // 6. Thick C-Pillars (Body colored white behind rear windows)
    [-0.66, 0.66].forEach((x) => {
      const cPillarGeo = new THREE.BoxGeometry(0.09, 0.52, 0.42);
      const cPillar = new THREE.Mesh(cPillarGeo, bodyMat);
      cPillar.position.set(x, 1.20, -1.18);
      cPillar.rotation.x = 0.12;
      parent.add(cPillar);
    });

    // 7. Rear Hatch Window Glass
    const rearGlassGeo = new THREE.BoxGeometry(1.18, 0.48, 0.04);
    const rearGlass = new THREE.Mesh(rearGlassGeo, glassMat);
    rearGlass.position.set(0, 1.22, -1.53);
    rearGlass.rotation.x = 0.16; // steep vertical Kei car hatch
    parent.add(rearGlass);

    // High Mount Stop Lamp (HMSL) - Centered red LED bar above rear glass
    const hmslGeo = new THREE.BoxGeometry(0.24, 0.035, 0.025);
    const hmsl = new THREE.Mesh(hmslGeo, this.materials.highBrakeLens);
    hmsl.position.set(0, 1.47, -1.48);
    parent.add(hmsl);

    // Rear Wiper on rear glass
    const rearWiperGeo = new THREE.BoxGeometry(0.015, 0.22, 0.015);
    const rearWiper = new THREE.Mesh(rearWiperGeo, trimMat);
    rearWiper.position.set(-0.06, 1.08, -1.56);
    rearWiper.rotation.z = 1.35;
    rearWiper.rotation.x = 0.16;
    parent.add(rearWiper);
  }

  buildInterior(parent) {
    const intMat = this.materials.interiorDark;

    // 1. Dashboard
    const dashGeo = new THREE.BoxGeometry(1.22, 0.18, 0.44);
    const dash = new THREE.Mesh(dashGeo, intMat);
    dash.position.set(0, 0.90, 0.62);
    parent.add(dash);

    // 2. Instrument Binnacle (RHD - Driver on right, or center)
    const binnacleGeo = new THREE.BoxGeometry(0.24, 0.08, 0.18);
    const binnacle = new THREE.Mesh(binnacleGeo, intMat);
    binnacle.position.set(0.32, 1.01, 0.60);
    parent.add(binnacle);

    // 3. Steering Wheel (Pakistani RHD on right: x = +0.32)
    const steerGeo = new THREE.TorusGeometry(0.11, 0.018, 8, 16);
    const steer = new THREE.Mesh(steerGeo, intMat);
    steer.position.set(0.32, 1.02, 0.46);
    steer.rotation.x = 0.35;
    parent.add(steer);

    // 4. Front Bucket Seats with Headrests
    [-0.32, 0.32].forEach((x) => {
      const seatGroup = new THREE.Group();
      seatGroup.position.set(x, 0.72, 0.12);

      // Seat cushion
      const cushionGeo = new THREE.BoxGeometry(0.42, 0.14, 0.44);
      const cushion = new THREE.Mesh(cushionGeo, intMat);
      seatGroup.add(cushion);

      // Backrest
      const backrestGeo = new THREE.BoxGeometry(0.40, 0.46, 0.12);
      const backrest = new THREE.Mesh(backrestGeo, intMat);
      backrest.position.set(0, 0.26, -0.18);
      backrest.rotation.x = -0.14;
      seatGroup.add(backrest);

      // Headrest (prominently visible in photo)
      const headrestGeo = new THREE.BoxGeometry(0.22, 0.16, 0.10);
      const headrest = new THREE.Mesh(headrestGeo, intMat);
      headrest.position.set(0, 0.54, -0.21);
      seatGroup.add(headrest);

      parent.add(seatGroup);
    });

    // 5. Rear Bench Seat
    const rearBenchGeo = new THREE.BoxGeometry(1.16, 0.38, 0.44);
    const rearBench = new THREE.Mesh(rearBenchGeo, intMat);
    rearBench.position.set(0, 0.74, -0.72);
    parent.add(rearBench);

    // Interior Rearview Mirror
    const mirrorGeo = new THREE.BoxGeometry(0.14, 0.045, 0.02);
    const mirror = new THREE.Mesh(mirrorGeo, intMat);
    mirror.position.set(0, 1.34, 0.68);
    parent.add(mirror);
  }

  buildExteriorDetails(parent) {
    const mat = this.materials.bodyPaint;
    const blackMat = this.materials.blackTrim;
    const chromeMat = this.materials.chrome;

    // 1. Aerodynamic Side Mirrors
    [-1, 1].forEach((side) => {
      const mirrorGroup = new THREE.Group();
      mirrorGroup.position.set(side * 0.74, 1.04, 0.64);

      // Black mounting stem
      const stemGeo = new THREE.BoxGeometry(0.06, 0.03, 0.04);
      const stem = new THREE.Mesh(stemGeo, blackMat);
      stem.position.set(side * 0.03, -0.02, 0);
      mirrorGroup.add(stem);

      // Painted mirror shell
      const shellGeo = new THREE.BoxGeometry(0.12, 0.09, 0.14);
      const shell = new THREE.Mesh(shellGeo, mat);
      shell.position.set(side * 0.08, 0, 0);
      mirrorGroup.add(shell);

      // Reflective mirror glass facing rear
      const mirrorGlassGeo = new THREE.BoxGeometry(0.10, 0.07, 0.01);
      const mirrorGlass = new THREE.Mesh(mirrorGlassGeo, chromeMat);
      mirrorGlass.position.set(side * 0.08, 0, -0.065);
      mirrorGroup.add(mirrorGlass);

      parent.add(mirrorGroup);
    });

    // 2. Door Handles (Front & Rear, Flushed low-poly handles)
    const handlePositions = [
      { x: -0.735, z: 0.12 },
      { x: 0.735, z: 0.12 },
      { x: -0.735, z: -0.48 },
      { x: 0.735, z: -0.48 }
    ];

    handlePositions.forEach((pos) => {
      const handleGeo = new THREE.BoxGeometry(0.025, 0.035, 0.12);
      const handle = new THREE.Mesh(handleGeo, chromeMat);
      handle.position.set(pos.x, 0.88, pos.z);
      parent.add(handle);
    });

    // 3. Fender Turn Signal Repeaters (Small amber indicators behind front wheels)
    [-0.735, 0.735].forEach((x) => {
      const repGeo = new THREE.BoxGeometry(0.015, 0.02, 0.04);
      const repeater = new THREE.Mesh(repGeo, this.materials.amberLens);
      repeater.position.set(x, 0.80, 0.78);
      parent.add(repeater);
    });

    // 4. Roof Antenna (Rear stub antenna)
    const antennaBaseGeo = new THREE.BoxGeometry(0.04, 0.025, 0.06);
    const antennaBase = new THREE.Mesh(antennaBaseGeo, blackMat);
    antennaBase.position.set(0, 1.50, -1.02);
    parent.add(antennaBase);

    const antennaMastGeo = new THREE.CylinderGeometry(0.006, 0.008, 0.18, 6);
    const antennaMast = new THREE.Mesh(antennaMastGeo, blackMat);
    antennaMast.position.set(0, 1.58, -1.07);
    antennaMast.rotation.x = -0.55; // angled rearward
    parent.add(antennaMast);
  }

  buildHeadlightBeams(parent) {
    // Spotlights & semi-transparent volumetric cones for realistic night/sunset lighting
    [-1, 1].forEach((side) => {
      const spot = new THREE.SpotLight(0xfffaea, 0, 35, Math.PI / 6, 0.45, 1.2);
      spot.position.set(side * 0.52, 0.73, 1.74);
      spot.target.position.set(side * 0.52, 0, 18);
      parent.add(spot);
      parent.add(spot.target);
      this.interactiveLights.spotLights.push(spot);

      // Volumetric beam cone
      const coneGeo = new THREE.ConeGeometry(2.4, 14, 16, 1, true);
      const beamCone = new THREE.Mesh(coneGeo, this.materials.beamMaterial);
      beamCone.position.set(side * 0.52, 0.73, 8.5);
      beamCone.rotation.x = -Math.PI / 2;
      beamCone.visible = false;
      parent.add(beamCone);
      this.interactiveLights.headlightBeams.push(beamCone);
    });
  }

  buildWheels() {
    // 4 Suzuki Alto Wheels with authentic silver slotted wheel covers
    const wheelConfigs = [
      { key: 'fl', x: -0.66, y: 0.28, z: 1.10, isFront: true },
      { key: 'fr', x: 0.66, y: 0.28, z: 1.10, isFront: true },
      { key: 'rl', x: -0.66, y: 0.28, z: -1.14, isFront: false },
      { key: 'rr', x: 0.66, y: 0.28, z: -1.14, isFront: false }
    ];

    wheelConfigs.forEach((cfg) => {
      // Steering pivot (steers Y axis)
      const steeringPivot = new THREE.Group();
      steeringPivot.name = `SteeringPivot_${cfg.key}`;
      steeringPivot.position.set(cfg.x, cfg.y, cfg.z);
      this.group.add(steeringPivot);

      // Spinning pivot (spins X axis)
      const spinPivot = new THREE.Group();
      spinPivot.name = `SpinPivot_${cfg.key}`;
      steeringPivot.add(spinPivot);

      const wheelMesh = this.createAltoWheelMesh(cfg.x > 0);
      spinPivot.add(wheelMesh);

      this.wheels[cfg.key] = {
        pivot: steeringPivot,
        spinner: spinPivot,
        isFront: cfg.isFront,
        restY: cfg.y
      };
    });
  }

  createAltoWheelMesh(isRightSide) {
    const wheelGroup = new THREE.Group();

    const tireRadius = 0.28;
    const tireWidth = 0.16;

    // 1. Rubber Tire with Low-Poly Faceted Bevels
    const tireGeo = new THREE.CylinderGeometry(tireRadius, tireRadius, tireWidth, 20, 1);
    const tire = new THREE.Mesh(tireGeo, this.materials.tireRubber);
    tire.rotation.z = Math.PI / 2;
    wheelGroup.add(tire);

    // Subtle tread bevel shoulders
    const shoulderGeo = new THREE.CylinderGeometry(tireRadius * 0.94, tireRadius * 0.98, tireWidth * 1.04, 20, 1);
    const shoulder = new THREE.Mesh(shoulderGeo, this.materials.tireRubber);
    shoulder.rotation.z = Math.PI / 2;
    wheelGroup.add(shoulder);

    // 2. Dark Steel Wheel Rim Center
    const rimGeo = new THREE.CylinderGeometry(0.20, 0.20, tireWidth * 0.98, 16);
    const rim = new THREE.Mesh(rimGeo, this.materials.wheelSteel);
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);

    // ==========================================
    // 3. AUTHENTIC ALTO SILVER HUBCAP
    // Has a silver disc with Suzuki center emblem and 4 wide cutouts!
    // ==========================================
    const hubcapGroup = new THREE.Group();
    // Position on outer face of the wheel
    const capX = isRightSide ? (tireWidth / 2 + 0.005) : (-tireWidth / 2 - 0.005);
    hubcapGroup.position.set(capX, 0, 0);

    // Silver Face Disc
    const capDiscGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.015, 16);
    const capDisc = new THREE.Mesh(capDiscGeo, this.materials.wheelSilver);
    capDisc.rotation.z = Math.PI / 2;
    hubcapGroup.add(capDisc);

    // 4 Slots / Cutouts (Dark recessed slots showing wheel steel behind)
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const slotGeo = new THREE.BoxGeometry(0.02, 0.035, 0.07);
      const slot = new THREE.Mesh(slotGeo, this.materials.wheelSteel);
      slot.position.set(0, Math.sin(angle) * 0.11, Math.cos(angle) * 0.11);
      slot.rotation.x = angle;
      hubcapGroup.add(slot);
    }

    // Center Hub with Chrome Suzuki Accent
    const hubNutGeo = new THREE.CylinderGeometry(0.045, 0.05, 0.025, 12);
    const hubNut = new THREE.Mesh(hubNutGeo, this.materials.wheelSilver);
    hubNut.rotation.z = Math.PI / 2;
    hubcapGroup.add(hubNut);

    const logoDotGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8);
    const logoDot = new THREE.Mesh(logoDotGeo, this.materials.chrome);
    logoDot.rotation.z = Math.PI / 2;
    hubcapGroup.add(logoDot);

    wheelGroup.add(hubcapGroup);

    return wheelGroup;
  }

  buildCarGroundShadow() {
    // Soft fake AO contact shadow under car (essential for low-poly ground grounding)
    const shadowGeo = new THREE.PlaneGeometry(1.68, 3.48);
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(64, 64, 20, 64, 64, 64);
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
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, 0.02, -0.02);
    this.group.add(shadowMesh);
  }

  // --- Dynamic Lighting Controls ---
  setHeadlights(enabled) {
    this.interactiveLights.headlightsOn = enabled;
    const intensity = enabled ? 3.5 : 0;
    this.materials.headlightBulb.emissive.setHex(enabled ? 0xfffae8 : 0x000000);
    this.materials.headlightBulb.emissiveIntensity = enabled ? 2.5 : 0;

    this.interactiveLights.spotLights.forEach((spot) => {
      spot.intensity = intensity;
    });

    this.interactiveLights.headlightBeams.forEach((beam) => {
      beam.visible = enabled;
      this.materials.beamMaterial.opacity = enabled ? 0.14 : 0;
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
      this.materials.redTailLens.emissiveIntensity = 2.2;
      this.materials.highBrakeLens.emissive.setHex(0xff1118);
      this.materials.highBrakeLens.emissiveIntensity = 2.8;
    } else {
      this.materials.redTailLens.emissive.setHex(0x330002);
      this.materials.redTailLens.emissiveIntensity = 0.2;
      this.materials.highBrakeLens.emissive.setHex(0x220000);
      this.materials.highBrakeLens.emissiveIntensity = 0.1;
    }
  }

  setReverseLights(enabled) {
    this.interactiveLights.reverseLightsOn = enabled;
    if (enabled) {
      this.materials.reverseLens.emissive.setHex(0xffffff);
      this.materials.reverseLens.emissiveIntensity = 1.8;
    } else {
      this.materials.reverseLens.emissive.setHex(0x000000);
      this.materials.reverseLens.emissiveIntensity = 0;
    }
  }

  // Steering angle in radians
  setSteeringAngle(angle) {
    this.wheels.fl.pivot.rotation.y = angle;
    this.wheels.fr.pivot.rotation.y = angle;
  }

  // Spin wheels based on forward movement
  spinWheels(distanceTraveled) {
    const tireRadius = 0.28;
    const deltaAngle = distanceTraveled / tireRadius;
    this.wheels.fl.spinner.rotation.x += deltaAngle;
    this.wheels.fr.spinner.rotation.x += deltaAngle;
    this.wheels.rl.spinner.rotation.x += deltaAngle;
    this.wheels.rr.spinner.rotation.x += deltaAngle;
  }

  // Chassis pitch (acceleration squat/dive) and roll (cornering lean)
  setChassisDynamics(pitch, roll) {
    this.chassisGroup.rotation.x = pitch;
    this.chassisGroup.rotation.z = roll;
  }
}
