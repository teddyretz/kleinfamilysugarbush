import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config/constants.js';
import { TappingIntro } from './scenes/TappingIntro.js';
import { TappingGame } from './scenes/TappingGame.js';
import { TappingWin } from './scenes/TappingWin.js';
import { BoilingIntro } from './scenes/BoilingIntro.js';
import { BoilingGame } from './scenes/BoilingGame.js';
import { BoilingWin } from './scenes/BoilingWin.js';

let game = null;

export function startGame(mode) {
  if (game) {
    switchGame(mode);
    return;
  }

  game = new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    pixelArt: true,
    roundPixels: true,
    backgroundColor: '#1a1a2e',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [TappingIntro, TappingGame, TappingWin, BoilingIntro, BoilingGame, BoilingWin],
  });

  game.registry.set('mode', mode);

  if (mode === 'boiling') {
    game.scene.start('BoilingIntro');
    game.scene.stop('TappingIntro');
  }
}

export function switchGame(mode) {
  if (!game) return;
  game.registry.set('mode', mode);
  game.scene.getScenes(true).forEach(s => game.scene.stop(s));

  if (mode === 'tapping' || mode === 'linked') {
    game.scene.start('TappingIntro');
  } else {
    game.scene.start('BoilingIntro');
  }
}
