import {Game, Camera, SpriteController, IGamepad, Image, DefiniteMap, Sprite, InstanceController, DPAD, ObjectInstance, CollisionChecker} from './engine'

export class MyGame implements Game {
  
  load(gamepad: IGamepad, sprites: SpriteController) {
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

    images.add('playerStand1', new Image([
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,g,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,B,w,w,w,B,w],

      [W,w,w,w,w,w,w,w],
      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,z,w,w,w,w,z,z],
      [z,w,w,w,w,w,W,z],
      [z,z,W,w,w,w,z,z],
      [z,z,W,w,w,w,z,z],
      [z,z,W,z,z,W,z,z],
    ]))

    images.add('playerStand2', new Image([
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,g,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,W,W,w,W,W,w],

      [W,w,w,w,w,w,w,w],
      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,z,w,w,w,w,z,z],
      [z,w,w,w,w,w,W,z],
      [z,z,W,w,K,w,z,z],
      [z,z,W,w,w,w,z,z],
      [z,z,W,z,z,W,z,z],
    ]))

    images.add('playerStand3', new Image([
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,g,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,p,p,w,p,p,w],

      [W,w,w,w,w,w,w,w],
      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,z,w,w,w,w,z,z],
      [z,w,w,w,w,w,W,z],
      [z,z,W,w,w,w,z,z],
      [z,z,W,w,w,w,z,z],
      [z,z,W,z,z,W,z,z],
    ]))

    images.add('playerJump1', new Image([
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,B,w,w,w,B,w],
      [W,w,w,w,B,w,w,w],

      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,z,w,w,w,w,z,z],
      [z,z,w,w,w,w,z,z],
      [z,w,W,w,w,w,W,z],
      [z,z,w,w,w,w,z,z],
      [z,z,z,z,z,w,z,z],
      [z,z,z,z,z,W,z,z],
    ]))

    images.add('playerJump2', new Image([
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,g,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,B,w,w,w,B,w],
      [W,w,w,w,B,B,w,w],
      [z,W,w,w,w,w,w,z],

      [z,z,z,W,w,z,z,z],
      [z,z,w,w,w,w,z,z],
      [z,w,w,w,w,w,W,z],
      [z,z,w,w,w,w,z,z],
      [z,z,w,w,w,w,z,z],
      [z,z,W,z,W,w,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
    ]))

    images.add('playerJump3', new Image([
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,g,g,r,z,z,z,z],
      [z,z,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,B,w,w,w,B,w],
      [W,w,w,w,B,B,w,w],

      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,w,w,w,w,w,W,z],
      [z,z,w,w,w,w,z,z],
      [z,z,W,w,w,w,z,z],
      [z,z,w,w,w,w,z,z],
      [z,z,W,w,W,z,z,z],
      [z,z,z,W,z,z,z,z],
    ]))


    images.add('playerJump4', new Image([ // 038
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,g,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,B,w,w,w,B,w],

      [W,w,w,w,w,B,w,w],
      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,z,w,w,w,w,z,z],
      [z,w,w,w,w,w,W,z],
      [z,z,W,w,w,w,z,z],
      [z,z,w,w,w,W,z,z],
      [z,z,W,z,z,z,z,z],
    ]))

    images.add('playerWalk1', new Image([
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,B,w,w,w,B,w],
      [W,w,w,w,w,w,w,w],

      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,z,W,w,w,w,z,z],
      [z,z,w,w,w,w,z,z],
      [z,z,w,W,w,w,z,z],
      [z,z,W,w,w,w,W,z],
      [z,z,w,z,z,z,z,z],
      [z,z,W,z,z,z,z,z],
    ]))

    images.add('playerWalk2', new Image([
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,g,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,B,w,w,w,B,w],
      [W,w,w,w,w,w,w,w],
      [z,W,w,w,w,w,w,z],

      [z,z,z,W,w,z,z,z],
      [z,z,W,w,w,w,z,z],
      [z,z,W,w,w,w,z,z],
      [z,z,w,W,w,w,z,z],
      [z,z,w,w,w,w,w,z],
      [z,W,w,z,z,z,W,z],
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
    ]))


    images.add('playerWalk3', new Image([
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,g,g,r,z,z,z,z],
      [z,z,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,B,w,w,w,B,w],
      [W,w,w,w,w,w,w,w],

      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,z,W,w,w,w,z,z],
      [z,z,w,W,w,w,z,z],
      [z,z,w,w,w,w,z,z],
      [z,W,w,w,w,w,z,z],
      [z,z,z,z,z,W,w,z],
      [z,z,z,z,z,z,W,z],
    ]))

    images.add('playerWalk4', new Image([
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,g,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,w,w,w,w,w,w],
      [W,w,B,w,w,w,B,w],

      [W,w,w,w,w,w,w,w],
      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,z,W,w,w,w,z,z],
      [z,z,w,w,w,w,z,z],
      [z,z,W,W,w,w,z,z],
      [z,z,W,w,w,w,z,z],
      [z,z,z,z,z,w,z,z],
    ]))

    sprites.add('playerStanding', Sprite.forSingleImage(images.get('playerStand1')))

    sprites.add('playerJumping', new Sprite(5, [
      images.get('playerJump1'),
      images.get('playerJump2'),
      images.get('playerJump3'),
      images.get('playerJump4'),
    ]))

    sprites.add('playerWalking', new Sprite(5, [
      images.get('playerWalk1'),
      images.get('playerWalk2'),
      images.get('playerWalk3'),
      images.get('playerWalk4'),
    ]))


    images.add('floorOrange1', new Image([
      [g,g,g,g,g,g,g,g],
      [g,G,g,G,G,g,g,G],
      [G,o,G,o,o,G,G,k],
      [Y,o,o,o,o,o,o,k],
      [Y,o,o,o,o,o,o,k],
      [Y,o,o,o,o,o,o,k],
      [Y,o,o,o,o,o,o,k],
      [Y,Y,Y,Y,Y,Y,o,o],
    ]))

    images.add('floorOrange2', new Image([
      [g,g,g,g,g,g,g,g],
      [g,G,G,g,G,G,g,g],
      [G,o,o,G,o,o,G,g],
      [Y,o,o,o,o,o,o,G],
      [Y,o,o,o,o,o,o,k],
      [Y,o,o,o,o,o,o,k],
      [Y,o,o,o,o,o,o,k],
      [Y,Y,Y,Y,Y,Y,o,o],
    ]))


    images.add('floorWhite1', new Image([
      [g,g,g,g,g,g,g,g],
      [g,g,g,G,g,g,G,G],
      [G,g,G,k,G,G,k,w],
      [W,G,k,k,k,k,k,w],
      [W,k,k,k,k,k,k,w],
      [W,k,k,k,k,k,k,w],
      [W,k,k,k,k,k,k,w],
      [W,W,W,W,W,W,k,k],
    ]))

    images.add('floorWhite2', new Image([
      [g,g,g,g,g,g,g,g],
      [g,G,g,g,G,G,g,g],
      [G,k,G,G,k,k,G,G],
      [W,k,k,k,k,k,k,w],
      [W,k,k,k,k,k,k,w],
      [W,k,k,k,k,k,k,w],
      [W,k,k,k,k,k,k,w],
      [W,W,W,W,W,W,k,k],
    ]))

    sprites.add('floorOrange1', Sprite.forSingleImage(images.get('floorOrange1')))
    sprites.add('floorOrange2', Sprite.forSingleImage(images.get('floorOrange2')))

    sprites.add('floorWhite1', Sprite.forSingleImage(images.get('floorWhite1')))
    sprites.add('floorWhite2', Sprite.forSingleImage(images.get('floorWhite2')))
  }

  init(sprites: SpriteController, instances: InstanceController) {
    const player = instances.factory('player', sprites.get('playerStanding'), playerUpdateFn)
    player.new({x: 8, y: 8})
    const floor1 = instances.simple(sprites, 'floorOrange1')
    const floor2 = instances.simple(sprites, 'floorOrange2')
    floor1.new({x: 8, y: 8 + 32})
    floor2.new({x: 8 + 8, y: 8 + 32})
    floor2.new({x: 8 + 16, y: 8 + 32})
    floor1.new({x: 8 + 24, y: 8 + 32})
    floor1.new({x: 8 + 32, y: 8 + 32})
    floor2.new({x: 8 + 48, y: 8 + 32})
  }

}


function playerUpdateFn(o: ObjectInstance<any, any>, gamepad: IGamepad, collisionChecker: CollisionChecker, sprites: SpriteController, instances: InstanceController, camera: Camera) {
  const playerJumping = sprites.get('playerJumping')
  const playerWalking = sprites.get('playerWalking')
  const playerStanding = sprites.get('playerStanding')

  if (o.props.dy === undefined) { o.props.dy = 0 }

  if (o.props.dy >= -3) o.props.dy -= 1 // terminal velocity so we do not fall through tiles (they are 8px tall)

  let newX = o.pos.x
  let newY = o.pos.y

  const bbox = o.toBBox()
  const itemsBelow = collisionChecker.searchBBox({
    minX: bbox.minX,
    maxX: bbox.maxX,
    minY: bbox.maxY + 1,
    maxY: bbox.maxY + 1,
  })
  const hasAirBelow = itemsBelow.length === 0

  if (!hasAirBelow) {
    o.props.dy = 0
    newY = itemsBelow[0].pos.y - 8
  }


  if (gamepad.isDpadPressed()) {
    const dir = gamepad.dpadDir()
    switch (dir) {
      case DPAD.LEFT:
      case DPAD.RIGHT:
        o.sprite = playerWalking
        // Flip the sprite if we press left/right
        o.hFlip = dir === DPAD.LEFT ? true : false
        break
      case DPAD.UP:
        if (!hasAirBelow) o.props.dy = 13
        break
      case DPAD.DOWN:
        o.sprite = playerJumping
        break
    }

    newX += (dir === DPAD.RIGHT ? 4 : dir === DPAD.LEFT ? -4 : 0)
    newY += (dir === DPAD.DOWN  ? 8 : 0)

  } else {
    o.sprite = playerStanding
  }



  if (o.props.dy !== 0) {
    newY -= Math.floor(o.props.dy / 3)
  }

  o.moveTo({
    x: newX,
    y: newY,
  })

}