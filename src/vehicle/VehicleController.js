import { StateMachine } from '../core/StateMachine.js';
import { eventBus } from '../core/EventBus.js';

export const VehicleState = {
  IDLE: 'IDLE',
  ACCELERATING: 'ACCELERATING',
  CRUISING: 'CRUISING',
  BRAKING: 'BRAKING',
  REVERSING: 'REVERSING',
  DRIFTING: 'DRIFTING'
};

export class VehicleController {
  constructor(physics, carModel, audio) {
    this.physics = physics;
    this.carModel = carModel;
    this.audio = audio;

    this.input = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      handbrake: false
    };

    this.stateMachine = new StateMachine(VehicleState.IDLE);
    this.setupStateMachine();
    this.setupKeyboardListeners();
  }

  setupStateMachine() {
    this.stateMachine
      .addState(VehicleState.IDLE, {
        onEnter: () => {
          this.carModel.setBrakeLights(false);
          this.carModel.setReverseLights(false);
        }
      })
      .addState(VehicleState.ACCELERATING, {
        onEnter: () => {
          this.carModel.setBrakeLights(false);
          this.carModel.setReverseLights(false);
        }
      })
      .addState(VehicleState.CRUISING, {
        onEnter: () => {
          this.carModel.setBrakeLights(false);
          this.carModel.setReverseLights(false);
        }
      })
      .addState(VehicleState.BRAKING, {
        onEnter: () => {
          this.carModel.setBrakeLights(true);
        },
        onExit: () => {
          this.carModel.setBrakeLights(false);
        }
      })
      .addState(VehicleState.REVERSING, {
        onEnter: () => {
          this.carModel.setReverseLights(true);
        },
        onExit: () => {
          this.carModel.setReverseLights(false);
        }
      })
      .addState(VehicleState.DRIFTING, {
        onEnter: () => {
          this.carModel.setBrakeLights(true);
        },
        onExit: () => {
          this.carModel.setBrakeLights(false);
        }
      });
  }

  setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      // Unsuspend audio context on any key press
      if (this.audio) this.audio.ensureContext();

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.input.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.input.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.input.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.input.right = true;
          break;
        case 'Space':
          this.input.handbrake = true;
          e.preventDefault();
          break;
        case 'KeyR':
          this.physics.reset();
          eventBus.emit('vehicle:reset');
          break;
        case 'KeyL':
          const lightsOn = this.carModel.toggleHeadlights();
          eventBus.emit('vehicle:lights', lightsOn);
          break;
        case 'KeyH':
          if (!e.repeat && this.audio) {
            this.audio.playHorn(true);
          }
          break;
        case 'KeyC':
          eventBus.emit('camera:cycle');
          break;
        case 'KeyM':
          if (this.audio) {
            const muted = this.audio.toggleMute();
            eventBus.emit('audio:mute', muted);
          }
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.input.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.input.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.input.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.input.right = false;
          break;
        case 'Space':
          this.input.handbrake = false;
          break;
        case 'KeyH':
          if (this.audio) {
            this.audio.playHorn(false);
          }
          break;
      }
    });
  }

  // Virtual touch controls / UI buttons
  setVirtualInput(action, active) {
    if (this.audio) this.audio.ensureContext();
    if (this.input[action] !== undefined) {
      this.input[action] = active;
    }
  }

  update(dt) {
    // Update physics simulation
    this.physics.update(dt, this.input);

    const speed = this.physics.speed;
    const isSlipping = this.physics.isSlipping();

    // Determine state
    let nextState = VehicleState.IDLE;
    if (isSlipping) {
      nextState = VehicleState.DRIFTING;
    } else if (this.input.handbrake || (this.input.backward && speed > 0.5)) {
      nextState = VehicleState.BRAKING;
    } else if (this.input.forward && speed >= -0.5) {
      nextState = VehicleState.ACCELERATING;
    } else if (speed < -0.2) {
      nextState = VehicleState.REVERSING;
    } else if (Math.abs(speed) > 0.5) {
      nextState = VehicleState.CRUISING;
    }

    this.stateMachine.transitionTo(nextState);
    this.stateMachine.update(dt);

    // Audio update
    if (this.audio) {
      this.audio.update(this.physics.getSpeedKmh(), this.input.forward, isSlipping);
    }

    // Telemetry event emission
    eventBus.emit('vehicle:telemetry', {
      speedKmh: this.physics.getSpeedKmh(),
      gear: this.physics.getGear(),
      state: this.stateMachine.getState(),
      steeringAngle: this.physics.steeringAngle,
      position: this.physics.position
    });
  }
}
