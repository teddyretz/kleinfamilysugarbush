import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, SAP_GOAL, TREE_COUNT,
  BUCKET_CAPACITY, DRIP_RATE_BASE, OVERFLOW_PENALTY, COLORS,
} from '../config/constants.js';
import { TAPPING_FACTS } from '../config/educational.js';

export class TappingGame extends Phaser.Scene {
  constructor() {
    super('TappingGame');
  }

  create() {
    this.totalSap = 0;
    this.shownFacts = new Set();
    this.isPaused = false;

    this.cameras.main.setBackgroundColor(COLORS.sky);
    this.drawBackground();
    this.createTrees();
    this.createUI();
  }

  drawBackground() {
    const g = this.add.graphics();
    // Snow ground
    g.fillStyle(0xe8eaf0);
    g.fillRect(0, GAME_HEIGHT - 60, GAME_WIDTH, 60);
    // Snow mounds
    g.fillStyle(0xd0d4de);
    for (let i = 0; i < 8; i++) {
      const x = i * 70 + 20;
      g.fillEllipse(x, GAME_HEIGHT - 55, 60, 20);
    }
  }

  createTrees() {
    this.trees = [];
    const spacing = GAME_WIDTH / (TREE_COUNT + 1);

    for (let i = 0; i < TREE_COUNT; i++) {
      const x = spacing * (i + 1);
      const y = GAME_HEIGHT - 100;
      const tree = this.createTree(x, y, i);
      this.trees.push(tree);
    }
  }

  createTree(x, y, index) {
    const container = this.add.container(x, y);

    // Trunk
    const trunk = this.add.graphics();
    trunk.fillStyle(0x5c3d2e);
    trunk.fillRect(-6, -20, 12, 60);
    container.add(trunk);

    // Canopy
    const canopy = this.add.graphics();
    canopy.fillStyle(0x2d5a27);
    canopy.fillRect(-24, -60, 48, 24);
    canopy.fillRect(-18, -76, 36, 16);
    canopy.fillRect(-12, -86, 24, 10);
    // Snow
    canopy.fillStyle(0xe8eaf0);
    canopy.fillRect(-18, -78, 36, 3);
    canopy.fillRect(-12, -87, 24, 2);
    container.add(canopy);

    // Hit area for the whole tree
    const hitZone = this.add.rectangle(0, -30, 60, 100, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    container.add(hitZone);

    const treeState = {
      index,
      tapped: false,
      hasBucket: false,
      bucketLevel: 0,
      container,
      bucketGraphics: null,
      sapBar: null,
      tapSprite: null,
      dripTimer: null,
    };

    hitZone.on('pointerdown', () => this.onTreeClick(treeState));

    return treeState;
  }

  onTreeClick(tree) {
    if (this.isPaused) return;

    if (!tree.tapped) {
      // Tap the tree
      tree.tapped = true;
      const tap = this.add.graphics();
      tap.fillStyle(0x888888);
      tap.fillRect(6, -10, 8, 4);
      tap.fillStyle(0x666666);
      tap.fillRect(12, -10, 4, 8);
      tree.container.add(tap);
      tree.tapSprite = tap;
    } else if (!tree.hasBucket) {
      // Hang bucket
      tree.hasBucket = true;
      const bucket = this.add.graphics();
      // Bucket body
      bucket.fillStyle(0x8a8a8a);
      bucket.fillRect(8, -4, 20, 18);
      bucket.fillStyle(0xaaaaaa);
      bucket.fillRect(10, -4, 16, 2);
      // Handle
      bucket.lineStyle(2, 0x666666);
      bucket.strokeRect(12, -8, 12, 4);
      tree.container.add(bucket);
      tree.bucketGraphics = bucket;

      // Sap level bar background
      const sapBg = this.add.graphics();
      sapBg.fillStyle(0x444444);
      sapBg.fillRect(10, -2, 16, 14);
      tree.container.add(sapBg);

      // Sap level bar fill
      const sapBar = this.add.graphics();
      tree.container.add(sapBar);
      tree.sapBar = sapBar;

    } else if (tree.bucketLevel > 0) {
      // Collect sap
      const collected = tree.bucketLevel;
      tree.bucketLevel = 0;
      this.totalSap = Math.min(this.totalSap + collected, SAP_GOAL);
      this.updateUI();
      this.updateBucketVisual(tree);

      // Floating text
      const floatText = this.add.text(
        tree.container.x, tree.container.y - 50,
        `+${collected.toFixed(1)} gal`,
        { fontFamily: 'monospace', fontSize: '12px', color: '#ffdd57', stroke: '#000', strokeThickness: 2 }
      ).setOrigin(0.5);

      this.tweens.add({
        targets: floatText,
        y: floatText.y - 30,
        alpha: 0,
        duration: 1000,
        onComplete: () => floatText.destroy(),
      });

      this.checkFacts();
      this.checkWin();
    }
  }

  updateBucketVisual(tree) {
    if (!tree.sapBar) return;
    tree.sapBar.clear();
    const fill = Math.min(tree.bucketLevel / BUCKET_CAPACITY, 1);
    const height = Math.round(fill * 14);
    if (height > 0) {
      const isAlmostFull = fill > 0.8;
      tree.sapBar.fillStyle(isAlmostFull ? 0xff6644 : 0xd4a574);
      tree.sapBar.fillRect(10, -2 + (14 - height), 16, height);
    }
  }

  createUI() {
    // Progress bar background
    this.add.graphics()
      .fillStyle(0x333333)
      .fillRect(10, 10, 200, 20)
      .lineStyle(2, 0x1c4587)
      .strokeRect(10, 10, 200, 20);

    this.progressBar = this.add.graphics();
    this.sapText = this.add.text(215, 10, '0 / 40 gal', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    });

    // Hint text
    this.hintText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 15, 'Tap a tree to start!', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#b0bec5',
    }).setOrigin(0.5);
  }

  updateUI() {
    this.progressBar.clear();
    const fill = Math.min(this.totalSap / SAP_GOAL, 1);
    this.progressBar.fillStyle(0xd4a574);
    this.progressBar.fillRect(12, 12, Math.round(fill * 196), 16);

    this.sapText.setText(`${this.totalSap.toFixed(1)} / ${SAP_GOAL} gal`);

    if (this.totalSap > 0 && this.hintText.visible) {
      this.hintText.setText('Tap buckets to collect sap!');
    }
  }

  checkFacts() {
    for (const fact of TAPPING_FACTS) {
      if (this.totalSap >= fact.trigger && !this.shownFacts.has(fact.trigger)) {
        this.shownFacts.add(fact.trigger);
        this.showPopup(fact.title, fact.text);
        break;
      }
    }
  }

  showPopup(title, text) {
    this.isPaused = true;
    const overlay = this.add.container(0, 0).setDepth(100);

    // Dim background
    const dim = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);
    overlay.add(dim);

    // Popup box
    const box = this.add.graphics();
    box.fillStyle(0x1a1a2e);
    box.fillRect(40, 50, GAME_WIDTH - 80, 200);
    box.lineStyle(3, 0x1c4587);
    box.strokeRect(40, 50, GAME_WIDTH - 80, 200);
    overlay.add(box);

    // Pixel border decoration
    const deco = this.add.graphics();
    deco.fillStyle(0xd4a574);
    for (let i = 0; i < 10; i++) {
      deco.fillRect(44 + i * 8, 54, 4, 4);
      deco.fillRect(44 + i * 8, 242, 4, 4);
    }
    overlay.add(deco);

    const titleText = this.add.text(GAME_WIDTH / 2, 80, title, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffdd57',
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    overlay.add(titleText);

    const bodyText = this.add.text(GAME_WIDTH / 2, 140, text, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#e0e0e0',
      wordWrap: { width: GAME_WIDTH - 120 },
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);
    overlay.add(bodyText);

    const btnBg = this.add.rectangle(GAME_WIDTH / 2, 220, 100, 28, 0x1c4587)
      .setInteractive({ useHandCursor: true });
    overlay.add(btnBg);

    const btnText = this.add.text(GAME_WIDTH / 2, 220, 'Got it!', {
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

  checkWin() {
    if (this.totalSap >= SAP_GOAL) {
      this.time.delayedCall(500, () => {
        this.scene.start('TappingWin', { sapCollected: this.totalSap });
      });
    }
  }

  update(time, delta) {
    if (this.isPaused) return;

    for (const tree of this.trees) {
      if (!tree.hasBucket) continue;

      tree.bucketLevel += DRIP_RATE_BASE * (delta / 1000);

      if (tree.bucketLevel >= BUCKET_CAPACITY) {
        tree.bucketLevel = BUCKET_CAPACITY * 0.3;
        this.totalSap = Math.max(0, this.totalSap - OVERFLOW_PENALTY);
        this.updateUI();

        // Flash red warning
        const flash = this.add.rectangle(
          tree.container.x, tree.container.y,
          40, 40, 0xff0000, 0.5
        );
        this.tweens.add({
          targets: flash,
          alpha: 0,
          duration: 400,
          onComplete: () => flash.destroy(),
        });
      }

      this.updateBucketVisual(tree);
    }
  }
}
