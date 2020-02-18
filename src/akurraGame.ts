import { Game, Camera, SpriteController, Image, DefiniteMap, Sprite, InstanceController, ObjectInstance, CollisionChecker, IPosition, GameObject, zIndexComparator, DrawPixelsFn, ShowDialogFn, SimpleObject, Opt, DrawTextFn } from './engine'
import { setMoveTo, DoubleArray } from './terminal'
import { IGamepad, BUTTON_TYPE } from './gamepad/api'
import { loadImages } from './akurraImages'
import { BBox } from 'rbush'

// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316#47593316
var LCG = (s: number) => () => (2 ** 31 - 1 & (s = Math.imul(48271, s))) / 2 ** 31

export class MyGame implements Game {
  load (gamepad: IGamepad, sprites: SpriteController) {
    // gamepad.listenTo([BUTTON_TYPE.ARROW_LEFT, BUTTON_TYPE.ARROW_RIGHT, BUTTON_TYPE.ARROW_DOWN, BUTTON_TYPE.ARROW_UP, BUTTON_TYPE.CLUSTER_BOTTOM])

    const images = loadImages()

    sprites.add('Water', new Sprite(20, [
      images.get('Water0'),
      images.get('Water0'),
      images.get('Water0'),
      images.get('Water0'),
      images.get('Water0'),
      images.get('Water0'),
      images.get('Water0'),
      images.get('Water0'),
      images.get('Water0'),
      images.get('Water0'),
      images.get('Water1'),
      images.get('Water2'),
      images.get('Water3'),
      images.get('Water4')
    ]))

    // Add all the images as single-image sprites too.
    for (const [name, image] of images.entries()) {
      sprites.add(name, Sprite.forSingleImage(image))
    }
  }

  init (sprites: SpriteController, instances: InstanceController) {
    const player = instances.factory('player', sprites.get('PlayerStoppedDown'), -1000, playerUpdateFn)

    const bgZ = 100
    const obZ = 0
    const hoverZ = -1

    const Sand = instances.simple(sprites, 'Sand', bgZ)
    const Rock = instances.simple(sprites, 'Rock', obZ)
    const Bush = instances.simple(sprites, 'Bush', obZ)
    const WallTopRightDown = instances.simple(sprites, 'WallTopRightDown', obZ)
    const SandEdge = instances.simple(sprites, 'SandEdge', bgZ)
    const Crate = instances.simple(sprites, 'Crate', obZ)
    const GongRed = instances.simple(sprites, 'GongRed', obZ)
    const PillarRed = instances.simple(sprites, 'PillarRed', obZ)
    const WallTopUpDown = instances.simple(sprites, 'WallTopUpDown', obZ)
    const Key = instances.simple(sprites, 'Key', hoverZ)
    const Land = instances.simple(sprites, 'Land', bgZ)
    const Lock = instances.simple(sprites, 'Lock', obZ)
    const ArrowLeft = instances.simple(sprites, 'ArrowLeft', obZ)
    const WallTopLeftRight = instances.simple(sprites, 'WallTopLeftRight', obZ)
    const WallTopUpLeft = instances.simple(sprites, 'WallTopUpLeft', obZ)
    const Pedestal = instances.simple(sprites, 'Pedestal', obZ)
    const LandCorner = instances.simple(sprites, 'LandCorner', bgZ)
    const LandBottom = instances.simple(sprites, 'LandBottom', bgZ)
    const ArrowLeftDisabled = instances.simple(sprites, 'ArrowLeftDisabled', obZ)
    const Wall = instances.simple(sprites, 'Wall', obZ)
    const WallVert = instances.simple(sprites, 'WallVert', obZ)
    const TreeTop = instances.simple(sprites, 'TreeTop', hoverZ)
    const TreeBottom = instances.simple(sprites, 'TreeBottom', obZ)
    const Water = instances.simple(sprites, 'Water', obZ)

    const Grass = Land // Just because we do not have all the sprites

    const validator = {}
    function g (item: GameObject<any, any>, pos: IPosition) {
      // convert from grid coordinates to pixels
      const o = item.new({
        x: pos.x * 16,
        y: pos.y * 16
      })

      return o
    }

    const rand = LCG(2020)

    // Setart each Ocean tile at a random spot so the ocean waves will crest randomly
    function waterAnim (o: ObjectInstance<any, any>) {
      const next = Math.round(rand() * 1000)
      o.startTick = -next
    }

    let y = 0
    let x = 0

    // Row0
    g(Rock, { x: x++, y })
    g(Grass, { x: x++, y })
    g(Grass, { x: x++, y })
    g(Grass, { x: x++, y })
    g(Grass, { x: x++, y })
    g(Grass, { x: x++, y })
    g(Grass, { x: x++, y })
    g(Grass, { x: x++, y })
    g(Grass, { x: x++, y })
    g(WallTopUpDown, { x: x++, y })
    g(Grass, { x: x++, y })
    g(Grass, { x: x++, y })
    g(Grass, { x: x++, y })
    g(Grass, { x: x++, y })
    g(WallTopUpDown, { x: x++, y }).hFlip = true
    g(Grass, { x: x++, y })
    g(Grass, { x: x++, y })
    g(Grass, { x: x++, y })
    g(Grass, { x: x++, y })
    g(Grass, { x: x++, y })
    g(Grass, { x: x++, y })
    g(Grass, { x: x++, y })
    g(Grass, { x: x++, y })
    g(Rock, { x: x++, y })

    // Row1
    x = 0; y += 1
    g(Rock, { x: x++, y })
    g(Grass, { x: x++, y })
    g(WallTopRightDown, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopUpLeft, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(WallTopUpLeft, { x: x++, y }).hFlip = true
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopRightDown, { x: x++, y }).hFlip = true
    g(Grass, { x: x++, y })
    g(Grass, { x: x++, y })
    g(Rock, { x: x++, y })

    // Row2
    x = 0; y += 1
    g(Bush, { x: x++, y })
    g(Grass, { x: x++, y })
    g(WallTopUpDown, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(WallVert, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Rock, { x: x++, y })
    g(WallVert, { x: x++, y }).hFlip = true
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(WallTopUpDown, { x: x++, y }).hFlip = true
    g(Grass, { x: x++, y })
    g(Grass, { x: x++, y })
    g(Bush, { x: x++, y })

    // Row3
    x = 0; y += 1
    g(Bush, { x: x++, y })
    g(Grass, { x: x++, y })
    g(WallTopUpDown, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(WallVert, { x: x++, y })
    g(ArrowLeftDisabled, { x: x++, y })
    g(ArrowLeftDisabled, { x: x++, y })
    g(ArrowLeft, { x: x++, y })
    g(Lock, { x: x++, y })
    g(WallVert, { x: x++, y }).hFlip = true
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(WallTopUpDown, { x: x++, y }).hFlip = true
    g(Grass, { x: x++, y })
    g(Grass, { x: x++, y })
    g(Bush, { x: x++, y })

    // Row4
    x = 0; y += 1
    g(Bush, { x: x++, y })
    g(Bush, { x: x++, y })
    g(WallTopUpDown, { x: x++, y })
    g(GongRed, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Sand, { x: x++, y })
    g(LandCorner, { x: x++, y })
    g(LandBottom, { x: x++, y })
    g(LandBottom, { x: x++, y })
    g(LandBottom, { x: x++, y })
    g(LandBottom, { x: x++, y })
    g(LandCorner, { x: x++, y }).hFlip = true
    g(Sand, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Pedestal, { x: x++, y })
    g(Key, { x: x - 1 / 16, y: y - 5 / 16 })
    g(Rock, { x: x++, y })
    g(Sand, { x: x++, y })
    g(WallTopUpDown, { x: x++, y }).hFlip = true
    g(Bush, { x: x++, y })
    g(Bush, { x: x++, y })
    g(Bush, { x: x++, y })

    // Row5
    x = 0; y += 1
    g(Bush, { x: x++, y })
    g(TreeTop, { x: x++, y })
    g(WallTopUpDown, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Rock, { x: x++, y })
    g(PillarRed, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Sand, { x: x++, y })
    g(WallTopUpDown, { x: x++, y }).hFlip = true
    g(TreeTop, { x: x++, y })
    g(TreeTop, { x: x++, y })
    g(TreeTop, { x: x++, y })

    // Row6
    x = 0; y += 1
    g(Bush, { x: x++, y })
    g(TreeBottom, { x: x++, y })
    g(WallTopUpDown, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x, y })
    g(Crate, { x: x++, y })
    g(Sand, { x, y })
    g(Crate, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(WallTopUpDown, { x: x++, y }).hFlip = true
    g(TreeBottom, { x: x++, y })
    g(TreeBottom, { x: x++, y })
    g(TreeBottom, { x: x++, y })

    // Row7
    x = 0; y += 1
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopUpLeft, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x, y })
    g(player, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(WallTopUpLeft, { x: x++, y }).hFlip = true
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })

    // Row8
    x = 0; y += 1
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(WallVert, { x: x++, y })
    g(SandEdge, { x: x++, y })
    g(SandEdge, { x: x++, y })
    g(SandEdge, { x: x++, y })
    g(SandEdge, { x: x++, y })
    g(SandEdge, { x: x++, y })
    g(SandEdge, { x: x++, y })
    g(SandEdge, { x: x++, y })
    g(SandEdge, { x: x++, y })
    g(SandEdge, { x: x++, y })
    g(SandEdge, { x: x++, y })
    g(SandEdge, { x: x++, y })
    g(SandEdge, { x: x++, y })
    g(SandEdge, { x: x++, y })
    g(SandEdge, { x: x++, y })
    g(SandEdge, { x: x++, y })
    g(SandEdge, { x: x++, y })
    g(SandEdge, { x: x++, y })
    g(WallVert, { x: x++, y }).hFlip = true
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })

    // Row9
    x = 0; y += 1
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(WallVert, { x: x++, y })
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    g(WallVert, { x: x++, y }).hFlip = true
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })

    // Row10
    x = 0; y += 1
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))

    // Row11
    x = 0; y += 1
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
    waterAnim(g(Water, { x: x++, y }))
  }

  drawBackground (tiles: Array<ObjectInstance<any, any>>, camera: Camera, drawPixelsFn: DrawPixelsFn) {
    const bbox = camera.toBBox()
    const color = '#FFFFFF' // white

    const pixels = Array(bbox.maxY - bbox.minY).fill(Array(bbox.maxX - bbox.minX).fill(color))

    drawPixelsFn({ x: 0, y: 0 }, pixels, false, false)
  }

  drawOverlay (drawPixelsFn: DrawPixelsFn, drawTextFn: DrawTextFn, fields: SimpleObject) {
  }

  drawDialog (message: string, drawPixelsFn: DrawPixelsFn, drawTextFn: DrawTextFn, elapsedMs: number, target: Opt<IPosition>, additional: Opt<SimpleObject>) {
  }
}

enum PLAYER_STATE {
  STOPPED = 'STOPPED',
  PUSHING = 'PUSHING'
}

enum PLAYER_DIR {
  RIGHT = 0,
  UP = 1,
  LEFT = 2,
  DOWN = 3,
}

interface PlayerProps {
  dir: PLAYER_DIR
  state: PLAYER_STATE
  stateStart: number
}

function playerUpdateFn (o: ObjectInstance<PlayerProps, any>, gamepad: IGamepad, collisionChecker: CollisionChecker, sprites: SpriteController, instances: InstanceController, camera: Camera, showDialog: ShowDialogFn, overlayState: SimpleObject, curTick: number) {
  // Follow the player for now
  camera.track(o.pos)

  const StoppedDown = sprites.get('PlayerStoppedDown')
  const PushingRight = sprites.get('PlayerPushingRight')
  const PushingUp = sprites.get('PlayerPushingUp')
  const PushingDown = sprites.get('PlayerPushingDown')

  const pushableSprites = [
    sprites.get('Crate'),
  ]

  const wallSprites = [...pushableSprites,
    sprites.get('Rock'),
    sprites.get('Bush'),
    sprites.get('WallTopRightDown'),
    sprites.get('GongRed'),
    sprites.get('PillarRed'),
    sprites.get('WallTopUpDown'),
    sprites.get('Lock'),
    sprites.get('ArrowLeft'),
    sprites.get('WallTopLeftRight'),
    sprites.get('WallTopUpLeft'),
    sprites.get('ArrowLeftDisabled'),
    sprites.get('Wall'),
    sprites.get('WallVert'),
    sprites.get('Water')
  ]

  // initialize the props
  const p = o.props
  if (p.state === undefined) {
    p.dir = PLAYER_DIR.DOWN
    p.state = PLAYER_STATE.STOPPED
  }

  let dy = 0
  let dx = 0
  if (gamepad.isButtonPressed(BUTTON_TYPE.DPAD_LEFT)) {
    dx += -1
  }
  if (gamepad.isButtonPressed(BUTTON_TYPE.DPAD_RIGHT)) {
    dx += 1
  }
  if (gamepad.isButtonPressed(BUTTON_TYPE.DPAD_UP)) {
    dy += -1
  }
  if (gamepad.isButtonPressed(BUTTON_TYPE.DPAD_DOWN)) {
    dy += 1
  }

  // Change the player's direction if something is pressed
  if (dy < 0) { p.dir = PLAYER_DIR.UP }
  else if (dy > 0) { p.dir = PLAYER_DIR.DOWN }
  else if (dx < 0) { p.dir = PLAYER_DIR.LEFT }
  else if (dx > 0) { p.dir = PLAYER_DIR.RIGHT }

  const oldPos = o.pos
  const newPos = {
    x: o.pos.x + dx * 4,
    y: o.pos.y + dy * 4 // 16/4 just to move faster
  }

  o.moveTo(newPos)

  // If there is a collision then move the player back
  const neighbor = collisionChecker.searchBBox(o.toBBox())
    .find((obj) => wallSprites.includes(obj.sprite))

  if (!!neighbor) {
    o.moveTo(oldPos)
    p.state = PLAYER_STATE.PUSHING

    if (pushableSprites.includes(neighbor.sprite)) {
      // start pushing the box. Just immediately push it for now (if it is empty behind it)
      let neighborOld = neighbor.pos

      let newNeighborPos: IPosition

      switch (p.dir) {
        case PLAYER_DIR.UP:    newNeighborPos = {x: neighbor.pos.x, y: neighbor.pos.y - 16}; break
        case PLAYER_DIR.DOWN:  newNeighborPos = {x: neighbor.pos.x, y: neighbor.pos.y + 16}; break
        case PLAYER_DIR.LEFT:  newNeighborPos = {x: neighbor.pos.x - 16, y: neighbor.pos.y}; break
        case PLAYER_DIR.RIGHT: newNeighborPos = {x: neighbor.pos.x + 16, y: neighbor.pos.y}; break
        default: throw new Error(`BUG: Invalid direction ${p.dir}`)
      }

      const isBehindNeighborFilled = collisionChecker.searchBBox(spriteToBBox(newNeighborPos, neighbor.sprite))
        .find((obj) => wallSprites.includes(obj.sprite))

      if (isBehindNeighborFilled === neighbor) {
        throw new Error('Should have .... oh, we already moved the neighbor... grrr')
      }

      if (!isBehindNeighborFilled) {
        // move the box, and move the player
        o.moveTo(neighborOld)
        neighbor.moveTo(newNeighborPos)
      } else {
        
      }
    }
  } else {
    p.state = PLAYER_STATE.STOPPED // Should be walking if moving
  }

  o.hFlip = false
  switch (p.state) {
    case PLAYER_STATE.STOPPED: o.sprite = StoppedDown; break
    case PLAYER_STATE.PUSHING: 
      switch (p.dir) {
        case PLAYER_DIR.RIGHT: o.sprite = PushingRight; break
        case PLAYER_DIR.UP: o.sprite = PushingUp; break
        case PLAYER_DIR.LEFT: o.sprite = PushingRight; o.hFlip = true; break
        case PLAYER_DIR.DOWN: o.sprite = PushingDown; break
        default: throw new Error(`BUG: Invalid direction ${p.dir}`)
      }
      break
    default: throw new Error(`BUG: Invalid state ${p.state}`)
  }
}


function spriteToBBox(pos: IPosition, sprite: Sprite): BBox {
  const dim = sprite.tick(0, 0).getDimension()
  return { minX: pos.x, minY: pos.y, maxX: pos.x + dim.width - 1, maxY: pos.y + dim.height - 1 }
}