import * as THREE from 'three';

/**
 * Arcade vehicle physics simulation
 * Inspired by Bruno Simon's driving mechanics:
 * - Responsive acceleration, responsive steering, drift/tire slip
 * - Chassis spring pitch (dive/squat) & roll (cornering lean)
 * - Velocity-based wheel spinning and steering linkage
 */
export class VehiclePhysics {
  constructor(carModel) {
    this.carModel = carModel;

    // Transform
    this.position = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.quaternion = new THREE.Quaternion();

    // Motion parameters (tuned for Suzuki Alto 660cc Kei car)
    this.speed = 0; // m/s
    this.maxForwardSpeed = 38.0; // ~137 km/h
    this.maxReverseSpeed = -10.0; // ~36 km/h
    this.acceleration = 14.0; // m/s^2
    this.reverseAcceleration = 8.0;
    this.brakeDeceleration = 28.0;
    this.naturalDeceleration = 4.5; // engine braking / rolling resistance
    this.handbrakeDeceleration = 20.0;

    // Steering
    this.steeringAngle = 0; // current wheel angle in radians
    this.maxSteeringAngle = 0.58; // ~33 degrees
    this.steeringSpeed = 4.5;
    this.steeringReturnSpeed = 6.0;

    // Drifting & Grip
    this.lateralFriction = 0.88;
    this.driftSlip = 0; // 0 (full grip) to 1 (full slide)
    this.angularVelocity = 0;

    // Suspension dynamics
    this.pitch = 0;
    this.targetPitch = 0;
    this.roll = 0;
    this.targetRoll = 0;

    // Reset position
    this.spawnPoint = new THREE.Vector3(0, 0, 0);
    this.spawnRotationY = 0;

    // Sync initial position
    this.applyTransform();
  }

  setSpawn(x, y, z, rotY = 0) {
    this.spawnPoint.set(x, y, z);
    this.spawnRotationY = rotY;
    this.reset();
  }

  reset() {
    this.position.copy(this.spawnPoint);
    this.rotation.set(0, this.spawnRotationY, 0);
    this.speed = 0;
    this.steeringAngle = 0;
    this.angularVelocity = 0;
    this.pitch = 0;
    this.roll = 0;
    this.driftSlip = 0;
    this.applyTransform();
  }

  update(dt, input) {
    // 1. Steering Input & Speed Sensitivity
    // At high speeds, reduce max steer angle for stability
    const speedRatio = Math.min(Math.abs(this.speed) / this.maxForwardSpeed, 1);
    const speedSensitiveMaxSteer = this.maxSteeringAngle * (1.0 - speedRatio * 0.45);

    let targetSteer = 0;
    if (input.left) targetSteer += speedSensitiveMaxSteer;
    if (input.right) targetSteer -= speedSensitiveMaxSteer;

    if (targetSteer !== 0) {
      this.steeringAngle = THREE.MathUtils.lerp(this.steeringAngle, targetSteer, dt * this.steeringSpeed);
    } else {
      this.steeringAngle = THREE.MathUtils.lerp(this.steeringAngle, 0, dt * this.steeringReturnSpeed);
    }

    // 2. Longitudinal Acceleration & Braking
    const isHandbrake = input.handbrake;

    if (input.forward) {
      if (this.speed < -0.2) {
        // Active braking while reversing
        this.speed += this.brakeDeceleration * dt;
      } else {
        // Forward drive
        this.speed += this.acceleration * dt;
        if (this.speed > this.maxForwardSpeed) this.speed = this.maxForwardSpeed;
      }
    } else if (input.backward) {
      if (this.speed > 0.2) {
        // Active braking while going forward
        this.speed -= this.brakeDeceleration * dt;
      } else {
        // Reverse drive
        this.speed -= this.reverseAcceleration * dt;
        if (this.speed < this.maxReverseSpeed) this.speed = this.maxReverseSpeed;
      }
    } else {
      // Natural rolling friction & engine braking
      if (Math.abs(this.speed) > 0.1) {
        const sign = Math.sign(this.speed);
        this.speed -= sign * this.naturalDeceleration * dt;
        if (sign !== Math.sign(this.speed)) this.speed = 0;
      } else {
        this.speed = 0;
      }
    }

    // Handbrake applied
    if (isHandbrake) {
      const sign = Math.sign(this.speed);
      this.speed -= sign * this.handbrakeDeceleration * dt;
      if (sign !== Math.sign(this.speed)) this.speed = 0;
    }

    // 3. Turning & Yaw Rotation
    // Wheelbase L ~ 2.44m
    const wheelbase = 2.44;
    let turnFactor = (this.speed / wheelbase) * Math.sin(this.steeringAngle);

    // Drifting amplification on handbrake or sharp high-speed steering
    const isDrifting = isHandbrake && Math.abs(this.speed) > 4.0;
    if (isDrifting) {
      this.driftSlip = THREE.MathUtils.lerp(this.driftSlip, 0.85, dt * 6.0);
      turnFactor *= 1.45; // whip tail around
    } else {
      this.driftSlip = THREE.MathUtils.lerp(this.driftSlip, 0, dt * 4.0);
    }

    this.rotation.y += turnFactor * dt;

    // 4. Position Update along heading
    // Forward direction vector in world space:
    // With Three.js coordinates, if rotation.y = 0, forward is +Z
    const forwardVec = new THREE.Vector3(
      Math.sin(this.rotation.y),
      0,
      Math.cos(this.rotation.y)
    );

    const distanceDelta = this.speed * dt;
    this.position.addScaledVector(forwardVec, distanceDelta);

    // 5. Suspension Pitch & Roll
    // Dive on braking (positive pitch tilts nose down), Squat on accel
    let targetPitch = 0;
    if (input.forward && this.speed >= 0) targetPitch = -0.035; // squat
    if (input.backward && this.speed > 0) targetPitch = 0.055; // dive under brake
    if (isHandbrake) targetPitch = 0.04;
    this.pitch = THREE.MathUtils.lerp(this.pitch, targetPitch, dt * 8.0);

    // Roll into turns (centrifugal body lean)
    const lateralG = (this.speed * turnFactor) / 9.81;
    const targetRoll = THREE.MathUtils.clamp(-lateralG * 0.12, -0.08, 0.08);
    this.roll = THREE.MathUtils.lerp(this.roll, targetRoll, dt * 6.0);

    // 6. Apply to 3D Model
    this.applyTransform();
    this.carModel.setSteeringAngle(this.steeringAngle);
    this.carModel.spinWheels(distanceDelta);
    this.carModel.setChassisDynamics(this.pitch, this.roll);
  }

  applyTransform() {
    this.carModel.group.position.copy(this.position);
    this.carModel.group.rotation.y = this.rotation.y;
  }

  getSpeedKmh() {
    return Math.abs(Math.round(this.speed * 3.6));
  }

  getGear() {
    if (Math.abs(this.speed) < 0.2 && Math.abs(this.angularVelocity) < 0.05) {
      return 'N';
    }
    return this.speed >= 0 ? 'D' : 'R';
  }

  isSlipping() {
    return this.driftSlip > 0.4 || (Math.abs(this.speed) > 12 && Math.abs(this.steeringAngle) > 0.4);
  }
}
