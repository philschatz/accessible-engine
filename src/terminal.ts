// To be blind-accessible:

// cannot rely on timing, only on keyboard presses.
// Animations need to be a property of the sprite.
// The sprite needs to contain the state (e.g. static properties that apply to all of this sprite type, or object properties that only apply to this instance).

// renderer needs to only draw sprites.
// Maybe the sprites need to be within the grid, maybe not.

// :thinking: Maybe there is a way to design zelda so that killing baddies is optionally time-sensitive.

// Hmm, domino-effects should be allowed (how can this fall into animation); interactions pause until the domino-effects are done.

// ---------

import { Engine, IOutputter } from './common/engine'
import { VisualOutputter } from './common/visual'
import { TerminalRenderer } from './terminal/renderer'
import { KeyboardGamepad, AnyGamepad } from './terminal/gamepad'
import { OrGamepad, BUTTON_TYPE } from './common/gamepad'
// import { MyGame } from './fuzGame'
import { MyGame } from './akurraGame'

import { AudioOutputter, AndOutputter } from './common/table'

const keyConfig = {}
keyConfig[BUTTON_TYPE.DPAD_UP] = ['W', 'w', '\u001B\u005B\u0041']
keyConfig[BUTTON_TYPE.DPAD_DOWN] = ['S', 's', '\u001B\u005B\u0042']
keyConfig[BUTTON_TYPE.DPAD_LEFT] = ['A', 'a', '\u001B\u005B\u0044']
keyConfig[BUTTON_TYPE.DPAD_RIGHT] = ['D', 'd', '\u001B\u005B\u0043']
keyConfig[BUTTON_TYPE.CLUSTER_DOWN] = ['X', 'x', ' ', '\u000D']
keyConfig[BUTTON_TYPE.BUMPER_TOP_LEFT] = ['Q', 'q']
keyConfig[BUTTON_TYPE.BUMPER_TOP_RIGHT] = ['E', 'e']

const err = console.error.bind(console)
let outputter: IOutputter
switch (process.env.OUTPUT_MODE) {
  case 'both': outputter = new AndOutputter([new VisualOutputter(new TerminalRenderer()), new AudioOutputter(err)]); break
  case 'audio': outputter = new AudioOutputter(); break
  default: outputter = new VisualOutputter(new TerminalRenderer())
}
const engine = new Engine(new MyGame(), outputter, new OrGamepad([new KeyboardGamepad(keyConfig), new AnyGamepad(1000)]))

const sleep = async (ms: number) => new Promise((resolve, reject) => {
  setTimeout(resolve, ms)
})

const run = async () => {
  console.log('NOTE: Keyboards in a terminal do not work well for platformers (holding down a key). So when you run & jump you should tap up and then keep tapping left/right to keep moving in that direction')
  let previous = Date.now()
  while (true) {
    const now = Date.now()
    const diff = now - previous
    const sleepTime = Math.max(0, 33 - diff) // 30 fps = 1000/30 = 16.6666ms
    // console.error(`Took: ${diff} Sleep time = ${sleepTime}`)
    await sleep(sleepTime * (process.env.SLOW ? 10 : 1))
    engine.tick()
    previous = now
  }
}

function handler (err, type) {
  console.error(type)
  console.error(err)
}

process.on('beforeExit', () => handler(null, 'beforeExit'))
process.on('exit', () => handler(null, 'exit'))
process.on('uncaughtException', err => handler(err, 'uncaughtException'))
process.on('unhandledRejection', err => handler(err, 'unhandledRejection'))
process.on('SIGINT', () => handler(null, 'SIGINT'))
process.on('SIGQUIT', () => handler(null, 'SIGQUIT'))
process.on('SIGTERM', () => handler(null, 'SIGTERM'))

run().then(null, (err) => {
  console.error(err)
  process.exit(111)
})
