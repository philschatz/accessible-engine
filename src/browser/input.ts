import { IGamepad, BUTTON_TYPE, STICK_TYPE } from '../common/gamepad'
import { Opt } from '../common/engine'

const keyConfig = new Map<BUTTON_TYPE, string[]>()
keyConfig.set(BUTTON_TYPE.DPAD_UP, ['W', 'w', 'ArrowUp'])
keyConfig.set(BUTTON_TYPE.DPAD_DOWN, ['S', 's', 'ArrowDown'])
keyConfig.set(BUTTON_TYPE.DPAD_LEFT, ['A', 'a', 'ArrowLeft'])
keyConfig.set(BUTTON_TYPE.DPAD_RIGHT, ['D', 'd', 'ArrowRight'])
keyConfig.set(BUTTON_TYPE.CLUSTER_DOWN, ['X', 'x', ' ', 'Enter', 'K', 'k'])
keyConfig.set(BUTTON_TYPE.BUMPER_TOP_LEFT, ['Q', 'q'])
keyConfig.set(BUTTON_TYPE.BUMPER_TOP_RIGHT, ['E', 'e'])

keyConfig.set(BUTTON_TYPE.SELECT, ['M', 'm'])
keyConfig.set(BUTTON_TYPE.CLUSTER_UP, ['I', 'i'])
keyConfig.set(BUTTON_TYPE.CLUSTER_LEFT, ['J', 'j'])
keyConfig.set(BUTTON_TYPE.CLUSTER_RIGHT, ['L', 'l'])

export const KEY_MAP = new Map<string, BUTTON_TYPE>()
for (const [button, keys] of keyConfig.entries()) {
  keys.forEach(key => KEY_MAP.set(key, button))
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
  }

  _on (isDown: boolean, key: string) {
    const k = this.mapper(key)
    if (k && (!this.context || checkActiveElement(this.context, window.document.activeElement))) {
      if (isDown) {
        this.pressed.add(k)
      } else {
        this.pressed.delete(k)
      }
      if (this.listener) this.listener(k, isDown)
    }
  }

  public isPressed (key: T) {
    return this.pressed.has(key)
  }
}

export class KeyGamepad implements IGamepad {
  private readonly km: Keymaster<BUTTON_TYPE>

  constructor (km: Keymaster<BUTTON_TYPE>) {
    this.km = km

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
    this.km._on(true, evt.key)
  }

  private onKeyUp (evt: KeyboardEvent) {
    this.km._on(false, evt.key)
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

export class HtmlButtonGamepad implements IGamepad {
  private readonly km: Keymaster<BUTTON_TYPE>
  private readonly keyLookup: (el: Element) => (string | undefined)

  constructor (keyLookup: (el: Element) => (string | undefined), km: Keymaster<BUTTON_TYPE>) {
    if (!keyLookup) {
      throw new Error('BUG: Specify a keyLookup function')
    }
    this.km = km
    this.keyLookup = keyLookup

    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onTouchStart = this.onTouchStart.bind(this)
    this.onTouchEnd = this.onTouchEnd.bind(this)
    window.addEventListener('mousedown', this.onMouseDown)
    window.addEventListener('mouseup', this.onMouseUp)
    window.addEventListener('touchstart', this.onTouchStart)
    window.addEventListener('touchend', this.onTouchEnd)
  }

  dispose () {
    window.removeEventListener('mousedown', this.onMouseDown)
    window.removeEventListener('mouseup', this.onMouseUp)
    window.removeEventListener('touchstart', this.onTouchStart)
    window.removeEventListener('touchend', this.onTouchEnd)
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

  private _start (el: EventTarget) {
    if (el instanceof Element) {
      const letter = this.keyLookup(el)
      if (letter) {
        this.km._on(true, letter)
        return true
      }
    }
    return false
  }

  private _end (el: EventTarget) {
    if (el instanceof Element) {
      const letter = this.keyLookup(el)
      if (letter) {
        this.km._on(false, letter)
        return true
      }
    }
    return false
  }

  private onMouseDown (evt: MouseEvent) {
    const el = evt.target
    if (el instanceof Element) {
      this._start(el) && evt.preventDefault()
    }
  }

  private onMouseUp (evt: MouseEvent) {
    const el = evt.target
    if (el instanceof Element) {
      this._end(el) && evt.preventDefault()
    }
  }

  private onTouchStart (evt: TouchEvent) {
    if (evt.target) this._start(evt.target) // && evt.preventDefault()
  }

  private onTouchEnd (evt: TouchEvent) {
    if (evt.target) this._end(evt.target) && evt.preventDefault()
  }
}
// https://w3c.github.io/gamepad/#dfn-standard-gamepad-layout
function toStandard (btn: BUTTON_TYPE) {
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
  isConnected () {
    for (const g of window.navigator.getGamepads()) {
      if (g?.connected) { return true }
    }
    return false
  }

  dispose () {
    // unused
  }

  tick () {
    // unused
  }

  isButtonPressed (btn: BUTTON_TYPE) {
    // return true if any gamepad pressed the button
    for (const g of window.navigator.getGamepads()) {
      if (g) {
        if (g.mapping !== 'standard') {
          console.warn('Gamepad does not have a standard mapping so not using')
        }
        const btnIndex = toStandard(btn)
        if (btnIndex >= 0 && g.buttons[btnIndex]?.pressed) {
          return true
        }
      }
    }
    return false
  }

  getStickCoordinates (stick: STICK_TYPE) {
    for (const g of window.navigator.getGamepads()) {
      if (g) {
        if (g.mapping !== 'standard') {
          console.warn('Gamepad does not have a standard mapping so not using')
        }
        switch (stick) {
          case STICK_TYPE.LEFT: return { x: g.axes[0], y: g.axes[1] }
          case STICK_TYPE.RIGHT: return { x: g.axes[2], y: g.axes[3] }
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
