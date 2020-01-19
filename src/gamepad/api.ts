export enum BUTTON_TYPE {
  ARROW_UP = 'ARROW_UP',
  ARROW_DOWN = 'ARROW_DOWN',
  ARROW_LEFT = 'ARROW_LEFT',
  ARROW_RIGHT = 'ARROW_RIGHT',
  HOME = 'HOME',
  START = 'START',
  SELECT = 'SELECT',
  CLUSTER_TOP = 'CLUSTER_TOP',
  CLUSTER_LEFT = 'CLUSTER_LEFT',
  CLUSTER_RIGHT = 'CLUSTER_RIGHT',
  CLUSTER_BOTTOM = 'CLUSTER_BOTTOM',
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
  isButtonPressed(btn: BUTTON_TYPE): boolean
  
  // https://developer.mozilla.org/en-US/docs/Web/API/Gamepad
  buttons: {pressed: boolean, value: number}[]
  axes: number[]
  mapping: string
  timestamp: number
}