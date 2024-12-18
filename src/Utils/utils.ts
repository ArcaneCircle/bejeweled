import type {
  PositionInPixel,
  PositionInTile,
  TileNumbers,
} from "../game.interfaces";
import { PIECE_TYPES } from "../game.interfaces";
import type Piece from "../Game/Piece";
import { gameScene } from "../Scenes/GameScene";
import { INITIAL_BOARD_SCREEN, MAP, TILE } from "./gameValues";

export function getRandomValueFromArray(arr: any[]): string {
  const rndNum = rndNumber(0, arr.length - 1, true);
  return arr[rndNum];
}
export function rndNumber(min: number, max: number, round = false): number {
  if (round) return Math.round(Math.random() * (max - min) + min);
  return Math.random() * (max - min) + min;
}
export function convertPositionToTile(
  positionInPixel: PositionInPixel,
): PositionInTile {
  const tileX = ((positionInPixel.x - INITIAL_BOARD_SCREEN.WIDTH) /
    TILE.WIDTH) as TileNumbers;
  const tileY = ((positionInPixel.y - INITIAL_BOARD_SCREEN.HEIGHT) /
    TILE.HEIGHT) as TileNumbers;
  return { tileX, tileY };
}
export function convertTileToPosition(
  positionInTile: PositionInTile,
): PositionInPixel {
  const x = positionInTile.tileX * TILE.WIDTH + INITIAL_BOARD_SCREEN.WIDTH;
  const y = positionInTile.tileY * TILE.HEIGHT + INITIAL_BOARD_SCREEN.HEIGHT;
  return { x, y };
}
export function getPieceHashColor(piece: Piece): string | null {
  switch (piece.pieceTypeByLetter) {
    case "w":
      return "#cdeff6";
    case "r":
      return "#ff0016";
    case "y":
      return "#fff03d";
    case "g":
      return "#00e433";
    case "o":
      return "#ff471c";
    case "b":
      return "#0060e4";
    case "p":
      return "#e101cd";
    default:
      return null;
  }
}
export function getPieceTypeEnum(type: string): PIECE_TYPES | null {
  switch (type) {
    case "w":
      return PIECE_TYPES.WHITE;
    case "r":
      return PIECE_TYPES.RED;
    case "y":
      return PIECE_TYPES.YELLOW;
    case "g":
      return PIECE_TYPES.GREEN;
    case "o":
      return PIECE_TYPES.ORANGE;
    case "b":
      return PIECE_TYPES.BLUE;
    case "p":
      return PIECE_TYPES.PURPLE;
    default:
      return null;
  }
}
export function getPieceTypeNumber(type: string): number | null {
  switch (type) {
    case "w":
      return 0;
    case "r":
      return 1;
    case "y":
      return 2;
    case "g":
      return 3;
    case "o":
      return 4;
    case "b":
      return 5;
    case "p":
      return 6;
    default:
      return null;
  }
}
export const makeMovementAnimation = (target, { x, y }, duration) =>
  new Promise<void>((resolve) => {
    gameScene.tweens.add({
      targets: target,
      x,
      y,
      ease: "Linear",
      duration,
      repeat: 0,
      onComplete() {
        resolve();
      },
    });
  });
export const makeScaleAnimation = (pieces: Piece[]) =>
  new Promise<void>((resolve) => {
    gameScene.tweens.add({
      targets: pieces,
      scaleX: 0,
      scaleY: 0,
      ease: "Linear",
      duration: 300,
      yoyo: false,
      repeat: 0,
      onComplete() {
        resolve();
      },
    });
  });
export const removeDuplicates = (pieces: Piece[]): Piece[] => {
  pieces.forEach((mainPiece, mainIndex) => {
    pieces.forEach((piece, index) => {
      if (
        mainIndex !== index &&
        mainPiece.currentTile.tileX === piece.currentTile.tileX &&
        mainPiece.currentTile.tileY === piece.currentTile.tileY
      )
        pieces.splice(index, 1);
    });
  });
  return pieces;
};

export const isNumberInsideBoard = (currentNumb: number): boolean => {
  if (currentNumb >= MAP.TOTAL_TILES_WIDTH || currentNumb < 0) return false;
  return true;
};

export const timeout = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

/**
 * Given an array of pieces, it returns what kind of score was achieved
 * @param {Piece[]} pieces matched pieces
 * @returns type of score in the form "line" or "other"
 */
export const recognizeScoreType = (pieces: Piece[]): string => {
  let xCounter = 1;
  let yCounter = 1;
  let currentX = pieces[0].currentTile.tileX;
  let currentY = pieces[0].currentTile.tileY;
  pieces.forEach(({ currentTile }) => {
    if (currentTile.tileX !== currentX) {
      xCounter += 1;
      currentX = currentTile.tileX;
    }
    if (currentTile.tileY !== currentY) {
      yCounter += 1;
      currentY = currentTile.tileY;
    }
  });

  let scoreType = "";
  if (xCounter !== 1 && yCounter !== 1) scoreType = "other";
  else scoreType = "line";

  return scoreType;
};

export const getPieceTypeList = (map: Piece[][]) => {
  const arr = [[]] as unknown as string[][];
  for (let i = 0; i < MAP.TOTAL_TILES_WIDTH; i++) {
    arr[i] = [];
    for (let j = 0; j < MAP.TOTAL_TILES_HEIGHT; j++)
      arr[i][j] = map[i][j].pieceTypeByLetter;
  }
  return arr;
};

export const getScoreboardArray = () => {
  const scores = window.highscores.getHighScores();
  const posArr = scores.slice(0, 10).map((p) => p.pos);
  const nameArr = scores.slice(0, 10).map((p) => p.name.slice(0, 25));
  const scoreArr = scores.slice(0, 10).map((p) => p.score.toString());
  return { posArr, nameArr, scoreArr };
};
