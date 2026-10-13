import * as THREE from 'three';
import { eventBus } from '../core/EventBus.js';

export const CameraMode = {
  CHASE: 'chase',
  INSPECT: 'inspect',
  HOOD: 'hood'
};

export class CameraManager {
  constructor(camera, domElement, targetVehicle) {
    this.camera = camera;
    this.domElement = domElement;
    this.targetVehicle = targetVehicle;

    this.mode = CameraMode.CHASE;
    this.modes = [CameraMode.CHASE, CameraMode.INSPECT, CameraMode.HOOD];
    this.modeIndex = 0;

    // Chase Camera parameters
    this.chaseDistance = 5.2;
    this.chaseHeight = 2.4;
    this.currentPosition = new THREE.Vector3(0, 5, -8);
    this.currentLookAt = new THREE.Vector3(0, 1, 0);

    // Orbit / Inspect Camera parameters
    this.orbitRadius = 4.6;
    this.orbitTheta = 0.6; // horizontal angle
    this.orbitPhi = 0.35; // vertical angle
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };

    this.setupInspectControls();
    this.setupEventListeners();
  }

  setupEventListeners() {
    eventBus.on('camera:cycle', () => {
      this.cycleMode();
    });

    eventBus.on('camera:setMode', (mode) => {
      this.setMode(mode);
    });
  }

  setupInspectControls() {
    // Mouse drag for 360 inspect
    this.domElement.addEventListener('pointerdown', (e) => {
      if (this.mode === CameraMode.INSPECT) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (this.isDragging && this.mode === CameraMode.INSPECT) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        this.orbitTheta -= deltaX * 0.008;
        this.orbitPhi = THREE.MathUtils.clamp(this.orbitPhi + deltaY * 0.008, 0.05, Math.PI / 2 - 0.05);

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });

    // Mouse wheel zoom
    this.domElement.addEventListener('wheel', (e) => {
      if (this.mode === CameraMode.INSPECT) {
        this.orbitRadius = THREE.MathUtils.clamp(this.orbitRadius + e.deltaY * 0.005, 2.0, 12.0);
        e.preventDefault();
      }
    }, { passive: false });
  }

  cycleMode() {
    this.modeIndex = (this.modeIndex + 1) % this.modes.length;
    this.setMode(this.modes[this.modeIndex]);
  }

  setMode(mode) {
    this.mode = mode;
    this.modeIndex = this.modes.indexOf(mode);
    eventBus.emit('camera:changed', this.mode);
  }

  setTargetVehicle(vehicle) {
    this.targetVehicle = vehicle;
  }

  update(dt) {
    const carPos = this.targetVehicle.position;
    const carRotY = this.targetVehicle.rotation.y;
    const carSpeed = this.targetVehicle.speed;
    const isBoosting = Boolean(this.targetVehicle.isBoosting);

    // Boost FOV kick (60° normal -> 68° when boosting)
    const targetFov = isBoosting ? 68.0 : 60.0;
    if (Math.abs(this.camera.fov - targetFov) > 0.05) {
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, THREE.MathUtils.clamp(dt * 5.0, 0, 1));
      this.camera.updateProjectionMatrix();
    }

    if (this.mode === CameraMode.CHASE) {
      // Dynamic chase camera with speed offset
      const speedFactor = Math.min(Math.abs(carSpeed) / 30, 1.0);
      const dynamicDist = this.chaseDistance + speedFactor * 1.5;
      const dynamicHeight = this.chaseHeight + speedFactor * 0.4;

      // Position behind car
      // In car space, forward is +Z, rear is -Z
      const idealOffset = new THREE.Vector3(
        -Math.sin(carRotY) * dynamicDist,
        dynamicHeight,
        -Math.cos(carRotY) * dynamicDist
      );

      const idealPosition = carPos.clone().add(idealOffset);

      // Smooth lag dampening
      const lerpSpeed = 6.0 * dt;
      this.currentPosition.lerp(idealPosition, THREE.MathUtils.clamp(lerpSpeed, 0, 1));
      this.camera.position.copy(this.currentPosition);

      // Look slightly ahead of car
      const lookAheadDist = 2.5 + speedFactor * 2.0;
      const idealLookAt = carPos.clone().add(new THREE.Vector3(
        Math.sin(carRotY) * lookAheadDist,
        0.8,
        Math.cos(carRotY) * lookAheadDist
      ));

      this.currentLookAt.lerp(idealLookAt, THREE.MathUtils.clamp(lerpSpeed * 1.5, 0, 1));
      this.camera.lookAt(this.currentLookAt);

    } else if (this.mode === CameraMode.INSPECT) {
      // Orbit around car center
      const targetLookAt = carPos.clone().add(new THREE.Vector3(0, 0.75, 0));

      const camX = targetLookAt.x + this.orbitRadius * Math.cos(this.orbitPhi) * Math.sin(this.orbitTheta);
      const camY = targetLookAt.y + this.orbitRadius * Math.sin(this.orbitPhi);
      const camZ = targetLookAt.z + this.orbitRadius * Math.cos(this.orbitPhi) * Math.cos(this.orbitTheta);

      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(targetLookAt);

    } else if (this.mode === CameraMode.HOOD) {
      // Cockpit / Hood POV (looking forward from driver perspective)
      // Car front is +Z, RHD driver is at X = +0.32, Y = 1.15, Z = 0.2
      const cockpitOffset = new THREE.Vector3(
        Math.sin(carRotY) * 0.4 + Math.cos(carRotY) * 0.32,
        1.18,
        Math.cos(carRotY) * 0.4 - Math.sin(carRotY) * 0.32
      );

      this.camera.position.copy(carPos).add(cockpitOffset);

      const lookTarget = carPos.clone().add(new THREE.Vector3(
        Math.sin(carRotY) * 15,
        1.0,
        Math.cos(carRotY) * 15
      ));

      this.camera.lookAt(lookTarget);
    }
  }
}
