import * as THREE from 'three';

/**
 * Arcade vehicle physics simulation with smooth drift dynamics,
 * campus-calibrated speedometer (40 km/h normal limit), and Shift Boost Mode.
 */
export class VehiclePhysics {
  constructor(carModel) {
    this.carModel = carModel;

    // Transform
    this.position = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.quaternion = new THREE.Quaternion();

    // Base motion parameters
    this.speed = 0; // m/s
    this.baseForwardSpeed = 38.0; // normal cruising top speed (maps to 40 km/h display)
    this.maxForwardSpeed = 38.0;
    this.maxReverseSpeed = -10.0;
    this.baseAcceleration = 14.0;
    this.acceleration = 14.0;
    this.reverseAcceleration = 8.0;
    this.brakeDeceleration = 26.0;
    this.naturalDeceleration = 4.2; // engine braking / rolling resistance

    // Toned-down, controllable handbrake & drift physics
    // Reduced from 20.0 to 7.5 so momentum carries through the slide
    this.handbrakeDeceleration = 7.5;
    this.lateralFriction = 0.90;
    this.driftSlip = 0;
    this.angularVelocity = 0;

    // Boost Mode (Shift key)
    this.isBoosting = false;
    this.boostAmount = 100.0; // 0 to 100%
    this.boostDrainRate = 12.0; // drains over ~8.5 seconds
    this.boostRechargeRate = 14.0; // recharges when not used
    this.boostMultiplierAccel = 1.75;
    this.boostMultiplierSpeed = 1.45; // allows surging beyond 40 km/h display

    // Steering
    this.steeringAngle = 0;
    this.maxSteeringAngle = 0.56; // ~32 degrees
    this.steeringSpeed = 4.5;
    this.steeringReturnSpeed = 6.0;

    // Suspension dynamics
    this.pitch = 0;
    this.roll = 0;

    // Reset spawn position
    this.spawnPoint = new THREE.Vector3(0, 0, 0);
    this.spawnRotationY = 0;

    this.applyTransform();
  }

  setModel(newModel) {
    this.carModel = newModel;
    this.applyTransform();
    if (typeof this.carModel.setSteeringAngle === 'function') {
      this.carModel.setSteeringAngle(this.steeringAngle);
    }
  }

  applyHandling(cfg = {}) {
    if (cfg.accel) this.baseAcceleration = cfg.accel;
    if (cfg.maxSpeed) this.baseForwardSpeed = cfg.maxSpeed;
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
    this.isBoosting = false;
    this.boostAmount = 100.0;
    if (this.carModel && typeof this.carModel.setBoost === 'function') {
      this.carModel.setBoost(false);
    }
    this.applyTransform();
  }

  update(dt, input) {
    // 1. Boost Mode Logic (Shift key)
    const wantsBoost = Boolean(input.boost && input.forward && this.speed > 1.0);
    if (wantsBoost && this.boostAmount > 2.0) {
      this.isBoosting = true;
      this.boostAmount = Math.max(0, this.boostAmount - this.boostDrainRate * dt);
      this.acceleration = this.baseAcceleration * this.boostMultiplierAccel;
      this.maxForwardSpeed = this.baseForwardSpeed * this.boostMultiplierSpeed;
    } else {
      this.isBoosting = false;
      this.boostAmount = Math.min(100.0, this.boostAmount + this.boostRechargeRate * dt);
      this.acceleration = this.baseAcceleration;
      this.maxForwardSpeed = this.baseForwardSpeed;
    }

    if (this.carModel && typeof this.carModel.setBoost === 'function') {
      this.carModel.setBoost(this.isBoosting);
    }

    // 2. Steering Input & Speed Sensitivity
    const speedRatio = Math.min(Math.abs(this.speed) / this.baseForwardSpeed, 1.0);
    const speedSensitiveMaxSteer = this.maxSteeringAngle * (1.0 - speedRatio * 0.40);

    let targetSteer = 0;
    if (input.left) targetSteer += speedSensitiveMaxSteer;
    if (input.right) targetSteer -= speedSensitiveMaxSteer;

    if (targetSteer !== 0) {
      this.steeringAngle = THREE.MathUtils.lerp(this.steeringAngle, targetSteer, dt * this.steeringSpeed);
    } else {
      this.steeringAngle = THREE.MathUtils.lerp(this.steeringAngle, 0, dt * this.steeringReturnSpeed);
    }

    // 3. Longitudinal Acceleration & Braking
    const isHandbrake = input.handbrake;

    if (input.forward) {
      if (this.speed < -0.2) {
        this.speed += this.brakeDeceleration * dt;
      } else {
        this.speed += this.acceleration * dt;
        if (this.speed > this.maxForwardSpeed) this.speed = this.maxForwardSpeed;
      }
    } else if (input.backward) {
      if (this.speed > 0.2) {
        this.speed -= this.brakeDeceleration * dt;
      } else {
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

    // Handbrake applied: Gentle deceleration so drift carries forward
    if (isHandbrake) {
      const sign = Math.sign(this.speed);
      this.speed -= sign * this.handbrakeDeceleration * dt;
      if (sign !== Math.sign(this.speed)) this.speed = 0;
    }

    // 4. Turning & Controllable Drift Dynamics
    const wheelbase = 2.44;
    let turnFactor = (this.speed / wheelbase) * Math.sin(this.steeringAngle);

    // Smooth controllable drift (toned down from 1.45 to 1.14 so it drifts without 180 snap)
    const isDrifting = isHandbrake && Math.abs(this.speed) > 3.5;
    if (isDrifting) {
      this.driftSlip = THREE.MathUtils.lerp(this.driftSlip, 0.70, dt * 5.0);
      turnFactor *= 1.14; // smooth drift angle
    } else {
      this.driftSlip = THREE.MathUtils.lerp(this.driftSlip, 0, dt * 4.0);
    }

    this.rotation.y += turnFactor * dt;

    // 5. Position Update along heading
    const forwardVec = new THREE.Vector3(
      Math.sin(this.rotation.y),
      0,
      Math.cos(this.rotation.y)
    );

    const distanceDelta = this.speed * dt;
    this.position.addScaledVector(forwardVec, distanceDelta);

    // 6. Suspension Pitch & Roll
    let targetPitch = 0;
    if (input.forward && this.speed >= 0) targetPitch = this.isBoosting ? -0.055 : -0.035;
    if (input.backward && this.speed > 0) targetPitch = 0.055;
    if (isHandbrake) targetPitch = 0.03;
    this.pitch = THREE.MathUtils.lerp(this.pitch, targetPitch, dt * 8.0);

    const lateralG = (this.speed * turnFactor) / 9.81;
    const targetRoll = THREE.MathUtils.clamp(-lateralG * 0.12, -0.08, 0.08);
    this.roll = THREE.MathUtils.lerp(this.roll, targetRoll, dt * 6.0);

    // 7. Apply to Active 3D Model
    this.applyTransform();
    if (this.carModel) {
      if (typeof this.carModel.setSteeringAngle === 'function') {
        this.carModel.setSteeringAngle(this.steeringAngle);
      }
      if (typeof this.carModel.spinWheels === 'function') {
        this.carModel.spinWheels(distanceDelta);
      }
      if (typeof this.carModel.setChassisDynamics === 'function') {
        this.carModel.setChassisDynamics(this.pitch, this.roll);
      }
    }
  }

  applyTransform() {
    if (this.carModel && this.carModel.group) {
      this.carModel.group.position.copy(this.position);
      this.carModel.group.rotation.y = this.rotation.y;
    }
  }

  /**
   * Campus-Calibrated Speedometer:
   * - Normal cruising speed (0 to baseForwardSpeed) maps to 0 - 40 km/h (NUST limit)
   * - In Boost mode, smoothly surges beyond 40 km/h up to 75 km/h
   */
  getSpeedKmh() {
    const absSpeed = Math.abs(this.speed);
    if (absSpeed < 0.2) return 0;

    const normalRatio = Math.min(absSpeed / this.baseForwardSpeed, 1.0);
    let display = normalRatio * 40.0;

    // Surge beyond 40 when boosting
    if (absSpeed > this.baseForwardSpeed) {
      const extraRatio = (absSpeed - this.baseForwardSpeed) / (this.baseForwardSpeed * (this.boostMultiplierSpeed - 1.0));
      display += extraRatio * 32.0; // reaches ~72 km/h at full nitro
    }

    return Math.round(display);
  }

  getRealSpeedKmh() {
    return Math.abs(Math.round(this.speed * 3.6));
  }

  getBoostPercent() {
    return Math.round(this.boostAmount);
  }

  getGear() {
    if (Math.abs(this.speed) < 0.2) return 'N';
    return this.speed >= 0 ? 'D' : 'R';
  }

  isSlipping() {
    return this.driftSlip > 0.35 || (Math.abs(this.speed) > 12 && Math.abs(this.steeringAngle) > 0.38);
  }
}
