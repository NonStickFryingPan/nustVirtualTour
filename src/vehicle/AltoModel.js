import * as THREE from 'three';

/**
 * High-Fidelity Suzuki Alto (HA36S / Pak Suzuki Alto) 3D Model
 * Crafted to faithfully match the 4-angle reference render:
 * 1. Monocoque body with continuous aerodynamic contours & wheel arch cutouts
 * 2. Signature asymmetric front grille (4 vertical louvers on driver side, Suzuki emblem, horizontal slit)
 * 3. Large trapezoidal clear headlights with chrome reflector cups & amber corner blinkers
 * 4. Lower front intake with black slats & license plate
 * 5. Iconic upward-kink rear door beltline window & thick C-pillar
 * 6. High-mount rear stop lamp, rear wiper, chrome "ALTO" & Suzuki badging
 * 7. Authentic bumper-mounted taillights & recessed rear license plate
 * 8. Authentic silver 4-slot wheel covers over dark steel rims
 * 9. Dark interior with steering wheel, dashboard, and front bucket seats with headrests
 * 10. Interactive headlights, brake lights, reverse lights, and steering
 */
export class AltoModel {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'SuzukiAlto_HA36';

    // Sub-assembly that pitches and rolls with suspension
    this.chassisGroup = new THREE.Group();
    this.group.add(this.chassisGroup);

    // Wheel assemblies
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
      color: 0xf5f6fa,
      roughness: 0.18,
      metalness: 0.08,
      name: 'AltoBodyWhite'
    });

    // Dark unpainted trim / bumper recesses / window frames
    const blackTrim = new THREE.MeshStandardMaterial({
      color: 0x1a1b1e,
      roughness: 0.75,
      metalness: 0.15,
      name: 'BlackTrim'
    });

    // Shiny chrome (Suzuki S emblem, badging, exhaust)
    const chrome = new THREE.MeshStandardMaterial({
      color: 0xe6e9ef,
      roughness: 0.12,
      metalness: 0.95,
      name: 'Chrome'
    });

    // Dark tinted automotive glass
    const windowGlass = new THREE.MeshStandardMaterial({
      color: 0x1c2026,
      roughness: 0.08,
      metalness: 0.35,
      transparent: true,
      opacity: 0.88,
      name: 'WindowGlass'
    });

    // Clear headlight glass cover
    const headlightGlass = new THREE.MeshStandardMaterial({
      color: 0xf0f5fc,
      roughness: 0.08,
      metalness: 0.2,
      transparent: true,
      opacity: 0.65,
      name: 'HeadlightGlass'
    });

    // Headlight chrome reflector bowl
    const reflector = new THREE.MeshStandardMaterial({
      color: 0xd8dde4,
      roughness: 0.15,
      metalness: 0.9,
      name: 'Reflector'
    });

    // Headlight projector bulb
    const bulb = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.2,
      name: 'HeadlightBulb'
    });

    // Amber indicator turn signal
    const amberLens = new THREE.MeshStandardMaterial({
      color: 0xf39c12,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.25,
      name: 'AmberLens'
    });

    // Bumper-mounted red taillight lens
    const redTailLens = new THREE.MeshStandardMaterial({
      color: 0xc0392b,
      emissive: 0x220505,
      emissiveIntensity: 0.2,
      roughness: 0.3,
      name: 'RedTailLens'
    });

    // High Mount Stop Lamp (top red LED)
    const highBrakeLens = new THREE.MeshStandardMaterial({
      color: 0xd63031,
      emissive: 0x220505,
      emissiveIntensity: 0.2,
      roughness: 0.25,
      name: 'HighBrakeLens'
    });

    // White reverse light lens
    const reverseLens = new THREE.MeshStandardMaterial({
      color: 0xeef2f7,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.25,
      name: 'ReverseLens'
    });

    // Rubber tire
    const tireRubber = new THREE.MeshStandardMaterial({
      color: 0x222326,
      roughness: 0.85,
      metalness: 0.05,
      name: 'TireRubber'
    });

    // Silver wheel hubcap
    const wheelSilver = new THREE.MeshStandardMaterial({
      color: 0xd2d7df,
      roughness: 0.28,
      metalness: 0.65,
      name: 'WheelSilver'
    });

    // Dark steel wheel behind hubcap
    const wheelSteel = new THREE.MeshStandardMaterial({
      color: 0x1e2024,
      roughness: 0.65,
      metalness: 0.5,
      name: 'WheelSteel'
    });

    // Dark interior cabin
    const interiorDark = new THREE.MeshStandardMaterial({
      color: 0x24262b,
      roughness: 0.9,
      metalness: 0.05,
      name: 'InteriorDark'
    });

    // License plate
    const licensePlate = new THREE.MeshStandardMaterial({
      color: 0x18191c,
      roughness: 0.6,
      metalness: 0.1,
      name: 'LicensePlate'
    });

    // Volumetric headlight beam cone
    const beamConeMat = new THREE.MeshBasicMaterial({
      color: 0xfff3d6,
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
      reflector,
      bulb,
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
    // Proportions:
    // Length: 3.40m (Z: -1.70 to +1.70)
    // Width: 1.48m (X: -0.74 to +0.74)
    // Height: 1.49m (Y: 0.20 to 1.49)
    // Wheelbase: 2.24m (Front axle Z = 1.08, Rear axle Z = -1.16)
    // Wheel Radius: 0.28m, Ground Clearance: 0.18m

    const c = this.chassisGroup;

    this.buildContinuousBodyShell(c);
    this.buildFrontFascia(c);
    this.buildRearFascia(c);
    this.buildGreenhouseAndWindows(c);
    this.buildInteriorCabin(c);
    this.buildExteriorAccessories(c);
    this.buildHeadlightBeams(c);
    this.buildWheels();
    this.buildGroundShadowPlane();

    // Enable cast and receive shadows
    this.chassisGroup.traverse((obj) => {
      if (obj.isMesh && obj.name !== 'CarGroundShadow') {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }

  buildContinuousBodyShell(parent) {
    const mat = this.materials.bodyPaint;
    const trimMat = this.materials.blackTrim;

    // 1. Lower Monocoque Tub (spans full length with wheel clearance)
    // Center floor section between wheels
    const floorGeo = new THREE.BoxGeometry(1.42, 0.28, 2.10);
    const floor = new THREE.Mesh(floorGeo, mat);
    floor.position.set(0, 0.36, -0.04);
    parent.add(floor);

    // Front overhang section (in front of front wheels)
    const frontNoseGeo = new THREE.BoxGeometry(1.42, 0.32, 0.62);
    const frontNose = new THREE.Mesh(frontNoseGeo, mat);
    frontNose.position.set(0, 0.40, 1.39);
    parent.add(frontNose);

    // Rear overhang section (behind rear wheels)
    const rearTailGeo = new THREE.BoxGeometry(1.42, 0.32, 0.54);
    const rearTail = new THREE.Mesh(rearTailGeo, mat);
    rearTail.position.set(0, 0.40, -1.43);
    parent.add(rearTail);

    // 2. Wheel Arch Surrounds (smooth contoured fenders, NOT floating blocks!)
    // Front and rear fender arches on left and right sides
    const wheelArches = [
      { x: -0.68, z: 1.08, isFront: true },
      { x: 0.68, z: 1.08, isFront: true },
      { x: -0.68, z: -1.16, isFront: false },
      { x: 0.68, z: -1.16, isFront: false }
    ];

    wheelArches.forEach((w) => {
      // Upper curved fender lip
      const archCrownGeo = new THREE.BoxGeometry(0.08, 0.14, 0.68);
      const archCrown = new THREE.Mesh(archCrownGeo, mat);
      archCrown.position.set(w.x, 0.58, w.z);
      parent.add(archCrown);

      // Inner dark wheel liner
      const linerGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.16, 12, 1, false, 0, Math.PI);
      const liner = new THREE.Mesh(linerGeo, trimMat);
      liner.rotation.z = Math.PI / 2;
      liner.position.set(w.x > 0 ? 0.64 : -0.64, 0.32, w.z);
      parent.add(liner);
    });

    // 3. Mid-Body Beltline & Door Panels
    const midBodyGeo = new THREE.BoxGeometry(1.42, 0.34, 3.22);
    const midBody = new THREE.Mesh(midBodyGeo, mat);
    midBody.position.set(0, 0.69, -0.02);
    parent.add(midBody);

    // Subtle horizontal shoulder crease running through door handles
    [-0.725, 0.725].forEach((x) => {
      const creaseGeo = new THREE.BoxGeometry(0.015, 0.04, 3.16);
      const crease = new THREE.Mesh(creaseGeo, mat);
      crease.position.set(x, 0.84, -0.02);
      parent.add(crease);
    });

    // 4. Sloping Front Hood (slopes gently down to the grille)
    const hoodGeo = new THREE.BoxGeometry(1.36, 0.12, 0.90);
    const hood = new THREE.Mesh(hoodGeo, mat);
    hood.position.set(0, 0.85, 1.15);
    hood.rotation.x = 0.09; // authentic hood rake
    parent.add(hood);

    // Hood side ridges (authentic Alto character lines)
    [-0.56, 0.56].forEach((x) => {
      const ridgeGeo = new THREE.BoxGeometry(0.03, 0.02, 0.86);
      const ridge = new THREE.Mesh(ridgeGeo, mat);
      ridge.position.set(x, 0.90, 1.15);
      ridge.rotation.x = 0.09;
      parent.add(ridge);
    });

    // 5. Roof Panel (Kei car flat roof with subtle crown & longitudinal stiffener channels)
    const roofGeo = new THREE.BoxGeometry(1.24, 0.06, 1.82);
    const roof = new THREE.Mesh(roofGeo, mat);
    roof.position.set(0, 1.48, -0.28);
    parent.add(roof);

    // 3 Longitudinal roof ribs / flutes (prominent on Suzuki Alto)
    [-0.32, 0, 0.32].forEach((x) => {
      const ribGeo = new THREE.BoxGeometry(0.022, 0.015, 1.64);
      const rib = new THREE.Mesh(ribGeo, mat);
      rib.position.set(x, 1.515, -0.28);
      parent.add(rib);
    });

    // 6. Solid C-Pillars (authentic wide white pillar behind rear doors)
    [-0.64, 0.64].forEach((x) => {
      const cPillarGeo = new THREE.BoxGeometry(0.12, 0.54, 0.44);
      const cPillar = new THREE.Mesh(cPillarGeo, mat);
      cPillar.position.set(x, 1.20, -1.18);
      cPillar.rotation.x = 0.10;
      parent.add(cPillar);
    });

    // 7. Dark Underbody Skid Plate
    const underGeo = new THREE.BoxGeometry(1.30, 0.06, 3.15);
    const under = new THREE.Mesh(underGeo, trimMat);
    under.position.set(0, 0.22, -0.02);
    parent.add(under);
  }

  buildFrontFascia(parent) {
    const mat = this.materials.bodyPaint;
    const trimMat = this.materials.blackTrim;
    const chromeMat = this.materials.chrome;

    // 1. Upper Front Fascia Header
    const headerGeo = new THREE.BoxGeometry(1.38, 0.20, 0.14);
    const header = new THREE.Mesh(headerGeo, mat);
    header.position.set(0, 0.77, 1.63);
    parent.add(header);

    // ==========================================
    // 2. THE SIGNATURE ASYMMETRIC ALTO GRILLE
    // Left (viewer left / car's right): 4 vertical chrome/dark slats
    // Center: Chrome Suzuki 'S' Emblem
    // Right (viewer right / car's left): 1 horizontal slit
    // ==========================================
    const grilleBackGeo = new THREE.BoxGeometry(0.68, 0.13, 0.02);
    const grilleBack = new THREE.Mesh(grilleBackGeo, trimMat);
    grilleBack.position.set(0, 0.76, 1.705);
    parent.add(grilleBack);

    // 4 Vertical Slits on the left side (x = -0.27 to -0.12)
    [-0.26, -0.21, -0.16, -0.11].forEach((x) => {
      const slitGeo = new THREE.BoxGeometry(0.016, 0.085, 0.025);
      const slit = new THREE.Mesh(slitGeo, trimMat);
      slit.position.set(x, 0.76, 1.72);
      parent.add(slit);

      // Silver bezel around each slit
      const slitRimGeo = new THREE.BoxGeometry(0.022, 0.092, 0.008);
      const slitRim = new THREE.Mesh(slitRimGeo, chromeMat);
      slitRim.position.set(x, 0.76, 1.725);
      parent.add(slitRim);
    });

    // Suzuki 'S' Emblem in Center
    const sLogoGroup = new THREE.Group();
    sLogoGroup.position.set(0, 0.76, 1.725);

    const sDiagonal1 = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.018, 0.012), chromeMat);
    sDiagonal1.rotation.z = 0.55;
    sLogoGroup.add(sDiagonal1);

    const sDiagonal2 = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.018, 0.012), chromeMat);
    sDiagonal2.rotation.z = -0.55;
    sLogoGroup.add(sDiagonal2);

    const sBack = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.075, 0.006), chromeMat);
    sLogoGroup.add(sBack);
    parent.add(sLogoGroup);

    // 1 Horizontal Slot on the right side (x = +0.18)
    const horizSlot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.022, 0.02), trimMat);
    horizSlot.position.set(0.18, 0.76, 1.715);
    parent.add(horizSlot);

    // 3. HEADLIGHT ASSEMBLIES (Large Trapezoidal Housings)
    [-1, 1].forEach((side) => {
      const headGroup = new THREE.Group();
      headGroup.position.set(side * 0.52, 0.76, 1.66);

      // Headlight Chrome Reflector Housing
      const housingGeo = new THREE.BoxGeometry(0.24, 0.16, 0.08);
      const housing = new THREE.Mesh(housingGeo, this.materials.reflector);
      headGroup.add(housing);

      // Circular Projector Reflector Bowl
      const bowlGeo = new THREE.CylinderGeometry(0.055, 0.065, 0.04, 16);
      const bowl = new THREE.Mesh(bowlGeo, this.materials.reflector);
      bowl.rotation.x = Math.PI / 2;
      bowl.position.set(-side * 0.02, 0.01, 0.025);
      headGroup.add(bowl);

      // Bulb center
      const bulbMesh = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 12), this.materials.bulb);
      bulbMesh.position.set(-side * 0.02, 0.01, 0.045);
      headGroup.add(bulbMesh);

      // Outer-bottom Amber Turn Signal Indicator
      const amberMesh = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.045, 0.025), this.materials.amberLens);
      amberMesh.position.set(side * 0.08, -0.04, 0.035);
      headGroup.add(amberMesh);

      // Clear Glass Lens Outer Cover
      const lensMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.17, 0.015), this.materials.headlightGlass);
      lensMesh.position.set(0, 0, 0.045);
      headGroup.add(lensMesh);

      parent.add(headGroup);
    });

    // 4. FRONT LOWER BUMPER
    // Upper Bumper Chin
    const chinGeo = new THREE.BoxGeometry(1.42, 0.22, 0.14);
    const chin = new THREE.Mesh(chinGeo, mat);
    chin.position.set(0, 0.46, 1.64);
    parent.add(chin);

    // Lower Central Air Intake (Wide black rectangular slot)
    const intakeGeo = new THREE.BoxGeometry(0.96, 0.15, 0.08);
    const intake = new THREE.Mesh(intakeGeo, trimMat);
    intake.position.set(0, 0.40, 1.68);
    parent.add(intake);

    // Horizontal cooling grille slats
    [-0.035, 0.035].forEach((yOff) => {
      const slatGeo = new THREE.BoxGeometry(0.94, 0.014, 0.015);
      const slat = new THREE.Mesh(slatGeo, mat);
      slat.position.set(0, 0.40 + yOff, 1.72);
      parent.add(slat);
    });

    // Front License Plate Holder (Black plate with white border)
    const plateGeo = new THREE.BoxGeometry(0.36, 0.14, 0.02);
    const plate = new THREE.Mesh(plateGeo, this.materials.licensePlate);
    plate.position.set(0, 0.40, 1.735);
    parent.add(plate);

    // Lower Bumper Air Dam Lip
    const lipGeo = new THREE.BoxGeometry(1.40, 0.07, 0.10);
    const lip = new THREE.Mesh(lipGeo, mat);
    lip.position.set(0, 0.25, 1.63);
    parent.add(lip);

    // Corner fog light pockets
    [-0.56, 0.56].forEach((x) => {
      const fogPocket = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), trimMat);
      fogPocket.position.set(x, 0.38, 1.67);
      parent.add(fogPocket);
    });
  }

  buildRearFascia(parent) {
    const mat = this.materials.bodyPaint;
    const trimMat = this.materials.blackTrim;
    const chromeMat = this.materials.chrome;

    // 1. Vertical Rear Tailgate Panel
    const tailgateGeo = new THREE.BoxGeometry(1.36, 0.65, 0.10);
    const tailgate = new THREE.Mesh(tailgateGeo, mat);
    tailgate.position.set(0, 0.80, -1.60);
    parent.add(tailgate);

    // 2. Rear Suzuki 'S' Emblem centered on tailgate
    const rearS = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.065, 0.012), chromeMat);
    rearS.position.set(0, 0.84, -1.66);
    parent.add(rearS);

    // 3. Black Tailgate Handle / Hatch Opener Button
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.045, 0.02), trimMat);
    handle.position.set(0, 0.74, -1.66);
    parent.add(handle);

    // 4. "ALTO" Chrome Badge on Lower-Right of Tailgate
    const altoBadge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.012), chromeMat);
    altoBadge.position.set(0.44, 0.70, -1.66);
    parent.add(altoBadge);

    // ==========================================
    // 5. BUMPER-MOUNTED TAILLIGHTS
    // In Suzuki Alto HA36, taillights are located IN THE LOWER BUMPER!
    // Flanking the recessed center license plate bay.
    // ==========================================
    const rearBumperGeo = new THREE.BoxGeometry(1.42, 0.32, 0.16);
    const rearBumper = new THREE.Mesh(rearBumperGeo, mat);
    rearBumper.position.set(0, 0.42, -1.58);
    parent.add(rearBumper);

    // Left and Right Bumper Taillight Assemblies
    [-0.48, 0.48].forEach((x) => {
      const tailGroup = new THREE.Group();
      tailGroup.position.set(x, 0.44, -1.665);

      // Outer Red Section (Running & Brake Light)
      const redGeo = new THREE.BoxGeometry(0.18, 0.075, 0.02);
      const redMesh = new THREE.Mesh(redGeo, this.materials.redTailLens);
      redMesh.position.set(x < 0 ? -0.05 : 0.05, 0, 0);
      tailGroup.add(redMesh);

      // Inner Clear Section (Reverse & Turn Signal)
      const clearGeo = new THREE.BoxGeometry(0.08, 0.075, 0.02);
      const clearMesh = new THREE.Mesh(clearGeo, this.materials.reverseLens);
      clearMesh.position.set(x < 0 ? 0.06 : -0.06, 0, 0);
      tailGroup.add(clearMesh);

      parent.add(tailGroup);
    });

    // Recessed License Plate Bay & Rear Plate
    const plateBay = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.18, 0.05), mat);
    plateBay.position.set(0, 0.34, -1.64);
    parent.add(plateBay);

    const rearPlate = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.14, 0.02), this.materials.licensePlate);
    rearPlate.position.set(0, 0.34, -1.67);
    parent.add(rearPlate);

    // Chrome Exhaust Pipe Tip under rear bumper
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 8), chromeMat);
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(-0.46, 0.22, -1.56);
    parent.add(exhaust);
  }

  buildGreenhouseAndWindows(parent) {
    const glassMat = this.materials.windowGlass;
    const bodyMat = this.materials.bodyPaint;
    const trimMat = this.materials.blackTrim;

    // 1. Swept-Back Front Windshield
    const windshieldGeo = new THREE.BoxGeometry(1.22, 0.58, 0.04);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, 1.18, 0.76);
    windshield.rotation.x = -0.56;
    parent.add(windshield);

    // Dual Windshield Wipers
    [-0.22, 0.22].forEach((x) => {
      const wiper = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.32, 0.012), trimMat);
      wiper.position.set(x, 0.99, 1.04);
      wiper.rotation.x = -0.56;
      wiper.rotation.z = -0.62;
      parent.add(wiper);
    });

    // Slender A-Pillars in Alpine White
    [-0.62, 0.62].forEach((x) => {
      const aPillar = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.64, 0.065), bodyMat);
      aPillar.position.set(x, 1.18, 0.74);
      aPillar.rotation.x = -0.56;
      aPillar.rotation.y = x > 0 ? -0.1 : 0.1;
      parent.add(aPillar);
    });

    // 2. Front Door Windows (Horizontal Beltline)
    [-0.67, 0.67].forEach((x) => {
      const frontWin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.42, 0.70), glassMat);
      frontWin.position.set(x, 1.20, 0.22);
      parent.add(frontWin);
    });

    // 3. Matte Black B-Pillars
    [-0.675, 0.675].forEach((x) => {
      const bPillar = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.48, 0.11), trimMat);
      bPillar.position.set(x, 1.20, -0.18);
      parent.add(bPillar);
    });

    // ==========================================
    // 4. SIGNATURE ALTO REAR DOOR WINDOW WITH UPWARD KINK!
    // Modeled with an authentic 2D shape extruded flat onto the side
    // ==========================================
    [-1, 1].forEach((side) => {
      const winGroup = new THREE.Group();
      winGroup.position.set(side * 0.67, 1.20, -0.60);

      // Create 2D profile of the kinky rear window
      // Coordinates in (Z, Y):
      // Front-bottom: (0.35, -0.21)
      // Kink-corner: (-0.08, -0.21)
      // Slant-up: (-0.35, 0.12)
      // Rear-top: (-0.35, 0.21)
      // Front-top: (0.35, 0.21)
      const shape = new THREE.Shape();
      shape.moveTo(0.35, -0.21);
      shape.lineTo(-0.08, -0.21);
      shape.lineTo(-0.35, 0.12); // upward slant kink!
      shape.lineTo(-0.35, 0.21);
      shape.lineTo(0.35, 0.21);
      shape.closePath();

      const shapeGeo = new THREE.ShapeGeometry(shape);
      const winMesh = new THREE.Mesh(shapeGeo, glassMat);
      winMesh.rotation.y = Math.PI / 2;
      winMesh.position.x = 0;
      winGroup.add(winMesh);

      // Black trim border around the kinked window
      const borderMesh = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.03, 0.38), trimMat);
      borderMesh.position.set(0, -0.05, -0.21);
      borderMesh.rotation.x = -0.42; // follows upward slant
      winGroup.add(borderMesh);

      parent.add(winGroup);
    });

    // 5. Steep Vertical Rear Hatch Window
    const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.48, 0.03), glassMat);
    rearGlass.position.set(0, 1.23, -1.53);
    rearGlass.rotation.x = 0.15;
    parent.add(rearGlass);

    // High Mount Stop Lamp (HMSL) - Centered red LED above rear glass
    const hmsl = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.02), this.materials.highBrakeLens);
    hmsl.position.set(0, 1.48, -1.48);
    parent.add(hmsl);

    // Rear Window Wiper
    const rearWiper = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.22, 0.012), trimMat);
    rearWiper.position.set(-0.06, 1.10, -1.55);
    rearWiper.rotation.z = 1.35;
    rearWiper.rotation.x = 0.15;
    parent.add(rearWiper);
  }

  buildInteriorCabin(parent) {
    const intMat = this.materials.interiorDark;

    // Dashboard
    const dash = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.18, 0.42), intMat);
    dash.position.set(0, 0.91, 0.62);
    parent.add(dash);

    // Steering Wheel (Pakistani RHD on right side)
    const steer = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.016, 8, 16), intMat);
    steer.position.set(0.32, 1.02, 0.46);
    steer.rotation.x = 0.35;
    parent.add(steer);

    // Front Bucket Seats with Headrests
    [-0.32, 0.32].forEach((x) => {
      const seatGroup = new THREE.Group();
      seatGroup.position.set(x, 0.72, 0.12);

      // Cushion
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.13, 0.42), intMat);
      seatGroup.add(cushion);

      // Backrest
      const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.44, 0.10), intMat);
      backrest.position.set(0, 0.25, -0.16);
      backrest.rotation.x = -0.14;
      seatGroup.add(backrest);

      // Headrest (prominently visible through glass in reference image)
      const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.15, 0.09), intMat);
      headrest.position.set(0, 0.52, -0.19);
      seatGroup.add(headrest);

      parent.add(seatGroup);
    });

    // Rear Bench Seat
    const rearBench = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.36, 0.42), intMat);
    rearBench.position.set(0, 0.74, -0.72);
    parent.add(rearBench);

    // Interior Rearview Mirror
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.04, 0.015), intMat);
    mirror.position.set(0, 1.35, 0.66);
    parent.add(mirror);
  }

  buildExteriorAccessories(parent) {
    const mat = this.materials.bodyPaint;
    const trimMat = this.materials.blackTrim;
    const chromeMat = this.materials.chrome;

    // 1. Aerodynamic Side Mirrors
    [-1, 1].forEach((side) => {
      const mirrorGroup = new THREE.Group();
      mirrorGroup.position.set(side * 0.73, 1.04, 0.64);

      // Black stalk
      const stalk = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.025, 0.035), trimMat);
      stalk.position.set(side * 0.03, -0.01, 0);
      mirrorGroup.add(stalk);

      // Body-color housing
      const housing = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.13), mat);
      housing.position.set(side * 0.075, 0, 0);
      mirrorGroup.add(housing);

      // Reflective mirror glass
      const mirrorGlass = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.065, 0.008), chromeMat);
      mirrorGlass.position.set(side * 0.075, 0, -0.062);
      mirrorGroup.add(mirrorGlass);

      parent.add(mirrorGroup);
    });

    // 2. Door Handles (Front & Rear)
    const handles = [
      { x: -0.73, z: 0.14 },
      { x: 0.73, z: 0.14 },
      { x: -0.73, z: -0.46 },
      { x: 0.73, z: -0.46 }
    ];

    handles.forEach((pos) => {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.11), chromeMat);
      handle.position.set(pos.x, 0.88, pos.z);
      parent.add(handle);
    });

    // 3. Fender Amber Turn Signal Repeaters
    [-0.73, 0.73].forEach((x) => {
      const repeater = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.02, 0.035), this.materials.amberLens);
      repeater.position.set(x, 0.81, 0.80);
      parent.add(repeater);
    });

    // 4. Rear Stub Radio Antenna
    const antennaBase = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.02, 0.05), trimMat);
    antennaBase.position.set(0, 1.51, -1.05);
    parent.add(antennaBase);

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.007, 0.18, 6), trimMat);
    mast.position.set(0, 1.59, -1.10);
    mast.rotation.x = -0.55;
    parent.add(mast);
  }

  buildHeadlightBeams(parent) {
    // Spotlights & semi-transparent volumetric cones for realistic night/sunset lighting
    [-1, 1].forEach((side) => {
      const spot = new THREE.SpotLight(0xfffaea, 0, 36, Math.PI / 6, 0.45, 1.2);
      spot.position.set(side * 0.52, 0.76, 1.74);
      spot.target.position.set(side * 0.52, 0, 18);
      parent.add(spot);
      parent.add(spot.target);
      this.interactiveLights.spotLights.push(spot);

      const coneGeo = new THREE.ConeGeometry(2.2, 14, 16, 1, true);
      const beamCone = new THREE.Mesh(coneGeo, this.materials.beamConeMat);
      beamCone.position.set(side * 0.52, 0.76, 8.5);
      beamCone.rotation.x = -Math.PI / 2;
      beamCone.visible = false;
      parent.add(beamCone);
      this.interactiveLights.beamCones.push(beamCone);
    });
  }

  buildWheels() {
    const wheelConfigs = [
      { key: 'fl', x: -0.66, y: 0.28, z: 1.08, isFront: true },
      { key: 'fr', x: 0.66, y: 0.28, z: 1.08, isFront: true },
      { key: 'rl', x: -0.66, y: 0.28, z: -1.16, isFront: false },
      { key: 'rr', x: 0.66, y: 0.28, z: -1.16, isFront: false }
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
    // Features 4 wide symmetric cutouts showing the steel rim inside
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
    this.materials.bulb.emissive.setHex(enabled ? 0xfffae8 : 0x000000);
    this.materials.bulb.emissiveIntensity = enabled ? 2.5 : 0;

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
