/* eslint-disable no-console */
import 'phaser'
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin.js'
import Bejeweled from 'phaser3-rex-plugins/templates/bejeweled/Bejeweled.js'

class Demo extends Phaser.Scene {
  rexBoard!: BoardPlugin
  constructor() {
    super({
      key: 'examples',
    })
  }

  preload() { }

  create() {
    const bejeweled = new Bejeweled(this, {
      // debug: true, // Show state changed log
      //   input: false,
      board: {
        grid: {
          gridType: 'quadGrid',
          x: 30,
          y: 30 - 480,
          cellWidth: 60,
          cellHeight: 60,
          type: 'orthogonal',
        },
        width: 8,
        height: 16, // Prepared rows: upper 8 rows
      },
      match: {
        // wildcard: undefined
        // dirMask: undefined
      },
      chess: {
        // pick random symbol from array, or a callback to return symbol
        symbols: [0, 1, 2, 3, 4, 5, 6],
        // symbols: function(board, tileX, tileY, excluded) { return symbol; }

        // User-defined chess game object
        create(board: BoardPlugin.Board) {
          const scene = board.scene as Demo
          const gameObject = scene.rexBoard.add.shape(board, 0, 0, 0, 0x0, 1, false)
            .setScale(0.95)
            // Initial 'symbol' value
            .setData('symbol', undefined)
          // Symbol is stored in gameObject's data manager (`gameObject.getData('symbol')`)
          // Add data changed event to change the appearance of game object via new symbol value
          gameObject.on('changedata-symbol', (gameObject: BoardPlugin.Shape, value: number, _previousValue: number) => {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            gameObject.setFillStyle(GetColor(value))
          })
          return gameObject
        },

        // scope for callbacks
        scope: undefined,

        // moveTo behavior
        moveTo: {
          speed: 400,
        },
        // tileZ: 1,
      },
    })
      .on('match', (
        lines: Phaser.Structs.Set<BoardPlugin.Shape>[],
        board: BoardPlugin.Board,
        _bejeweled: Bejeweled,
      ) => {
        // get Game object/tile position of matched lines
        for (let i = 0, icnt = lines.length; i < icnt; i++) {
          const line = lines[i]
          const s = [`Get matched ${line.size}`]
          const chessArray = line.entries
          for (let j = 0, jcnt = chessArray.length; j < jcnt; j++) {
            const gameObject = chessArray[j]
            const tileXYZ = board.chessToTileXYZ(gameObject)
            if (tileXYZ)
              s.push(`(${tileXYZ.x},${tileXYZ.y})`)
          }
          console.log(s.join(' '))
        }
      })
      .on('eliminate', (
        chessArray: BoardPlugin.Shape[],
        board: BoardPlugin.Board,
        bejeweled: Bejeweled,
      ) => {
        bejeweled.incData('scores', chessArray.length * chessArray.length)
      })
      .setData('scores', 0)

    // Monitor 'scores' variable
    const txtScore = this.add.text(
      480, 30,
      bejeweled.getData('scores'),
      { fontSize: '24px', color: '#fff' },
    )
    bejeweled.on(
      'changedata-scores',
      (bejeweled: Bejeweled, value: any, _previousValue: any) => {
        txtScore.setText(value)
      },
    )

    // bejeweled.on('match-end', (board: BoardPlugin.Board, bejeweled: Bejeweled) => {
    //   bejeweled.setInputEnable(false)
    //   console.log('game ended')
    // },
    // )

    bejeweled.start()
  }

  update() { }
}

const colorArray = Phaser.Display.Color.HSVColorWheel(0.5, 1)

const GetColor = function (symbol: number) {
  // symbols: [0, 1, 2, 3, 4, 5]
  return (colorArray[symbol * 55] as any).color
}

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 540,
  height: 480,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: Demo,
  plugins: {
    scene: [{
      key: 'rexBoard',
      plugin: BoardPlugin,
      mapping: 'rexBoard',
    }],
  },
}

export const game = new Phaser.Game(config)
