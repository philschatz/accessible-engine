// To be blind-accessible:

// cannot rely on timing, only on keyboard presses.
// Animations need to be a property of the sprite.
// The sprite needs to contain the state (e.g. static properties that apply to all of this sprite type, or object properties that only apply to this instance).

// renderer needs to only draw sprites.
// Maybe the sprites need to be within the grid, maybe not.


// :thinking: Maybe there is a way to design zelda so that killing baddies is optionally time-sensitive.

// Hmm, domino-effects should be allowed (how can this fall into animation); interactions pause until the domino-effects are done.


// ---------

import {Engine} from './engine'
import {TerminalRenderer, KeyboardGamepad} from './terminal'
import {MyGame} from './myGame'




function setUnion<T>(set1: Iterable<T>, set2: Iterable<T>) {
  const s: Set<T> = new Set()
  for (const o of set1) {
    s.add(o)
  }
  for (const o of set2) {
    s.add(o)
  }
  return s
}

const engine = new Engine(new MyGame(), new TerminalRenderer(), new KeyboardGamepad())



const sleep = async (ms: number) => new Promise((resolve, reject) => {
  setTimeout(resolve, ms)
})

const run = async () => {
  console.log('NOTE: Keyboards in a terminal do not work well for platformers (holding down a key). So when you run & jump you should tap up and then keep tapping left/right to keep moving in that direction')
  while (true) {
    await sleep(16) // 60 fps = 1000/60 = 16.6666ms
    engine.tick()
  }
}

run().then(null, (err) => {
  console.error(err)
  process.exit(111)
})