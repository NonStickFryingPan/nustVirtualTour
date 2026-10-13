import { StateMachine } from '../core/StateMachine.js';
import { eventBus } from '../core/EventBus.js';

export const VehicleState = {
  IDLE: 'IDLE',
  ACCELERATING: 'ACCELERATING',
  CRUISING: 'CRUISING',
  BRAKING: 'BRAKING',
  REVERSING: 'REVERSING',
  DRIFTING: 'DRIFTING',
  BOOSTING: 'BOOSTING'
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
      handbrake: false,
      boost: false
    };

    this.stateMachine = new StateMachine(VehicleState.IDLE);
    this.setupStateMachine();
    this.setupKeyboardListeners();
  }

  setModel(newModel) {
    this.carModel = newModel;
    if (this.physics) {
      this.physics.setModel(newModel);
    }
  }

  setupStateMachine() {
    this.stateMachine
      .addState(VehicleState.IDLE, {
        onEnter: () => {
          if (this.carModel.setBrakeLights) this.carModel.setBrakeLights(false);
          if (this.carModel.setReverseLights) this.carModel.setReverseLights(false);
        }
      })
      .addState(VehicleState.ACCELERATING, {
        onEnter: () => {
          if (this.carModel.setBrakeLights) this.carModel.setBrakeLights(false);
          if (this.carModel.setReverseLights) this.carModel.setReverseLights(false);
        }
      })
      .addState(VehicleState.BOOSTING, {
        onEnter: () => {
          if (this.carModel.setBrakeLights) this.carModel.setBrakeLights(false);
          if (this.carModel.setReverseLights) this.carModel.setReverseLights(false);
        }
      })
      .addState(VehicleState.CRUISING, {
        onEnter: () => {
          if (this.carModel.setBrakeLights) this.carModel.setBrakeLights(false);
          if (this.carModel.setReverseLights) this.carModel.setReverseLights(false);
        }
      })
      .addState(VehicleState.BRAKING, {
        onEnter: () => {
          if (this.carModel.setBrakeLights) this.carModel.setBrakeLights(true);
        },
        onExit: () => {
          if (this.carModel.setBrakeLights) this.carModel.setBrakeLights(false);
        }
      })
      .addState(VehicleState.REVERSING, {
        onEnter: () => {
          if (this.carModel.setReverseLights) this.carModel.setReverseLights(true);
        },
        onExit: () => {
          if (this.carModel.setReverseLights) this.carModel.setReverseLights(false);
        }
      })
      .addState(VehicleState.DRIFTING, {
        onEnter: () => {
          if (this.carModel.setBrakeLights) this.carModel.setBrakeLights(true);
        },
        onExit: () => {
          if (this.carModel.setBrakeLights) this.carModel.setBrakeLights(false);
        }
      });
  }

  setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
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
        case 'ShiftLeft':
        case 'ShiftRight':
          this.input.boost = true;
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
          if (this.carModel.toggleHeadlights) {
            const lightsOn = this.carModel.toggleHeadlights();
            eventBus.emit('vehicle:lights', lightsOn);
          }
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
        case 'ShiftLeft':
        case 'ShiftRight':
          this.input.boost = false;
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

  setVirtualInput(action, active) {
    if (this.audio) this.audio.ensureContext();
    if (this.input[action] !== undefined) {
      this.input[action] = active;
    }
  }

  update(dt) {
    this.physics.update(dt, this.input);

    const speed = this.physics.speed;
    const isSlipping = this.physics.isSlipping();
    const isBoosting = this.physics.isBoosting;

    // Determine state
    let nextState = VehicleState.IDLE;
    if (isSlipping) {
      nextState = VehicleState.DRIFTING;
    } else if (this.input.handbrake || (this.input.backward && speed > 0.5)) {
      nextState = VehicleState.BRAKING;
    } else if (isBoosting) {
      nextState = VehicleState.BOOSTING;
    } else if (this.input.forward && speed >= -0.5) {
      nextState = VehicleState.ACCELERATING;
    } else if (speed < -0.2) {
      nextState = VehicleState.REVERSING;
    } else if (Math.abs(speed) > 0.5) {
      nextState = VehicleState.CRUISING;
    }

    this.stateMachine.transitionTo(nextState);
    this.stateMachine.update(dt);

    // Audio update (scales pitch with boost)
    if (this.audio) {
      this.audio.update(this.physics.getSpeedKmh(), this.input.forward, isSlipping, isBoosting);
    }

    // Telemetry event emission
    eventBus.emit('vehicle:telemetry', {
      speedKmh: this.physics.getSpeedKmh(),
      gear: this.physics.getGear(),
      state: this.stateMachine.getState(),
      steeringAngle: this.physics.steeringAngle,
      position: this.physics.position,
      isBoosting: isBoosting,
      boostPercent: this.physics.getBoostPercent()
    });
  }
}
