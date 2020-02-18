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
    const Box = instances.simple(sprites, 'Box', obZ)
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
      const key = `${pos.x}, ${pos.y}`
      if (validator[key]) {
        throw new Error(`BUG: 2 voxels in the same spot: ${key}`)
      }
      validator[key] = true

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

    // Row0
    g(Rock, { x: 0, y })
    g(Grass, { x: 1, y })
    g(Grass, { x: 2, y })
    g(Grass, { x: 3, y })
    g(Grass, { x: 4, y })
    g(Grass, { x: 5, y })
    g(Grass, { x: 6, y })
    g(Grass, { x: 7, y })
    g(Grass, { x: 8, y })
    g(WallTopUpDown, { x: 9, y })
    g(Grass, { x: 10, y })
    g(Grass, { x: 11, y })
    g(Grass, { x: 12, y })
    g(Grass, { x: 13, y })
    g(WallTopUpDown, { x: 14, y }).hFlip = true
    g(Grass, { x: 15, y })
    g(Grass, { x: 16, y })
    g(Grass, { x: 17, y })
    g(Grass, { x: 18, y })
    g(Grass, { x: 19, y })
    g(Grass, { x: 20, y })
    g(Grass, { x: 21, y })
    g(Grass, { x: 22, y })
    g(Rock, { x: 23, y })

    // Row1
    y += 1
    g(Rock, { x: 0, y })
    g(Grass, { x: 1, y })
    g(WallTopRightDown, { x: 2, y })
    g(WallTopLeftRight, { x: 3, y })
    g(WallTopLeftRight, { x: 4, y })
    g(WallTopLeftRight, { x: 5, y })
    g(WallTopLeftRight, { x: 6, y })
    g(WallTopLeftRight, { x: 7, y })
    g(WallTopLeftRight, { x: 8, y })
    g(WallTopUpLeft, { x: 9, y })
    g(Land, { x: 10, y })
    g(Land, { x: 11, y })
    g(Land, { x: 12, y })
    g(Land, { x: 13, y })
    g(WallTopUpLeft, { x: 14, y }).hFlip = true
    g(WallTopLeftRight, { x: 15, y })
    g(WallTopLeftRight, { x: 16, y })
    g(WallTopLeftRight, { x: 17, y })
    g(WallTopLeftRight, { x: 18, y })
    g(WallTopLeftRight, { x: 19, y })
    g(WallTopRightDown, { x: 20, y }).hFlip = true
    g(Grass, { x: 21, y })
    g(Grass, { x: 22, y })
    g(Rock, { x: 23, y })

    // Row2
    y += 1
    g(Bush, { x: 0, y })
    g(Grass, { x: 1, y })
    g(WallTopUpDown, { x: 2, y })
    g(Wall, { x: 3, y })
    g(Wall, { x: 4, y })
    g(Wall, { x: 5, y })
    g(Wall, { x: 6, y })
    g(Wall, { x: 7, y })
    g(Wall, { x: 8, y })
    g(WallVert, { x: 9, y })
    g(Rock, { x: 10, y })
    g(Land, { x: 11, y })
    g(Land, { x: 12, y })
    g(Rock, { x: 13, y })
    g(WallVert, { x: 14, y }).hFlip = true
    g(Wall, { x: 15, y })
    g(Wall, { x: 16, y })
    g(Wall, { x: 17, y })
    g(Wall, { x: 18, y })
    g(Wall, { x: 19, y })
    g(WallTopUpDown, { x: 20, y }).hFlip = true
    g(Grass, { x: 21, y })
    g(Grass, { x: 22, y })
    g(Bush, { x: 23, y })

    // Row3
    y += 1
    g(Bush, { x: 0, y })
    g(Grass, { x: 1, y })
    g(WallTopUpDown, { x: 2, y })
    g(Wall, { x: 3, y })
    g(Wall, { x: 4, y })
    g(Wall, { x: 5, y })
    g(Wall, { x: 6, y })
    g(Wall, { x: 7, y })
    g(Wall, { x: 8, y })
    g(WallVert, { x: 9, y })
    g(ArrowLeftDisabled, { x: 10, y })
    g(ArrowLeftDisabled, { x: 11, y })
    g(ArrowLeft, { x: 12, y })
    g(Lock, { x: 13, y })
    g(WallVert, { x: 14, y }).hFlip = true
    g(Wall, { x: 15, y })
    g(Wall, { x: 16, y })
    g(Wall, { x: 17, y })
    g(Wall, { x: 18, y })
    g(Wall, { x: 19, y })
    g(WallTopUpDown, { x: 20, y }).hFlip = true
    g(Grass, { x: 21, y })
    g(Grass, { x: 22, y })
    g(Bush, { x: 23, y })

    // Row4
    y += 1
    g(Bush, { x: 0, y })
    g(Bush, { x: 1, y })
    g(WallTopUpDown, { x: 2, y })
    g(GongRed, { x: 3, y })
    g(Sand, { x: 4, y })
    g(Sand, { x: 5, y })
    g(Rock, { x: 6, y })
    g(Rock, { x: 7, y })
    g(Sand, { x: 8, y })
    g(LandCorner, { x: 9, y })
    g(LandBottom, { x: 10, y })
    g(LandBottom, { x: 11, y })
    g(LandBottom, { x: 12, y })
    g(LandBottom, { x: 13, y })
    g(LandCorner, { x: 14, y }).hFlip = true
    g(Sand, { x: 15, y })
    g(Rock, { x: 16, y })
    g(Key, { x: 17 - 1 / 16, y: y - 5 / 16 })
    g(Pedestal, { x: 17, y })
    g(Rock, { x: 18, y })
    g(Sand, { x: 19, y })
    g(WallTopUpDown, { x: 20, y }).hFlip = true
    g(Bush, { x: 21, y })
    g(Bush, { x: 22, y })
    g(Bush, { x: 23, y })

    // Row5
    y += 1
    g(Bush, { x: 0, y })
    g(TreeTop, { x: 1, y })
    g(WallTopUpDown, { x: 2, y })
    g(Rock, { x: 3, y })
    g(Rock, { x: 4, y })
    g(Sand, { x: 5, y })
    g(Sand, { x: 6, y })
    g(Rock, { x: 7, y })
    g(Rock, { x: 8, y })
    g(Sand, { x: 9, y })
    g(Sand, { x: 10, y })
    g(Sand, { x: 11, y })
    g(Sand, { x: 12, y })
    g(Sand, { x: 13, y })
    g(Sand, { x: 14, y })
    g(Sand, { x: 15, y })
    g(Rock, { x: 16, y })
    g(PillarRed, { x: 17, y })
    g(Rock, { x: 18, y })
    g(Sand, { x: 19, y })
    g(WallTopUpDown, { x: 20, y }).hFlip = true
    g(TreeTop, { x: 21, y })
    g(TreeTop, { x: 22, y })
    g(TreeTop, { x: 23, y })

    // Row6
    y += 1
    g(Bush, { x: 0, y })
    g(TreeBottom, { x: 1, y })
    g(WallTopUpDown, { x: 2, y })
    g(Rock, { x: 3, y })
    g(Sand, { x: 4, y })
    g(Box, { x: 5, y })
    g(Box, { x: 6, y })
    g(Sand, { x: 7, y })
    g(Sand, { x: 8, y })
    g(Sand, { x: 9, y })
    g(Sand, { x: 10, y })
    g(Sand, { x: 11, y })
    g(Sand, { x: 12, y })
    g(Sand, { x: 13, y })
    g(Rock, { x: 14, y })
    g(Sand, { x: 15, y })
    g(Sand, { x: 16, y })
    g(Sand, { x: 17, y })
    g(Sand, { x: 18, y })
    g(Sand, { x: 19, y })
    g(WallTopUpDown, { x: 20, y }).hFlip = true
    g(TreeBottom, { x: 21, y })
    g(TreeBottom, { x: 22, y })
    g(TreeBottom, { x: 23, y })

    // Row7
    y += 1
    g(WallTopLeftRight, { x: 0, y })
    g(WallTopLeftRight, { x: 1, y })
    g(WallTopUpLeft, { x: 2, y })
    g(Rock, { x: 3, y })
    g(Sand, { x: 4, y })
    g(Sand, { x: 5, y })
    g(Sand, { x: 6, y })
    g(Sand, { x: 7, y })
    g(Sand, { x: 8, y })
    g(Sand, { x: 9, y })
    g(Sand, { x: 10, y })
    g(player, { x: 11, y })
    g(Sand, { x: 12, y })
    g(Sand, { x: 13, y })
    g(Sand, { x: 14, y })
    g(Sand, { x: 15, y })
    g(Sand, { x: 16, y })
    g(Sand, { x: 17, y })
    g(Sand, { x: 18, y })
    g(Sand, { x: 19, y })
    g(WallTopUpLeft, { x: 20, y }).hFlip = true
    g(WallTopLeftRight, { x: 21, y })
    g(WallTopLeftRight, { x: 22, y })
    g(WallTopLeftRight, { x: 23, y })

    // Row8
    y += 1
    g(Wall, { x: 0, y })
    g(Wall, { x: 1, y })
    g(WallVert, { x: 2, y })
    g(SandEdge, { x: 3, y })
    g(SandEdge, { x: 4, y })
    g(SandEdge, { x: 5, y })
    g(SandEdge, { x: 6, y })
    g(SandEdge, { x: 7, y })
    g(SandEdge, { x: 8, y })
    g(SandEdge, { x: 9, y })
    g(SandEdge, { x: 10, y })
    g(SandEdge, { x: 11, y })
    g(SandEdge, { x: 12, y })
    g(SandEdge, { x: 13, y })
    g(SandEdge, { x: 14, y })
    g(SandEdge, { x: 15, y })
    g(SandEdge, { x: 16, y })
    g(SandEdge, { x: 17, y })
    g(SandEdge, { x: 18, y })
    g(SandEdge, { x: 19, y })
    g(WallVert, { x: 20, y }).hFlip = true
    g(Wall, { x: 21, y })
    g(Wall, { x: 22, y })
    g(Wall, { x: 23, y })

    // Row9
    y += 1
    g(Wall, { x: 0, y })
    g(Wall, { x: 1, y })
    g(WallVert, { x: 2, y })
    waterAnim(g(Water, { x: 3, y }))
    waterAnim(g(Water, { x: 4, y }))
    waterAnim(g(Water, { x: 5, y }))
    waterAnim(g(Water, { x: 6, y }))
    waterAnim(g(Water, { x: 7, y }))
    waterAnim(g(Water, { x: 8, y }))
    waterAnim(g(Water, { x: 9, y }))
    waterAnim(g(Water, { x: 10, y }))
    waterAnim(g(Water, { x: 11, y }))
    waterAnim(g(Water, { x: 12, y }))
    waterAnim(g(Water, { x: 13, y }))
    waterAnim(g(Water, { x: 14, y }))
    waterAnim(g(Water, { x: 15, y }))
    waterAnim(g(Water, { x: 16, y }))
    waterAnim(g(Water, { x: 17, y }))
    waterAnim(g(Water, { x: 18, y }))
    waterAnim(g(Water, { x: 19, y }))
    g(WallVert, { x: 20, y }).hFlip = true
    g(Wall, { x: 21, y })
    g(Wall, { x: 22, y })
    g(Wall, { x: 23, y })

    // Row10
    y += 1
    waterAnim(g(Water, { x: 0, y }))
    waterAnim(g(Water, { x: 1, y }))
    waterAnim(g(Water, { x: 2, y }))
    waterAnim(g(Water, { x: 3, y }))
    waterAnim(g(Water, { x: 4, y }))
    waterAnim(g(Water, { x: 5, y }))
    waterAnim(g(Water, { x: 6, y }))
    waterAnim(g(Water, { x: 7, y }))
    waterAnim(g(Water, { x: 8, y }))
    waterAnim(g(Water, { x: 9, y }))
    waterAnim(g(Water, { x: 10, y }))
    waterAnim(g(Water, { x: 11, y }))
    waterAnim(g(Water, { x: 12, y }))
    waterAnim(g(Water, { x: 13, y }))
    waterAnim(g(Water, { x: 14, y }))
    waterAnim(g(Water, { x: 15, y }))
    waterAnim(g(Water, { x: 16, y }))
    waterAnim(g(Water, { x: 17, y }))
    waterAnim(g(Water, { x: 18, y }))
    waterAnim(g(Water, { x: 19, y }))
    waterAnim(g(Water, { x: 20, y }))
    waterAnim(g(Water, { x: 21, y }))
    waterAnim(g(Water, { x: 22, y }))
    waterAnim(g(Water, { x: 23, y }))

    // Row11
    y += 1
    waterAnim(g(Water, { x: 0, y }))
    waterAnim(g(Water, { x: 1, y }))
    waterAnim(g(Water, { x: 2, y }))
    waterAnim(g(Water, { x: 3, y }))
    waterAnim(g(Water, { x: 4, y }))
    waterAnim(g(Water, { x: 5, y }))
    waterAnim(g(Water, { x: 6, y }))
    waterAnim(g(Water, { x: 7, y }))
    waterAnim(g(Water, { x: 8, y }))
    waterAnim(g(Water, { x: 9, y }))
    waterAnim(g(Water, { x: 10, y }))
    waterAnim(g(Water, { x: 11, y }))
    waterAnim(g(Water, { x: 12, y }))
    waterAnim(g(Water, { x: 13, y }))
    waterAnim(g(Water, { x: 14, y }))
    waterAnim(g(Water, { x: 15, y }))
    waterAnim(g(Water, { x: 16, y }))
    waterAnim(g(Water, { x: 17, y }))
    waterAnim(g(Water, { x: 18, y }))
    waterAnim(g(Water, { x: 19, y }))
    waterAnim(g(Water, { x: 20, y }))
    waterAnim(g(Water, { x: 21, y }))
    waterAnim(g(Water, { x: 22, y }))
    waterAnim(g(Water, { x: 23, y }))
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
    sprites.get('Box'),
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