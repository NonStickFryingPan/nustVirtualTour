import { eventBus } from '../core/EventBus.js';
import { QualityPreset } from '../core/QualityManager.js';
import { CameraMode } from '../camera/CameraManager.js';

export class HUD {
  constructor(qualityManager, vehicleController) {
    this.qualityManager = qualityManager;
    this.vehicleController = vehicleController;

    this.container = null;
    this.speedEl = null;
    this.gearEl = null;
    this.qualityBtn = null;
    this.cameraBtn = null;
    this.lightsBtn = null;
    this.audioBtn = null;

    this.init();
    this.setupListeners();
  }

  init() {
    this.container = document.createElement('div');
    this.container.id = 'hud-overlay';
    this.container.innerHTML = `
      <!-- Header -->
      <div class="hud-header">
        <div class="brand-badge">
          <div class="brand-title">
            <span>SUZUKI ALTO</span>
            <span class="badge-pill">660cc</span>
          </div>
          <div class="brand-subtitle">NUST Campus Virtual Tour • Gate 2 Test Drive</div>
        </div>

        <div class="header-actions">
          <button id="btn-camera" class="hud-btn" title="Toggle Camera (Key C)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            <span id="label-camera">Camera: Chase</span>
          </button>

          <button id="btn-inspect" class="hud-btn" title="360° Car Inspection View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            <span>Inspect Alto 360°</span>
          </button>

          <button id="btn-quality" class="hud-btn" title="Toggle Visual/Performance Mode">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            <span id="label-quality">Visual Mode</span>
          </button>

          <button id="btn-lights" class="hud-btn" title="Toggle Headlights (Key L)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>
            <span>Lights</span>
          </button>

          <button id="btn-horn" class="hud-btn" title="Horn (Key H)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            <span>Horn</span>
          </button>

          <button id="btn-reset" class="hud-btn" title="Reset Car to Spawn (Key R)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span>Reset</span>
          </button>
        </div>
      </div>

      <!-- Footer / Controls & Telemetry -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%;">
        <!-- Controls Legend -->
        <div class="controls-legend">
          <div class="legend-title">
            <span>Controls</span>
            <span style="opacity: 0.7;">Autumn Sunset</span>
          </div>
          <div class="legend-grid">
            <div class="legend-item"><span class="key-cap">W</span><span>Accelerate</span></div>
            <div class="legend-item"><span class="key-cap">S</span><span>Brake / Rev</span></div>
            <div class="legend-item"><span class="key-cap">A</span><span class="key-cap">D</span><span>Steering</span></div>
            <div class="legend-item"><span class="key-cap">Space</span><span>Handbrake</span></div>
            <div class="legend-item"><span class="key-cap">C</span><span>Camera</span></div>
            <div class="legend-item"><span class="key-cap">L</span><span>Lights</span></div>
            <div class="legend-item"><span class="key-cap">H</span><span>Horn</span></div>
            <div class="legend-item"><span class="key-cap">R</span><span>Reset</span></div>
          </div>
        </div>

        <!-- Telemetry Cluster -->
        <div class="hud-telemetry">
          <div class="gauge-cluster">
            <div class="speed-display">
              <span id="hud-speed" class="speed-number">0</span>
              <span class="speed-unit">KM / H</span>
            </div>
            <div class="gear-display">
              <span id="hud-gear" class="gear-indicator">P</span>
              <span class="gear-label">GEAR</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.speedEl = document.getElementById('hud-speed');
    this.gearEl = document.getElementById('hud-gear');
    this.qualityBtn = document.getElementById('btn-quality');
    this.cameraBtn = document.getElementById('btn-camera');
    this.lightsBtn = document.getElementById('btn-lights');

    this.setupButtonEvents();
  }

  setupButtonEvents() {
    this.qualityBtn.addEventListener('click', () => {
      const next = this.qualityManager.toggleMode();
      this.updateQualityLabel(next);
    });

    this.cameraBtn.addEventListener('click', () => {
      eventBus.emit('camera:cycle');
    });

    document.getElementById('btn-inspect').addEventListener('click', () => {
      eventBus.emit('camera:setMode', CameraMode.INSPECT);
    });

    this.lightsBtn.addEventListener('click', () => {
      if (this.vehicleController && this.vehicleController.carModel) {
        const on = this.vehicleController.carModel.toggleHeadlights();
        this.lightsBtn.classList.toggle('active', on);
      }
    });

    const hornBtn = document.getElementById('btn-horn');
    hornBtn.addEventListener('pointerdown', () => {
      if (this.vehicleController && this.vehicleController.audio) {
        this.vehicleController.audio.playHorn(true);
      }
    });
    hornBtn.addEventListener('pointerup', () => {
      if (this.vehicleController && this.vehicleController.audio) {
        this.vehicleController.audio.playHorn(false);
      }
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      if (this.vehicleController) {
        this.vehicleController.physics.reset();
      }
    });
  }

  setupListeners() {
    eventBus.on('vehicle:telemetry', (data) => {
      if (this.speedEl) this.speedEl.textContent = data.speedKmh;
      if (this.gearEl) this.gearEl.textContent = data.gear;
    });

    eventBus.on('camera:changed', (mode) => {
      const label = document.getElementById('label-camera');
      const inspectBtn = document.getElementById('btn-inspect');
      if (label) {
        label.textContent = `Camera: ${mode.toUpperCase()}`;
      }
      if (inspectBtn) {
        inspectBtn.classList.toggle('active', mode === CameraMode.INSPECT);
      }
    });

    eventBus.on('vehicle:lights', (active) => {
      if (this.lightsBtn) {
        this.lightsBtn.classList.toggle('active', active);
      }
    });
  }

  updateQualityLabel(mode) {
    const label = document.getElementById('label-quality');
    if (label) {
      label.textContent = mode === QualityPreset.VISUAL ? 'Visual Mode' : 'Performance Mode';
    }
    if (this.qualityBtn) {
      this.qualityBtn.classList.toggle('active', mode === QualityPreset.VISUAL);
    }
  }
}
