const { gamepadRoot, AnyGamepad } = require('./src/gamepad/implementation')

const anyPad = new AnyGamepad(1000)

ALL_BUTTONS = [
  'DPAD_UP',
  'DPAD_DOWN',
  'DPAD_LEFT',
  'DPAD_RIGHT',
  'HOME',
  'START',
  'SELECT',
  'CLUSTER_UP',
  'CLUSTER_LEFT',
  'CLUSTER_RIGHT',
  'CLUSTER_DOWN',
  'BUMPER_TOP_LEFT',
  'BUMPER_BOTTOM_LEFT',
  'BUMPER_TOP_RIGHT',
  'BUMPER_BOTTOM_RIGHT',
  'STICK_PRESS_LEFT',
  'STICK_PRESS_RIGHT',
  'TOUCHSCREEN'
]

setInterval(() => {
  buttons = new Set()

  ALL_BUTTONS.forEach(b => {
    if (anyPad.isButtonPressed(b)) { buttons.add(b) }
  })
  
  console.log(buttons)
}, 200)