/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable import/no-mutable-exports */
/* eslint-disable linebreak-style */
import { average, convertTileToPosition, getPieceHashColor, getPieceTypeList, getRandomValueFromArray, isNumberInsideBoard, makeMovementAnimation, makeScaleAnimation, recognizeScoreType, rndNumber, timeout } from '../Utils/utils'
import { gameScene, levelBarImg, levelText, scoreText } from '../Scenes/GameScene'
import type { PositionInPixel, PositionInTile, ScoreTypes, TileNumbers } from '../game.interfaces'
import { INITIAL_BOARD_SCREEN, LEVEL_SCORE_TO_ADD, PIECE_TYPES, TILE } from '../Utils/gameValues'
import Map, { map } from './Map'
import Piece from './Piece'

import './webxdc-scores.js'

// eslint-disable-next-line import/prefer-default-export
export let gameManager: GameManager

export default class GameManager {
  public map!: Map
  lastPiece!: Piece
  currentPiece!: Piece
  score!: number
  level!: number
  scoreObjective!: number
  previousScoreObjective!: number
  isPieceSelectedInFrame = false
  isMoving = false
  GOMenu: null | Phaser.GameObjects.Image = null
  GOBtn: null | Phaser.GameObjects.Image = null
  GOText: null | Phaser.GameObjects.Text = null

  constructor() {
    gameManager = this
    this.start()
  }

  private start() {
    window.highscores.init('Dejeweled')
    this.resetScoreAndLevel()
    this.map = new Map()
    this.checkMatches()
  }

  public resetScoreAndLevel() {
    this.score = parseInt(window.localStorage.getItem('dejeweled-score') ?? '0')
    this.level = Math.floor(this.score / LEVEL_SCORE_TO_ADD) + 1
    this.scoreObjective = this.level * LEVEL_SCORE_TO_ADD + (this.level > 1 ? this.level * 100 : 0)
    this.previousScoreObjective = this.scoreObjective - (LEVEL_SCORE_TO_ADD) - (this.level > 1 ? this.level * 100 : 0)
    // levelBarImg.scaleX = 0
    levelBarImg.scaleX = (this.score - this.previousScoreObjective) / (LEVEL_SCORE_TO_ADD + (this.level > 1 ? this.level * 100 : 0))
    scoreText.setText(`Score: ${this.score}`)
    levelText.setText(`Level: ${this.level}`)
  }

  public reset() {
    // send score before reset
    window.highscores.setScore(this.score)
    // remove map and score from localStorage
    window.localStorage.removeItem('dejeweled-map')
    window.localStorage.removeItem('dejeweled-score')
    map.resetMap()
    this.resetScoreAndLevel()
    // this.gameOver()
    if (this.GOMenu)
      this.GOMenu.destroy()
    if (this.GOBtn)
      this.GOBtn.destroy()
    if (this.GOText)
      this.GOText.destroy()
  }

  public changeCurrentSelectedPiece(newPiece: Piece): Piece {
    if (this.currentPiece) {
      this.lastPiece = this.currentPiece
      this.lastPiece.clearFrame()
    }
    this.currentPiece = newPiece
    this.isPieceSelectedInFrame = true
    return this.currentPiece
  }

  public resetPiecesForAction() {
    this.lastPiece = this.currentPiece
    this.currentPiece = null as unknown as Piece
    this.lastPiece.clearFrame()
    this.isPieceSelectedInFrame = false
  }

  private async scoreAndLevelUp(pieces: Piece[]) {
    const scoreType = recognizeScoreType(pieces)
    await this.scoreIt(scoreType, pieces)
    // save map and score with every point
    window.localStorage.setItem('dejeweled-map', JSON.stringify(getPieceTypeList(map.getCurrentMap())))
    window.localStorage.setItem('dejeweled-score', this.score.toString())

    if (this.score >= this.scoreObjective)
      this.levelUp()
  }

  private levelUp() {
    this.level++
    levelText.setText(`Level: ${this.level}`)
    levelBarImg.scaleX = 0
    this.previousScoreObjective = this.scoreObjective
    this.scoreObjective = this.level * LEVEL_SCORE_TO_ADD + (this.level * 100)
  }

  private insertModalText(text: string | number, { x, y }: PositionInPixel, _type = 'normal', color = '#ffffff') {
    const levelText = gameScene.add.text(x, y, text.toString(), {
      font: 'bold 63px Geneva',
      stroke: '#000000',
      strokeThickness: 10,
      color,
    }).setDepth(1.1).setOrigin(0.5, 0.5)
    makeMovementAnimation(levelText, { x: levelText.x, y: levelText.y - 250 }, 600)

    gameScene.tweens.add({
      targets: levelText,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
    })
  }

  private async scoreIt(scoreToType: ScoreTypes, pieces: Piece[]) {
    let toScore = 2000
    switch (scoreToType) {
      case '3line':
        toScore = 50
        break
      case '4line':
        toScore = 100
        break
      case '5line':
        toScore = 500
        break
      case '6line':
        toScore = 800
        break
      case '3L':
        toScore = 800
        break
      case '4L':
        toScore = 1000
        break
      default:
        console.log('No scoreType was found')
    }

    this.calculateScoreUI(pieces, toScore)
    this.score += toScore
    await this.updateLevelBar()

    scoreText.setText(`Score: ${this.score}`)
  }

  calculateScoreUI(pieces: Piece[], score) {
    const arrayXValues: number[] = []
    const arrayYValues: number[] = []
    pieces.forEach((piece) => {
      arrayXValues.push(piece.currentTile.tileX)
      arrayYValues.push(piece.currentTile.tileY)
    })
    const tileX = average(arrayXValues) as TileNumbers
    const tileY = average(arrayYValues) as TileNumbers
    const color = getPieceHashColor(pieces[0]) ?? undefined
    this.insertModalText(`+${score}`, convertTileToPosition({ tileX, tileY }), 'score', color)
  }

  comboUI(combo: number, x = 100, y = 100) {
    this.insertModalText(`${combo}x combo`, { x, y }, 'combo', '#df8e73')
  }

  private async updateLevelBar() {
    return new Promise<void>((resolve) => {
      const newScaleXVal = (this.score - this.previousScoreObjective) / (LEVEL_SCORE_TO_ADD + (this.level > 1 ? this.level * 100 : 0))
      gameScene.tweens.add({
        targets: levelBarImg,
        scaleX: newScaleXVal > 1 ? 1 : newScaleXVal,
        ease: 'Linear',
        duration: 500,
        onComplete() {
          resolve()
        },
      })
    })
  }

  private playExplodingBubbleSound() {
    gameScene.sound.play(`bubble${rndNumber(1, 3, true)}`)
    setTimeout(() => {
      gameScene.sound.play(`bubble${rndNumber(1, 3, true)}`)
    }, 150)
  }

  public async makeTwoPieceAnimation(currentPiece: Piece, lastPiece: Piece): Promise<null> {
    makeMovementAnimation(lastPiece, {
      x: currentPiece.currentPosition.x,
      y: currentPiece.currentPosition.y,
    }, 300)
    await makeMovementAnimation(currentPiece, {
      x: lastPiece.currentPosition.x,
      y: lastPiece.currentPosition.y,
    }, 300)

    return null
  }

  public async piecesMovement(pieceToSwitch: Piece) {
    if (this.isPieceSelectedInFrame && map.isPieceAdjacent(pieceToSwitch)) {
      this.isMoving = true
      this.resetPiecesForAction()
      await pieceToSwitch.switch(this.lastPiece)
      const { matchArrOfPieces, finalMap } = map.checkMatch(map.getCurrentMap(), this.lastPiece)
      if (finalMap && finalMap.length > 0) {
        map.setCurrentMap(finalMap)
        window.localStorage.setItem('dejeweled-map', JSON.stringify(getPieceTypeList(finalMap)))
      }

      if (matchArrOfPieces.length >= 3)
        await this.matchIt(matchArrOfPieces)

      let opositePieceMatchArr: Piece[] = []
      const opositePieceResponse = map.checkMatch(map.getCurrentMap(), pieceToSwitch)
      if (opositePieceResponse.finalMap && opositePieceResponse.matchArrOfPieces.length > 0) {
        map.setCurrentMap(opositePieceResponse.finalMap)
        window.localStorage.setItem('dejeweled-map', JSON.stringify(getPieceTypeList(opositePieceResponse.finalMap)))
        opositePieceMatchArr = opositePieceResponse.matchArrOfPieces
      }

      if (opositePieceMatchArr.length >= 3)
        await this.matchIt(opositePieceMatchArr)

      if (opositePieceMatchArr.length <= 0 && matchArrOfPieces.length <= 0)
        await pieceToSwitch.switch(this.lastPiece)

      let resultForGameOver = map.isBoardMatch(map.getCurrentMap())

      const resultForFutureMoves = map.isExistantFutureMoves(map.getCurrentMap())
      if (!resultForGameOver.isMatch && !resultForFutureMoves)
        this.gameOver()

      let combo = 1
      if (resultForGameOver.isMatch) {
        do {
          await this.matchAgain(resultForGameOver.piece)
          combo++
          console.log(`${combo}x combo`)
          this.comboUI(combo, 720, 1490)
          this.score += combo * 100
          await timeout(500)
          resultForGameOver = map.isBoardMatch(map.getCurrentMap())
        } while (resultForGameOver.isMatch)

        if (!map.isExistantFutureMoves(map.getCurrentMap()))
          this.gameOver()
      }

      this.isMoving = false
      return true
    }
    return false
  }

  private async matchAgain(piece: Piece) {
    const { matchArrOfPieces } = map.checkMatch(map.getCurrentMap(), piece)
    await this.matchIt(matchArrOfPieces)
  }

  public gameOver() {
    this.GOMenu = gameScene.add.image(INITIAL_BOARD_SCREEN.WIDTH - TILE.WIDTH / 2 - 20, 500, 'ScoreMenu').setDepth(1).setOrigin(0, 0).setScale(2)
    this.GOBtn = gameScene.add.image(this.GOMenu.x + this.GOMenu.width - 188, this.GOMenu.y + 250, 'RestartButton').setDepth(1).setOrigin(0, 0)
    this.GOBtn.setInteractive({ useHandCursor: true })

    this.GOText = gameScene.add.text(this.GOMenu.x + this.GOMenu.width, this.GOMenu.y + 200, this.score.toString(), { font: 'bold 53px Geneva' }).setDepth(1).setOrigin(0.5, 0)

    window.highscores.setScore(this.score)

    this.GOBtn.on('pointerup', () => {
      this.GOBtn && this.GOBtn.destroy()
      this.GOMenu && this.GOMenu.destroy()
      this.GOText && this.GOText.destroy()
      this.reset()
    })
  }

  private matchIt = async (pieces: Piece[]): Promise<null> => {
    this.playExplodingBubbleSound()
    await makeScaleAnimation(pieces)
    pieces.forEach(piece => piece.destroy())
    this.scoreAndLevelUp(pieces)
    this.fallPieces(pieces)
    this.generateMore()
    await timeout(500)
    return null
  }

  private async fallPieces(piecesThatMatch: Piece[]) {
    let newPiecesThatMatch = piecesThatMatch.map(piece => piece.currentTile)
    let currentMatchArr

    newPiecesThatMatch.sort((a, b) => a.tileY - b.tileY)
    do {
      currentMatchArr = []
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      newPiecesThatMatch.forEach(async ({ tileX, tileY }) => {
        let contador = 0
        const currentMap = map.getCurrentMap()

        if (isNumberInsideBoard(tileY - contador)) {
          do
            contador++
          while (isNumberInsideBoard(tileY - contador) && !currentMap[tileX][tileY - contador])

          const pieceToReplace = currentMap[tileX][tileY - contador]
          if (pieceToReplace) {
            pieceToReplace.updatePiecePositionAndTile({ tileX, tileY })
            makeMovementAnimation(pieceToReplace, convertTileToPosition({ tileX, tileY }), 200)

            map.setPieceOnTile(null as unknown as Piece, { tileX, tileY: (tileY - contador) as TileNumbers })
            currentMatchArr.push({ tileX, tileY: (tileY - contador) as TileNumbers })
          }
        }
        newPiecesThatMatch = currentMatchArr.sort((a, b) => a.tileY - b.tileY)
      })
    } while (currentMatchArr.length > 0)
  }

  private async generateMore() {
    const currentMap = map.getCurrentMap()
    const emptyTiles: PositionInTile[] = []
    currentMap.forEach((line, tileX) => line.forEach((piece, tileY) => {
      if (!piece || !piece.active) {
        const newX = tileX as unknown as TileNumbers
        const newY = tileY as unknown as TileNumbers
        emptyTiles.push({ tileX: newX, tileY: newY })
      }
    }))

    emptyTiles.sort((a, b) => b.tileY - a.tileY)

    let contador = 1
    let xValue: number
    emptyTiles.forEach((tilePosition: PositionInTile) => {
      const pieceTypeLetter = getRandomValueFromArray(PIECE_TYPES)
      const newTilePosition = convertTileToPosition(tilePosition)
      if (xValue !== tilePosition.tileX)
        contador = 1
      else
        contador++

      xValue = tilePosition.tileX
      const yPositon = (INITIAL_BOARD_SCREEN.HEIGHT - (TILE.HEIGHT * contador))
      const newPosition = { x: newTilePosition.x, y: yPositon }
      const piece = new Piece(pieceTypeLetter, newPosition)

      piece.updatePiecePositionAndTile(tilePosition)
      makeMovementAnimation(piece, convertTileToPosition(tilePosition), 200)
    })
  }

  private async checkMatches() {
    const mapExist = window.localStorage.getItem('dejeweled-map') !== null
    if (mapExist) {
      let resultForGameOver = map.isBoardMatch(map.getCurrentMap())

      const resultForFutureMoves = map.isExistantFutureMoves(map.getCurrentMap())
      if (!resultForGameOver.isMatch && !resultForFutureMoves)
        this.gameOver()

      if (resultForGameOver.isMatch) {
        do {
          await this.matchAgain(resultForGameOver.piece)
          resultForGameOver = map.isBoardMatch(map.getCurrentMap())
        } while (resultForGameOver.isMatch)

        if (!map.isExistantFutureMoves(map.getCurrentMap()))
          this.gameOver()
      }
    }
  }
}
