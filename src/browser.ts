import { Engine, IOutputter } from './common/engine'
import { OrGamepad, IGamepad } from './common/gamepad'
// import { MyGame } from './fuzGame'
import { MyGame } from './akurraGame'
import { TableOutputter, AudioOutputter, AndOutputter } from './common/table'

export { Engine, MyGame, AudioOutputter, AndOutputter, OrGamepad, IGamepad, IOutputter }

const outputter = new AndOutputter([new TableOutputter(), new AudioOutputter(console.error.bind(console))])
const engine = new Engine(new MyGame(), outputter, new OrGamepad([]))

const sleep = async (ms: number) => new Promise((resolve, reject) => {
  setTimeout(resolve, ms)
})

export const run = async () => {
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
