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
  all(): I[]
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

export class ObjectInstance<P, S> {
  public pos: IPosition

  public static: GameObject<P, S>
  public sprite: Sprite
  public props: P
  public hFlip: boolean

  constructor(t: GameObject<P, S>, pos: IPosition, props: P) {
    this.sprite = t.sprite
    this.static = t
    this.pos = pos
    this.props = props
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
  readonly updateFn: UpdateFn<P, S>
  public props: S

  constructor(bush: RBush<ObjectInstance<{},{}>>, sprite: Sprite, updateFn: UpdateFn<P, S>) {
    this.bush = bush
    this.sprite = sprite
    this.updateFn = updateFn
  }

  public new(pos: IPosition) {
    const o = new ObjectInstance(this, pos, {})
    this.instances.add(o)
    this.bush.insert(o)
    return o
  }

  public newBulk(positions: IPosition[]) {
    const instances = positions.map(p => new ObjectInstance<any, any>(this, p, {}))
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
export class Sprite {
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

export class Image {
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

export class CollisionChecker {
  private readonly bush: RBush<ObjectInstance<any, any>>
  constructor(bush: RBush<ObjectInstance<any, any>>) {
    this.bush = bush
  }

  searchBBox(bbox: BBox) {
    return this.bush.search(bbox)
  }

  searchPoint(pos: IPosition) {
    return this.bush.search({
      minX: pos.x,
      maxX: pos.x,
      minY: pos.y,
      maxY: pos.y,
    })
  }
}


export class Engine {
  private curTick: number = 0
  private readonly game: Game
  private readonly renderer: Renderer
  private readonly bush: RBush<ObjectInstance<any, any>>
  private readonly collisionChecker: CollisionChecker
  private readonly sprites: SpriteController
  private readonly instances: InstanceController
  private readonly camera: Camera
  private readonly gamepad: Gamepad

  constructor(game: Game, renderer: Renderer, gamepad: Gamepad) {
    this.bush = new MyRBush()
    this.collisionChecker = new CollisionChecker(this.bush)
    this.sprites = new DefiniteMap<Sprite>()
    this.instances = new InstanceController(this.bush)
    this.camera = new Camera({width: 128, height: 128})
    this.gamepad = gamepad
    this.renderer = renderer
    this.game = game
  }

  tick() {
    if (this.curTick === 0) {
      this.game.load(this.gamepad, this.sprites)
      this.game.init(this.sprites, this.instances)
    }
    this.curTick++

        // Update each object
    // TODO: Only update objects in view or ones that have an alwaysUpdate=true flag set (TBD)
    this.bush.all().forEach(i => {
      i.static.updateFn(i, this.gamepad, this.collisionChecker, this.sprites, this.instances, this.camera)
    })

    this.draw()
  }

  private draw() {
    // get all the sprites visible to the camera
    const tiles = this.bush.search(this.camera.toBBox())

    this.renderer.drawStart()
    for (const t of tiles) {
      const image = t.sprite.tick(this.curTick)
      if (!image) { throw new Error(`BUG: Could not find image for the sprite.`)}
      const screenPos = relativeTo({x: t.pos.x, y: t.pos.y - image.pixels.length + 1 /* Shift the image up because it might not be a 8x8 sprite, like if it is a tall person */}, this.camera.pos)
      this.drawPixels(screenPos, image.pixels, t.hFlip, false)
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

export interface Game {
  load(gamepad: Gamepad, sprites: SpriteController)
  init(sprites: SpriteController, instances: InstanceController)
}

export class Camera {
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

type UpdateFn<P, S> = (o: ObjectInstance<P, S>, gamepad: Gamepad, collisionCheker: CollisionChecker, sprites: SpriteController, instances: InstanceController, camera: Camera) => void

export class InstanceController {
  private readonly bush: RBush<ObjectInstance<any, any>>
  private instances: Map<String, GameObject> = new Map()

  constructor(bush: RBush<ObjectInstance<any, any>>) {
    this.bush = bush
  }

  simple(sprites: SpriteController, name: string) {
    return this.factory(name, sprites.get(name), () => null)
  }

  factory(name: String, sprite: Sprite, fnUpdate: UpdateFn<any, any>) {
    let i = this.instances.get(name)
    if (i === undefined) {
      i = new GameObject(this.bush, sprite, fnUpdate)
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

export interface Gamepad {
  reset(): void
  dpadDir(): number
  isDpadPressed(): boolean
  listenToDpad()
}

const KEY_REPEAT_WITHIN = 50

export class KeyboardGamepad implements Gamepad {
  private lastSaw = Date.now()
  private isSubscribedToDpad = false
  private zeroToFour: number | undefined = undefined

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
    // Node only receives key press events. If we have not seen a key press event recently then they are no longer pressing
    if (this.lastSaw + KEY_REPEAT_WITHIN < Date.now()) {
      return false
    }
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
        this.lastSaw = Date.now()
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
                this.zeroToFour = undefined
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



class DoubleArray<T> {
  private ary: T[][] = []
  private maxX = 0
  private maxY = 0

  clear() {
    this.ary = []
  }
  set(pos: IPosition, v: T) {
    if (!this.ary[pos.y]) { this.ary[pos.y] = [] }
    this.ary[pos.y][pos.x] = v

    this.maxY = Math.max(this.maxY, pos.y)
    this.maxX = Math.max(this.maxX, pos.x)
  }

  get(pos: IPosition, def: T): T {
    if (!this.ary[pos.y]) { return def }
    return this.ary[pos.y][pos.x] || def
  }

  dim() {
    return {
      width: this.maxX + 1,
      height: this.maxY + 1
    }
  }
}

const BLACK = '#000000'
const WHITE = '#ffffff'

export class DoubleTerminalRenderer implements Renderer {
  private pixelsOnScreen = new DoubleArray<Pixel>()
  private pixelsToDraw = new DoubleArray<Pixel>()

  drawStart() {
    this.pixelsToDraw.clear()
  }

  drawEnd() {
    const {width, height} = this.pixelsToDraw.dim()

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pos = {x, y}
        const toDraw = this.pixelsToDraw.get(pos, BLACK)
        if (this.pixelsOnScreen.get(pos, BLACK) !== toDraw) {
          this._drawSinglePixel(pos, toDraw)
        }
      }
    }
    
  }

  private _drawSinglePixel(pos: IPosition, hex: string) {
    const {columns, rows} = getTerminalSize()

    // do not draw past the terminal
    if (pos.x * 2 + 1 >= columns || pos.y >= rows) { return }  // +1 is just-in-case

    process.stdout.write(
      setMoveTo(pos.x * 2, pos.y) +
      setBgColor(hex) +
      '  ' +
      setBgColor(BLACK) // reset back to black
    )
    this.pixelsOnScreen.set(pos, hex)
  }

  drawPixel(pos: IPosition, hex: string) {
    if (pos.x < 0 || pos.y < 0) { throw new Error(`BUG: Tried to draw outside of the camera range ${JSON.stringify(pos)}`)}
    this.pixelsToDraw.set(pos, hex)
  }
}

export class TerminalRenderer implements Renderer {
  private pixelsOnScreen = new DoubleArray<Pixel>()
  private pixelsToDraw = new DoubleArray<Pixel>()

  drawStart() {
    this.pixelsToDraw.clear()
  }

  drawEnd() {
    const {width, height} = this.pixelsToDraw.dim()

    for (let yDouble = 0; yDouble < height; yDouble+=2) {
      for (let x = 0; x < width; x++) {
        const topPos = {x, y: yDouble}
        const bottomPos = {x, y: yDouble + 1}
        const topDraw = this.pixelsToDraw.get(topPos, BLACK)
        const bottomDraw = this.pixelsToDraw.get(bottomPos, BLACK)
        if (this.pixelsOnScreen.get(topPos, BLACK) !== topDraw || this.pixelsOnScreen.get(bottomPos, BLACK) !== bottomDraw) {
          this._drawTopBottomPixel({x, y: yDouble / 2}, topDraw, bottomDraw)
        }
      }
    }
    
  }

  private _drawTopBottomPixel(pos: IPosition, topHex: string, bottomHex: string) {
    const {columns, rows} = getTerminalSize()

    // do not draw past the terminal
    if (pos.x >= columns || pos.y * 2 >= rows) { return }

    process.stdout.write(
      setMoveTo(pos.x, pos.y) +
      setFgColor(bottomHex) +
      setBgColor(topHex) +
      '▄' +
      setFgColor(WHITE) + // reset fg to white
      setBgColor(BLACK) // reset back to black
    )
    this.pixelsOnScreen.set({x: pos.x, y: pos.y * 2}, topHex)
    this.pixelsOnScreen.set({x: pos.x, y: pos.y * 2 + 1}, bottomHex)
  }

  drawPixel(pos: IPosition, hex: string) {
    if (pos.x < 0 || pos.y < 0) { throw new Error(`BUG: Tried to draw outside of the camera range ${JSON.stringify(pos)}`)}
    this.pixelsToDraw.set(pos, hex)
  }
}


// TypeScript does not like that columns and rows might be null
function getTerminalSize() {
  return {
      columns: process.stdout.columns || 80,
      rows: process.stdout.rows || 25
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



export class DefiniteMap<V> {
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

export type SpriteController = DefiniteMap<Sprite>

export enum DPAD {
  RIGHT = 0,
  UP = 1,
  LEFT = 2,
  DOWN = 3,
}
