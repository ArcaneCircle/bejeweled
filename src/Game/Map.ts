/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable import/no-mutable-exports */
import type { PositionInTile, TileNumbers } from "../game.interfaces";
import {
  INITIAL_BOARD_SCREEN,
  MAP,
  PIECE_TYPES,
  TILE,
} from "../Utils/gameValues";
import {
  convertTileToPosition,
  getRandomValueFromArray,
  isNumberInsideBoard,
  removeDuplicates,
} from "../Utils/utils";
import { gameManager } from "./GameManager";
import Piece from "./Piece";
// eslint-disable-next-line import/prefer-default-export
export let map: Map;

export default class Map {
  private currentMap: Piece[][] = [[]];

  constructor() {
    map = this;
    this.start();
  }

  start() {
    this.createRealMap();
    // this.createFakeMap()
  }

  public resetMap() {
    this.currentMap.forEach((line) =>
      line.forEach((piece) => {
        piece.destroy();
        this.currentMap = [];
      }),
    );
    this.start();
  }

  createRealMap() {
    let tempMap: Piece[][] = [];
    let mapExist = window.localStorage.getItem("dejeweled-map") !== null;
    do {
      if (tempMap) this.clearMap(tempMap);
      tempMap = this.generateMap();
      mapExist = window.localStorage.getItem("dejeweled-map") !== null;
    } while (this.isBoardMatch(tempMap).isMatch === true && !mapExist);
    this.currentMap = tempMap;
  }

  createFakeMap() {
    const newFakeMap: Piece[][] = [];
    const fakeMap = [
      // No match
      ["g", "y", "b", "r", "y", "w", "b", "p"],
      ["w", "w", "y", "y", "g", "y", "w", "w"],
      ["w", "g", "r", "y", "g", "w", "p", "p"],
      ["r", "w", "b", "w", "r", "w", "r", "b"],
      ["w", "w", "y", "r", "w", "b", "w", "b"],
      ["w", "y", "b", "y", "w", "p", "g", "r"],
      ["p", "w", "y", "p", "g", "p", "g", "y"],
      ["w", "b", "b", "w", "y", "w", "p", "y"],
    ];

    fakeMap.forEach((line, i) =>
      line.forEach((piece, j) => {
        if (!newFakeMap[i] || newFakeMap[i].length === 0) newFakeMap[i] = [];
        newFakeMap[i].push(
          new Piece(
            piece,
            convertTileToPosition({
              tileX: i as TileNumbers,
              tileY: j as TileNumbers,
            }),
          ),
        );
      }),
    );
    this.currentMap = newFakeMap;
  }

  private clearMap(tempMap: Piece[][]) {
    tempMap.forEach((line: Piece[]) =>
      line.forEach((piece: Piece) => piece.destroy()),
    );
  }

  generateMap(): Piece[][] {
    const tempMap: Piece[][] = [[]];
    const mapExist = window.localStorage.getItem("dejeweled-map") !== null;
    const savedTypes = JSON.parse(
      window.localStorage.getItem("dejeweled-map") as string,
    );
    for (let i = 0; i < MAP.TOTAL_TILES_WIDTH; i++) {
      tempMap[i] = [];
      for (let j = 0; j < MAP.TOTAL_TILES_HEIGHT; j++) {
        const x = INITIAL_BOARD_SCREEN.WIDTH + i * TILE.WIDTH;
        const y = INITIAL_BOARD_SCREEN.HEIGHT + j * TILE.HEIGHT;
        const pieceTypeLetter = mapExist
          ? savedTypes[i][j]
          : getRandomValueFromArray(PIECE_TYPES);
        const piece = new Piece(pieceTypeLetter, { x, y });
        tempMap[i][j] = piece;
      }
    }
    return tempMap;
  }

  public getCurrentMap() {
    return this.currentMap;
  }

  public setCurrentMap(currentMap: Piece[][]) {
    this.currentMap = currentMap;
  }

  public getPieceOnTile(tilePos: PositionInTile): Piece {
    return this.currentMap[tilePos.tileX][tilePos.tileY];
  }

  setPieceOnTile = (newPiece: Piece, tile: PositionInTile) => {
    this.currentMap[tile.tileX][tile.tileY] = newPiece;
  };

  public isPieceAdjacent(selectedPiece: Piece): boolean {
    const { currentTile } = gameManager.currentPiece;
    const selectedTile = selectedPiece.currentTile;
    if (selectedTile.tileX === currentTile.tileX) {
      // vertical
      if (
        selectedTile.tileY === currentTile.tileY - 1 ||
        selectedTile.tileY === currentTile.tileY + 1
      )
        return true;
    } else if (selectedTile.tileY === currentTile.tileY) {
      // horizontal
      if (
        selectedTile.tileX === currentTile.tileX - 1 ||
        selectedTile.tileX === currentTile.tileX + 1
      )
        return true;
    }
    return false;
  }

  public isBoardMatch(tempMap: Piece[][]): { isMatch: boolean; piece: Piece } {
    const result = {
      isMatch: false,
      piece: null as unknown as Piece,
    };
    // eslint-disable-next-line no-restricted-syntax
    for (const x of tempMap) {
      const found = x.find(
        (piece: Piece) =>
          this.checkMatch(tempMap, piece).matchArrOfPieces.length >= 3,
      );
      if (found && found.active === true) {
        result.isMatch = true;
        result.piece = found;
      }
    }

    return result;
  }

  public isExistantFutureMoves(tempMap: Piece[][]): boolean {
    for (let i = 0; i < tempMap.length; i++) {
      for (let j = 0; j < tempMap[i].length; j++) {
        if (map.calculatEachFourMoves(i, j)) return true;
      }
    }
    return false;
  }

  private calculatEachFourMoves(mTileX, mTileY) {
    const arr = [1, -1, 1, -1];
    for (let i = 0; i < 4; i++) {
      const possibleMap: Piece[][] = [];
      this.getCurrentMap().forEach((line, indexX) =>
        line.forEach((piece) => {
          if (!possibleMap[indexX]) possibleMap[indexX] = [];
          possibleMap[indexX].push(piece);
        }),
      );
      const piece = Object.assign({}, possibleMap[mTileX][mTileY]);

      const tileX = (
        i >= 2 ? piece.currentTile.tileX + arr[i] : piece.currentTile.tileX
      ) as TileNumbers;
      const tileY = (
        i >= 2 ? piece.currentTile.tileY : piece.currentTile.tileY + arr[i]
      ) as TileNumbers;
      if (isNumberInsideBoard(i >= 2 ? tileX : tileY)) {
        const futurePiece = Object.assign({}, possibleMap[tileX][tileY]);
        const currentPiece = Object.assign({}, piece);

        possibleMap[tileX][tileY] = currentPiece;
        possibleMap[tileX][tileY].currentTile = { tileX, tileY };

        possibleMap[piece.currentTile.tileX][piece.currentTile.tileY] =
          futurePiece;
        possibleMap[piece.currentTile.tileX][
          piece.currentTile.tileY
        ].currentTile = {
          tileX: piece.currentTile.tileX,
          tileY: piece.currentTile.tileY,
        };

        const currentSituation = map.checkMatch(
          possibleMap,
          possibleMap[tileX][tileY],
        );
        if (currentSituation.matchArrOfPieces.length >= 3) return true;
      }
    }
    return false;
  }

  /**
   * Check if there's a match for the current piece
   * and returns an array with pieces to remove
   * @param {Piece[][]} map Tablero actual
   * @param {Piece} piece Primera pieza
   * @returns \{ matchArrOfPieces }
   */
  public checkMatch(
    map: Piece[][],
    piece: Piece,
  ): { matchArrOfPieces: Piece[] } {
    const { pieceTypeByLetter } = piece;
    const arr = [1, -1, 1, -1];
    let arrOfPiecesToMatch: Piece[] = [piece]; // First Piece
    let direction: "horizontal" | "vertical" = "horizontal";
    let matchArrOfPieces: Piece[] = [];

    // check every direction
    for (let i = 0; i < 4; i++) {
      // set coordinates
      let tileX = piece.currentTile.tileX + arr[i];
      let { tileY } = piece.currentTile;
      if (i >= 2) {
        // change direction and coordinates
        if (i === 2) arrOfPiecesToMatch = [piece];
        direction = "vertical";
        tileX = piece.currentTile.tileX;
        tileY = (piece.currentTile.tileY + arr[i]) as TileNumbers;
      }

      if (isNumberInsideBoard(i >= 2 ? tileY : tileX)) {
        // select new piece
        const pieceSelected = map[tileX][tileY];

        if (
          pieceSelected &&
          pieceSelected.pieceTypeByLetter === pieceTypeByLetter
        ) {
          arrOfPiecesToMatch.push(pieceSelected); // Second Piece

          const obj = this.checkAdjacentForMatch(
            map,
            pieceSelected,
            piece,
            arrOfPiecesToMatch,
            arr[i],
            direction,
          ); // Third and more Pieces
          if (obj.matchArrOfPieces.length >= 3) {
            // add the new matches
            matchArrOfPieces = matchArrOfPieces.concat(obj.matchArrOfPieces);
            // search for ortogonal matches

            for (let i = 0; i < obj.matchArrOfPieces.length; i++) {
              const ortogonalMatches = this.checkOrtogonalPieces(
                map,
                obj.matchArrOfPieces[i],
                direction,
              );
              matchArrOfPieces.push(...ortogonalMatches);
            }
          }
        }
      }
    }

    matchArrOfPieces = removeDuplicates(matchArrOfPieces);

    return { matchArrOfPieces };
  }

  private checkOrtogonalPieces(
    map: Piece[][],
    piece: Piece,
    direction: "horizontal" | "vertical",
  ) {
    const additionalMatches = [] as Piece[];
    const side1X =
      direction === "horizontal"
        ? piece.currentTile.tileX
        : ((piece.currentTile.tileX - 1) as TileNumbers);
    const side2X =
      direction === "horizontal"
        ? piece.currentTile.tileX
        : ((piece.currentTile.tileX + 1) as TileNumbers);
    const side1Y =
      direction === "horizontal"
        ? ((piece.currentTile.tileY - 1) as TileNumbers)
        : piece.currentTile.tileY;
    const side2Y =
      direction === "horizontal"
        ? ((piece.currentTile.tileY + 1) as TileNumbers)
        : piece.currentTile.tileY;

    if (
      isNumberInsideBoard(side1X) &&
      isNumberInsideBoard(side1Y) &&
      isNumberInsideBoard(side2X) &&
      isNumberInsideBoard(side2Y) &&
      map[side1X][side1Y].pieceTypeByLetter === piece.pieceTypeByLetter &&
      piece.pieceTypeByLetter === map[side2X][side2Y].pieceTypeByLetter
    ) {
      // son del mismo tipo y están en el tablero
      additionalMatches.push(map[side1X][side1Y], piece, map[side2X][side2Y]);
    }

    if (
      isNumberInsideBoard(side1X) &&
      isNumberInsideBoard(side1Y) &&
      map[side1X][side1Y].pieceTypeByLetter === piece.pieceTypeByLetter
    ) {
      // possible match to this side
      const yetAnotherMatches = this.checkExtended(
        side1X,
        side1Y,
        map,
        piece,
        direction,
      );
      additionalMatches.push(...yetAnotherMatches);
    } else if (
      isNumberInsideBoard(side2X) &&
      isNumberInsideBoard(side2Y) &&
      map[side2X][side2Y].pieceTypeByLetter === piece.pieceTypeByLetter
    ) {
      // possible match to this other side
      const yetAnotherMatches = this.checkExtended(
        side1X,
        side1Y,
        map,
        piece,
        direction,
      );
      additionalMatches.push(...yetAnotherMatches);
    }
    return removeDuplicates(additionalMatches);
  }

  private checkExtended(
    x: TileNumbers,
    y: TileNumbers,
    map: Piece[][],
    piece: Piece,
    direction: "horizontal" | "vertical",
  ) {
    const directionArr = [1, -1];
    let additionalMatches = [] as Piece[];
    let tempMatches = [] as Piece[];
    for (let i = 0; i < 2; i++) {
      let extendedIndex =
        direction === "horizontal" ? y + directionArr[i] : x + directionArr[i];
      while (
        isNumberInsideBoard(extendedIndex) &&
        map[direction === "horizontal" ? x : extendedIndex][
          direction === "horizontal" ? extendedIndex : y
        ].pieceTypeByLetter === piece.pieceTypeByLetter &&
        map?.[x]?.[y] &&
        map[x][y].pieceTypeByLetter === piece.pieceTypeByLetter
      ) {
        tempMatches.push(
          map[direction === "horizontal" ? x : extendedIndex][
            direction === "horizontal" ? extendedIndex : y
          ],
          piece,
          map[x][y],
        );

        i === 0 ? extendedIndex++ : extendedIndex--;
      }
    }
    tempMatches = removeDuplicates(tempMatches);
    if (tempMatches.length > 2) additionalMatches = tempMatches;
    return additionalMatches;
  }

  private checkAdjacentForMatch(
    map: Piece[][],
    pieceSelected: Piece,
    piece: Piece,
    arrOfPiecesToMatch: Piece[],
    currentValueSide: number,
    direction: "horizontal" | "vertical",
  ): { matchArrOfPieces: Piece[]; finalMap: Piece[][] } {
    const { pieceTypeByLetter } = piece;
    let nextMatch = currentValueSide < 0 ? -1 : 1;
    let tileX =
      direction === "horizontal"
        ? piece.currentTile.tileX + nextMatch * 2
        : piece.currentTile.tileX;
    let tileY =
      direction === "horizontal"
        ? piece.currentTile.tileY
        : piece.currentTile.tileY + nextMatch * 2;

    if (isNumberInsideBoard(tileX) && isNumberInsideBoard(tileY)) {
      pieceSelected = map[tileX][tileY];
      while (
        pieceSelected &&
        pieceSelected.pieceTypeByLetter === pieceTypeByLetter
      ) {
        nextMatch += currentValueSide < 0 ? -1 : 1;
        arrOfPiecesToMatch.push(pieceSelected);
        tileX =
          direction === "horizontal"
            ? piece.currentTile.tileX + (currentValueSide + nextMatch)
            : piece.currentTile.tileX;
        tileY =
          direction === "horizontal"
            ? piece.currentTile.tileY
            : piece.currentTile.tileY + (currentValueSide + nextMatch);
        if (!isNumberInsideBoard(tileX) || !isNumberInsideBoard(tileY)) break;

        pieceSelected = map[tileX][tileY];
      }
    }

    return {
      matchArrOfPieces: arrOfPiecesToMatch,
      finalMap: map,
    };
  }
}
