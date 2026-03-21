import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, SYRUP_TEMP, BOILING_POINT, BURN_TEMP,
  ROOM_TEMP, SYRUP_BRIX_MIN, SYRUP_BRIX_MAX, FIRE_DECAY_RATE,
  WOOD_HEAT_BOOST, MAX_WOOD, TEMP_RISE_RATE, GRADES,
  UNCUT_LOGS_START, CHOP_SWEET_SPOT_DURATION, LOG_FALL_TIMEOUT,
  LOG_WOBBLE_WARNING, AXE_CYCLE_DURATION,
} from '../config/constants.js';
import { BOILING_FACTS } from '../config/educational.js';

export class BoilingGame extends Phaser.Scene {
  constructor() {
    super('BoilingGame');
  }

  init(data) {
    this.linked = data?.linked || false;
  }

  create() {
    this.temperature = ROOM_TEMP;
    this.fireLevel = 0;
    this.sapConcentration = 0;
    this.woodCount = 0;
    this.isBurned = false;
    this.isPaused = false;
    this.shownFacts = new Set();
    this.boilingStarted = false;
    this.canDrawOff = false;

    this.uncutLogs = UNCUT_LOGS_START;
    this.axeAngle = 0;
    this.axeGoingDown = true;
    this.logFallTimer = 0;
    this.chopResult = null;

    this.cameras.main.setBackgroundColor('#3a2a1a');
    this.drawSugarHouse();
    this.createEvaporator();
    this.createChoppingBlock();
    this.createWoodPile();
    this.createThermometer();
    this.createControls();
    this.createUI();

    // Show initial educational fact
    this.time.delayedCall(500, () => {
      this.showFact('start');
    });
  }

  drawSugarHouse() {
    const g = this.add.graphics();
    // Walls
    g.fillStyle(0x4a3828);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Floor
    g.fillStyle(0x3a2a1a);
    g.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 40);
    // Floor planks
    g.lineStyle(1, 0x2a1a0a);
    for (let i = 0; i < 8; i++) {
      g.lineBetween(0, GAME_HEIGHT - 40 + i * 5, GAME_WIDTH, GAME_HEIGHT - 40 + i * 5);
    }
    // Rafters
    g.lineStyle(3, 0x5c3d2e);
    g.lineBetween(0, 30, GAME_WIDTH, 30);
    g.lineBetween(GAME_WIDTH / 3, 0, GAME_WIDTH / 3, 30);
    g.lineBetween(2 * GAME_WIDTH / 3, 0, 2 * GAME_WIDTH / 3, 30);
  }

  createEvaporator() {
    const evapX = GAME_WIDTH / 2;
    const evapY = GAME_HEIGHT - 100;

    // Evaporator body
    this.evapGraphics = this.add.graphics();
    const eg = this.evapGraphics;
    eg.fillStyle(0x555555);
    eg.fillRect(evapX - 80, evapY, 160, 50);
    // Legs
    eg.fillStyle(0x444444);
    eg.fillRect(evapX - 75, evapY + 50, 8, 15);
    eg.fillRect(evapX + 67, evapY + 50, 8, 15);
    // Pan rim
    eg.fillStyle(0x777777);
    eg.fillRect(evapX - 76, evapY - 6, 152, 8);

    // Chimney
    eg.fillStyle(0x444444);
    eg.fillRect(evapX + 60, evapY - 70, 16, 70);
    eg.fillStyle(0x555555);
    eg.fillRect(evapX + 56, evapY - 76, 24, 8);

    // Sap pan (will be redrawn as color changes)
    this.sapPanGraphics = this.add.graphics();
    this.updateSapColor();

    // Fire area
    this.fireGraphics = this.add.graphics();

    // Steam particles container
    this.steamParticles = [];
  }

  updateSapColor() {
    const g = this.sapPanGraphics;
    g.clear();
    const evapX = GAME_WIDTH / 2;
    const evapY = GAME_HEIGHT - 100;

    // Lerp color from light sap to dark syrup based on concentration
    const t = this.sapConcentration / 100;
    const r = Math.round(Phaser.Math.Linear(240, 139, t));
    const gr = Math.round(Phaser.Math.Linear(212, 69, t));
    const b = Math.round(Phaser.Math.Linear(168, 19, t));
    const color = (r << 16) | (gr << 8) | b;

    g.fillStyle(color);
    g.fillRect(evapX - 74, evapY - 4, 148, 5);

    // Bubbles if boiling
    if (this.temperature >= BOILING_POINT) {
      g.fillStyle(0xffffff, 0.3);
      for (let i = 0; i < 6; i++) {
        const bx = evapX - 60 + Math.random() * 120;
        const by = evapY - 4 + Math.random() * 3;
        g.fillCircle(bx, by, 2);
      }
    }
  }

  updateFire() {
    const g = this.fireGraphics;
    g.clear();
    if (this.fireLevel <= 0) return;

    const evapX = GAME_WIDTH / 2;
    const evapY = GAME_HEIGHT - 100;
    const fireHeight = Math.round((this.fireLevel / 100) * 30);

    // Fire flames
    const colors = [0xff4500, 0xff6a00, 0xffa500, 0xffcc00];
    for (let i = 0; i < 8; i++) {
      const fx = evapX - 50 + i * 14;
      const fh = fireHeight * (0.6 + Math.random() * 0.4);
      const colorIndex = Math.floor(Math.random() * colors.length);
      g.fillStyle(colors[colorIndex]);
      g.fillRect(fx, evapY + 45 - fh, 10, fh);
    }

    // Glow
    g.fillStyle(0xff4500, 0.15);
    g.fillRect(evapX - 70, evapY + 15, 140, 35);
  }

  updateSteam() {
    if (this.temperature < BOILING_POINT) return;

    const evapX = GAME_WIDTH / 2;
    const evapY = GAME_HEIGHT - 100;

    // Add steam particle
    if (Math.random() < 0.3) {
      const steam = this.add.text(
        evapX - 40 + Math.random() * 80,
        evapY - 10,
        '~',
        { fontFamily: 'monospace', fontSize: '10px', color: '#cccccc' }
      ).setAlpha(0.5);

      this.tweens.add({
        targets: steam,
        y: steam.y - 50 - Math.random() * 30,
        alpha: 0,
        duration: 1500 + Math.random() * 1000,
        onComplete: () => steam.destroy(),
      });
    }
  }

  createChoppingBlock() {
    const blockX = 60;
    const blockY = 240;

    this.choppingBlockGfx = this.add.graphics();
    const bg = this.choppingBlockGfx;
    // Stump base
    bg.fillStyle(0x5c3d2e);
    bg.fillRect(blockX - 30, blockY, 60, 15);
    // Stump top
    bg.fillStyle(0x6b4226);
    bg.fillRect(blockX - 25, blockY - 20, 50, 20);

    // Log on block
    this.logGfx = this.add.graphics();
    this.drawLogOnBlock();

    // Axe container
    this.axeContainer = this.add.container(blockX, blockY - 60);
    const axeGfx = this.add.graphics();
    // Handle
    axeGfx.fillStyle(0x6b4226);
    axeGfx.fillRect(-2, 0, 4, 35);
    // Blade
    this.axeBladeGfx = this.add.graphics();
    this.axeBladeGfx.fillStyle(0x888888);
    this.axeBladeGfx.fillTriangle(2, 4, 2, 16, 14, 10);
    this.axeContainer.add(axeGfx);
    this.axeContainer.add(this.axeBladeGfx);

    // Interactive zone
    this.chopZone = this.add.rectangle(blockX, blockY - 30, 80, 100, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    this.chopZone.on('pointerdown', () => {
      this.attemptChop();
    });

    // Labels
    this.uncutLogText = this.add.text(blockX, blockY + 22, `Logs: ${this.uncutLogs}`, {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#b0bec5',
    }).setOrigin(0.5);

    this.choppingActive = true;
  }

  drawLogOnBlock() {
    const g = this.logGfx;
    g.clear();
    const blockX = 60;
    const blockY = 240;
    // Log circle (end grain)
    g.fillStyle(0x8b5a3e);
    g.fillCircle(blockX, blockY - 34, 14);
    // Wood grain rings
    g.lineStyle(1, 0x6b4226);
    g.strokeCircle(blockX, blockY - 34, 10);
    g.strokeCircle(blockX, blockY - 34, 6);
    g.strokeCircle(blockX, blockY - 34, 2);
    g.setAngle(0);
  }

  updateChoppingBlock(delta) {
    if (!this.choppingActive) return;

    const dt = delta / 1000;

    // Axe oscillation using sine wave
    const cycleMs = AXE_CYCLE_DURATION;
    const t = (this.time.now % cycleMs) / cycleMs;
    this.axeAngle = -0.25 + 0.55 * Math.sin(t * Math.PI * 2);
    // Clamp to range [-0.8, 0.3]
    this.axeAngle = Phaser.Math.Clamp(this.axeAngle, -0.8, 0.3);

    // Sweet spot visual feedback
    const inSweetSpot = this.axeAngle > 0.1;
    this.axeBladeGfx.clear();
    this.axeBladeGfx.fillStyle(inSweetSpot ? 0xffdd00 : 0x888888);
    this.axeBladeGfx.fillTriangle(2, 4, 2, 16, 14, 10);

    // Rotate axe container
    this.axeContainer.setRotation(this.axeAngle);

    // Log fall timer
    this.logFallTimer += dt;

    if (this.logFallTimer >= LOG_WOBBLE_WARNING && this.logFallTimer < LOG_FALL_TIMEOUT) {
      // Wobble the log
      const wobble = Math.sin(this.time.now * 0.02) * 0.08;
      this.logGfx.setRotation(wobble);
    }

    if (this.logFallTimer >= LOG_FALL_TIMEOUT) {
      this.logFallOver();
    }
  }

  attemptChop() {
    if (this.isPaused || this.isBurned || !this.choppingActive) return;

    const inSweetSpot = this.axeAngle > 0.1;

    if (inSweetSpot) {
      this.choppingSuccess();
    } else {
      // Flash axe red
      this.axeBladeGfx.clear();
      this.axeBladeGfx.fillStyle(0xff0000);
      this.axeBladeGfx.fillTriangle(2, 4, 2, 16, 14, 10);
      this.time.delayedCall(200, () => {
        if (this.choppingActive) {
          this.axeBladeGfx.clear();
          this.axeBladeGfx.fillStyle(0x888888);
          this.axeBladeGfx.fillTriangle(2, 4, 2, 16, 14, 10);
        }
      });

      // Show MISS text
      const missText = this.add.text(60, 190, 'MISS!', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#ff4444',
        stroke: '#000',
        strokeThickness: 2,
      }).setOrigin(0.5);
      this.tweens.add({
        targets: missText,
        y: missText.y - 20,
        alpha: 0,
        duration: 600,
        onComplete: () => missText.destroy(),
      });
    }
  }

  choppingSuccess() {
    this.logFallTimer = 0;
    this.woodCount = Math.min(MAX_WOOD, this.woodCount + 1);

    // Split animation
    const blockX = 60;
    const blockY = 240;
    const leftHalf = this.add.graphics();
    leftHalf.fillStyle(0x8b5a3e);
    leftHalf.fillArc(blockX, blockY - 34, 14, Phaser.Math.DegToRad(90), Phaser.Math.DegToRad(270), false);
    const rightHalf = this.add.graphics();
    rightHalf.fillStyle(0x8b5a3e);
    rightHalf.fillArc(blockX, blockY - 34, 14, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(90), false);

    this.logGfx.clear();

    this.tweens.add({
      targets: leftHalf,
      x: -25,
      alpha: 0,
      duration: 400,
      onComplete: () => leftHalf.destroy(),
    });
    this.tweens.add({
      targets: rightHalf,
      x: 25,
      alpha: 0,
      duration: 400,
      onComplete: () => rightHalf.destroy(),
    });

    // Update wood count display
    this.updateWoodPile();
    this.woodCountText.setText(`Ready: ${this.woodCount}`);

    this.uncutLogs--;
    if (this.uncutLogs > 0) {
      this.uncutLogText.setText(`Logs: ${this.uncutLogs}`);
      this.time.delayedCall(500, () => {
        this.drawLogOnBlock();
      });
    } else {
      this.uncutLogText.setText('Logs: 0');
      this.choppingActive = false;
      this.chopZone.disableInteractive();
      this.logGfx.setVisible(false);
      this.axeContainer.setVisible(false);
    }

    if (this.hintText) {
      this.updateHintForChopping();
    }
  }

  logFallOver() {
    this.logFallTimer = 0;

    this.tweens.add({
      targets: this.logGfx,
      rotation: Math.PI / 2,
      duration: 400,
      onComplete: () => {
        this.uncutLogs--;
        if (this.uncutLogs > 0) {
          this.uncutLogText.setText(`Logs: ${this.uncutLogs}`);
          this.time.delayedCall(500, () => {
            this.logGfx.setRotation(0);
            this.drawLogOnBlock();
          });
        } else {
          this.uncutLogText.setText('Logs: 0');
          this.choppingActive = false;
          this.chopZone.disableInteractive();
          this.logGfx.setVisible(false);
          this.axeContainer.setVisible(false);
        }
      },
    });
  }

  updateHintForChopping() {
    if (this.isBurned) return;
    if (this.woodCount > 0 && this.fireLevel <= 0) {
      this.hintText.setText('Add chopped wood to the fire!').setColor('#ffdd57');
    } else if (this.choppingActive) {
      this.hintText.setText('Chop wood to get started!').setColor('#ffdd57');
    }
  }

  createWoodPile() {
    const woodX = 160;
    const woodY = GAME_HEIGHT - 80;

    // Wood pile hit area
    this.woodPileZone = this.add.rectangle(woodX, woodY, 60, 50, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    this.woodPileGraphics = this.add.graphics();
    this.updateWoodPile();

    this.woodCountText = this.add.text(woodX, woodY + 35, `Ready: ${this.woodCount}`, {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#b0bec5',
    }).setOrigin(0.5);

    this.woodPileZone.on('pointerdown', () => {
      if (this.isPaused || this.isBurned) return;
      if (this.woodCount <= 0) return;

      this.woodCount--;
      this.fireLevel = Math.min(100, this.fireLevel + WOOD_HEAT_BOOST);
      this.updateWoodPile();
      this.woodCountText.setText(`Ready: ${this.woodCount}`);
    });
  }

  updateWoodPile() {
    const g = this.woodPileGraphics;
    g.clear();
    const woodX = 160;
    const woodY = GAME_HEIGHT - 80;
    const logsToShow = Math.ceil((this.woodCount / MAX_WOOD) * 4);

    for (let i = 0; i < logsToShow; i++) {
      g.fillStyle(0x6b4226);
      g.fillRect(woodX - 20, woodY - 10 + i * 10, 40, 8);
      g.fillStyle(0x8b5a3e);
      g.fillCircle(woodX - 20, woodY - 6 + i * 10, 4);
      g.fillCircle(woodX + 20, woodY - 6 + i * 10, 4);
    }
  }

  createThermometer() {
    const tx = GAME_WIDTH - 50;
    const ty = 50;
    const height = 180;

    // Thermometer background
    const g = this.add.graphics();
    g.fillStyle(0x333333);
    g.fillRect(tx - 8, ty, 16, height);
    g.lineStyle(2, 0x888888);
    g.strokeRect(tx - 8, ty, 16, height);

    // Bulb
    g.fillStyle(0xff4444);
    g.fillCircle(tx, ty + height + 8, 10);

    // Scale markings
    const temps = [100, 150, 200, 219, 235];
    temps.forEach(temp => {
      const pct = (temp - ROOM_TEMP) / (BURN_TEMP + 20 - ROOM_TEMP);
      const markY = ty + height - pct * height;
      g.lineStyle(1, temp === 219 ? 0x00ff00 : 0x888888);
      g.lineBetween(tx + 10, markY, tx + 18, markY);
      const color = temp === 219 ? '#00ff00' : '#888888';
      this.add.text(tx + 20, markY, `${temp}`, {
        fontFamily: 'monospace',
        fontSize: '8px',
        color,
      }).setOrigin(0, 0.5);
    });

    // Target zone indicator
    const targetPct = (SYRUP_TEMP - ROOM_TEMP) / (BURN_TEMP + 20 - ROOM_TEMP);
    const targetY = ty + height - targetPct * height;
    this.add.text(tx + 20, targetY - 10, 'GOAL', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#00ff00',
    });

    // Mercury fill (dynamic)
    this.thermFill = this.add.graphics();
    this.thermX = tx;
    this.thermY = ty;
    this.thermHeight = height;
  }

  updateThermometer() {
    const g = this.thermFill;
    g.clear();
    const pct = Math.max(0, (this.temperature - ROOM_TEMP) / (BURN_TEMP + 20 - ROOM_TEMP));
    const fillH = Math.round(pct * this.thermHeight);

    let color = 0xff4444;
    if (this.temperature >= BURN_TEMP) color = 0xff0000;
    else if (this.temperature >= SYRUP_TEMP - 3) color = 0x00ff00;

    g.fillStyle(color);
    g.fillRect(this.thermX - 6, this.thermY + this.thermHeight - fillH, 12, fillH);
  }

  createControls() {
    // Hydrometer button
    const hydroX = GAME_WIDTH - 50;
    const hydroY = GAME_HEIGHT - 50;

    const hydroBg = this.add.rectangle(hydroX, hydroY, 70, 28, 0x1c4587)
      .setInteractive({ useHandCursor: true });
    this.add.text(hydroX, hydroY, 'CHECK', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffffff',
    }).setOrigin(0.5);

    hydroBg.on('pointerdown', () => {
      if (this.isPaused || this.isBurned) return;
      this.checkDensity();
    });

    // Draw off button (hidden until ready)
    this.drawOffBtn = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 20, 120, 28, 0x00aa00)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    this.drawOffText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20, 'DRAW OFF!', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffffff',
    }).setOrigin(0.5).setVisible(false);

    this.drawOffBtn.on('pointerdown', () => {
      if (this.isPaused) return;
      this.drawOff();
    });
  }

  checkDensity() {
    const brix = this.getBrix();
    const inRange = brix >= SYRUP_BRIX_MIN && brix <= SYRUP_BRIX_MAX;
    const tempOk = this.temperature >= SYRUP_TEMP - 2 && this.temperature <= SYRUP_TEMP + 5;

    let message = `Density: ${brix.toFixed(1)} Brix`;
    if (brix < SYRUP_BRIX_MIN) {
      message += '\nNot concentrated enough yet!';
    } else if (brix > SYRUP_BRIX_MAX) {
      message += '\nA bit too thick!';
    } else {
      message += '\nPerfect density!';
    }

    if (inRange && tempOk) {
      this.canDrawOff = true;
      this.drawOffBtn.setVisible(true);
      this.drawOffText.setVisible(true);
      message += '\nReady to draw off!';
    }

    this.showFact('almost');
    this.showDensityPopup(message);
  }

  getBrix() {
    return (this.sapConcentration / 100) * 70;
  }

  showDensityPopup(message) {
    const popup = this.add.container(0, 0).setDepth(50);
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 220, 100, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(2, 0x1c4587);
    popup.add(bg);

    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, message, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#e0e0e0',
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);
    popup.add(text);

    this.time.delayedCall(2000, () => popup.destroy());
  }

  drawOff() {
    // Calculate grade based on concentration
    const grade = this.getGrade();
    this.scene.start('BoilingWin', { grade, linked: this.linked });
  }

  getGrade() {
    for (const grade of GRADES) {
      if (this.sapConcentration >= grade.minColor && this.sapConcentration < grade.maxColor) {
        return grade;
      }
    }
    return GRADES[GRADES.length - 1];
  }

  createUI() {
    // Temperature display
    this.tempText = this.add.text(10, 10, 'Temp: 60F', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    });

    // Fire level
    this.add.graphics()
      .fillStyle(0x333333)
      .fillRect(10, 32, 100, 10)
      .lineStyle(1, 0x888888)
      .strokeRect(10, 32, 100, 10);

    this.fireBar = this.add.graphics();

    this.add.text(115, 32, 'Fire', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#b0bec5',
    });

    // Hint
    this.hintText = this.add.text(GAME_WIDTH / 2, 10, 'Chop wood to get started!', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#ffdd57',
    }).setOrigin(0.5, 0);
  }

  updateUI() {
    this.tempText.setText(`Temp: ${Math.round(this.temperature)}F`);

    this.fireBar.clear();
    this.fireBar.fillStyle(this.fireLevel > 20 ? 0xff6a00 : 0xff0000);
    this.fireBar.fillRect(11, 33, Math.round((this.fireLevel / 100) * 98), 8);

    // Update hint
    if (this.isBurned) {
      this.hintText.setText('BURNED! The syrup is ruined!').setColor('#ff0000');
    } else if (this.temperature >= SYRUP_TEMP - 5 && this.temperature < BURN_TEMP) {
      this.hintText.setText('Getting close! Check the density!').setColor('#00ff00');
    } else if (this.temperature >= BURN_TEMP - 10) {
      this.hintText.setText('CAREFUL! Temperature is too high!').setColor('#ff4444');
    } else if (this.fireLevel <= 5 && this.temperature > ROOM_TEMP + 10) {
      this.hintText.setText('Fire is dying! Add more wood!').setColor('#ffdd57');
    } else if (this.woodCount > 0 && this.fireLevel <= 0) {
      this.hintText.setText('Add chopped wood to the fire!').setColor('#ffdd57');
    } else if (this.choppingActive && this.woodCount === 0) {
      this.hintText.setText('Chop wood to get started!').setColor('#ffdd57');
    }
  }

  showFact(trigger) {
    if (this.shownFacts.has(trigger)) return;
    const fact = BOILING_FACTS.find(f => f.trigger === trigger);
    if (!fact) return;
    this.shownFacts.add(trigger);

    this.isPaused = true;
    const overlay = this.add.container(0, 0).setDepth(100);

    const dim = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);
    overlay.add(dim);

    const box = this.add.graphics();
    box.fillStyle(0x1a1a2e);
    box.fillRect(40, 60, GAME_WIDTH - 80, 180);
    box.lineStyle(3, 0xff6a00);
    box.strokeRect(40, 60, GAME_WIDTH - 80, 180);
    overlay.add(box);

    const titleText = this.add.text(GAME_WIDTH / 2, 85, fact.title, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ff9900',
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    overlay.add(titleText);

    const bodyText = this.add.text(GAME_WIDTH / 2, 140, fact.text, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#e0e0e0',
      wordWrap: { width: GAME_WIDTH - 120 },
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);
    overlay.add(bodyText);

    const btnBg = this.add.rectangle(GAME_WIDTH / 2, 215, 100, 28, 0xcc5500)
      .setInteractive({ useHandCursor: true });
    overlay.add(btnBg);

    const btnText = this.add.text(GAME_WIDTH / 2, 215, 'Got it!', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5);
    overlay.add(btnText);

    btnBg.on('pointerdown', () => {
      overlay.destroy();
      this.isPaused = false;
    });
  }

  showBurnScreen() {
    this.isPaused = true;
    const overlay = this.add.container(0, 0).setDepth(100);

    const dim = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
    overlay.add(dim);

    this.add.text(GAME_WIDTH / 2, 100, 'BURNED!', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#ff0000',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(101);

    this.add.text(GAME_WIDTH / 2, 150, 'The temperature got too high\nand the syrup burned!', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#e0e0e0',
      align: 'center',
    }).setOrigin(0.5).setDepth(101);

    const btnBg = this.add.rectangle(GAME_WIDTH / 2, 210, 140, 32, 0xcc5500)
      .setInteractive({ useHandCursor: true })
      .setDepth(101);
    this.add.text(GAME_WIDTH / 2, 210, 'Try Again', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(101);

    btnBg.on('pointerdown', () => {
      this.scene.restart({ linked: this.linked });
    });
  }

  update(time, delta) {
    if (this.isPaused || this.isBurned) return;

    const dt = delta / 1000;

    // Update chopping block
    this.updateChoppingBlock(delta);

    // Fire decays
    this.fireLevel = Math.max(0, this.fireLevel - FIRE_DECAY_RATE * dt);

    // Temperature changes
    const targetTemp = ROOM_TEMP + (this.fireLevel / 100) * (BURN_TEMP + 30 - ROOM_TEMP);
    if (this.temperature < targetTemp) {
      this.temperature += TEMP_RISE_RATE * dt;
    } else {
      this.temperature -= TEMP_RISE_RATE * 1.5 * dt;
    }
    this.temperature = Phaser.Math.Clamp(this.temperature, ROOM_TEMP, BURN_TEMP + 20);

    // Concentration increases when above boiling
    if (this.temperature >= BOILING_POINT) {
      if (!this.boilingStarted) {
        this.boilingStarted = true;
        this.showFact('boiling');
      }
      const rate = ((this.temperature - BOILING_POINT) / (SYRUP_TEMP - BOILING_POINT)) * 8;
      this.sapConcentration = Math.min(100, this.sapConcentration + rate * dt);
    }

    // Check for burn
    if (this.temperature >= BURN_TEMP) {
      this.isBurned = true;
      this.showBurnScreen();
      return;
    }

    // Grade fact trigger
    if (this.sapConcentration > 50 && !this.shownFacts.has('grade')) {
      this.showFact('grade');
    }

    // Update visuals
    this.updateSapColor();
    this.updateFire();
    this.updateThermometer();
    this.updateSteam();
    this.updateUI();
  }
}
