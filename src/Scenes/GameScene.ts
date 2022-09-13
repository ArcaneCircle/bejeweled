/* eslint-disable no-new */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable import/no-mutable-exports */
import '../phaser-core.min.js'

import GameManager, { gameManager } from '~/Game/GameManager'
import { INITIAL_BOARD_SCREEN, TILE } from '~/Utils/gameValues'

import backgroundBoard from '/assets/background_board.png'
import Border from '/assets/Border.png'
import selectedTile from '/assets/selectedTile.png'
import LevelBar from '/assets/levelbar.jpg'
import bubble1 from '/assets/bubble_single_1.mp3'
import bubble2 from '/assets/bubble_single_2.mp3'
import bubble3 from '/assets/bubble_single_3.mp3'
import pieces from '/assets/pieces.png'

export let gameScene: Phaser.Scene
export let scoreText, levelText, buttonResetRectangle, buttonResetText, buttonMenuRectangle, buttonMenuText
export let levelBarImg: Phaser.GameObjects.Image

export default class GameScene extends Phaser.Scene {
  // private playerCarsGroup: Phaser.GameObjects.Group;

  constructor() {
    super('GameScene')
    gameScene = this
  }

  preload() {
    this.load.image('backgroundBoard', backgroundBoard)
    this.load.image('Border', Border)
    this.load.image('selectedTile', selectedTile)
    this.load.image('LevelBar', LevelBar)

    this.load.audio('bubble1', bubble1)
    this.load.audio('bubble2', bubble2)
    this.load.audio('bubble3', bubble3)

    this.load.spritesheet('pieces_spritesheet', pieces, {
      frameWidth: TILE.WIDTH,
      frameHeight: TILE.HEIGHT,
    })

    // this.menuGameOver = this.add.group();
  }

  create() {
    this.cameras.main.setBackgroundColor('#000')
    levelBarImg = this.add.image(INITIAL_BOARD_SCREEN.WIDTH + 120, 1260 + 100, 'LevelBar').setDepth(1).setOrigin(0, 0)
    this.add.image(this.cameras.main.centerX, INITIAL_BOARD_SCREEN.HEIGHT - 70, 'backgroundBoard').setDepth(1).setOrigin(0.5, 0)
    this.add.image(this.cameras.main.centerX, INITIAL_BOARD_SCREEN.HEIGHT - 90, 'Border').setDepth(1).setOrigin(0.5, 0)

    const newLocal = 'bold 72px Calibri'

    // use rectangle instead of image
    buttonResetRectangle = this.add.rectangle(this.cameras.main.centerX, 1370 + 140, 600, 120, 14101760, 0.8).setDepth(1).setOrigin(0.5, 0)
    buttonResetRectangle.setInteractive({ useHandCursor: true })
    buttonResetRectangle.on('pointerup', () => gameManager.reset())

    buttonResetText = this.add.text(this.cameras.main.centerX, 1370 + 160, 'RESTART', { font: newLocal }).setDepth(1).setOrigin(0.5, 0)

    buttonMenuRectangle = this.add.rectangle(this.cameras.main.centerX, 1370 + 300, 600, 120, 14101760, 0.8).setDepth(1).setOrigin(0.5, 0)
    buttonMenuRectangle.setInteractive({ useHandCursor: true })
    buttonMenuRectangle.on('pointerup', () => this.scene.start('MenuScene'))
    // buttonMenuRectangle.on('pointerup', () => gameManager.gameOver())

    buttonMenuText = this.add.text(this.cameras.main.centerX, 1370 + 320, 'HIGHSCORES', { font: newLocal }).setDepth(1).setOrigin(0.5, 0)

    // level and score texts
    levelText = this.add.text(100, 50, 'Level: 1', { font: newLocal, align: 'left', fixedWidth: 620 }).setDepth(1).setOrigin(0, 0)
    scoreText = this.add.text(720, 50, 'Score: 0', { font: newLocal, align: 'right', fixedWidth: 620 }).setDepth(1).setOrigin(0, 0)

    new GameManager()
  }
}
