import '../phaser-core.min.js'
import { BACKGROUND } from '~/Utils/gameValues'
import { getScoreboardArray } from '~/Utils/utils'

import title from '/assets/Bejeweled_title.png'

export default class MenuScene extends Phaser.Scene {
  // private playerCarsGroup: Phaser.GameObjects.Group;

  constructor() {
    super('MenuScene')
  }

  preload() {
    this.load.image('logo', title)

    // this.menuGameOver = this.add.group();
  }

  create() {
    window.highscores.init('Dejeweled')
    this.cameras.main.setBackgroundColor('#000')
    this.add.image(this.cameras.main.centerX, 150, 'logo').setDepth(1).setOrigin(0.5, 0).setScale(6)

    // this.add.text(HALF_SCREEN.WIDTH, 150, 'BEJEWELED', { font: 'bold 250px monospace' }).setDepth(1).setOrigin(0.5, 0)

    // Add scoreboard
    const { posArr, nameArr, scoreArr } = getScoreboardArray()
    this.add.text(100, 700, posArr, { font: 'bold 70px monospace', align: 'left' }).setDepth(1).setOrigin(0, 0)
    this.add.text(this.cameras.main.centerX, 700, nameArr, { font: 'bold 70px monospace', align: 'center' }).setDepth(1).setOrigin(0.5, 0)
    this.add.text(1350, 700, scoreArr, { font: 'bold 70px monospace', align: 'right' }).setDepth(1).setOrigin(1, 0)

    this.add.text(this.cameras.main.centerX, BACKGROUND.HEIGHT - 200, 'Press any key to start', { font: 'bold 53px monospace', color: '#c94cb1' }).setDepth(1).setOrigin(0.5)

    this.input.on('pointerup', () => {
      this.scene.start('GameScene')
    }, this)

    this.input.keyboard.on('keydown', () => {
      this.scene.start('GameScene')
    }, this)

    return 3
  }
}
