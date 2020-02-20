import { IPosition } from '../engine'

export enum BUTTON_TYPE {
  DPAD_UP = 'DPAD_UP',
  DPAD_DOWN = 'DPAD_DOWN',
  DPAD_LEFT = 'DPAD_LEFT',
  DPAD_RIGHT = 'DPAD_RIGHT',
  HOME = 'HOME',
  START = 'START',
  SELECT = 'SELECT',
  CLUSTER_UP = 'CLUSTER_UP',
  CLUSTER_LEFT = 'CLUSTER_LEFT',
  CLUSTER_RIGHT = 'CLUSTER_RIGHT',
  CLUSTER_DOWN = 'CLUSTER_DOWN',
  BUMPER_TOP_LEFT = 'BUMPER_TOP_LEFT',
  BUMPER_BOTTOM_LEFT = 'BUMPER_BOTTOM_LEFT',
  BUMPER_TOP_RIGHT = 'BUMPER_TOP_RIGHT',
  BUMPER_BOTTOM_RIGHT = 'BUMPER_BOTTOM_RIGHT',
  STICK_PRESS_LEFT = 'STICK_PRESS_LEFT',
  STICK_PRESS_RIGHT = 'STICK_PRESS_RIGHT',
  TOUCHSCREEN = 'TOUCHSCREEN'
}
export enum STICK_TYPE {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}
export enum ANALOG_TYPE {
  BUMPER_LEFT = 'BUMPER_LEFT',
  BUMPER_RIGHT = 'BUMPER_RIGHT'
}

export interface IGamepadRoot {
  getGamepads(): IGamepad[]
}

export interface IGamepad {
  tick(): void
  isButtonPressed(btn: BUTTON_TYPE): boolean
  getStickCoordinates(stick: STICK_TYPE): IPosition | null

  // https://developer.mozilla.org/en-US/docs/Web/API/Gamepad
  buttons: Array<{pressed: boolean, value: number}>
  axes: number[]
  mapping: string
  timestamp: number
}
