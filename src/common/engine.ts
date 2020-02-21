import Rbush from 'rbush'
import { IGamepad } from './gamepad'

class MyRBush extends Rbush<ObjectInstance<any, any>> {
  toBBox (item: ObjectInstance<any, any>) { return item.toBBox() }
  compareMinX (a: ObjectInstance<any, any>, b: ObjectInstance<any, any>) { return a.pos.x - b.pos.x }
  compareMinY (a: ObjectInstance<any, any>, b: ObjectInstance<any, any>) { return a.pos.y - b.pos.y }
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

export interface IPosition {
  readonly x: number
  readonly y: number
}

export type Opt<T> = null | T

export class ObjectInstance<P, S> {
  public pos: IPosition
  offsetPos: IPosition
  _zIndex: Opt<number>

  public static: GameObject<P, S>
  sprite: Sprite
  startTick: number = 0
  maskColor: Opt<string>
  isGrayscale: boolean
  public props: P
  public hFlip: boolean

  constructor (t: GameObject<P, S>, pos: IPosition, props: P) {
    this._zIndex = null
    this.sprite = t.sprite
    this.static = t
    this.pos = pos
    this.props = props
    this.hFlip = false
    this.offsetPos = { x: 0, y: 0 }
  }

  destroy () {
    this.static.delete(this)
  }

  moveTo (pos: IPosition) {
    // delegate
    this.static.moveTo(this, pos)
  }

  toBBox (): BBox {
    return { minX: this.pos.x, minY: this.pos.y, maxX: this.pos.x, maxY: this.pos.y }
  }

  setSprite (sprite: Sprite) {
    // only change the sprite when it is different
    if (this.sprite !== sprite) {
      this.sprite = sprite
      this.startTick = 0
    }
  }

  setMask (hexColor: Opt<string>, isGrayscale: boolean = false) {
    this.maskColor = hexColor
    this.isGrayscale = isGrayscale
  }

  zIndex () {
    return this._zIndex === null ? this.static.zIndex : this._zIndex
  }

  getPixelPos (grid: Size) {
    return posAdd(posTimes(this.pos, grid), this.offsetPos)
  }
}

export class GameObject<P = {}, S = {}> {
  private readonly bush: RBush<ObjectInstance<{}, {}>>
  readonly sprite: Sprite
  readonly zIndex: Opt<number>
  readonly instances: Set<ObjectInstance<any, any>> = new Set()
  readonly updateFn: UpdateFn<P, S>
  public props: S

  constructor (bush: RBush<ObjectInstance<{}, {}>>, sprite: Sprite, zIndex: Opt<number>, updateFn: UpdateFn<P, S>) {
    this.bush = bush
    this.sprite = sprite
    this.zIndex = zIndex
    this.updateFn = updateFn
  }

  public new (pos: IPosition): ObjectInstance<any, any> {
    const o = new ObjectInstance(this, pos, {})
    this.instances.add(o)
    this.bush.insert(o)
    return o
  }

  public newBulk (positions: IPosition[]) {
    const instances = positions.map(p => new ObjectInstance<any, any>(this, p, {}))
    this.bush.load(instances)
    for (const o of instances) {
      this.instances.add(o)
    }
    return instances
  }

  moveTo (o: ObjectInstance<P, S>, newPos: IPosition) {
    if (!this.instances.has(o)) { throw new Error('BUG: Trying to move an object that the framework is unaware of') }
    if (Number.isNaN(newPos.x) || Number.isNaN(newPos.y)) {
      throw new Error(`Position neeeds to have numbers as their coordinates. At least one of them was not a number. (${newPos.x}, ${newPos.y})`)
    }
    if (newPos.x !== Math.floor(newPos.x) || newPos.y !== Math.floor(newPos.y)) {
      throw new Error('BUG: coordinates need to be whole numbers')
    }
    this.bush.remove(o)
    o.pos = newPos
    this.bush.insert(o)
  }

  delete (o: ObjectInstance<P, S>) {
    this.instances.delete(o)
    this.bush.remove(o)
  }

  deleteAll () {
    for (const o of this.instances) {
      this.bush.remove(o)
    }
    this.instances.clear()
  }
}

// An animated set of Images
export class Sprite {
  _name: string
  readonly playbackRate: number // 1 == every tick. 30 = every 30 ticks (1/2 a second)
  images: Image[]
  loop: boolean

  constructor (playbackRate: number, loop: boolean, images: Image[]) {
    if (Math.floor(playbackRate) !== playbackRate || playbackRate < 0) {
      throw new Error('The rate is the number of ticks to wait before moving to the next sprite. It should be a whole non-negative number')
    }
    this._name = ''
    this.loop = loop
    this.playbackRate = playbackRate
    this.images = images
    // validate the images are not null
    for (const s of this.images) {
      if (s === null) { throw new Error('ERROR: sprites need to be non-null') }
    }
  }

  static forSingleImage (s: Image) {
    return new Sprite(1, false, [s])
  }

  tick (startTick: number, curTick: number) {
    if (this.images.length === 0) {
      throw new Error('BUG: Could not find sprite since there should only be one')
    }
    const i = Math.round((curTick - startTick) / this.playbackRate)
    let ret: Image

    if (this.loop) {
      ret = this.images[i % this.images.length]
    } else {
      ret = this.images[Math.min(i, this.images.length - 1)]
    }

    if (!ret) { throw new Error(`BUG: Could not find sprite with index i=${i} . len=${this.images.length}`) }
    return ret
  }
}

export type IPixel = (string | null)
export interface Size {
  width: number
  height: number
}

export class Image {
  public readonly pixels: IPixel[][]
  constructor (pixels: IPixel[][]) {
    this.pixels = pixels
  }

  getDimension (): Size {
    return {
      width: this.pixels[0].length,
      height: this.pixels.length
    }
  }

  getBBox (): BBox {
    const { width, height } = this.getDimension()
    return {
      minX: 0,
      minY: 0,
      maxX: width,
      maxY: height
    }
  }
}

export class CollisionChecker {
  private readonly grid: Size
  private readonly bush: RBush<ObjectInstance<any, any>>
  constructor (grid: Size, bush: RBush<ObjectInstance<any, any>>) {
    this.grid = grid
    this.bush = bush
  }

  searchBBox (bbox: BBox) {
    return this.bush.search(bbox) // .sort(zIndexComparator)
  }

  searchPoint (pos: IPosition) {
    return this.searchBBox({
      minX: pos.x,
      maxX: pos.x,
      minY: pos.y,
      maxY: pos.y
    })
  }
}

export type PaintFn = (message: string[], camera: Camera, startTick: number, currentTick: number, drawPixelsFn: DrawPixelsFn) => void
export interface Dialog {message: string, startTick: number, target: Opt<IPosition>, additional: Opt<SimpleObject>}

export class Engine {
  private curTick: number = 0
  private readonly game: Game
  private readonly outputter: IOutputter
  private readonly bush: RBush<ObjectInstance<any, any>>
  private readonly collisionChecker: CollisionChecker
  private readonly sprites: SpriteController
  private readonly instances: InstanceController
  private readonly camera: Camera
  private readonly gamepad: IGamepad
  private readonly overlayState: SimpleObject
  private pendingDialog: Opt<Dialog>
  private readonly grid: Size

  constructor (game: Game, outputter: IOutputter, gamepad: IGamepad) {
    this.bush = new MyRBush()
    this.sprites = new DefiniteMap<Sprite>()
    this.instances = new InstanceController(this.bush)
    this.camera = new Camera({ width: 24 * 2, height: 12 * 2 })
    this.gamepad = gamepad
    this.outputter = outputter
    this.game = game
    this.pendingDialog = null
    this.overlayState = {}

    this.showDialog = this.showDialog.bind(this)

    const { grid } = this.game.load(this.gamepad, this.sprites)
    this.grid = grid
    this.collisionChecker = new CollisionChecker(grid, this.bush)

    // For debugging attach a name to each sprite
    for (const [name, sprite] of this.sprites.entries()) {
      sprite._name = name
    }

    this.game.init(this.sprites, this.instances)
  }

  tick () {
    this.curTick++
    this.gamepad.tick()

    // Update each object
    // TODO: Only update objects in view or ones that have an alwaysUpdate=true flag set (TBD)
    this.bush.all().forEach(i => {
      i.static.updateFn(i, this.gamepad, this.collisionChecker, this.sprites, this.instances, this.camera, this.showDialog, this.overlayState, this.curTick)
    })

    this.draw()
  }

  private draw () {
    // get all the sprites visible to the camera
    const tiles = this.bush.search(this.camera.toBBox())

    // Lower zIndex needs to be drawn later
    tiles.sort(zIndexComparator)
    tiles.reverse()

    this.outputter.draw(this.game, tiles, this.camera, this.curTick, this.grid, this.overlayState, this.pendingDialog, this.sprites)
    this.pendingDialog = null
  }

  showDialog (message: string, target: Opt<IPosition>, additional: Opt<SimpleObject>) {
    if (!this.pendingDialog || this.pendingDialog.message !== message) {
      this.pendingDialog = {
        message,
        target,
        additional,
        startTick: this.curTick
      }
    }
  }
}

export type DrawPixelsFn = (screenPos: IPosition, pixels: IPixel[][], hFlip: boolean, vFlip: boolean) => void
export type DrawTextFn = (screenPos: IPosition, letters: string, hexColor: string) => void

export type SimpleValue = null | boolean | number | string | SimpleValue[]

export interface SimpleObject {
  [key: string]: SimpleValue
}

export interface Game {
  load(gamepad: IGamepad, sprites: SpriteController): {grid: Size}
  init(sprites: SpriteController, instances: InstanceController)
  drawBackground(tiles: Array<ObjectInstance<any, any>>, camera: Camera, drawPixelsFn: DrawPixelsFn)
  drawOverlay(drawPixelsFn: DrawPixelsFn, drawTextFn: DrawTextFn, additional: SimpleObject, sprites: SpriteController)
  drawDialog(message: string, drawPixelsFn: DrawPixelsFn, drawTextFn: DrawTextFn, elapsedMs: number, target: Opt<IPosition>, additional: Opt<SimpleObject>)
}

export class Camera {
  public pos: IPosition
  private dim: Size

  constructor (dim: Size) {
    this.dim = dim
    this.pos = { x: 0, y: 0 }
  }

  public size () { return this.dim }
  public resize (dim: Size) { this.dim = dim }

  public toBBox (): BBox {
    const { width, height } = this.dim
    const w = width / 2
    const h = height / 2
    return {
      minX: this.pos.x - w,
      maxX: this.pos.x + w,
      minY: this.pos.y - h,
      maxY: this.pos.y + h
    }
  }

  public topLeft (): IPosition {
    const bbox = this.toBBox()
    return {
      x: bbox.minX,
      y: bbox.minY
    }
  }

  track (target: IPosition) {
    this.pos = target
  }

  nudge (target: IPosition, xAmount: number | null, yAmount: number | null) {
    const { x, y } = this.pos

    this.pos = {
      x: boxNudge(x, target.x, xAmount),
      y: boxNudge(y, target.y, yAmount)
    }
  }
}

function boxNudge (source: number, target: number, leashLength: number | null) {
  if (leashLength === null) return source

  const diff = target - source
  if (diff > leashLength) {
    return source + (diff - leashLength)
  } else if (diff < -leashLength) {
    return source + (diff + leashLength)
  }
  return source
}

export type ShowDialogFn = (message: string, target: Opt<IPosition>, additional: Opt<SimpleObject>) => void
export type UpdateFn<P, S> = (o: ObjectInstance<P, S>, gamepad: IGamepad, collisionCheker: CollisionChecker, sprites: SpriteController, instances: InstanceController, camera: Camera, showDialogFn: ShowDialogFn, overlayState: SimpleObject, currentTick: number) => void

export class InstanceController {
  private readonly bush: RBush<ObjectInstance<any, any>>
  private readonly instances: Map<String, GameObject> = new Map()

  constructor (bush: RBush<ObjectInstance<any, any>>) {
    this.bush = bush
  }

  simple (sprites: SpriteController, name: string, zIndex: Opt<number>) {
    return this.factory(name, sprites.get(name), zIndex, () => null)
  }

  factory (name: String, sprite: Sprite, zIndex: Opt<number>, fnUpdate: UpdateFn<any, any>) {
    let i = this.instances.get(name)
    if (i === undefined) {
      i = new GameObject(this.bush, sprite, zIndex, fnUpdate)
      this.instances.set(name, i)
      return i
    }
    return i
  }

  findAll (name: string) {
    const i = this.instances.get(name)
    if (i === undefined) { throw new Error(`BUG: Could not find tile named "${name}". Currently have the following: ${JSON.stringify([...this.instances.keys()])}`) }
    return [...i.instances]
  }
}

export interface IOutputter {
  draw(game: Game, tiles: Array<ObjectInstance<any, any>>, camera: Camera, curTick: number, grid: Size, overlayState: SimpleObject, pendingDialog: Opt<Dialog>, sprites: SpriteController): void
}

export class DefiniteMap<V> {
  private readonly map: Map<string, V> = new Map()

  add (key: string, value: V) {
    if (this.map.has(key)) { throw new Error(`BUG: Trying to add item (sprite) when there is another item that already exists with the same name "${key}"`) }
    this.map.set(key, value)
  }

  get (key: string) {
    const value = this.map.get(key)
    if (value === undefined) { throw new Error(`ERROR: Could not find item (sprite) named ${key}`) }
    return value
  }

  entries () {
    return this.map.entries()
  }
}

export type SpriteController = DefiniteMap<Sprite>

export enum DPAD {
  RIGHT = 0,
  UP = 1,
  LEFT = 2,
  DOWN = 3,
}

export function zIndexComparator (a: ObjectInstance<any, any>, b: ObjectInstance<any, any>) {
  const az = a.zIndex()
  const bz = b.zIndex()
  const aNull = az === undefined || az === null
  const bNull = bz === undefined || bz === null
  if (aNull && bNull) {
    return 0
  } else if (bNull) {
    return 1
  } else if (aNull) {
    return -1
  } else {
    return az - bz
  }
}

export function posAdd (pos1: IPosition, pos2: IPosition): IPosition {
  return {
    x: pos1.x + pos2.x,
    y: pos1.y + pos2.y
  }
}

export function posTimes (pos: IPosition, size: Size): IPosition {
  if (!pos || !size) { throw new Error(`pos=${JSON.stringify(pos)} size=${JSON.stringify(size)}`) }
  return {
    x: pos.x * size.width,
    y: pos.y * size.height
  }
}

export function bboxTimes (bbox: BBox, size: Size): BBox {
  if (!(size.width > 0) || !(size.height > 0)) { throw new Error(`BUG: Invalid Size: ${JSON.stringify(size)}`) }
  return {
    minX: bbox.minX * size.width,
    maxX: bbox.maxX * size.width,
    minY: bbox.minY * size.height,
    maxY: bbox.maxY * size.height
  }
}
