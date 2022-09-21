import '../phaser-core.min.js'
import { BACKGROUND } from '~/Utils/gameValues'
import { getScoreboardArray } from '~/Utils/utils'

import TweenHelper from '~/Utils/animate.js'

import title from '/assets/Bejeweled_title.png'

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene')
  }

  preload() {
    this.load.image('logo', title)
  }

  create() {
    this.cameras.main.setBackgroundColor('#000')
    this.add.image(this.cameras.main.centerX, 150, 'logo').setDepth(1).setOrigin(0.5, 0).setScale(6)

    // Add scoreboard
    const { posArr, nameArr, scoreArr } = getScoreboardArray()
    this.add.text(100, 700, posArr, { font: 'bold 70px monospace', align: 'left' }).setDepth(1).setOrigin(0, 0)
    this.add.text(this.cameras.main.centerX, 700, nameArr, { font: 'bold 70px monospace', align: 'center' }).setDepth(1).setOrigin(0.5, 0)
    this.add.text(1350, 700, scoreArr, { font: 'bold 70px monospace', align: 'right' }).setDepth(1).setOrigin(1, 0)

    // Add play text
    const text = this.add.text(this.cameras.main.centerX, BACKGROUND.HEIGHT - 200, 'click to play', { font: 'bold 53px monospace', color: '#c94cb1' }).setDepth(1).setOrigin(0.5)
    TweenHelper.flashElement(this, text)

    this.input.on('pointerup', () => {
      this.scene.start('GameScene')
    }, this)

    this.input.keyboard.on('keydown', () => {
      this.scene.start('GameScene')
    }, this)

    return 3
  }
}
