import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants.js';

export class TappingWin extends Phaser.Scene {
  constructor() {
    super('TappingWin');
  }

  init(data) {
    this.sapCollected = data.sapCollected || 40;
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Celebration title
    this.add.text(GAME_WIDTH / 2, 40, 'GREAT JOB!', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ffdd57',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Syrup bottle pixel art
    this.drawSyrupBottle(GAME_WIDTH / 2, 130);

    this.add.text(GAME_WIDTH / 2, 185, `You collected ${this.sapCollected.toFixed(0)} gallons of sap!`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#e0e0e0',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 205, "That's enough to make 1 gallon of maple syrup!", {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#d4a574',
    }).setOrigin(0.5);

    // Continue to Boiling button
    const btn1Bg = this.add.rectangle(GAME_WIDTH / 2, 250, 200, 32, 0x1c4587)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, 250, 'Continue to Boiling', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffffff',
    }).setOrigin(0.5);

    btn1Bg.on('pointerover', () => btn1Bg.setFillStyle(0x2a5faa));
    btn1Bg.on('pointerout', () => btn1Bg.setFillStyle(0x1c4587));
    btn1Bg.on('pointerdown', () => {
      this.scene.start('BoilingIntro', { sapCollected: this.sapCollected, linked: true });
    });

    // Play Again button
    const btn2Bg = this.add.rectangle(GAME_WIDTH / 2, 290, 140, 28, 0x333333)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, 290, 'Play Again', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#b0bec5',
    }).setOrigin(0.5);

    btn2Bg.on('pointerover', () => btn2Bg.setFillStyle(0x444444));
    btn2Bg.on('pointerout', () => btn2Bg.setFillStyle(0x333333));
    btn2Bg.on('pointerdown', () => {
      this.scene.start('TappingIntro');
    });

    // Simple particle celebration
    for (let i = 0; i < 20; i++) {
      const px = Phaser.Math.Between(50, GAME_WIDTH - 50);
      const py = Phaser.Math.Between(-20, 0);
      const star = this.add.text(px, py, '*', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: Phaser.Math.RND.pick(['#ffdd57', '#ff9900', '#ffffff', '#d4a574']),
      });
      this.tweens.add({
        targets: star,
        y: GAME_HEIGHT + 20,
        x: px + Phaser.Math.Between(-40, 40),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        delay: Phaser.Math.Between(0, 1000),
        repeat: -1,
      });
    }
  }

  drawSyrupBottle(x, y) {
    const g = this.add.graphics();
    // Bottle body
    g.fillStyle(0xd4a574);
    g.fillRect(x - 12, y - 20, 24, 40);
    // Bottle neck
    g.fillStyle(0xd4a574);
    g.fillRect(x - 6, y - 32, 12, 12);
    // Cap
    g.fillStyle(0x8b4513);
    g.fillRect(x - 8, y - 36, 16, 6);
    // Label
    g.fillStyle(0xffffff);
    g.fillRect(x - 10, y - 8, 20, 16);
    // Label text
    this.add.text(x, y, 'NH', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#1a1a2e',
    }).setOrigin(0.5);
  }
}
