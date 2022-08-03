/* eslint-disable no-new */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable import/no-mutable-exports */
import 'phaser'

import GameManager, { gameManager } from '../Game/GameManager'
import { INITIAL_BOARD_SCREEN, TILE } from '../Utils/gameValues'

import backgroundBoard from '~/assets/background_board.png'
import Border from '~/assets/Border.png'
import selectedTile from '~/assets/selectedTile.png'
import ScoreBoard from '~/assets/ScoreBoard.png'
import ScoreBorder from '~/assets/ScoreBorder.png'
import LevelBarBackground from '~/assets/levelBarBackground.png'
import LevelBar from '~/assets/levelbar.jpg'
import ButtonReset from '~/assets/buttonReset.png'
import ButtonMenu from '~/assets/buttonMenu.png'
import RestartButton from '~/assets/restartBtn.png'
import ScoreMenu from '~/assets/scoreMenu.jpg'
import bubble1 from '~/assets/bubble_single_1.mp3'
import bubble2 from '~/assets/bubble_single_2.mp3'
import bubble3 from '~/assets/bubble_single_3.mp3'
import levelUpSound from '~/assets/levelUpSound.mp3'
import pieces from '~/assets/pieces.png'

export let gameScene: Phaser.Scene
export let scoreText, levelText
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
    this.load.image('ScoreBoard', ScoreBoard)
    this.load.image('ScoreBorder', ScoreBorder)
    this.load.image('LevelBarBackground', LevelBarBackground)
    this.load.image('LevelBar', LevelBar)
    this.load.image('ButtonReset', ButtonReset)
    this.load.image('ButtonMenu', ButtonMenu)
    this.load.image('RestartButton', RestartButton)
    this.load.image('ScoreMenu', ScoreMenu)

    this.load.audio('bubble1', bubble1)
    this.load.audio('bubble2', bubble2)
    this.load.audio('bubble3', bubble3)
    this.load.audio('levelUpSound', levelUpSound)

    this.load.spritesheet('pieces_spritesheet', pieces, {
      frameWidth: TILE.WIDTH,
      frameHeight: TILE.HEIGHT,
    })

    // this.menuGameOver = this.add.group();
  }

  create() {
    this.cameras.main.setBackgroundColor('#000')
    this.add.image(INITIAL_BOARD_SCREEN.WIDTH + 120, 1330 + 100, 'LevelBarBackground').setDepth(1).setOrigin(0, 0)
    levelBarImg = this.add.image(INITIAL_BOARD_SCREEN.WIDTH + 125, 1330 + 105, 'LevelBar').setDepth(1).setOrigin(0, 0)
    this.add.image(INITIAL_BOARD_SCREEN.WIDTH - TILE.WIDTH / 2, INITIAL_BOARD_SCREEN.HEIGHT - TILE.HEIGHT / 2, 'backgroundBoard').setDepth(1).setOrigin(0, 0)
    this.add.image(INITIAL_BOARD_SCREEN.WIDTH - TILE.WIDTH / 2 - 20, INITIAL_BOARD_SCREEN.HEIGHT - TILE.HEIGHT / 2 - 20, 'Border').setDepth(1).setOrigin(0, 0)
    this.add.image(170, INITIAL_BOARD_SCREEN.HEIGHT - TILE.HEIGHT / 2 - 20, 'ScoreBoard').setDepth(1).setOrigin(0, 0)
    this.add.image(170 - 20, INITIAL_BOARD_SCREEN.HEIGHT - TILE.HEIGHT / 2 - 20, 'ScoreBorder').setDepth(1).setOrigin(0, 0)

    const buttonReset = this.add.image(190, INITIAL_BOARD_SCREEN.HEIGHT + 120, 'ButtonReset').setDepth(1).setOrigin(0, 0)
    buttonReset.setInteractive({ useHandCursor: true })
    buttonReset.on('pointerup', () => gameManager.reset())

    const buttonMenu = this.add.image(190, INITIAL_BOARD_SCREEN.HEIGHT + 220, 'ButtonMenu').setDepth(1).setOrigin(0, 0)
    buttonMenu.setInteractive({ useHandCursor: true })
    buttonMenu.on('pointerup', () => this.scene.start('MenuScene'))

    scoreText = this.add.text(190, INITIAL_BOARD_SCREEN.HEIGHT + 30, 'Score: 0', { font: 'bold 53px Geneva' }).setDepth(1)
    levelText = this.add.text(190, INITIAL_BOARD_SCREEN.HEIGHT - 60, 'Level: 1', { font: 'bold 53px Geneva' }).setDepth(1)

    new GameManager()
  }
}
