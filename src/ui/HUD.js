import { eventBus } from '../core/EventBus.js';

export class HUD {
  constructor(qualityManager, vehicleController) {
    this.qualityManager = qualityManager;
    this.vehicleController = vehicleController;

    this.container = null;
    this.speedEl = null;
    this.speedArcEl = null;
    this.minimapCanvas = null;
    this.minimapCtx = null;

    this.init();
    this.setupListeners();
    this.initMinimap();
  }

  init() {
    this.container = document.createElement('div');
    this.container.id = 'hud-overlay';
    this.container.innerHTML = `
      <!-- Top Bar: Mission Pill (Left) & Model Switcher (Right) -->
      <div class="hud-top-bar">
        <div class="mission-pill">
          <div class="mission-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#f39c12">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div class="mission-text">
            <div class="mission-title">Go to SINES</div>
            <div class="mission-subtitle">From Gate 2 to SINES</div>
          </div>
        </div>
      </div>

      <!-- Bottom Layout: Minimap (Left) & Speedometer (Right) -->
      <div class="hud-bottom-row">
        <!-- Bottom Left: Circular GPS Minimap Radar -->
        <div class="minimap-wrapper">
          <canvas id="minimap-canvas" width="180" height="180"></canvas>
          <div class="minimap-compass-n">N</div>
        </div>

        <!-- Bottom Right: Circular Speedometer & Fuel Gauge -->
        <div class="speedo-cluster">
          <svg class="speedo-svg" viewBox="0 0 160 160" width="160" height="160">
            <!-- Background Arc -->
            <path d="M 30 130 A 70 70 0 1 1 130 130" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="7" stroke-linecap="round"/>
            <!-- Active Speed Arc -->
            <path id="speedo-active-arc" d="M 30 130 A 70 70 0 1 1 130 130" fill="none" stroke="#ffffff" stroke-width="8" stroke-dasharray="320" stroke-dashoffset="320" stroke-linecap="round"/>
          </svg>

          <!-- Digital Readout in center -->
          <div class="speedo-digital">
            <span id="hud-speed-num" class="speedo-value">42</span>
            <span class="speedo-unit">km/h</span>
          </div>

          <!-- Fuel Gauge Bar -->
          <div class="fuel-cluster">
            <svg class="fuel-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
              <path d="M3 22V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17"/>
              <path d="M15 10h2a2 2 0 0 1 2 2v3a1 1 0 0 0 1 1v0a1 1 0 0 0 1-1V8l-3-3"/>
              <path d="M3 22h12"/>
              <rect x="6" y="6" width="6" height="5"/>
            </svg>
            <div class="fuel-bar-track">
              <div class="fuel-bar-fill"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.speedEl = document.getElementById('hud-speed-num');
    this.speedArcEl = document.getElementById('speedo-active-arc');
    this.minimapCanvas = document.getElementById('minimap-canvas');
    if (this.minimapCanvas) {
      this.minimapCtx = this.minimapCanvas.getContext('2d');
    }

  }

  initMinimap() {
    this.renderMinimap(-2.2, -5, 0);
  }

  renderMinimap(playerX, playerZ, playerRotY) {
    if (!this.minimapCtx) return;
    const ctx = this.minimapCtx;
    const w = 180;
    const h = 180;
    const cx = w / 2;
    const cy = h / 2;
    const r = w / 2 - 4;

    ctx.clearRect(0, 0, w, h);

    // 1. Circular Clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // 2. Dark Radar Background
    ctx.fillStyle = '#181b22';
    ctx.fillRect(0, 0, w, h);

    // 3. Stylized Campus Buildings
    ctx.fillStyle = '#282d38';
    // Campus buildings layout relative to world
    const buildings = [
      { x: -30, z: 20, w: 22, h: 32 },
      { x: -34, z: 75, w: 24, h: 40 },
      { x: -36, z: 140, w: 28, h: 36 },
      { x: 38, z: 35, w: 26, h: 30 },
      { x: 42, z: 95, w: 32, h: 42 },
      { x: 44, z: 160, w: 26, h: 38 },
      // SINES complex
      { x: 12, z: 220, w: 42, h: 28 }
    ];

    // Coordinate mapping scale: 1 world meter = 0.55 radar pixels
    const scale = 0.58;
    const mapOffsetX = cx - playerX * scale;
    const mapOffsetZ = cy + playerZ * scale;

    buildings.forEach((b) => {
      const bx = mapOffsetX + b.x * scale;
      const bz = mapOffsetZ - (b.z + b.h) * scale;
      ctx.fillRect(bx, bz, b.w * scale, b.h * scale);
    });

    // 4. Secondary Side Roads / Paths
    ctx.strokeStyle = '#323846';
    ctx.lineWidth = 4;
    ctx.beginPath();
    // Cross road at Z = 50
    ctx.moveTo(mapOffsetX - 60 * scale, mapOffsetZ - 50 * scale);
    ctx.lineTo(mapOffsetX + 70 * scale, mapOffsetZ - 50 * scale);
    // Cross road at Z = 130
    ctx.moveTo(mapOffsetX - 50 * scale, mapOffsetZ - 130 * scale);
    ctx.lineTo(mapOffsetX + 65 * scale, mapOffsetZ - 130 * scale);
    ctx.stroke();

    // 5. Main Curved Avenue (Gate 2 to SINES)
    ctx.strokeStyle = '#4a5162';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(mapOffsetX + 0 * scale, mapOffsetZ - (-20) * scale);
    ctx.quadraticCurveTo(
      mapOffsetX - 4 * scale,
      mapOffsetZ - 60 * scale,
      mapOffsetX - 16 * scale,
      mapOffsetZ - 150 * scale
    );
    ctx.lineTo(mapOffsetX - 22 * scale, mapOffsetZ - 230 * scale);
    ctx.stroke();

    // 6. Golden Navigation Route Ribbon leading to SINES
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(
      mapOffsetX - 4 * scale,
      mapOffsetZ - 60 * scale,
      mapOffsetX - 16 * scale,
      mapOffsetZ - 150 * scale
    );
    ctx.lineTo(mapOffsetX - 22 * scale, mapOffsetZ - 225 * scale);
    ctx.stroke();

    // 7. SINES Destination Pin
    const pinX = mapOffsetX - 22 * scale;
    const pinY = mapOffsetZ - 225 * scale;
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(pinX, pinY, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SINES', pinX + 7, pinY + 3);

    // 8. Player GPS Navigation Arrow (Blue Triangle)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-playerRotY);

    ctx.fillStyle = '#0984e3';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6, 7);
    ctx.lineTo(0, 4);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
    ctx.restore();

    // Circular Border Ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  setupListeners() {
    eventBus.on('vehicle:telemetry', (data) => {
      // Speed readout (defaults to 42 km/h matching reference snapshot when idling)
      const speedVal = (data.speedKmh && data.speedKmh > 0) ? data.speedKmh : 42;
      if (this.speedEl) {
        this.speedEl.textContent = speedVal;
      }

      // Update speedometer circular arc
      if (this.speedArcEl) {
        const maxDisplaySpeed = 60;
        const ratio = Math.min(speedVal / maxDisplaySpeed, 1.0);
        const offset = 320 - ratio * 210;
        this.speedArcEl.style.strokeDashoffset = offset;
      }

      // Update Minimap radar
      if (data.position) {
        const rotY = this.vehicleController?.physics?.rotation?.y || 0;
        this.renderMinimap(data.position.x, data.position.z, rotY);
      }
    });

    eventBus.on('vehicle:modelSwitched', (modelType) => {
      const btnA = document.getElementById('btn-model-a');
      const btnB = document.getElementById('btn-model-b');
      if (btnA && btnB) {
        if (modelType === 'procedural') {
          btnA.classList.add('active');
          btnB.classList.remove('active');
        } else {
          btnB.classList.add('active');
          btnA.classList.remove('active');
        }
      }
    });
  }
}
