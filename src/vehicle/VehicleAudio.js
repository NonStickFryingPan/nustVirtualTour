/**
 * Procedural Web Audio API sound generator for Suzuki Alto
 * Zero external asset dependencies (works 100% offline & instant load)
 */
export class VehicleAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isInitialized = false;

    // Engine synth nodes
    this.engineOsc = null;
    this.engineSubOsc = null;
    this.engineFilter = null;
    this.engineGain = null;

    // Tire squeal nodes
    this.squealSource = null;
    this.squealFilter = null;
    this.squealGain = null;

    // Horn nodes
    this.hornOsc1 = null;
    this.hornOsc2 = null;
    this.hornGain = null;
    this.isHornPlaying = false;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master output gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);

      this.initEngineSynth();
      this.initSquealSynth();
      this.initHornSynth();

      this.isInitialized = true;
    } catch (e) {
      console.warn('[VehicleAudio] Web Audio API initialization deferred or failed:', e);
    }
  }

  ensureContext() {
    if (!this.isInitialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  initEngineSynth() {
    // 3-cylinder low-pitch Kei car engine
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.value = 45; // idle freq

    this.engineSubOsc = this.ctx.createOscillator();
    this.engineSubOsc.type = 'triangle';
    this.engineSubOsc.frequency.value = 22.5;

    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.value = 320;
    this.engineFilter.Q.value = 2.0;

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0.12;

    this.engineOsc.connect(this.engineFilter);
    this.engineSubOsc.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.engineOsc.start();
    this.engineSubOsc.start();
  }

  initSquealSynth() {
    // White noise generator for tire drift squeal
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    this.squealFilter = this.ctx.createBiquadFilter();
    this.squealFilter.type = 'bandpass';
    this.squealFilter.frequency.value = 1100;
    this.squealFilter.Q.value = 4.5;

    this.squealGain = this.ctx.createGain();
    this.squealGain.gain.value = 0;

    whiteNoise.connect(this.squealFilter);
    this.squealFilter.connect(this.squealGain);
    this.squealGain.connect(this.masterGain);

    whiteNoise.start();
  }

  initHornSynth() {
    // Dual-tone Kei car horn (420Hz + 500Hz)
    this.hornGain = this.ctx.createGain();
    this.hornGain.gain.value = 0;
    this.hornGain.connect(this.masterGain);

    this.hornOsc1 = this.ctx.createOscillator();
    this.hornOsc1.type = 'triangle';
    this.hornOsc1.frequency.value = 425;

    this.hornOsc2 = this.ctx.createOscillator();
    this.hornOsc2.type = 'sine';
    this.hornOsc2.frequency.value = 510;

    this.hornOsc1.connect(this.hornGain);
    this.hornOsc2.connect(this.hornGain);

    this.hornOsc1.start();
    this.hornOsc2.start();
  }

  update(speedKmh, isAccelerating, isSlipping) {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;

    // Engine pitch scales with speed and simulated gear shifts
    const ratio = Math.min(speedKmh / 120, 1.0);
    // Gear shift sawtooth modulation
    const gearModulo = (ratio * 4) % 1;
    const targetFreq = 42 + ratio * 110 + gearModulo * 35;
    const filterFreq = 300 + ratio * 550 + (isAccelerating ? 200 : 0);
    const targetGain = 0.08 + (isAccelerating ? 0.07 : 0) + ratio * 0.05;

    this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.08);
    this.engineSubOsc.frequency.setTargetAtTime(targetFreq * 0.5, now, 0.08);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.08);
    this.engineGain.gain.setTargetAtTime(targetGain, now, 0.08);

    // Tire squeal gain
    const squealTarget = isSlipping ? 0.22 : 0;
    this.squealGain.gain.setTargetAtTime(squealTarget, now, 0.05);
  }

  playHorn(active) {
    this.ensureContext();
    if (!this.isInitialized || this.isMuted || !this.hornGain) return;
    const now = this.ctx.currentTime;
    this.hornGain.gain.setTargetAtTime(active ? 0.35 : 0, now, 0.03);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.5, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }
}
