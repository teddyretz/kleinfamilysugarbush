import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GRADES } from '../config/constants.js';

export class BoilingWin extends Phaser.Scene {
  constructor() {
    super('BoilingWin');
  }

  init(data) {
    this.grade = data.grade || GRADES[1];
    this.linked = data.linked || false;
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    this.add.text(GAME_WIDTH / 2, 30, 'SYRUP READY!', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ffdd57',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Syrup bottle with grade color
    this.drawGradedBottle(GAME_WIDTH / 2, 110, this.grade);

    // Grade name
    this.add.text(GAME_WIDTH / 2, 170, this.grade.name, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: this.grade.color,
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Grade description
    const descriptions = {
      'Golden Delicate': 'Light and delicate with a mild, sweet flavor.\nPerfect for drizzling on ice cream or yogurt.',
      'Amber Rich': 'Rich maple flavor with a smooth body.\nThe most popular grade for pancakes and waffles!',
      'Dark Robust': 'Bold, robust flavor with caramel notes.\nGreat for baking and cooking.',
      'Very Dark Strong': 'Very strong, intense maple flavor.\nIdeal for recipes that need a maple punch.',
    };

    this.add.text(GAME_WIDTH / 2, 205, descriptions[this.grade.name] || '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#b0bec5',
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);

    // Buttons
    const btn1Bg = this.add.rectangle(GAME_WIDTH / 2 - 80, 265, 130, 28, 0x1c4587)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2 - 80, 265, 'Different Grade', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5);

    btn1Bg.on('pointerover', () => btn1Bg.setFillStyle(0x2a5faa));
    btn1Bg.on('pointerout', () => btn1Bg.setFillStyle(0x1c4587));
    btn1Bg.on('pointerdown', () => {
      this.scene.start('BoilingIntro', { linked: false });
    });

    const btn2Bg = this.add.rectangle(GAME_WIDTH / 2 + 80, 265, 130, 28, 0x1c4587)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2 + 80, 265, 'Play From Start', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5);

    btn2Bg.on('pointerover', () => btn2Bg.setFillStyle(0x2a5faa));
    btn2Bg.on('pointerout', () => btn2Bg.setFillStyle(0x1c4587));
    btn2Bg.on('pointerdown', () => {
      this.scene.start('TappingIntro');
    });

    // Back to games page hint
    this.add.text(GAME_WIDTH / 2, 300, 'Use "Back to Game Select" to return to the games page', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#666666',
    }).setOrigin(0.5);

    // Celebration particles
    for (let i = 0; i < 15; i++) {
      const px = Phaser.Math.Between(30, GAME_WIDTH - 30);
      const star = this.add.text(px, -10, '*', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: Phaser.Math.RND.pick([this.grade.color, '#ffdd57', '#ffffff']),
      });
      this.tweens.add({
        targets: star,
        y: GAME_HEIGHT + 20,
        x: px + Phaser.Math.Between(-30, 30),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        delay: Phaser.Math.Between(0, 1500),
        repeat: -1,
      });
    }
  }

  drawGradedBottle(x, y, grade) {
    const g = this.add.graphics();
    const gradeColor = Phaser.Display.Color.HexStringToColor(grade.color).color;

    // Bottle body
    g.fillStyle(gradeColor);
    g.fillRect(x - 16, y - 24, 32, 48);
    // Bottle neck
    g.fillStyle(gradeColor);
    g.fillRect(x - 8, y - 38, 16, 14);
    // Cap
    g.fillStyle(0x8b4513);
    g.fillRect(x - 10, y - 42, 20, 6);
    // Label
    g.fillStyle(0xffffff);
    g.fillRect(x - 14, y - 10, 28, 20);
    // Highlight
    g.fillStyle(0xffffff, 0.2);
    g.fillRect(x - 14, y - 24, 6, 48);

    // Label text
    this.add.text(x, y + 2, 'NH\nMAPLE', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#1a1a2e',
      align: 'center',
    }).setOrigin(0.5);
  }
}
