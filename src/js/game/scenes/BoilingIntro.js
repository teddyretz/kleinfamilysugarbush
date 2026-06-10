import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { sfx } from '../audio.js';

export class BoilingIntro extends Phaser.Scene {
  constructor() {
    super('BoilingIntro');
  }

  init(data) {
    this.linked = data?.linked || false;
    this.sapCollected = data?.sapCollected || 40;
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    this.add.text(GAME_WIDTH / 2, 50, 'BOILING DOWN!', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ff9900',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Pixel art evaporator decoration
    this.drawEvaporator(GAME_WIDTH / 2, 120);

    // Linked mode message
    if (this.linked) {
      this.add.text(GAME_WIDTH / 2, 165, `You brought ${this.sapCollected.toFixed(0)} gallons of sap!`, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#d4a574',
      }).setOrigin(0.5);
    }

    // Instructions
    const instructions = [
      'Chop logs and feed the fire to boil the sap.',
      'Hold the temperature near 219F - the GOAL line.',
      "Too thick? Add sap. Don't let it burn!",
      'Check the density, then draw off your syrup.',
    ];

    const startY = this.linked ? 185 : 172;
    instructions.forEach((line, i) => {
      this.add.text(GAME_WIDTH / 2, startY + i * 20, line, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#e0e0e0',
      }).setOrigin(0.5);
    });

    // Start button
    const btnY = startY + 100;
    const btnBg = this.add.rectangle(GAME_WIDTH / 2, btnY, 140, 36, 0xcc5500)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, btnY, 'FIRE IT UP', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => btnBg.setFillStyle(0xff6a00));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0xcc5500));
    btnBg.on('pointerdown', () => {
      sfx.click();
      this.scene.start('BoilingGame', { linked: this.linked, sapCollected: this.sapCollected });
    });
  }

  drawEvaporator(x, y) {
    const g = this.add.graphics();
    // Base/arch
    g.fillStyle(0x555555);
    g.fillRect(x - 40, y - 10, 80, 30);
    // Pan on top
    g.fillStyle(0x777777);
    g.fillRect(x - 36, y - 16, 72, 8);
    // Sap in pan
    g.fillStyle(0xf0d4a8);
    g.fillRect(x - 34, y - 14, 68, 4);
    // Chimney
    g.fillStyle(0x444444);
    g.fillRect(x + 28, y - 40, 10, 26);
    // Fire
    g.fillStyle(0xff4500);
    g.fillRect(x - 20, y + 4, 8, 12);
    g.fillStyle(0xff6a00);
    g.fillRect(x - 8, y + 2, 8, 14);
    g.fillStyle(0xffa500);
    g.fillRect(x + 4, y + 6, 8, 10);
    g.fillStyle(0xff4500);
    g.fillRect(x + 16, y + 4, 8, 12);
  }
}
