import ansiEscapes from 'ansi-escapes'
import ansiStyles from 'ansi-styles'
import { IPosition, IGamepad, IRenderer, IPixel } from './engine'

// Prepare the keyboard handler
if (process.stdin.setRawMode) {
  process.stdin.setRawMode(true)
} else {
  throw new Error(`ERROR: stdin does not allow setting setRawMode (we need that for keyboard input`)
}
process.stdin.resume()
process.stdin.setEncoding('utf8')





const KEY_REPEAT_WITHIN = 50

export class KeyboardGamepad implements IGamepad {
  private lastSaw = Date.now()
  private isSubscribedToDpad = false
  private zeroToFour: number | undefined = undefined

  reset() {
    this.zeroToFour = undefined
  }
  dpadDir() {
    if (!this.isSubscribedToDpad) { throw new Error(`ERROR: remember to call controller.listenToDpad() during loading if your game requires it`)}
    if (this.zeroToFour === undefined) { throw new Error(`ERROR: Check that one of the dpad directions was pressed`)}
    return this.zeroToFour
  }

  isDpadPressed() {
    if (!this.isSubscribedToDpad) { throw new Error(`ERROR: remember to call controller.listenToDpad() during loading if your game requires it`)}
    // Node only receives key press events. If we have not seen a key press event recently then they are no longer pressing
    if (this.lastSaw + KEY_REPEAT_WITHIN < Date.now()) {
      return false
    }
    return this.zeroToFour !== undefined
  }

  listenToDpad() {
    this.isSubscribedToDpad = true

    // Prepare the keyboard handler
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true)
    } else {
        throw new Error(`ERROR: stdin does not allow setting setRawMode (we need that for keyboard input`)
    }
    process.stdin.resume()
    process.stdin.setEncoding('utf8')

    // https://stackoverflow.com/a/30687420
    process.stdin.on('data', async (key: string) => {
        this.lastSaw = Date.now()
        switch (key) {
            case 'W':
            case 'w':
            case '\u001B\u005B\u0041': // UP-ARROW
                this.zeroToFour = 1; break
            case 'S':
            case 's':
            case '\u001B\u005B\u0042': // DOWN-ARROW
                this.zeroToFour = 3; break
            case 'A':
            case 'a':
            case '\u001B\u005B\u0044': // LEFT-ARROW
                this.zeroToFour = 2; break
            case 'D':
            case 'd':
            case '\u001B\u005B\u0043': // RIGHT-ARROW
                this.zeroToFour = 0; break
            // case 'X':
            // case 'x':
            // case ' ':
            // case '\u000D':
            //     this.actionKey = true; break
            case '\u0003': // Ctrl+C
            case '\u001B': // Escape
                return process.exit(1)
            default:
                this.zeroToFour = undefined
                console.log(`Did not understand key pressed: "${key}"`)
        }
    })
  }
}







class DoubleArray<T> {
  private ary: T[][] = []
  private maxX = 0
  private maxY = 0

  clear() {
    this.ary = []
  }
  set(pos: IPosition, v: T) {
    if (!this.ary[pos.y]) { this.ary[pos.y] = [] }
    this.ary[pos.y][pos.x] = v

    this.maxY = Math.max(this.maxY, pos.y)
    this.maxX = Math.max(this.maxX, pos.x)
  }

  get(pos: IPosition, def: T): T {
    if (!this.ary[pos.y]) { return def }
    return this.ary[pos.y][pos.x] || def
  }

  dim() {
    return {
      width: this.maxX + 1,
      height: this.maxY + 1
    }
  }
}

const BLACK = '#000000'
const WHITE = '#ffffff'

export class DoubleTerminalRenderer implements IRenderer {
  private pixelsOnScreen = new DoubleArray<IPixel>()
  private pixelsToDraw = new DoubleArray<IPixel>()

  drawStart() {
    this.pixelsToDraw.clear()
  }

  drawEnd() {
    const {width, height} = this.pixelsToDraw.dim()

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pos = {x, y}
        const toDraw = this.pixelsToDraw.get(pos, BLACK)
        if (this.pixelsOnScreen.get(pos, BLACK) !== toDraw) {
          this._drawSinglePixel(pos, toDraw)
        }
      }
    }
    
  }

  private _drawSinglePixel(pos: IPosition, hex: string) {
    const {columns, rows} = getTerminalSize()

    // do not draw past the terminal
    if (pos.x * 2 + 1 >= columns || pos.y >= rows) { return }  // +1 is just-in-case

    process.stdout.write(
      setMoveTo(pos.x * 2, pos.y) +
      setBgColor(hex) +
      '  ' +
      setBgColor(BLACK) // reset back to black
    )
    this.pixelsOnScreen.set(pos, hex)
  }

  drawPixel(pos: IPosition, hex: string) {
    if (pos.x < 0 || pos.y < 0) { throw new Error(`BUG: Tried to draw outside of the camera range ${JSON.stringify(pos)}`)}
    this.pixelsToDraw.set(pos, hex)
  }
}

export class TerminalRenderer implements IRenderer {
  private pixelsOnScreen = new DoubleArray<IPixel>()
  private pixelsToDraw = new DoubleArray<IPixel>()

  drawStart() {
    this.pixelsToDraw.clear()
  }

  drawEnd() {
    const {width, height} = this.pixelsToDraw.dim()

    for (let yDouble = 0; yDouble < height; yDouble+=2) {
      for (let x = 0; x < width; x++) {
        const topPos = {x, y: yDouble}
        const bottomPos = {x, y: yDouble + 1}
        const topDraw = this.pixelsToDraw.get(topPos, BLACK)
        const bottomDraw = this.pixelsToDraw.get(bottomPos, BLACK)
        if (this.pixelsOnScreen.get(topPos, BLACK) !== topDraw || this.pixelsOnScreen.get(bottomPos, BLACK) !== bottomDraw) {
          this._drawTopBottomPixel({x, y: yDouble / 2}, topDraw, bottomDraw)
        }
      }
    }
    
  }

  private _drawTopBottomPixel(pos: IPosition, topHex: string, bottomHex: string) {
    const {columns, rows} = getTerminalSize()

    // do not draw past the terminal
    if (pos.x >= columns || pos.y * 2 >= rows) { return }

    process.stdout.write(
      setMoveTo(pos.x, pos.y) +
      setFgColor(bottomHex) +
      setBgColor(topHex) +
      '▄' +
      setFgColor(WHITE) + // reset fg to white
      setBgColor(BLACK) // reset back to black
    )
    this.pixelsOnScreen.set({x: pos.x, y: pos.y * 2}, topHex)
    this.pixelsOnScreen.set({x: pos.x, y: pos.y * 2 + 1}, bottomHex)
  }

  drawPixel(pos: IPosition, hex: string) {
    if (pos.x < 0 || pos.y < 0) { throw new Error(`BUG: Tried to draw outside of the camera range ${JSON.stringify(pos)}`)}
    this.pixelsToDraw.set(pos, hex)
  }
}


// TypeScript does not like that columns and rows might be null
function getTerminalSize() {
  return {
      columns: process.stdout.columns || 80,
      rows: process.stdout.rows || 25
  }
}

// Determine if this
// 'truecolor' if this terminal supports 16m colors. 256 colors otherwise
const supports16mColors = process.env.COLORTERM === 'truecolor'

function setBgColor(hex: string) {
    if (supports16mColors) {
        return ansiStyles.bgColor.ansi16m.hex(hex)
    } else {
      // console.log(ansiStyles)
        return ansiStyles.bgColor.ansi256.hex(hex)
    }
}

function setFgColor(hex: string) {
    if (supports16mColors) {
        return ansiStyles.color.ansi16m.hex(hex)
    } else {
        return ansiStyles.color.ansi256.hex(hex)
    }
}
function writeBgColor(hex: string) {
    process.stdout.write(setBgColor(hex))
}
function writeFgColor(hex: string) {
    process.stdout.write(setFgColor(hex))
}
function setMoveTo(x: number, y: number) {
    return ansiEscapes.cursorTo(x, y)
}
function setShowCursor() {
    return ansiEscapes.cursorShow
}
function clearScreen() {
    process.stdout.write(ansiEscapes.clearScreen)
}
