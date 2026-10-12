import { eventBus } from './EventBus.js';

export const QualityPreset = {
  PERFORMANCE: 'performance',
  VISUAL: 'visual'
};

export class QualityManager {
  constructor(renderer) {
    this.renderer = renderer;
    // Auto-detect high vs low end, default to VISUAL
    this.currentMode = QualityPreset.VISUAL;

    this.settings = {
      [QualityPreset.PERFORMANCE]: {
        pixelRatio: Math.min(window.devicePixelRatio || 1, 1),
        shadows: false,
        shadowMapType: null,
        particlesEnabled: false,
        volumetricLights: false,
        antiAliasing: false,
        fogDensity: 0.008,
        targetFps: 60,
      },
      [QualityPreset.VISUAL]: {
        pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
        shadows: true,
        shadowMapType: 1, // THREE.PCFShadowMap
        particlesEnabled: true,
        volumetricLights: true,
        antiAliasing: true,
        fogDensity: 0.012,
        targetFps: 60,
      }
    };
  }

  init() {
    this.applyCurrentMode();
  }

  setMode(mode) {
    if (this.currentMode === mode) return;
    this.currentMode = mode;
    this.applyCurrentMode();
    eventBus.emit('quality:changed', { mode, settings: this.getCurrentSettings() });
  }

  toggleMode() {
    const next = this.currentMode === QualityPreset.VISUAL ? QualityPreset.PERFORMANCE : QualityPreset.VISUAL;
    this.setMode(next);
    return next;
  }

  getCurrentSettings() {
    return this.settings[this.currentMode];
  }

  getMode() {
    return this.currentMode;
  }

  applyCurrentMode() {
    const s = this.getCurrentSettings();
    if (this.renderer) {
      this.renderer.setPixelRatio(s.pixelRatio);
      this.renderer.shadowMap.enabled = s.shadows;
      if (s.shadows && s.shadowMapType !== null) {
        this.renderer.shadowMap.type = s.shadowMapType;
      }
    }
  }
}
