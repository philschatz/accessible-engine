const { gamepadRoot, AnyGamepad } = require('./src/gamepad/implementation')

const anyPad = new AnyGamepad(1000)

const ALL_BUTTONS = [
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
  'AXIS_LEFT',
  'AXIS_RIGHT',
  'TOUCHSCREEN'
]

const ALL_STICKS = [ 'LEFT', 'RIGHT' ]

setInterval(() => {
  buttons = new Set()

  ALL_BUTTONS.forEach(b => {
    if (anyPad.isButtonPressed(b)) { buttons.add(b) }
  })

  sticks = new Map()
  ALL_STICKS.forEach(s => {
    const v = anyPad.getStickCoordinates(s)
    if (Math.abs(v.x) + Math.abs(v.y) > .1) {
      sticks.set(s, v)
    }
  })
  
  console.log(buttons.size, buttons, sticks)
}, 200)