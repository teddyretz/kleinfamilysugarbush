import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants.js';

export class TappingIntro extends Phaser.Scene {
  constructor() {
    super('TappingIntro');
  }

  create() {
    // Sky background
    this.cameras.main.setBackgroundColor(COLORS.sky);

    // Title
    this.add.text(GAME_WIDTH / 2, 60, 'TAPPING TIME!', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Pixel art tree decoration
    this.drawPixelTree(GAME_WIDTH / 2 - 80, 130);
    this.drawPixelTree(GAME_WIDTH / 2 + 80, 130);

    // Instructions
    const instructions = [
      'Tap trees to drill and hang buckets.',
      'Collect sap before buckets overflow!',
      'Gather 40 gallons to make syrup.',
    ];

    instructions.forEach((line, i) => {
      this.add.text(GAME_WIDTH / 2, 180 + i * 24, line, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#e0e0e0',
      }).setOrigin(0.5);
    });

    // Start button
    const btnBg = this.add.rectangle(GAME_WIDTH / 2, 275, 140, 36, 0x1c4587)
      .setInteractive({ useHandCursor: true });
    const btnText = this.add.text(GAME_WIDTH / 2, 275, 'START', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x2a5faa));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x1c4587));
    btnBg.on('pointerdown', () => {
      this.scene.start('TappingGame');
    });
  }

  drawPixelTree(x, y) {
    const g = this.add.graphics();
    // Trunk
    g.fillStyle(0x5c3d2e);
    g.fillRect(x - 4, y, 8, 24);
    // Canopy
    g.fillStyle(0x2d5a27);
    g.fillRect(x - 16, y - 16, 32, 16);
    g.fillRect(x - 12, y - 28, 24, 12);
    g.fillRect(x - 8, y - 36, 16, 8);
    // Snow on top
    g.fillStyle(0xe8eaf0);
    g.fillRect(x - 12, y - 30, 24, 3);
    g.fillRect(x - 8, y - 37, 16, 2);
  }
}
