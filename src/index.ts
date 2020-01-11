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


class MyRBush extends Rbush<TileObject<any, any>> {
  toBBox(item: TileObject<any, any>) { return item.toBBox() }
  compareMinX(a: TileObject<any, any>, b: TileObject<any, any>) { return a.pos.x - b.pos.x }
  compareMinY(a: TileObject<any, any>, b: TileObject<any, any>) { return a.pos.y - b.pos.y }
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

class TileObject<P, S> {
  public pos: IPosition

  public static: Tile<P, S>
  public props: P
  public hFlip: boolean

  constructor(t: Tile<P, S>, pos: IPosition) {
    this.static = t
    this.pos = pos
    this.hFlip = false
  }

  destroy() {
    this.static.delete(this)
  }

  moveTo(pos: IPosition) {
    this.static.moveTo(this, pos)
    this.pos = pos
  }

  toBBox(): BBox {
    return {minX: this.pos.x, minY: this.pos.y, maxX: this.pos.x + 8, maxY: this.pos.y + 8}
  }
}

class Tile<P = {}, S = {}> {
  private readonly bush: RBush<TileObject<{},{}>>
  readonly sprite: AnimatedSprite
  readonly objects: Set<TileObject<P, S>> = new Set()
  public props: S

  constructor(bush: RBush<TileObject<{},{}>>, sprite: AnimatedSprite) {
    this.bush = bush
    this.sprite = sprite
  }

  public new(pos: IPosition) {
    const o = new TileObject(this, pos)
    this.objects.add(o)
    this.bush.insert(o)
    return o
  }

  public newBulk(positions: IPosition[]) {
    const objects = positions.map(p => new TileObject(this, p))
    this.bush.load(objects)
    for (const o of objects) {
      this.objects.add(o)
    }
    return objects
  }

  moveTo(o: TileObject<P, S>, pos: IPosition) {
    if (!this.objects.has(o)) { throw new Error('BUG: Trying to move an object that the framework is unaware of')}
    this.bush.remove(o)
    this.bush.insert(o)
  }

  delete(o: TileObject<P, S>) {
    this.objects.delete(o)
    this.bush.remove(o)
  }

  deleteAll() {
    for (const o of this.objects) {
      this.bush.remove(o)
    }
    this.objects.clear()
  }
}



class AnimatedSprite {
  startTick: number = 0
  readonly playbackRate: number // 1 == every tick. 30 = every 30 ticks (1/2 a second)
  sprites: Sprite[]

  constructor(playbackRate: number, sprites: Sprite[]) {
    this.playbackRate = playbackRate
    this.sprites = sprites
    // validate the sprites are not null
    for (const s of this.sprites) {
      if (s === null) { throw new Error(`ERROR: sprites need to be non-null`)}
    }
  }

  static forSingleSprite(s: Sprite) {
    return new AnimatedSprite(1, [s])
  }

  tick(curTick: number) {
    if (this.sprites.length === 1) { 
      if (!this.sprites[0]) { throw new Error(`BUG: Could not find sprite since there should only be one`)}
      return this.sprites[0]
    }

    const i = Math.round((curTick - this.startTick) / this.playbackRate)
    const ret = this.sprites[i % this.sprites.length]
    if (!ret) { throw new Error(`BUG: Could not find sprite with index i=${i} . len=${this.sprites.length}`)}
    return ret
  }
}

type Pixel = (string | null)
type Size = {
  width: number
  height: number
}

class Sprite {
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
  private readonly bush: RBush<TileObject<any, any>>
  private readonly tm: TileMaker
  private readonly camera: Camera
  private readonly gamepad: Gamepad

  constructor(game: Game, renderer: Renderer) {
    this.bush = new MyRBush()
    this.tm = new TileMaker(this.bush)
    this.camera = new Camera({width: 128, height: 128})
    this.gamepad = new KeyboardGamepad()
    this.renderer = renderer
    this.game = game
  }

  tick() {
    if (this.curTick === 0) {
      this.game.init(this.gamepad, this.tm)
    }
    this.curTick++
    this.game.update(this.gamepad, this.tm, this.camera)
    this.gamepad.reset()
    this.draw()
  }

  private draw() {
    // get all the sprites visible to the camera
    const tiles = this.bush.search(this.camera.toBBox())

    this.renderer.drawStart()
    for (const t of tiles) {
      const sprite = t.static.sprite.tick(this.curTick)
      if (!sprite) { throw new Error(`BUG: Could not find sprite.`)}
      this.drawPixels(relativeTo(t.pos, this.camera.pos), sprite.pixels, t.hFlip, false)
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
  init(gamepad: Gamepad, t: TileMaker)
  update(gamepad: Gamepad, t: TileMaker, camera: Camera): void
}

class Camera {
  public pos: IPosition
  private dim: Size

  constructor(dim: Size) {
    this.dim = dim
    this.pos = {x: 0, y: 0}
  }

  public toBBox(): BBox {
    return {
      minX: this.pos.x,
      maxX: this.pos.x + this.dim.width,
      minY: this.pos.y,
      maxY: this.pos.y + this.dim.height
    }
  }
}


class TileMaker {
  private readonly bush: RBush<TileObject<any, any>>
  private instances: Map<String, Tile> = new Map()

  constructor(bush: RBush<TileObject<any, any>>) {
    this.bush = bush
  }

  factory(name: String, sprite: AnimatedSprite) {
    let i = this.instances.get(name)
    if (i === undefined) {
      i = new Tile(this.bush, sprite)
      this.instances.set(name, i)
      return i
    }
    return i
  }

  findAll(name: string) {
    const i = this.instances.get(name)
    if (i === undefined) { throw new Error(`BUG: Could not find tile named "${name}". Currently have the following: ${JSON.stringify([...this.instances.keys()])}`)}
    return [...i.objects]
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
}

class KeyboardGamepad implements Gamepad {
  private zeroToFour: number | undefined

  constructor() {
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
  reset() {
    this.zeroToFour = undefined
  }
  dpadDir() {
    if (this.zeroToFour === undefined) { throw new Error(`ERROR: Check that one of the dpad directions was pressed`)}
    return this.zeroToFour
  }

  isDpadPressed() { return this.zeroToFour !== undefined }

  setDpad(zeroToFour: number | undefined) {
    this.zeroToFour = zeroToFour
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

// function filter_in(CAMERA) {
//   // Maybe use an https://en.wikipedia.org/wiki/R-tree instead
//   // and JS implementation: https://github.com/mourner/rbush
//   visible_tiles = {}
//   for (tile in ALL_TILES_IN_GAME) {
//     if (CAMERA.x1 <= tile.x && tile.x <= CAMERA.x2 && 
//         CAMERA.y1 <= tile.y && tile.y <= CAMERA.y2) {

//           visible_tiles.add(tile)
//     }
//   }
//   return visible_tiles
// }

// function draw(canvas) {
//   CUR_TICK++

//   tiles_in_view = ALL_TILES_IN_GAME.filter_in(CAMERA).sort_by(z_index)
  
//   for (tile in tiles_in_view) {
//     tile_rel_pos = tile.rel_pos()
//     for (animated_sprite in tile) {
//       // each sprite can actually be 1 of many animation variants
//       (sprite, sprite_rel_pos) = animated_sprite.get_current_sprite(CUR_TICK)
//       canvas.draw(sprite, camera) // draw the sprite relative to where the camera is

//     }
//   }

  
// }

// function update() {
//   if (btn() != 0) {
//     _game_specific_update(gamepads)
//   }
// }


// color_palette: 0123456789abcdef | ghijklmnopqrstuv (for 32 colors per sprite instead of pic8's 16 colors)


class MyGame implements Game {
  
  spriteMap: Map<string, Sprite> = new Map()
  tileMap: Map<string, Tile> = new Map()

  constructor() {
    const z = null
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

    this.spriteMap.set('playerTop1', new Sprite([
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,g,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,B,w,w,w,B,w],
    ]))

    this.spriteMap.set('playerTop2', new Sprite([
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,g,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,W,W,w,W,W,w],
    ]))

    this.spriteMap.set('playerTop3', new Sprite([
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,g,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,p,p,w,p,p,w],
    ]))

    this.spriteMap.set('playerTop4', new Sprite([
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,B,w,w,w,B,w],
      [W,w,w,w,B,w,w,w],
    ]))

    this.spriteMap.set('playerTop5', new Sprite([
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,g,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,B,w,w,w,B,w],
      [W,w,w,w,B,B,w,w],
    ]))

    this.spriteMap.set('playerTop5', new Sprite([
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,g,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,B,w,w,w,B,w],
      [W,w,w,w,B,B,w,w],
      [z,W,w,w,w,w,w,z],
    ]))

    this.spriteMap.set('playerTop6', new Sprite([
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,g,g,r,z,z,z,z],
      [z,z,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,B,w,w,w,B,w],
      [W,w,w,w,B,B,w,w],
    ]))



    this.spriteMap.set('playerBottom1', new Sprite([
      [W,w,w,w,w,w,w,w],
      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,z,w,w,w,w,z,z],
      [z,w,w,w,w,w,W,z],
      [z,z,W,w,w,w,z,z],
      [z,z,W,w,w,w,z,z],
      [z,z,W,z,z,W,z,z],
    ]))

    this.spriteMap.set('playerBottom2', new Sprite([
      [W,w,w,w,w,w,w,w],
      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,z,w,w,w,w,z,z],
      [z,w,w,w,w,w,W,z],
      [z,z,W,w,K,w,z,z],
      [z,z,W,w,w,w,z,z],
      [z,z,W,z,z,W,z,z],
    ]))

    this.spriteMap.set('playerBottom3', new Sprite([
      [W,w,w,w,w,w,w,w],
      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,z,w,w,w,w,z,z],
      [z,w,w,w,w,w,W,z],
      [z,z,W,w,w,w,z,z],
      [z,z,W,w,w,w,z,z],
      [z,z,W,z,z,W,z,z],
    ]))

    this.spriteMap.set('playerBottom4', new Sprite([
      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,z,w,w,w,w,z,z],
      [z,z,w,w,w,w,z,z],
      [z,w,W,w,w,w,W,z],
      [z,z,w,w,w,w,z,z],
      [z,z,z,z,z,w,z,z],
      [z,z,z,z,z,W,z,z],
    ]))

    this.spriteMap.set('playerBottom5', new Sprite([
      [z,z,z,W,w,z,z,z],
      [z,z,w,w,w,w,z,z],
      [z,w,w,w,w,w,W,z],
      [z,z,w,w,w,w,z,z],
      [z,z,w,w,w,w,z,z],
      [z,z,W,z,W,w,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
    ]))

    this.spriteMap.set('playerBottom6', new Sprite([
      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,w,w,w,w,w,W,z],
      [z,z,w,w,w,w,z,z],
      [z,z,W,w,w,w,z,z],
      [z,z,w,w,w,w,z,z],
      [z,z,W,w,W,z,z,z],
      [z,z,z,W,z,z,z,z],
    ]))

  }

  init(gamepad: Gamepad, tm: TileMaker) {
    // console.log('initializing')
    for (const [key, value] of this.spriteMap.entries()) {
      // console.log(`Adding "${key}" to the tileMaker`)
      this.tileMap.set(key, tm.factory(key, AnimatedSprite.forSingleSprite(value)))
    }


    this.tileMap.set('playerJumpTop', tm.factory('playerJumpTop', new AnimatedSprite(5, [
      this.spriteMap.get('playerTop1'),
      this.spriteMap.get('playerTop2'),
      this.spriteMap.get('playerTop3'),
      this.spriteMap.get('playerTop4'),
      this.spriteMap.get('playerTop5'),
      this.spriteMap.get('playerTop6'),
    ])))

    this.tileMap.set('playerJumpBottom', tm.factory('playerJumpBottom', new AnimatedSprite(5, [
      this.spriteMap.get('playerBottom1'),
      this.spriteMap.get('playerBottom2'),
      this.spriteMap.get('playerBottom3'),
      this.spriteMap.get('playerBottom4'),
      this.spriteMap.get('playerBottom5'),
      this.spriteMap.get('playerBottom6'),
    ])))

    // console.log("Searching for player")
    // console.log(tm.findAll('player'))

    this.tileMap.get('playerJumpTop').new({x: 2, y: 2})
    this.tileMap.get('playerJumpBottom').new({x: 2, y: 2 + 8})
  }

  update(gamepad: Gamepad, tm: TileMaker, camera: Camera) {
    const playerTops = tm.findAll('playerJumpTop')
    const playerBottoms = tm.findAll('playerJumpBottom')
    const players = setUnion(playerTops, playerBottoms)

    for (const p of players) {
      if (gamepad.isDpadPressed()) {
        const dir = gamepad.dpadDir()

        // Flip the sprite if we press left/right
        p.hFlip = dir === 2 ? true : dir === 0 ? false : p.hFlip

        p.moveTo({
          x: p.pos.x + (dir === 0 ? 1 : dir === 2 ? -1 : 0),
          y: p.pos.y + (dir === 3 ? 1 : dir === 1 ? -1 : 0),
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