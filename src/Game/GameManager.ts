/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable import/no-mutable-exports */
/* eslint-disable linebreak-style */
import {
  average,
  convertTileToPosition,
  getPieceHashColor,
  getPieceTypeList,
  getRandomValueFromArray,
  isNumberInsideBoard,
  makeMovementAnimation,
  makeScaleAnimation,
  recognizeScoreType,
  rndNumber,
  timeout,
} from "../Utils/utils";
import {
  gameScene,
  levelBarImg,
  levelText,
  scoreText,
} from "../Scenes/GameScene";
import type {
  PositionInPixel,
  PositionInTile,
  TileNumbers,
} from "../game.interfaces";
import {
  INITIAL_BOARD_SCREEN,
  LEVEL_SCORE_TO_ADD,
  PIECE_TYPES,
  TILE,
} from "../Utils/gameValues";
import Map, { map } from "./Map";
import Piece from "./Piece";

// eslint-disable-next-line import/prefer-default-export
export let gameManager: GameManager;

export default class GameManager {
  public map!: Map;
  lastPiece!: Piece;
  currentPiece!: Piece;
  score!: number;
  level!: number;
  scoreObjective!: number;
  previousScoreObjective!: number;
  isPieceSelectedInFrame = false;
  isMoving = false;
  GOMenu: null | Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle = null;
  GOHeader: null | Phaser.GameObjects.Text = null;
  GOBtnRectangle: null | Phaser.GameObjects.Rectangle = null;
  GOBtnText: null | Phaser.GameObjects.Text = null;
  GOText: null | Phaser.GameObjects.Text = null;

  constructor() {
    gameManager = this;
    this.start();
  }

  private start() {
    this.resetScoreAndLevel();
    this.map = new Map();
    this.checkMatches();
  }

  public resetScoreAndLevel() {
    this.score = parseInt(
      window.localStorage.getItem("dejeweled-score") ?? "0",
    );
    this.level = Math.floor(this.score / LEVEL_SCORE_TO_ADD) + 1;
    this.scoreObjective =
      this.level * LEVEL_SCORE_TO_ADD + (this.level > 1 ? this.level * 100 : 0);
    this.previousScoreObjective =
      this.scoreObjective -
      LEVEL_SCORE_TO_ADD -
      (this.level > 1 ? this.level * 100 : 0);
    levelBarImg.scaleX =
      (this.score - this.previousScoreObjective) /
      (LEVEL_SCORE_TO_ADD + (this.level > 1 ? this.level * 100 : 0));
    scoreText.setText(`Score: ${this.score}`);
    levelText.setText(`Level: ${this.level}`);
  }

  public reset() {
    // send score before reset
    window.highscores.setScore(this.score);
    // remove map and score from localStorage
    window.localStorage.removeItem("dejeweled-map");
    window.localStorage.removeItem("dejeweled-score");
    map.resetMap();
    this.resetScoreAndLevel();
    this.GOBtnRectangle && this.GOBtnRectangle.destroy();
    this.GOBtnText && this.GOBtnText.destroy();
    this.GOMenu && this.GOMenu.destroy();
    this.GOText && this.GOText.destroy();
    this.GOHeader && this.GOHeader.destroy();
  }

  public changeCurrentSelectedPiece(newPiece: Piece): Piece {
    if (this.currentPiece) {
      this.lastPiece = this.currentPiece;
      this.lastPiece.clearFrame();
    }
    this.currentPiece = newPiece;
    this.isPieceSelectedInFrame = true;
    return this.currentPiece;
  }

  public resetPiecesForAction() {
    this.lastPiece = this.currentPiece;
    this.currentPiece = null as unknown as Piece;
    this.lastPiece.clearFrame();
    this.isPieceSelectedInFrame = false;
  }

  private async scoreAndLevelUp(pieces: Piece[]) {
    const scoreType = recognizeScoreType(pieces);
    await this.scoreIt(scoreType, pieces);
    // save map and score with every point (make sure map is valid)
    const typesArr = getPieceTypeList(map.getCurrentMap());
    typesArr &&
      window.localStorage.setItem("dejeweled-map", JSON.stringify(typesArr));
    window.localStorage.setItem("dejeweled-score", this.score.toString());

    if (this.score >= this.scoreObjective) this.levelUp();
  }

  private levelUp() {
    this.level++;
    levelText.setText(`Level: ${this.level}`);
    levelBarImg.scaleX = 0;
    this.previousScoreObjective = this.scoreObjective;
    this.scoreObjective = this.level * LEVEL_SCORE_TO_ADD + this.level * 100;
  }

  private insertModalText(
    text: string | number,
    { x, y }: PositionInPixel,
    _type = "normal",
    color = "#ffffff",
    duration = 600,
  ) {
    const levelText = gameScene.add
      .text(x, y, text.toString(), {
        font: "bold 63px Calibri",
        stroke: "#000000",
        strokeThickness: 10,
        color,
      })
      .setDepth(1.1)
      .setOrigin(0.5, 0.5);
    makeMovementAnimation(
      levelText,
      { x: levelText.x, y: levelText.y - 250 },
      duration,
    );

    gameScene.tweens.add({
      targets: levelText,
      alpha: 0,
      duration: duration * 1.5,
      scale: 2,
      ease: "Power2",
    });
  }

  /**
   * Animate the score. Update score and progress level bar
   * @param {string} scoreToType - kind of score
   * @param {Piece[]} pieces - matched pieces
   */
  private async scoreIt(scoreToType: string, pieces: Piece[]) {
    const hardCoef = scoreToType === "other" ? 2 : 1;
    const piecesAmount = pieces.length;
    const toScore =
      piecesAmount < 4 ? 50 : hardCoef * (50 * Math.pow(2, piecesAmount - 3));
    this.calculateScoreUI(pieces, toScore);
    this.score += toScore;
    await this.updateLevelBar();

    scoreText.setText(`Score: ${this.score}`);
  }

  calculateScoreUI(pieces: Piece[], score) {
    const arrayXValues: number[] = [];
    const arrayYValues: number[] = [];
    pieces.forEach((piece) => {
      arrayXValues.push(piece.currentTile.tileX);
      arrayYValues.push(piece.currentTile.tileY);
    });
    const tileX = average(arrayXValues) as TileNumbers;
    const tileY = average(arrayYValues) as TileNumbers;
    const color = getPieceHashColor(pieces[0]) ?? undefined;
    this.insertModalText(
      `+${score}`,
      convertTileToPosition({ tileX, tileY }),
      "score",
      color,
      2000,
    );
  }

  comboUI(combo: number, x = 100, y = 100) {
    this.insertModalText(
      `${combo}x combo (+${combo * 20})`,
      { x, y },
      "combo",
      "#df8e73",
      2500,
    );
  }

  private async updateLevelBar() {
    return new Promise<void>((resolve) => {
      const newScaleXVal =
        (this.score - this.previousScoreObjective) /
        (LEVEL_SCORE_TO_ADD + (this.level > 1 ? this.level * 100 : 0));
      gameScene.tweens.add({
        targets: levelBarImg,
        scaleX: newScaleXVal > 1 ? 1 : newScaleXVal,
        ease: "Linear",
        duration: 500,
        onComplete() {
          resolve();
        },
      });
    });
  }

  private playExplodingBubbleSound() {
    gameScene.sound.play(`bubble${rndNumber(1, 3, true)}`);
    setTimeout(() => {
      gameScene.sound.play(`bubble${rndNumber(1, 3, true)}`);
    }, 150);
  }

  public async makeTwoPieceAnimation(
    currentPiece: Piece,
    lastPiece: Piece,
  ): Promise<null> {
    makeMovementAnimation(
      lastPiece,
      {
        x: currentPiece.currentPosition.x,
        y: currentPiece.currentPosition.y,
      },
      300,
    );
    await makeMovementAnimation(
      currentPiece,
      {
        x: lastPiece.currentPosition.x,
        y: lastPiece.currentPosition.y,
      },
      300,
    );

    return null;
  }

  public async piecesMovement(pieceToSwitch: Piece) {
    if (this.isPieceSelectedInFrame && map.isPieceAdjacent(pieceToSwitch)) {
      this.isMoving = true;
      this.resetPiecesForAction();

      await pieceToSwitch.switch(this.lastPiece);

      // find which piece is up in y-axis
      let [piece1, piece2] = [this.lastPiece, pieceToSwitch];
      if (piece1.currentTile.tileY > piece2.currentTile.tileY)
        [piece1, piece2] = [piece2, piece1];

      // initialize combo counter
      let combo = 0;
      const { matchArrOfPieces } = map.checkMatch(map.getCurrentMap(), piece1);

      if (matchArrOfPieces.length >= 3) {
        // map.setCurrentMap(map.getCurrentMap())
        await this.matchIt(matchArrOfPieces);
        combo++;
        if (combo > 1) {
          this.comboUI(combo, 720, 720);
          this.score += combo * 20;
          this.updateLevelBar();
        }
      }

      const { matchArrOfPieces: opositeArr } = map.checkMatch(
        map.getCurrentMap(),
        piece2,
      );

      if (opositeArr.length >= 3) {
        // map.setCurrentMap(map.getCurrentMap())
        await this.matchIt(opositeArr);
        combo++;
        if (combo > 1) {
          this.comboUI(combo, 720, 720);
          this.score += combo * 20;
          this.updateLevelBar();
        }
      }

      if (opositeArr.length <= 0 && matchArrOfPieces.length <= 0)
        await pieceToSwitch.switch(this.lastPiece);

      let resultForGameOver = map.isBoardMatch(map.getCurrentMap());

      const resultForFutureMoves = map.isExistantFutureMoves(
        map.getCurrentMap(),
      );
      if (!resultForGameOver.isMatch && !resultForFutureMoves) this.gameOver();

      if (resultForGameOver.isMatch) {
        do {
          await this.matchAgain(resultForGameOver.piece);
          combo++;
          this.comboUI(combo, 720, 720);
          this.score += combo * 20;
          this.updateLevelBar();
          // await timeout(1000)
          resultForGameOver = map.isBoardMatch(map.getCurrentMap());
        } while (resultForGameOver.isMatch);

        if (!map.isExistantFutureMoves(map.getCurrentMap())) this.gameOver();
      }

      this.isMoving = false;
      return true;
    }
    return false;
  }

  private async matchAgain(piece: Piece) {
    const { matchArrOfPieces } = map.checkMatch(map.getCurrentMap(), piece);
    // map.setCurrentMap(map.getCurrentMap())
    await this.matchIt(matchArrOfPieces);
  }

  public gameOver() {
    this.GOBtnRectangle && this.GOBtnRectangle.destroy();
    this.GOBtnText && this.GOBtnText.destroy();
    this.GOMenu && this.GOMenu.destroy();
    this.GOText && this.GOText.destroy();
    this.GOHeader && this.GOHeader.destroy();

    // send score before reset
    window.highscores.setScore(this.score);
    // remove map and score from localStorage
    window.localStorage.removeItem("dejeweled-map");
    window.localStorage.removeItem("dejeweled-score");

    this.GOMenu = gameScene.add
      .rectangle(
        INITIAL_BOARD_SCREEN.WIDTH - TILE.WIDTH / 2 - 20,
        500,
        1230,
        450,
        14101760,
        0.8,
      )
      .setDepth(1)
      .setOrigin(0, 0);

    const XMiddle = this.GOMenu.x + this.GOMenu.width / 2;

    this.GOHeader = gameScene.add
      .text(XMiddle, 520, "GAME OVER", {
        font: "bold 72px Calibri",
        color: "#FFF980",
      })
      .setDepth(1)
      .setOrigin(0.5, 0);

    this.GOBtnRectangle = gameScene.add
      .rectangle(XMiddle, this.GOMenu.y + 320, 400, 80, 16775552, 0.8)
      .setDepth(1)
      .setOrigin(0.5, 0);
    this.GOBtnRectangle.setInteractive({ useHandCursor: true });

    this.GOBtnText = gameScene.add
      .text(XMiddle, this.GOMenu.y + 330, "RESTART", {
        font: "bold 53px Calibri",
        color: "#ac2400",
      })
      .setDepth(1)
      .setOrigin(0.5, 0);

    this.GOText = gameScene.add
      .text(XMiddle, this.GOMenu.y + 200, `Score: ${this.score}`, {
        font: "bold 53px Calibri",
        color: "#FFF980",
      })
      .setDepth(1)
      .setOrigin(0.5, 0);

    window.highscores.setScore(this.score);

    this.GOBtnRectangle.on("pointerup", () => {
      this.GOBtnRectangle && this.GOBtnRectangle.destroy();
      this.GOBtnText && this.GOBtnText.destroy();
      this.GOMenu && this.GOMenu.destroy();
      this.GOText && this.GOText.destroy();
      this.GOHeader && this.GOHeader.destroy();
      this.reset();
    });
  }

  private matchIt = async (pieces: Piece[]): Promise<null> => {
    this.playExplodingBubbleSound();
    await makeScaleAnimation(pieces);
    pieces.forEach((piece) => piece.destroy());
    this.scoreAndLevelUp(pieces);
    this.fallPieces(pieces);
    this.generateMore();
    await timeout(300);
    return null;
  };

  private async fallPieces(piecesThatMatch: Piece[]) {
    let newPiecesThatMatch = piecesThatMatch.map((piece) => piece.currentTile);
    let currentMatchArr;

    newPiecesThatMatch.sort((a, b) => a.tileY - b.tileY);
    do {
      currentMatchArr = [];
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      newPiecesThatMatch.forEach(async ({ tileX, tileY }) => {
        let contador = 0;
        const currentMap = map.getCurrentMap();

        if (isNumberInsideBoard(tileY - contador)) {
          do contador++;
          while (
            isNumberInsideBoard(tileY - contador) &&
            !currentMap[tileX][tileY - contador]
          );

          const pieceToReplace = currentMap[tileX][tileY - contador];
          if (pieceToReplace) {
            pieceToReplace.updatePiecePositionAndTile({ tileX, tileY });
            makeMovementAnimation(
              pieceToReplace,
              convertTileToPosition({ tileX, tileY }),
              200,
            );

            map.setPieceOnTile(null as unknown as Piece, {
              tileX,
              tileY: (tileY - contador) as TileNumbers,
            });
            currentMatchArr.push({
              tileX,
              tileY: (tileY - contador) as TileNumbers,
            });
          }
        }
        newPiecesThatMatch = currentMatchArr.sort((a, b) => a.tileY - b.tileY);
      });
    } while (currentMatchArr.length > 0);
  }

  private async generateMore() {
    const currentMap = map.getCurrentMap();
    const emptyTiles: PositionInTile[] = [];
    currentMap.forEach((line, tileX) =>
      line.forEach((piece, tileY) => {
        if (!piece || !piece.active) {
          const newX = tileX as unknown as TileNumbers;
          const newY = tileY as unknown as TileNumbers;
          emptyTiles.push({ tileX: newX, tileY: newY });
        }
      }),
    );

    emptyTiles.sort((a, b) => b.tileY - a.tileY);

    let contador = 1;
    let xValue: number;
    emptyTiles.forEach((tilePosition: PositionInTile) => {
      const pieceTypeLetter = getRandomValueFromArray(PIECE_TYPES);
      const newTilePosition = convertTileToPosition(tilePosition);
      if (xValue !== tilePosition.tileX) contador = 1;
      else contador++;

      xValue = tilePosition.tileX;
      const yPositon = INITIAL_BOARD_SCREEN.HEIGHT - TILE.HEIGHT * contador;
      const newPosition = { x: newTilePosition.x, y: yPositon };
      const piece = new Piece(pieceTypeLetter, newPosition);

      piece.updatePiecePositionAndTile(tilePosition);
      makeMovementAnimation(piece, convertTileToPosition(tilePosition), 200);
    });
  }

  private async checkMatches() {
    const mapExist = window.localStorage.getItem("dejeweled-map") !== null;
    if (mapExist) {
      let resultForGameOver = map.isBoardMatch(map.getCurrentMap());

      const resultForFutureMoves = map.isExistantFutureMoves(
        map.getCurrentMap(),
      );
      if (!resultForGameOver.isMatch && !resultForFutureMoves) this.reset();

      if (resultForGameOver.isMatch) {
        do {
          await this.matchAgain(resultForGameOver.piece);
          resultForGameOver = map.isBoardMatch(map.getCurrentMap());
        } while (resultForGameOver.isMatch);

        if (!map.isExistantFutureMoves(map.getCurrentMap())) this.reset();
      }
    }
  }
}
