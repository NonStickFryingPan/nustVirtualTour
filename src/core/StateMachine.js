/**
 * Reusable Finite State Machine for game objects and subsystems
 */
export class StateMachine {
  constructor(initialState, possibleStates = {}) {
    this.initialState = initialState;
    this.currentState = initialState;
    this.states = possibleStates; // { stateName: { onEnter, onUpdate, onExit } }
    this.history = [];
  }

  addState(name, config) {
    this.states[name] = config;
    return this;
  }

  transitionTo(nextState, context = {}) {
    if (this.currentState === nextState) return;
    if (!this.states[nextState]) {
      console.warn(`[StateMachine] Unknown state "${nextState}"`);
      return;
    }

    const currentConfig = this.states[this.currentState];
    if (currentConfig && typeof currentConfig.onExit === 'function') {
      currentConfig.onExit(context);
    }

    const prevState = this.currentState;
    this.history.push(prevState);
    if (this.history.length > 20) this.history.shift();

    this.currentState = nextState;

    const nextConfig = this.states[nextState];
    if (nextConfig && typeof nextConfig.onEnter === 'function') {
      nextConfig.onEnter(context, prevState);
    }
  }

  update(deltaTime, context = {}) {
    const config = this.states[this.currentState];
    if (config && typeof config.onUpdate === 'function') {
      config.onUpdate(deltaTime, context);
    }
  }

  getState() {
    return this.currentState;
  }
}
