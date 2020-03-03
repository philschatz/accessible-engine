import { ObjectInstance, SimpleObject, ShowDialogFn, Camera, SpriteController, InstanceController, CollisionChecker, IPosition, Sprite, posAdd, SpriteInstance } from '../common/engine'
import { IGamepad, BUTTON_TYPE } from '../common/gamepad'
import { PLAYER_DIR, PlayerProps, ROOM_SIZE, PLAYER_STATE } from './util'
import { assertSomething } from '../common/util'

export function playerUpdateFn (o: ObjectInstance<PlayerProps>, gamepad: IGamepad, collisionChecker: CollisionChecker, sprites: SpriteController, instances: InstanceController, camera: Camera, showDialog: ShowDialogFn, overlayState: SimpleObject, curTick: number) {
  camera.screenPixelPos = { x: 0, y: 16 * 2 /* for the overlay */ }
  camera.resize({
    width: ROOM_SIZE.width,
    height: ROOM_SIZE.height
  })

  const playerRoomPos = currentRoomCorner(o.pos)

  camera.pos = posAdd(playerRoomPos, { x: Math.round(ROOM_SIZE.width / 2), y: Math.round(ROOM_SIZE.height / 2) })

  const [
    Hole,
    HoleStraw,
    PlayerWalkingUp,
    PlayerWalkingDown,
    PlayerWalkingRight,
    PlayerPushingRight,
    PlayerPushingUp,
    PlayerPushingDown,
    GongRed,
    PillarRed,
    GongBlue,
    PillarBlue,
    GongPlayMusic,
    Key,
    Lock,
    ArrowLeft,
    ArrowLeftDisabled,
    ArrowUp,
    ArrowUpDisabled,
    ArrowRight,
    ArrowRightDisabled,
    ArrowDown,
    ArrowDownDisabled,
    FloorSquare,
    FloorDiamond
  ] = sprites.getAll([
    'Hole',
    'HoleStraw',
    'PlayerWalkingUp',
    'PlayerWalkingDown',
    'PlayerWalkingRight',
    'PlayerPushingRight',
    'PlayerPushingUp',
    'PlayerPushingDown',
    'GongRed',
    'PillarRed',
    'GongBlue',
    'PillarBlue',
    'GongPlayMusic',
    'Key',
    'Lock',
    'ArrowLeft',
    'ArrowLeftDisabled',
    'ArrowUp',
    'ArrowUpDisabled',
    'ArrowRight',
    'ArrowRightDisabled',
    'ArrowDown',
    'ArrowDownDisabled',
    'FloorSquare',
    'FloorDiamond'
  ])

  const pushableSprites = [
    sprites.get('Crate')
  ]

  const pushableWallSprites = [...pushableSprites,
    GongRed,
    PillarRed,
    GongBlue,
    PillarBlue,
    Lock,
    ArrowLeft,
    ArrowLeftDisabled,
    ArrowUp,
    ArrowUpDisabled,
    ArrowRight,
    ArrowRightDisabled,
    ArrowDown,
    ArrowDownDisabled,
    sprites.get('Stump'),
    sprites.get('Rock'),
    sprites.get('Bush'),
    sprites.get('WallTopRightDown'),
    sprites.get('WallTopUpDown'),
    sprites.get('WallTopLeftRight'),
    sprites.get('WallTopUpLeft'),
    sprites.get('Wall'),
    sprites.get('WallVert'),
    sprites.get('Water'),
    sprites.get('BigDoor12'),
    sprites.get('BigDoor13'),
    sprites.get('BigDoor14'),
    sprites.get('BigDoor15')
  ]

  const playerWallSprites = [
    ...pushableWallSprites,
    // sprites.get('Pit'), // walk over the pit for now since we cannot push the crate
    sprites.get('Hole')
  ]

  pushableWallSprites.push(sprites.get('WallLadder'))

  // initialize the props
  const p = o.props
  if (p.state === undefined) {
    p.dir = PLAYER_DIR.DOWN
    p.state = PLAYER_STATE.STOPPED
    overlayState.keys = 0
  }

  function reduce (i: number, by: number) {
    if (i < 0) { return Math.min(i + by, 0) } else if (i > 0) { return Math.max(i - by, 0) } else { return 0 }
  }

  if (o.offsetPos.x !== 0 || o.offsetPos.y !== 0) {
    // slowly move the sprite
    o.offsetPos = {
      x: reduce(o.offsetPos.x, 4),
      y: reduce(o.offsetPos.y, 4)
    }
    return
  }

  let dy = 0
  let dx = 0
  if (gamepad.isButtonPressed(BUTTON_TYPE.DPAD_LEFT)) {
    dx += -1
  } else if (gamepad.isButtonPressed(BUTTON_TYPE.DPAD_RIGHT)) {
    dx += 1
  } else if (gamepad.isButtonPressed(BUTTON_TYPE.DPAD_UP)) {
    dy += -1
  } else if (gamepad.isButtonPressed(BUTTON_TYPE.DPAD_DOWN)) {
    dy += 1
  }

  // Change the player's direction if something is pressed
  if (dy < 0) { p.dir = PLAYER_DIR.UP } else if (dy > 0) { p.dir = PLAYER_DIR.DOWN } else if (dx < 0) { p.dir = PLAYER_DIR.LEFT } else if (dx > 0) { p.dir = PLAYER_DIR.RIGHT }

  const oldPos = o.pos
  const newPos = {
    x: o.pos.x + dx,
    y: o.pos.y + dy
  }

  o.offsetPos = {
    x: dx * -15,
    y: dy * -15
  }
  o.moveTo(newPos)

  // If there is a collision then move the player back
  const neighborSprites = collisionChecker.searchPoint(o.pos)
  const wallNeighbor = neighborSprites
    .find((obj) => playerWallSprites.includes(obj.getMainSprite()))

  if (wallNeighbor) {
    o.moveTo(oldPos)
    p.state = PLAYER_STATE.PUSHING

    if ([GongRed, GongBlue].includes(wallNeighbor.getMainSprite())) {
      const doRing = (instrument: Sprite, pillar: Sprite) => {
        if (instrument === wallNeighbor.getMainSprite() && !wallNeighbor.sprite.isGrayscale) {
          // remove all the pillars in the current room
          const pillars = collisionChecker.searchBBox(currentRoomBBox(o.pos)).filter(t => t.getMainSprite() === pillar)
          pillars.forEach(p => p.setSprite(FloorSquare))
          // wallNeighbor.setMask(null, true)
          wallNeighbor.sprite.isGrayscale = true
          wallNeighbor.addAnimation(new SpriteInstance(GongPlayMusic, { x: 0, y: 0 }))
        }
      }

      o.offsetPos = { x: 0, y: 0 }
      doRing(GongRed, PillarRed)
      doRing(GongBlue, PillarBlue)
    } else if (pushableSprites.includes(wallNeighbor.getMainSprite())) {
      // start pushing the box. Just immediately push it for now (if it is empty behind it)
      const neighborOld = wallNeighbor.pos

      const newNeighborPos = posAdd(wallNeighbor.pos, neighborPos(p.dir))

      const isBehindNeighborFilled = collisionChecker.searchPoint(newNeighborPos)
        .find((obj) => pushableWallSprites.includes(obj.getMainSprite()))

      if (isBehindNeighborFilled === wallNeighbor) {
        throw new Error('Should have .... oh, we already moved the neighbor... grrr')
      }

      if (!isBehindNeighborFilled) {
        // move the box, and move the player
        o.moveTo(neighborOld)
        wallNeighbor.moveTo(newNeighborPos)
      } else {
        o.offsetPos = { x: 0, y: 0 }
      }
    } else {
      o.offsetPos = { x: 0, y: 0 }
    }
  } else {
    p.state = PLAYER_STATE.STOPPED // Should be walking if moving

    // check if we walked off of a HoleStraw. If so it should turn into a Hole
    const here = collisionChecker.searchPoint(oldPos)
    const holeStraw = here.find(obj => HoleStraw === obj.getMainSprite())
    if (holeStraw && (dx || dy)) {
      holeStraw.setSprite(Hole)
    }
  }

  // Pick up a key
  const maybeKey = neighborSprites.find(obj => obj.getMainSprite() === Key)
  if (maybeKey) {
    overlayState.keys = typeof overlayState.keys === 'number' ? overlayState.keys + 1 : 1
    maybeKey.destroy() // TODO: animate it moving to the overlay
  }

  // Unlock a lock
  const maybeLock = neighborSprites.find(obj => obj.getMainSprite() === Lock)
  if (maybeLock && assertSomething(overlayState.keys) > 0) {
    overlayState.keys = typeof overlayState.keys === 'number' ? overlayState.keys - 1 : 0
    maybeLock.setSprite(FloorDiamond)
  }

  // Unlock the arrow locks when pushing the correct direction
  function checkArrow (sprite: Sprite, disabledSprite: Sprite, playerDir: PLAYER_DIR) {
    const maybeArrow = neighborSprites.find(obj => obj.getMainSprite() === sprite)
    if (maybeArrow && p.dir === playerDir) {
      // loop and delete all the disabled arrowlefts
      let cur: ObjectInstance<any> | undefined = maybeArrow
      while (cur !== undefined) {
        const pos: IPosition = cur.pos
        cur.setSprite(FloorDiamond)
        cur = collisionChecker.searchPoint(posAdd(pos, neighborPos(playerDir))).find(obj => obj.getMainSprite() === disabledSprite)
      }
    }
  }

  checkArrow(ArrowUp, ArrowUpDisabled, PLAYER_DIR.UP)
  checkArrow(ArrowDown, ArrowDownDisabled, PLAYER_DIR.DOWN)
  checkArrow(ArrowLeft, ArrowLeftDisabled, PLAYER_DIR.LEFT)
  checkArrow(ArrowRight, ArrowRightDisabled, PLAYER_DIR.RIGHT)

  o.flip(false)
  switch (p.state) {
    case PLAYER_STATE.STOPPED:
      switch (p.dir) {
        case PLAYER_DIR.UP: o.setSprite(PlayerWalkingUp); break
        case PLAYER_DIR.DOWN: o.setSprite(PlayerWalkingDown); break
        case PLAYER_DIR.RIGHT: o.setSprite(PlayerWalkingRight); break
        case PLAYER_DIR.LEFT: o.setSprite(PlayerWalkingRight); o.flip(true); break
      }
      break
    case PLAYER_STATE.PUSHING:
      switch (p.dir) {
        case PLAYER_DIR.RIGHT: o.setSprite(PlayerPushingRight); break
        case PLAYER_DIR.UP: o.setSprite(PlayerPushingUp); break
        case PLAYER_DIR.LEFT: o.setSprite(PlayerPushingRight); o.flip(true); break
        case PLAYER_DIR.DOWN: o.setSprite(PlayerPushingDown); break
        default: throw new Error(`BUG: Invalid direction ${p.dir}`)
      }
      break
    default: throw new Error(`BUG: Invalid state ${p.state}`)
  }

  if (dx !== 0 || dy !== 0) {
    o.sprite.sprite.loop = true
  } else {
    o.sprite.sprite.loop = false
  }
}

export function crateUpdateFn (o: ObjectInstance<PlayerProps>, gamepad: IGamepad, collisionChecker: CollisionChecker, sprites: SpriteController, instances: InstanceController, camera: Camera, showDialog: ShowDialogFn, overlayState: SimpleObject, curTick: number) {
  const [Hole, HoleStraw, HoleCrate] = sprites.getAll(['Hole', 'HoleStraw', 'HoleCrate'])

  const holes = [
    Hole,
    HoleStraw
  ]

  const maybeHole = collisionChecker.searchPoint(o.pos).find(obj => holes.includes(obj.getMainSprite()))
  if (maybeHole) {
    maybeHole.setSprite(HoleCrate)
    o.destroy()
  }
}

function neighborPos (dir: PLAYER_DIR) {
  switch (dir) {
    case PLAYER_DIR.UP: return { x: 0, y: -1 }
    case PLAYER_DIR.DOWN: return { x: 0, y: 1 }
    case PLAYER_DIR.LEFT: return { x: -1, y: 0 }
    case PLAYER_DIR.RIGHT: return { x: 1, y: 0 }
    default: throw new Error(`BUG: Invalid dir ${dir}`)
  }
}

function currentRoomCorner (playerGridPos: IPosition) {
  return {
    x: Math.floor(playerGridPos.x / ROOM_SIZE.width) * ROOM_SIZE.width,
    y: Math.floor(playerGridPos.y / ROOM_SIZE.height) * ROOM_SIZE.height
  }
}

function currentRoomBBox (playerGridPos: IPosition) {
  const pos = currentRoomCorner(playerGridPos)
  return {
    minX: pos.x,
    minY: pos.y,
    maxX: pos.x + ROOM_SIZE.width,
    maxY: pos.y + ROOM_SIZE.height
  }
}
