import 'phaser'
import { HALF_SCREEN } from '../Utils/gameValues'

import title from '/Bejeweled_title.png'

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
    this.cameras.main.setBackgroundColor('#000')
    this.add.image(HALF_SCREEN.WIDTH - 640, 150, 'logo').setDepth(1).setOrigin(0, 0)

    this.add.text(HALF_SCREEN.WIDTH - 300, HALF_SCREEN.HEIGHT + 200, 'Press any key to start', { font: 'bold 53px Geneva', color: 'white' }).setDepth(1)

    this.input.on('pointerup', () => {
      this.scene.start('GameScene')
    }, this)

    return 3
  }
}
