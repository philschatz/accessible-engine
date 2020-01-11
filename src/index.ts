// To be blind-accessible:

// cannot rely on timing, only on keyboard presses.
// Animations need to be a property of the sprite.
// The sprite needs to contain the state (e.g. static properties that apply to all of this sprite type, or object properties that only apply to this instance).

// renderer needs to only draw sprites.
// Maybe the sprites need to be within the grid, maybe not.


// :thinking: Maybe there is a way to design zelda so that killing baddies is optionally time-sensitive.

// Hmm, domino-effects should be allowed (how can this fall into animation); interactions pause until the domino-effects are done.


// ---------

import ansiEscapes from 'ansi-escapes'
import ansiStyles from 'ansi-styles'
import Rbush from 'rbush'


class MyRBush extends Rbush<ObjectInstance<any, any>> {
  toBBox(item: ObjectInstance<any, any>) { return item.toBBox() }
  compareMinX(a: ObjectInstance<any, any>, b: ObjectInstance<any, any>) { return a.pos.x - b.pos.x }
  compareMinY(a: ObjectInstance<any, any>, b: ObjectInstance<any, any>) { return a.pos.y - b.pos.y }
}

// From https://github.com/mourner/rbush
interface RBush<I> {
  insert(item: I): void
  load(items: I[]): void
  remove(item: I): void
  search(bbox: BBox): I[]
}

interface BBox {
  readonly minX: number
  readonly minY: number
  readonly maxX: number
  readonly maxY: number
}

interface IPosition {
  readonly x: number
  readonly y: number
}

class ObjectInstance<P, S> {
  public pos: IPosition

  public static: GameObject<P, S>
  public props: P
  public hFlip: boolean

  constructor(t: GameObject<P, S>, pos: IPosition) {
    this.static = t
    this.pos = pos
    this.hFlip = false
  }

  destroy() {
    this.static.delete(this)
  }

  moveTo(pos: IPosition) {
    // delegate
    this.static.moveTo(this, pos)
  }

  toBBox(): BBox {
    return {minX: this.pos.x, minY: this.pos.y, maxX: this.pos.x + 8, maxY: this.pos.y + 8}
  }
}

class GameObject<P = {}, S = {}> {
  private readonly bush: RBush<ObjectInstance<{},{}>>
  readonly sprite: Sprite
  readonly instances: Set<ObjectInstance<P, S>> = new Set()
  public props: S

  constructor(bush: RBush<ObjectInstance<{},{}>>, sprite: Sprite) {
    this.bush = bush
    this.sprite = sprite
  }

  public new(pos: IPosition) {
    const o = new ObjectInstance(this, pos)
    this.instances.add(o)
    this.bush.insert(o)
    return o
  }

  public newBulk(positions: IPosition[]) {
    const instances = positions.map(p => new ObjectInstance(this, p))
    this.bush.load(instances)
    for (const o of instances) {
      this.instances.add(o)
    }
    return instances
  }

  moveTo(o: ObjectInstance<P, S>, newPos: IPosition) {
    if (!this.instances.has(o)) { throw new Error('BUG: Trying to move an object that the framework is unaware of')}
    this.bush.remove(o)
    o.pos = newPos
    this.bush.insert(o)
  }

  delete(o: ObjectInstance<P, S>) {
    this.instances.delete(o)
    this.bush.remove(o)
  }

  deleteAll() {
    for (const o of this.instances) {
      this.bush.remove(o)
    }
    this.instances.clear()
  }
}


// An animated set of Images
class Sprite {
  startTick: number = 0
  readonly playbackRate: number // 1 == every tick. 30 = every 30 ticks (1/2 a second)
  images: Image[]

  constructor(playbackRate: number, images: Image[]) {
    this.playbackRate = playbackRate
    this.images = images
    // validate the images are not null
    for (const s of this.images) {
      if (s === null) { throw new Error(`ERROR: sprites need to be non-null`)}
    }
  }

  static forSingleImage(s: Image) {
    return new Sprite(1, [s])
  }

  tick(curTick: number) {
    if (this.images.length === 1) { 
      if (!this.images[0]) { throw new Error(`BUG: Could not find sprite since there should only be one`)}
      return this.images[0]
    }

    const i = Math.round((curTick - this.startTick) / this.playbackRate)
    const ret = this.images[i % this.images.length]
    if (!ret) { throw new Error(`BUG: Could not find sprite with index i=${i} . len=${this.images.length}`)}
    return ret
  }
}

type Pixel = (string | null)
type Size = {
  width: number
  height: number
}

class Image {
  public readonly pixels: Pixel[][]
  constructor(pixels: Pixel[][]) {
    this.pixels = pixels
  }
  getDimension(): Size {
    return {
      width: this.pixels[0].length,
      height: this.pixels.length
    }
  }
  getBBox(): BBox {
    const {width, height} = this.getDimension()
    return {
      minX: 0,
      minY: 0,
      maxX: width,
      maxY: height
    }
  }
}

class Engine {
  private curTick: number = 0
  private readonly game: Game
  private readonly renderer: Renderer
  private readonly bush: RBush<ObjectInstance<any, any>>
  private readonly sprites: SpriteController
  private readonly instances: InstanceController
  private readonly camera: Camera
  private readonly gamepad: Gamepad

  constructor(game: Game, renderer: Renderer) {
    this.bush = new MyRBush()
    this.sprites = new DefiniteMap<Sprite>()
    this.instances = new InstanceController(this.bush)
    this.camera = new Camera({width: 128, height: 128})
    this.gamepad = new KeyboardGamepad()
    this.renderer = renderer
    this.game = game
  }

  tick() {
    if (this.curTick === 0) {
      this.game.load(this.gamepad, this.sprites)
      this.game.init(this.sprites, this.instances)
    }
    this.curTick++
    this.game.update(this.gamepad, this.sprites, this.instances, this.camera)
    this.gamepad.reset()
    this.draw()
  }

  private draw() {
    // get all the sprites visible to the camera
    const tiles = this.bush.search(this.camera.toBBox())

    this.renderer.drawStart()
    for (const t of tiles) {
      const image = t.static.sprite.tick(this.curTick)
      if (!image) { throw new Error(`BUG: Could not find image for the sprite.`)}
      this.drawPixels(relativeTo(t.pos, this.camera.pos), image.pixels, t.hFlip, false)
    }
    this.renderer.drawEnd()
  }

  private drawPixels(screenPos: IPosition, pixels: Pixel[][], hFlip: boolean, vFlip: boolean) {
    const height = pixels.length
    let relY = 0
    for (const row of pixels) {
      const width = row.length
      let relX = 0
      for (const pixel of row) {
        const x = screenPos.x + (hFlip ? width - relX: relX)
        const y = screenPos.y + (vFlip ? height - relY: relY)
        if (pixel !== null && x >= 0 && y >= 0) {
          const pos = {x, y}
          this.renderer.drawPixel(pos, pixel)
        }
        relX++
      }
      relY++
    }
    
  }
}

function relativeTo(pos1: IPosition, pos2: IPosition): IPosition {
  return {
    x: pos1.x - pos2.x,
    y: pos1.y - pos2.y
  }
}

interface Game {
  load(gamepad: Gamepad, sprites: SpriteController)
  init(sprites: SpriteController, instances: InstanceController)
  update(gamepad: Gamepad, sprites: SpriteController, instances: InstanceController, camera: Camera)
}

class Camera {
  public pos: IPosition
  private dim: Size

  constructor(dim: Size) {
    this.dim = dim
    this.pos = {x: 0, y: 0}
  }

  public toBBox(): BBox {
    const {width, height} = this.dim
    return {
      minX: this.pos.x,
      maxX: this.pos.x + width,
      minY: this.pos.y,
      maxY: this.pos.y + height
    }
  }
}


class InstanceController {
  private readonly bush: RBush<ObjectInstance<any, any>>
  private instances: Map<String, GameObject> = new Map()

  constructor(bush: RBush<ObjectInstance<any, any>>) {
    this.bush = bush
  }

  factory(name: String, sprite: Sprite) {
    let i = this.instances.get(name)
    if (i === undefined) {
      i = new GameObject(this.bush, sprite)
      this.instances.set(name, i)
      return i
    }
    return i
  }

  findAll(name: string) {
    const i = this.instances.get(name)
    if (i === undefined) { throw new Error(`BUG: Could not find tile named "${name}". Currently have the following: ${JSON.stringify([...this.instances.keys()])}`)}
    return [...i.instances]
  }
}


// Prepare the keyboard handler
if (process.stdin.setRawMode) {
  process.stdin.setRawMode(true)
} else {
  throw new Error(`ERROR: stdin does not allow setting setRawMode (we need that for keyboard input`)
}
process.stdin.resume()
process.stdin.setEncoding('utf8')

interface Gamepad {
  reset(): void
  dpadDir(): number
  isDpadPressed(): boolean
  listenToDpad()
}

class KeyboardGamepad implements Gamepad {
  private isSubscribedToDpad = false
  private zeroToFour: number | undefined

  reset() {
    this.zeroToFour = undefined
  }
  dpadDir() {
    if (!this.isSubscribedToDpad) { throw new Error(`ERROR: remember to call controller.listenToDpad() during loading if your game requires it`)}
    if (this.zeroToFour === undefined) { throw new Error(`ERROR: Check that one of the dpad directions was pressed`)}
    return this.zeroToFour
  }

  isDpadPressed() {
    if (!this.isSubscribedToDpad) { throw new Error(`ERROR: remember to call controller.listenToDpad() during loading if your game requires it`)}
    return this.zeroToFour !== undefined
  }

  listenToDpad() {
    this.isSubscribedToDpad = true

    // Prepare the keyboard handler
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true)
    } else {
        throw new Error(`ERROR: stdin does not allow setting setRawMode (we need that for keyboard input`)
    }
    process.stdin.resume()
    process.stdin.setEncoding('utf8')

    // https://stackoverflow.com/a/30687420
    process.stdin.on('data', async (key: string) => {
        switch (key) {
            case 'W':
            case 'w':
            case '\u001B\u005B\u0041': // UP-ARROW
                this.zeroToFour = 1; break
            case 'S':
            case 's':
            case '\u001B\u005B\u0042': // DOWN-ARROW
                this.zeroToFour = 3; break
            case 'A':
            case 'a':
            case '\u001B\u005B\u0044': // LEFT-ARROW
                this.zeroToFour = 2; break
            case 'D':
            case 'd':
            case '\u001B\u005B\u0043': // RIGHT-ARROW
                this.zeroToFour = 0; break
            // case 'X':
            // case 'x':
            // case ' ':
            // case '\u000D':
            //     this.actionKey = true; break
            case '\u0003': // Ctrl+C
            case '\u001B': // Escape
                return process.exit(1)
            default:
                console.log(`Did not understand key pressed: "${key}"`)
        }
    })
  }
}

interface Renderer {
  drawStart(): void
  drawEnd(): void
  drawPixel(pos: IPosition, hex: string): void
}


class TerminalRenderer implements Renderer {
  drawStart() {
    clearScreen()
  }
  drawEnd() { }
  drawPixel(pos: IPosition, hex: string) {
    if (pos.x < 0 || pos.y < 0) { throw new Error(`BUG: Tried to draw outside of the camera range ${JSON.stringify(pos)}`)}
    process.stdout.write(
      setMoveTo(pos.x * 2, pos.y) +
      setBgColor(hex) +
      '  ' +
      setBgColor('#000000') // reset back to black
    )
  }
}



// Determine if this
// 'truecolor' if this terminal supports 16m colors. 256 colors otherwise
const supports16mColors = process.env.COLORTERM === 'truecolor'

function setBgColor(hex: string) {
    if (supports16mColors) {
        return ansiStyles.bgColor.ansi16m.hex(hex)
    } else {
      // console.log(ansiStyles)
        return ansiStyles.bgColor.ansi256.hex(hex)
    }
}

function setFgColor(hex: string) {
    if (supports16mColors) {
        return ansiStyles.color.ansi16m.hex(hex)
    } else {
        return ansiStyles.color.ansi256.hex(hex)
    }
}
function writeBgColor(hex: string) {
    process.stdout.write(setBgColor(hex))
}
function writeFgColor(hex: string) {
    process.stdout.write(setFgColor(hex))
}
function setMoveTo(x: number, y: number) {
    return ansiEscapes.cursorTo(x, y)
}
function setShowCursor() {
    return ansiEscapes.cursorShow
}
function clearScreen() {
    process.stdout.write(ansiEscapes.clearScreen)
}



class DefiniteMap<V> {
  private readonly map: Map<string, V> = new Map()

  add(key: string, value: V) {
    if (this.map.has(key)) { throw new Error(`BUG: Trying to add item (sprite) when there is another item that already exists with the same name "${key}"`)}
    this.map.set(key, value)
  }

  get(key: string) {
    const value = this.map.get(key)
    if (value === undefined) { throw new Error(`ERROR: Could not find item (sprite) named ${key}`) }
    return value
  }
}

type SpriteController = DefiniteMap<Sprite>

enum DPAD {
  RIGHT = 0,
  UP = 1,
  LEFT = 2,
  DOWN = 3,
}






// Below is the code for a simple game.
// It shows how the game code is organized.






class MyGame implements Game {
  
  load(gamepad: Gamepad, sprites: SpriteController) {
    gamepad.listenToDpad()

    const images = new DefiniteMap<Image>()

    const z = null // transparent
    const K = '#000000' // (black)
    const B = '#1D2B53' // (dark blue)
    const P = '#7E2553' // (dark purple)
    const G = '#008751' // (dark green)
    const R = '#AB5236' // (red)
    const Y = '#5F574F' // brown??? kinda grey
    const W = '#C2C3C7' // (dark grey)
    const w = '#FFF1E8' // (light grey)
    const r = '#FF004D' // (light red)
    const o = '#FFA300' // (orange?)
    const y = '#FFF024' // (yellow aka light brown)
    const g = '#00E756' // (light green)
    const b = '#29ADFF' // (light blue)
    const c = '#83769C' // (light cyan?)
    const p = '#FF77A8' // (light purple)
    const k = '#FFCCAA' // (light brown)

    images.add('playerTop1', new Image([
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,g,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,B,w,w,w,B,w],
    ]))

    images.add('playerTop2', new Image([
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,g,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,W,W,w,W,W,w],
    ]))

    images.add('playerTop3', new Image([
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,g,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,p,p,w,p,p,w],
    ]))

    images.add('playerTop4', new Image([
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,B,w,w,w,B,w],
      [W,w,w,w,B,w,w,w],
    ]))

    images.add('playerTop5', new Image([
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,g,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,B,w,w,w,B,w],
      [W,w,w,w,B,B,w,w],
      [z,W,w,w,w,w,w,z],
    ]))

    images.add('playerTop6', new Image([
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,g,g,r,z,z,z,z],
      [z,z,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,B,w,w,w,B,w],
      [W,w,w,w,B,B,w,w],
    ]))

    images.add('playerBottom1', new Image([
      [W,w,w,w,w,w,w,w],
      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,z,w,w,w,w,z,z],
      [z,w,w,w,w,w,W,z],
      [z,z,W,w,w,w,z,z],
      [z,z,W,w,w,w,z,z],
      [z,z,W,z,z,W,z,z],
    ]))

    images.add('playerBottom2', new Image([
      [W,w,w,w,w,w,w,w],
      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,z,w,w,w,w,z,z],
      [z,w,w,w,w,w,W,z],
      [z,z,W,w,K,w,z,z],
      [z,z,W,w,w,w,z,z],
      [z,z,W,z,z,W,z,z],
    ]))

    images.add('playerBottom3', new Image([
      [W,w,w,w,w,w,w,w],
      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,z,w,w,w,w,z,z],
      [z,w,w,w,w,w,W,z],
      [z,z,W,w,w,w,z,z],
      [z,z,W,w,w,w,z,z],
      [z,z,W,z,z,W,z,z],
    ]))

    images.add('playerBottom4', new Image([
      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,z,w,w,w,w,z,z],
      [z,z,w,w,w,w,z,z],
      [z,w,W,w,w,w,W,z],
      [z,z,w,w,w,w,z,z],
      [z,z,z,z,z,w,z,z],
      [z,z,z,z,z,W,z,z],
    ]))

    images.add('playerBottom5', new Image([
      [z,z,z,W,w,z,z,z],
      [z,z,w,w,w,w,z,z],
      [z,w,w,w,w,w,W,z],
      [z,z,w,w,w,w,z,z],
      [z,z,w,w,w,w,z,z],
      [z,z,W,z,W,w,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
    ]))

    images.add('playerBottom6', new Image([
      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,w,w,w,w,w,W,z],
      [z,z,w,w,w,w,z,z],
      [z,z,W,w,w,w,z,z],
      [z,z,w,w,w,w,z,z],
      [z,z,W,w,W,z,z,z],
      [z,z,z,W,z,z,z,z],
    ]))

    sprites.add('playerJumpTop', new Sprite(5, [
      images.get('playerTop1'),
      images.get('playerTop2'),
      images.get('playerTop3'),
      images.get('playerTop4'),
      images.get('playerTop5'),
      images.get('playerTop6'),
    ]))

    sprites.add('playerJumpBottom', new Sprite(5, [
      images.get('playerBottom1'),
      images.get('playerBottom2'),
      images.get('playerBottom3'),
      images.get('playerBottom4'),
      images.get('playerBottom5'),
      images.get('playerBottom6'),
    ]))

  }

  init(sprites: SpriteController, instances: InstanceController) {
    instances.factory('playerTop', sprites.get('playerJumpTop')).new({x: 2, y: 2})
    instances.factory('playerBottom', sprites.get('playerJumpBottom')).new({x: 2, y: 2 + 8})
  }

  update(gamepad: Gamepad, sprites: SpriteController, instances: InstanceController, camera: Camera) {
    const playerTops = instances.findAll('playerTop')
    const playerBottoms = instances.findAll('playerBottom')
    const players = setUnion(playerTops, playerBottoms)

    for (const p of players) {
      if (gamepad.isDpadPressed()) {
        const dir = gamepad.dpadDir()

        // Flip the sprite if we press left/right
        p.hFlip = dir === DPAD.LEFT ? true : dir === DPAD.RIGHT ? false : p.hFlip

        p.moveTo({
          x: p.pos.x + (dir === DPAD.RIGHT ? 1 : dir === DPAD.LEFT ? -1 : 0),
          y: p.pos.y + (dir === DPAD.DOWN  ? 1 : dir === DPAD.UP   ? -1 : 0),
        })
      }
    }
  }
}

















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

const engine = new Engine(new MyGame(), new TerminalRenderer())



const sleep = async (ms: number) => new Promise((resolve, reject) => {
  setTimeout(resolve, ms)
})

const run = async () => {
  while (true) {
    await sleep(16) // 60 fps = 1000/60 = 16.6666ms
    engine.tick()
  }
}

run().then(null, (err) => {
  console.error(err)
  process.exit(111)
})