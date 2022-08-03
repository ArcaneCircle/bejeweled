import GameScene from './Scenes/GameScene'
import MenuScene from './Scenes/MenuScene'
import 'phaser'

export const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'bejeweled-game',
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 1720,
    backgroundColor: '#df8e73',
  },
  physics: {
    default: 'arcade',
    arcade: {
      // debug: true,
    },
  },
  // scene: [GameScene, MenuScene]
  scene: [MenuScene, GameScene],
}

export const game = new Phaser.Game(config)
