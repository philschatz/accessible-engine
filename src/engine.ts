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

export interface IPosition {
  readonly x: number
  readonly y: number
}

export class ObjectInstance<P, S> {
  public pos: IPosition
  public zIndex: number | undefined // lower is on top

  public static: GameObject<P, S>
  sprite: Sprite
  startTick: number = 0
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

  setSprite(sprite: Sprite) {
    // only change the sprite when it is different
    if (this.sprite !== sprite) {
      this.sprite = sprite
      this.startTick = 0
    }
  }
}

export class GameObject<P = {}, S = {}> {
  private readonly bush: RBush<ObjectInstance<{},{}>>
  readonly sprite: Sprite
  readonly instances: Set<ObjectInstance<any, any>> = new Set()
  readonly updateFn: UpdateFn<P, S>
  public props: S

  constructor(bush: RBush<ObjectInstance<{},{}>>, sprite: Sprite, updateFn: UpdateFn<P, S>) {
    this.bush = bush
    this.sprite = sprite
    this.updateFn = updateFn
  }

  public new(pos: IPosition): ObjectInstance<any, any> {
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

  tick(startTick: number, curTick: number) {
    if (this.images.length === 1) { 
      if (!this.images[0]) { throw new Error(`BUG: Could not find sprite since there should only be one`)}
      return this.images[0]
    }

    const i = Math.round((curTick - startTick) / this.playbackRate)
    const ret = this.images[i % this.images.length]
    if (!ret) { throw new Error(`BUG: Could not find sprite with index i=${i} . len=${this.images.length}`)}
    return ret
  }
}

export type IPixel = (string | null)
type Size = {
  width: number
  height: number
}

export class Image {
  public readonly pixels: IPixel[][]
  constructor(pixels: IPixel[][]) {
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
    return this.bush.search(bbox) //.sort(zIndexComparator)
  }

  searchPoint(pos: IPosition) {
    return this.searchBBox({
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
  private readonly renderer: IRenderer
  private readonly bush: RBush<ObjectInstance<any, any>>
  private readonly collisionChecker: CollisionChecker
  private readonly sprites: SpriteController
  private readonly instances: InstanceController
  private readonly camera: Camera
  private readonly gamepad: IGamepad

  constructor(game: Game, renderer: IRenderer, gamepad: IGamepad) {
    this.bush = new MyRBush()
    this.collisionChecker = new CollisionChecker(this.bush)
    this.sprites = new DefiniteMap<Sprite>()
    this.instances = new InstanceController(this.bush)
    this.camera = new Camera({width: 128, height: 96})
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

    // Lower zIndex needs to be drawn later
    tiles.sort(zIndexComparator)

    this.renderer.drawStart()

    this.game.drawBackground(tiles, this.camera, this.drawPixels.bind(this))

    for (const t of tiles) {
      if (t.startTick === 0) { t.startTick = this.curTick }
      const image = t.sprite.tick(t.startTick, this.curTick)
      if (!image) { throw new Error(`BUG: Could not find image for the sprite.`)}
      const screenPos = relativeTo({x: t.pos.x, y: t.pos.y - image.pixels.length + 1 /* Shift the image up because it might not be a 8x8 sprite, like if it is a tall person */}, this.camera.topLeft())
      this.drawPixels(screenPos, image.pixels, t.hFlip, false)
    }
    this.renderer.drawEnd()
  }

  private drawPixels(screenPos: IPosition, pixels: IPixel[][], hFlip: boolean, vFlip: boolean) {
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
  load(gamepad: IGamepad, sprites: SpriteController)
  init(sprites: SpriteController, instances: InstanceController)
  drawBackground(tiles: ObjectInstance<any, any>[], camera: Camera, drawPixelsFn: (screenPos: IPosition, pixels: IPixel[][], hFlip: boolean, vFlip: boolean) => void)
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
    const w = width / 2
    const h = height / 2
    return {
      minX: this.pos.x - w,
      maxX: this.pos.x + w,
      minY: this.pos.y - h,
      maxY: this.pos.y + h
    }
  }

  public topLeft(): IPosition {
    const bbox = this.toBBox()
    return {
      x: bbox.minX,
      y: bbox.minY
    }
  }

  track(target: IPosition) {
    this.pos = target
  }

  nudge(target: IPosition, xAmount: number | null, yAmount: number | null) {
    const {x, y} = this.pos
  
    this.pos = {
      x: boxNudge(x, target.x, xAmount),
      y: boxNudge(y, target.y, yAmount)
    }  
  }
}

function boxNudge(source: number, target: number, leashLength: number | null) {
  if (leashLength === null) return source

  let diff = target - source
  if (diff > leashLength) {
    return source + (diff - leashLength)
  } else if (diff < -leashLength) {
    return source + (diff + leashLength)
  }
  return source
}

type UpdateFn<P, S> = (o: ObjectInstance<P, S>, gamepad: IGamepad, collisionCheker: CollisionChecker, sprites: SpriteController, instances: InstanceController, camera: Camera) => void

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

export enum DIRECTION {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export interface IGamepad {
  listenTo(btns: BUTTON_TYPE[])
  isButtonPressed(btn: BUTTON_TYPE): boolean
}


export interface IRenderer {
  drawStart(): void
  drawEnd(): void
  drawPixel(pos: IPosition, hex: string): void
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

  entries() {
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


export class OrGamepad implements IGamepad {
  private pads: IGamepad[]
  constructor(pads: IGamepad[]) {
    this.pads = pads
  }

  listenTo(btns: BUTTON_TYPE[]) { for (const pad of this.pads) { pad.listenTo(btns) } }
  isButtonPressed(btn: BUTTON_TYPE) { for (const pad of this.pads) { if (pad.isButtonPressed(btn)) { return true } } return false }
}


export function zIndexComparator(a: ObjectInstance<any, any>, b: ObjectInstance<any, any>) {
  if (a.zIndex === undefined && b.zIndex === undefined) {
    return 0
  } else if (b.zIndex === undefined) {
    return 1
  } else if (a.zIndex === undefined) {
    return -1
  } else {
    return b.zIndex - a.zIndex
  }
}
