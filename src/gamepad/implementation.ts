import * as HID from 'node-hid'
import { IGamepadRoot, IGamepad, BUTTON_TYPE } from './api'

function debug(message?: any, ...optionalParams: any[]) {
  // console.error(message, ...optionalParams)
}

type ConfigButton = {
  pin: number
  names: string[]
  value?: number
  mask?: number
  clearBit?: number
  bit?: number
}

type ConfigJoystick = {
  name: string
  xPin: number
  yPin: number
}

type Config = {
  vendorId: number
  productId: number
  buttons: ConfigButton[]
  joysticks: ConfigJoystick[]

  standard: {
    buttons: string[]
    axes: [string, "x" | "y"][]
  }
}

const configs = new Map<[number, number], Config>()

const cache = new Map<string, Gamepad>()

type IPosition = {
  x: number
  y: number
}

class GamepadRoot implements IGamepadRoot {
  getGamepads(): Gamepad[] {
    const devices = HID.devices()
    const gamepadsOrNull = devices.map(d => {
      const c = configs.get([d.vendorId, d.productId])
      if (c) {
        let i = cache.get(d.path)
        if (!i) {
          i = new Gamepad(d.path, c)
          cache.set(d.path, i)
        }
        return i
      } else {
        return null
      }
    })
    return gamepadsOrNull.filter(d => d !== null)
  }
}

export const gamepadRoot = new GamepadRoot()

class Gamepad implements IGamepad {
  private readonly path: string
  private readonly config: Config
  private usb: HID.HID | null
  private lastUpdated: number

  private jStates = new Map<string, IPosition>()
  private bStates = new Set<string>()

  private standardButtons: Button[] | undefined

  constructor(path: string, config: Config) {
    this.path = path
    this.config = config
    this.usb = new HID.HID(path)

    this.usb.on('data', this.onUsbFrame.bind(this))
    process.on('exit', this.disconnect.bind(this))
  }

  disconnect() {
    if (this.usb) {
        this.usb.close()
        this.usb = null
    }
    cache.delete(this.path)
  }

  private onUsbFrame(data) {
    this.processJoysticks(data)
    this.processButtons(data)
  }

  private processJoysticks(data) {
    if (!this.config.joysticks) { return }

    this.config.joysticks.forEach(j => {
      this.jStates[j.name] = {x: data[j.xPin], y: data[j.yPin]}
    })
  }

  private processButtons(data) {
    this.config.buttons.forEach(b => {
      const v = data[b.pin]
      let newState
      if (b.bit !== undefined) {
        newState = (v & b.bit) === b.bit
      } else if (b.clearBit !== undefined) { // b.value !== undefined
        // This is used by the PS4 DualShock Controller
        let noDpad = (v & b.clearBit) === b.clearBit
        if (noDpad) {
          newState = false
        } else {
          newState = (v & b.mask) === b.value
        }
      } else {
        newState = v === b.value
      }

      b.names.forEach(n => { if (newState) { this.bStates.add(n) } else { this.bStates.delete(n)} } )

    })
    this.lastUpdated = Date.now()
  }

  isButtonPressed(btn: BUTTON_TYPE) {
    return this.bStates.has(btn)
  }

  // ------------------------------------
  // Gamepad API support
  // See https://developer.mozilla.org/en-US/docs/Web/API/Gamepad
  // ------------------------------------

  get buttons() {
    let s = this.standardButtons
    if (!s) {
      s = this.config.standard.buttons.map(name => new Button(this.bStates, name))
      this.standardButtons = s
    }
    return this.standardButtons
  }

  get axes() {
    return this.config.standard.axes.map(([name, xy]) => {
      return (this.jStates.get(name) || {x: 0, y: 0})[xy]
    })
  }

  get mapping() {
    return this.config.standard ? 'standard' : ''
  }

  get timestamp() {
    return this.lastUpdated
  }
}

class Button {
  private bStates: Set<string>
  private name: string
  constructor(bStates: Set<string>, name: string) {
    this.bStates = bStates
    this.name = name
  }

  get pressed() {
    return this.bStates.has(name)
  }
  get value() {
    return this.pressed ? 1.0 : 0.0
  }
}


const KEY_REPEAT_WITHIN = 110 // MacOS seems to repeat at 80ms (up to 102ms)

export class KeyboardGamepad implements IGamepad {
  timestamp = Date.now()
  private curPressed: string
  private keyConfig

  // Gamepad API. TODO: Actually map it (not too hard)
  buttons: []
  axes: []
  mapping: 'none'

  constructor(keyConfig) {
    this.curPressed = ''
    this.keyConfig = keyConfig

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
      if (this.timestamp > 0) debug('Time since last keystroke detected:', Date.now() - this.timestamp)
        this.timestamp = Date.now()
        
        switch (key) {
            case '\u0003': // Ctrl+C
            case '\u001B': // Escape
                return process.exit(1)
            default:
              this.curPressed = key
        }
    })
  }
  isButtonPressed(btn: BUTTON_TYPE) {
    const c = this.keyConfig[btn]
    return c ? c.indexOf(this.getCurPressed()) >= 0 : false
  }

  private getCurPressed() {
    if (this.timestamp + KEY_REPEAT_WITHIN < Date.now()) {
      this.curPressed = ''
    }
    return this.curPressed
  }
  
}


export class OrGamepad implements IGamepad {
  private pads: IGamepad[]

  // Gamepad API. TODO: Implement (not hard)
  buttons: []
  axes: []
  mapping: 'none'
  timestamp: 0

  constructor(pads: IGamepad[]) {
    this.pads = pads
  }

  isButtonPressed(btn: BUTTON_TYPE) {
    for (const pad of this.pads) {
      if (pad.isButtonPressed(btn)) { return true }
    }
    return false
  }
}

export class AnyGamepad implements IGamepad {
  timestamp = 0
  private readonly polling: number
  private pads: IGamepad[] = []

  // Gamepad API. TODO: Implement (not hard)
  buttons: []
  axes: []
  mapping: 'none'

  constructor(pollingInterval: number) {
    this.polling = pollingInterval
  }

  isButtonPressed(btn: BUTTON_TYPE) {
    if (this.timestamp + this.polling < Date.now()) {
      this.pads = gamepadRoot.getGamepads()
      this.timestamp = Date.now()
    }
    for (const pad of this.pads) {
      if (pad.isButtonPressed(btn)) { return true }
    }
    return false
  }
}