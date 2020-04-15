import { IGamepad, BUTTON_TYPE, STICK_TYPE } from '../common/gamepad'
import { Opt } from '../common/engine'

const keyConfig = new Map<BUTTON_TYPE, string[]>()
keyConfig.set(BUTTON_TYPE.DPAD_UP, ['W', 'w', 'ArrowUp'])
keyConfig.set(BUTTON_TYPE.DPAD_DOWN, ['S', 's', 'ArrowDown'])
keyConfig.set(BUTTON_TYPE.DPAD_LEFT, ['A', 'a', 'ArrowLeft'])
keyConfig.set(BUTTON_TYPE.DPAD_RIGHT, ['D', 'd', 'ArrowRight'])
keyConfig.set(BUTTON_TYPE.CLUSTER_DOWN, ['X', 'x', ' ', 'Enter'])
keyConfig.set(BUTTON_TYPE.BUMPER_TOP_LEFT, ['Q', 'q'])
keyConfig.set(BUTTON_TYPE.BUMPER_TOP_RIGHT, ['E', 'e'])

const keyMap = new Map<string, BUTTON_TYPE>()
for (const [button, keys] of keyConfig.entries()) {
  keys.forEach(key => keyMap.set(key, button))
}

const checkActiveElement = (root: Element, current: Element | null): boolean => {
  if (root === current) {
    return true
  }
  if (current?.parentElement) {
    return checkActiveElement(root, current.parentElement)
  }
  return false
}

export class Keymaster<T> {
  private readonly context: Opt<HTMLElement>
  private readonly mapper: (key: string) => (T | undefined)
  private readonly pressed = new Set<T>()
  private readonly listener: Opt<(key: T, pressed: boolean) => void>
  constructor (mapper: (key: string) => T | undefined, listener: Opt<(key: T, pressed: boolean) => void>, context: Opt<HTMLElement>) {
    this.mapper = mapper
    this.listener = listener
    this.context = context
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onKeyUp = this.onKeyUp.bind(this)
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  dispose () {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  }

  private onKeyDown (evt: KeyboardEvent) {
    const key = this.mapper(evt.key)
    if (key && (!this.context || checkActiveElement(this.context, window.document.activeElement))) {
      this.pressed.add(key)
      if (this.listener) this.listener(key, true)
    }
  }

  private onKeyUp (evt: KeyboardEvent) {
    const key = this.mapper(evt.key)
    if (key && (!this.context || checkActiveElement(this.context, window.document.activeElement))) {
      this.pressed.delete(key)
      if (this.listener) this.listener(key, false)
    }
  }

  public isPressed (key: T) {
    return this.pressed.has(key)
  }
}

export class KeyGamepad implements IGamepad {
  private readonly km: Keymaster<BUTTON_TYPE>

  constructor (context: Opt<HTMLElement>) {
    this.km = new Keymaster((key: string) => keyMap.get(key), null, context)
  }

  dispose () {
    this.km.dispose()
  }

  tick () {
    // no polling necessary. They on('keydown') handles this async
  }

  isButtonPressed (btn: BUTTON_TYPE) {
    return this.km.isPressed(btn)
  }

  getStickCoordinates (stick: STICK_TYPE) {
    return null
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Gamepad
  buttons = []
  axes = []
  mapping = ''
  timestamp = 0
}

// https://w3c.github.io/gamepad/#dfn-standard-gamepad-layout
function toStandard(btn: BUTTON_TYPE) {
  switch (btn) {
    case BUTTON_TYPE.CLUSTER_DOWN: return 0
    case BUTTON_TYPE.CLUSTER_RIGHT: return 1
    case BUTTON_TYPE.CLUSTER_LEFT: return 2
    case BUTTON_TYPE.CLUSTER_UP: return 3
    case BUTTON_TYPE.BUMPER_TOP_LEFT: return 4
    case BUTTON_TYPE.BUMPER_TOP_RIGHT: return 5
    case BUTTON_TYPE.BUMPER_BOTTOM_LEFT: return 6
    case BUTTON_TYPE.BUMPER_BOTTOM_RIGHT: return 7
    case BUTTON_TYPE.SELECT: return 8
    case BUTTON_TYPE.START: return 9
    case BUTTON_TYPE.STICK_PRESS_LEFT: return 10
    case BUTTON_TYPE.STICK_PRESS_RIGHT: return 11
    case BUTTON_TYPE.DPAD_UP: return 12
    case BUTTON_TYPE.DPAD_DOWN: return 13
    case BUTTON_TYPE.DPAD_LEFT: return 14
    case BUTTON_TYPE.DPAD_RIGHT: return 15
    case BUTTON_TYPE.HOME: return 16
    default: return -1
  }
}

export class BrowserGamepad implements IGamepad {

  isConnected() {
    for (const g of window.navigator.getGamepads()) {
      if (g && g.connected) { return true }
    }
    return false
  }
  dispose() {}
  tick() {}
  isButtonPressed(btn: BUTTON_TYPE) {
    // return true if any gamepad pressed the button
    for (const g of window.navigator.getGamepads()) {
      if (g) {
        if (g.mapping !== 'standard') {
          console.warn("Gamepad does not have a standard mapping so not using")
        }
        let btnIndex = toStandard(btn)
        if (btnIndex >= 0 && g.buttons[btnIndex]?.pressed) {
          return true
        }
      }
    }
    return false
  }
  getStickCoordinates(stick: STICK_TYPE) {
    for (const g of window.navigator.getGamepads()) {
      if (g) {
        if (g.mapping !== 'standard') {
          console.warn("Gamepad does not have a standard mapping so not using")
        }
        switch (stick) {
          case STICK_TYPE.LEFT: return {x: g.axes[0], y: g.axes[1]}
          case STICK_TYPE.RIGHT: return {x: g.axes[2], y: g.axes[3]}
        }
      }
    }
    return null
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Gamepad
  buttons = []
  axes = []
  mapping = ''
  timestamp = 0
  
}