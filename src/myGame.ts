import {Game, Camera, SpriteController, Gamepad, Image, DefiniteMap, Sprite, InstanceController, DPAD} from './engine'

export class MyGame implements Game {
  
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


    images.add('landOrange1', new Image([
      [g,g,g,g,g,g,g,g],
      [g,G,g,G,G,g,g,G],
      [G,o,G,o,o,G,G,k],
      [Y,o,o,o,o,o,o,k],
      [Y,o,o,o,o,o,o,k],
      [Y,o,o,o,o,o,o,k],
      [Y,o,o,o,o,o,o,k],
      [Y,Y,Y,Y,Y,Y,o,o],
    ]))

    sprites.add('landOrange1', Sprite.forSingleImage(images.get('landOrange1')))
  }

  init(sprites: SpriteController, instances: InstanceController) {
    instances.factory('player', sprites.get('playerStanding')).new({x: 8, y: 8})
    const land = instances.factory('landOrange1', sprites.get('landOrange1'))
    land.new({x: 0, y: 8 + 16})
    land.new({x: 0 + 8, y: 8 + 16})
    land.new({x: 0 + 16, y: 8 + 16})
    land.new({x: 0 + 24, y: 8 + 16})
    land.new({x: 0 + 32, y: 8 + 16})
    land.new({x: 0 + 48, y: 8 + 16})
  }

  update(gamepad: Gamepad, sprites: SpriteController, instances: InstanceController, camera: Camera) {
    const playerJumping = sprites.get('playerJumping')
    const playerWalking = sprites.get('playerWalking')
    const playerStanding = sprites.get('playerStanding')

    const players = instances.findAll('player')

    for (const p of players) {
      if (gamepad.isDpadPressed()) {
        const dir = gamepad.dpadDir()

        switch (dir) {
          case DPAD.LEFT:
          case DPAD.RIGHT:
            p.sprite = playerWalking
            break
          case DPAD.UP:
          case DPAD.DOWN:
            p.sprite = playerJumping
            break
        }
        // Flip the sprite if we press left/right
        p.hFlip = dir === DPAD.LEFT ? true : dir === DPAD.RIGHT ? false : p.hFlip

        p.moveTo({
          x: p.pos.x + (dir === DPAD.RIGHT ? 4 : dir === DPAD.LEFT ? -4 : 0),
          y: p.pos.y + (dir === DPAD.DOWN  ? 4 : dir === DPAD.UP   ? -4 : 0),
        })
      } else {
        p.sprite = playerStanding
      }
    }
  }
}
