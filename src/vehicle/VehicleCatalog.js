/**
 * Vehicle Catalog Registry
 * Defines all available drivable vehicles in the NUST Virtual Tour
 */
export const VEHICLE_CATALOG = [
  {
    id: 'alto_glb',
    name: 'Suzuki Alto (3D Textured)',
    badge: '660cc',
    description: 'Realistic textured Suzuki Alto HA36S',
    type: 'gltf',
    modelUrl: './models/suzuki_alto.glb',
    scale: 3.3,
    yOffset: 0.88,
    rotationY: 0,
    handling: {
      accel: 14.0,
      maxSpeed: 38.0,
      boostAccel: 25.0,
      boostMaxSpeed: 54.0
    }
  },
  {
    id: 'f1_race',
    name: 'F1 Speedster',
    badge: 'FORMULA',
    description: 'NUST Formula Student Race Car',
    type: 'gltf',
    modelUrl: './models/f1_race.glb',
    scale: 1.35,
    yOffset: 0.0,
    rotationY: 0,
    handling: {
      accel: 20.0,
      maxSpeed: 45.0,
      boostAccel: 32.0,
      boostMaxSpeed: 65.0
    }
  },
  {
    id: 'firetruck',
    name: 'NUST Fire Rescue',
    badge: 'RESCUE',
    description: 'NUST Campus Emergency Response Engine',
    type: 'gltf',
    modelUrl: './models/firetruck.glb',
    scale: 1.15,
    yOffset: 0.0,
    rotationY: 0,
    handling: {
      accel: 11.0,
      maxSpeed: 32.0,
      boostAccel: 19.0,
      boostMaxSpeed: 46.0
    }
  },
  {
    id: 'hatchback',
    name: 'Sports Hatchback',
    badge: 'SPORT',
    description: 'Kenney Sports Edition Hot Hatch',
    type: 'gltf',
    modelUrl: './models/hatchback_sports.glb',
    scale: 1.25,
    yOffset: 0.0,
    rotationY: 0,
    handling: {
      accel: 15.0,
      maxSpeed: 40.0,
      boostAccel: 26.0,
      boostMaxSpeed: 56.0
    }
  },
  {
    id: 'alto_poly',
    name: 'Suzuki Alto (Polygonal)',
    badge: 'LOW-POLY',
    description: 'Pure Alpine White Procedural Mesh',
    type: 'procedural',
    handling: {
      accel: 14.0,
      maxSpeed: 38.0,
      boostAccel: 25.0,
      boostMaxSpeed: 54.0
    }
  }
];
