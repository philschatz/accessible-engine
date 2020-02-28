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
  private readonly mapper: (key: string) => T
  private readonly pressed = new Set<T>()
  private readonly listener: Opt<(key: T, pressed: boolean) => void>
  constructor (mapper: (key: string) => T, listener: Opt<(key: T, pressed: boolean) => void>, context: Opt<HTMLElement>) {
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
  buttons: Array<{pressed: boolean, value: number}>
  axes: number[]
  mapping: string
  timestamp: number
}
