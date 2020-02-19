import ansiEscapes from 'ansi-escapes'
import ansiStyles from 'ansi-styles'
import { IPosition, IPixel } from './engine'
import { IRenderer } from './visual'

export class DoubleArray<T> {
  private ary: T[][] = []
  private maxX = 0
  private maxY = 0

  clear () {
    this.ary = []
  }

  set (pos: IPosition, v: T) {
    let row = this.ary[pos.y]
    if (!row) {
      row = []
      this.ary[pos.y] = row
    }
    row[pos.x] = v

    this.maxY = Math.max(this.maxY, pos.y)
    this.maxX = Math.max(this.maxX, pos.x)
  }

  get (pos: IPosition, def: T): T {
    if (!this.ary[pos.y]) { return def }
    return this.ary[pos.y][pos.x] || def
  }

  dim () {
    return {
      width: this.maxX + 1,
      height: this.maxY + 1
    }
  }

  asArray () {
    return this.ary
  }
}

const BLACK = '#000000'
const WHITE = '#ffffff'

export class DoubleTerminalRenderer implements IRenderer {
  private readonly pixelsOnScreen = new DoubleArray<IPixel>()
  private readonly pixelsToDraw = new DoubleArray<IPixel>()

  drawStart () {
    this.pixelsToDraw.clear()
  }

  drawEnd () {
    const { width, height } = this.pixelsToDraw.dim()

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pos = { x, y }
        const toDraw = this.pixelsToDraw.get(pos, BLACK)
        if (this.pixelsOnScreen.get(pos, null) !== toDraw) {
          this._drawSinglePixel(pos, toDraw)
        }
      }
    }
  }

  private _drawSinglePixel (pos: IPosition, hex: string) {
    const { columns, rows } = getTerminalSize()

    // do not draw past the terminal
    if (pos.x * 2 + 1 >= columns || pos.y >= rows) { return } // +1 is just-in-case

    process.stdout.write(
      setMoveTo(pos.x * 2, pos.y) +
      setBgColor(hex) +
      '  ' +
      setMoveTo(1, 1) +
      setBgColor(BLACK) // reset back to black
    )
    this.pixelsOnScreen.set(pos, hex)
  }

  drawPixel (pos: IPosition, hex: string) {
    if (pos.x < 0 || pos.y < 0) { throw new Error(`BUG: Tried to draw outside of the camera range ${JSON.stringify(pos)}`) }
    this.pixelsToDraw.set(pos, hex)
  }
}

export class TerminalRenderer implements IRenderer {
  private readonly pixelsOnScreen = new DoubleArray<IPixel>()
  private readonly pixelsToDraw = new DoubleArray<IPixel>()

  drawStart () {
    this.pixelsToDraw.clear()
  }

  drawEnd () {
    const { width, height } = this.pixelsToDraw.dim()

    for (let yDouble = 0; yDouble < height; yDouble += 2) {
      const acc: string[] = []
      for (let x = 0; x < width; x++) {
        const topPos = { x, y: yDouble }
        const bottomPos = { x, y: yDouble + 1 }
        const topDraw = this.pixelsToDraw.get(topPos, BLACK)
        const bottomDraw = this.pixelsToDraw.get(bottomPos, BLACK)
        if (this.pixelsOnScreen.get(topPos, BLACK) !== topDraw || this.pixelsOnScreen.get(bottomPos, BLACK) !== bottomDraw) {
          this._drawTopBottomPixel({ x, y: yDouble / 2 }, topDraw, bottomDraw, acc)
        }
      }
      // flush a row of updates
      if (acc.length > 0) {
        acc.push(setMoveTo(1, getTerminalSize().rows - 1))
        acc.push(setFgColor(WHITE))
        acc.push(setBgColor(BLACK))

        process.stdout.write(acc.join(''))
      }
    }
  }

  private _drawTopBottomPixel (pos: IPosition, topHex: string, bottomHex: string, acc: string[]) {
    const { columns, rows } = getTerminalSize()

    // do not draw past the terminal
    if (pos.x >= columns || pos.y >= rows * 2) { return }

    acc.push(setMoveTo(pos.x, pos.y))
    acc.push(setFgColor(bottomHex))
    acc.push(setBgColor(topHex))
    acc.push('▄')

    this.pixelsOnScreen.set({ x: pos.x, y: pos.y * 2 }, topHex)
    this.pixelsOnScreen.set({ x: pos.x, y: pos.y * 2 + 1 }, bottomHex)
  }

  drawPixel (pos: IPosition, hex: string) {
    if (pos.x < 0 || pos.y < 0) { throw new Error(`BUG: Tried to draw outside of the camera range ${JSON.stringify(pos)}`) }
    this.pixelsToDraw.set(pos, hex)
  }
}

// TypeScript does not like that columns and rows might be null
function getTerminalSize () {
  return {
    columns: process.stdout.columns || 80,
    rows: process.stdout.rows || 25
  }
}

// Determine if this
// 'truecolor' if this terminal supports 16m colors. 256 colors otherwise
const supports16mColors = process.env.COLORTERM === 'truecolor'

function setBgColor (hex: string) {
  if (supports16mColors) {
    return ansiStyles.bgColor.ansi16m.hex(hex)
  } else {
    // console.log(ansiStyles)
    return ansiStyles.bgColor.ansi256.hex(hex)
  }
}

function setFgColor (hex: string) {
  if (supports16mColors) {
    return ansiStyles.color.ansi16m.hex(hex)
  } else {
    return ansiStyles.color.ansi256.hex(hex)
  }
}
export function setMoveTo (x: number, y: number) {
  return ansiEscapes.cursorTo(x, y)
}
// function writeBgColor (hex: string) {
//   process.stdout.write(setBgColor(hex))
// }
// function writeFgColor (hex: string) {
//   process.stdout.write(setFgColor(hex))
// }
// function setShowCursor () {
//   return ansiEscapes.cursorShow
// }
// function clearScreen () {
//   process.stdout.write(ansiEscapes.clearScreen)
// }
