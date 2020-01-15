import ansiEscapes from 'ansi-escapes'
import ansiStyles from 'ansi-styles'
import gamepad from 'gamepad'
import { IPosition, IGamepad, IRenderer, IPixel, DPAD, BUTTON_TYPE } from './engine'


function debug(message?: any, ...optionalParams: any[]) {
  // console.error(message, ...optionalParams)
}





const KEY_REPEAT_WITHIN = 110 // MacOS seems to repeat at 80ms (up to 102ms)

export class KeyboardGamepad implements IGamepad {
  private lastSaw = Date.now()
  private curPressed: BUTTON_TYPE | undefined = undefined

  listenTo(btns: BUTTON_TYPE[]) {
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
      if (this.lastSaw > 0) debug('Time since last keystroke detected:', Date.now() - this.lastSaw)
        this.lastSaw = Date.now()
        switch (key) {
            case 'W':
            case 'w':
            case '\u001B\u005B\u0041': // UP-ARROW
              this.curPressed = BUTTON_TYPE.ARROW_UP; break
            case 'S':
            case 's':
            case '\u001B\u005B\u0042': // DOWN-ARROW
              this.curPressed = BUTTON_TYPE.ARROW_DOWN; break
            case 'A':
            case 'a':
            case '\u001B\u005B\u0044': // LEFT-ARROW
              this.curPressed = BUTTON_TYPE.ARROW_LEFT; break
            case 'D':
            case 'd':
            case '\u001B\u005B\u0043': // RIGHT-ARROW
              this.curPressed = BUTTON_TYPE.ARROW_RIGHT; break
            case 'X':
            case 'x':
            case ' ':
            case '\u000D':
              this.curPressed = BUTTON_TYPE.CLUSTER_BOTTOM; break
            case 'Q':
            case 'q':
              this.curPressed = BUTTON_TYPE.BUMPER_TOP_LEFT; break
            case 'E':
            case 'e':
              this.curPressed = BUTTON_TYPE.BUMPER_TOP_RIGHT; break
            case '\u0003': // Ctrl+C
            case '\u001B': // Escape
                return process.exit(1)
            default:
              this.curPressed = undefined
              debug(`Did not understand key pressed: "${key}"`)
        }
    })
  }
  isButtonPressed(btn: BUTTON_TYPE) {
    return this.getCurPressed() === btn
  }

  private getCurPressed() {
    if (this.lastSaw + KEY_REPEAT_WITHIN < Date.now()) {
      this.curPressed = undefined
    }
    return this.curPressed
  }
}


export class ActualGamepad implements IGamepad {
  private deviceProductIds: number[] = []
  private pressedButtons: boolean[] = []
  private pressedAxes: number[] = []

  listenTo(btns: BUTTON_TYPE[]) {
    gamepad.init()

    // Create a game loop and poll for events
    setInterval(gamepad.processEvents, 16)
    // Scan for new gamepads as a slower rate
    setInterval(gamepad.detectDevices, 500)

    // Listen for button up events on all gamepads
    gamepad.on('attach', (id, device) => {
      debug('gamepad attached. Desc, vendor, product: ', device.description, device.vendorID, device.productID)
      this.deviceProductIds[id] = device.productID
    })

    gamepad.on('up',   (id, num) => this.pressedButtons[num] = false)
    gamepad.on('down', (id, num) => this.pressedButtons[num] = true)
    gamepad.on('move', (id, axis, value) => this.pressedAxes[axis] = value)

  }
  isButtonPressed(btn: BUTTON_TYPE) {
    if (this.deviceProductIds.length === 0) { return false }

    // PS4
    if (this.deviceProductIds[0] === 2508) {
      switch(btn) {
        case BUTTON_TYPE.ARROW_UP:    return this.pressedAxes[5] < -0.5
        case BUTTON_TYPE.ARROW_DOWN:  return this.pressedAxes[5] > 0.5
        case BUTTON_TYPE.ARROW_LEFT:  return this.pressedAxes[4] < -0.5
        case BUTTON_TYPE.ARROW_RIGHT: return this.pressedAxes[4] > 0.5


        case BUTTON_TYPE.CLUSTER_LEFT:        return this.pressedButtons[0]
        case BUTTON_TYPE.CLUSTER_BOTTOM:      return this.pressedButtons[1]
        case BUTTON_TYPE.CLUSTER_RIGHT:       return this.pressedButtons[2]
        case BUTTON_TYPE.CLUSTER_TOP:         return this.pressedButtons[3]
        case BUTTON_TYPE.BUMPER_TOP_LEFT:     return this.pressedButtons[4]
        case BUTTON_TYPE.BUMPER_TOP_RIGHT:    return this.pressedButtons[5]
        case BUTTON_TYPE.BUMPER_BOTTOM_LEFT:  return this.pressedButtons[6]
        case BUTTON_TYPE.BUMPER_BOTTOM_RIGHT: return this.pressedButtons[7]
        case BUTTON_TYPE.SELECT:              return this.pressedButtons[8]
        case BUTTON_TYPE.START:               return this.pressedButtons[9]
        case BUTTON_TYPE.STICK_PRESS_LEFT:    return this.pressedButtons[10]
        case BUTTON_TYPE.STICK_PRESS_RIGHT:   return this.pressedButtons[11]
        case BUTTON_TYPE.HOME:                return this.pressedButtons[12]
        case BUTTON_TYPE.TOUCHSCREEN:         return this.pressedButtons[13]
          
        default:
          throw new Error(`Did not understand button yet. ${btn}`)
      } 
    } else {
      //throw new Error('Unsupported Gamepad')
      return false
    }
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
    if (pos.x >= columns || pos.y >= rows * 2) { return }

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
