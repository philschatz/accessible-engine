import {Game, Camera, SpriteController, IGamepad, Image, DefiniteMap, Sprite, InstanceController, DPAD, ObjectInstance, CollisionChecker, IPosition, GameObject, BUTTON_TYPE} from './engine'

export class MyGame implements Game {
  
  load(gamepad: IGamepad, sprites: SpriteController) {
    gamepad.listenTo([BUTTON_TYPE.ARROW_LEFT, BUTTON_TYPE.ARROW_RIGHT, BUTTON_TYPE.ARROW_DOWN, BUTTON_TYPE.ARROW_UP, BUTTON_TYPE.CLUSTER_BOTTOM])

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

    images.add('playerStanding', new Image([ // 032 & 048
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

    images.add('playerIdle1', new Image([ // 033 & 049
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

    images.add('playerIdle2', new Image([ // 034 & 050
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

    images.add('playerWalk1', new Image([ // 035 & 051
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

    images.add('playerWalk2', new Image([ // 036 & 052
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

    images.add('playerWalk3', new Image([ // 037 & 053
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


    images.add('playerWalk4', new Image([ // 038 & 054
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

    images.add('playerWalk5', new Image([ // 039 & 055
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

    images.add('playerWalk6', new Image([ // 040 & 056
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


    images.add('playerWalk7', new Image([ // 041 & 057
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

    images.add('playerWalk8', new Image([ // 042 & 058
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

    sprites.add('playerWalking', new Sprite(1, [
      images.get('playerWalk1'),
      images.get('playerWalk2'),
      images.get('playerWalk3'),
      images.get('playerWalk4'),
      images.get('playerWalk5'),
      images.get('playerWalk6'),
      images.get('playerWalk7'),
      images.get('playerWalk8'),
    ]))


    images.add('playerJumping', new Image([ // 044 & 060
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,g,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,B,w,w,w,B,w],
      [W,w,w,w,w,w,w,w],

      [W,w,w,w,w,w,w,w],
      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,z,w,w,w,w,z,z],
      [z,w,w,w,w,w,W,z],
      [z,z,W,w,w,w,z,z],
      [z,z,W,w,w,w,z,z],
      [z,z,W,z,z,W,z,z],
    ]))

    images.add('playerFalling', new Image([ // 045 & 061
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,z,z,z,z],
      [z,z,g,z,z,z,z,z],
      [z,z,g,r,z,z,z,z],
      [z,z,Y,r,z,z,z,z],
      [z,W,w,w,w,w,w,z],
      [W,w,B,w,w,w,B,w],
      [W,w,w,w,B,B,w,w],

      [W,w,w,w,p,B,w,w],
      [z,W,w,w,w,w,w,z],
      [z,z,z,W,w,z,z,z],
      [z,w,w,w,w,w,W,z],
      [z,z,w,w,w,w,z,z],
      [z,z,W,w,w,w,z,z],
      [z,W,W,w,w,w,W,z],
      [z,z,z,z,z,z,z,z],
    ]))

    images.add('floorOrange1', new Image([ // 001
      [g,g,g,g,g,g,g,g],
      [g,G,g,G,G,g,g,G],
      [G,o,G,o,o,G,G,k],
      [Y,o,o,o,o,o,o,k],
      [Y,o,o,o,o,o,o,k],
      [Y,o,o,o,o,o,o,k],
      [Y,o,o,o,o,o,o,k],
      [Y,Y,Y,Y,Y,Y,o,o],
    ]))

    images.add('floorOrange2', new Image([ // 002
      [g,g,g,g,g,g,g,g],
      [g,G,G,g,G,G,g,g],
      [G,o,o,G,o,o,G,g],
      [Y,o,o,o,o,o,o,G],
      [Y,o,o,o,o,o,o,k],
      [Y,o,o,o,o,o,o,k],
      [Y,o,o,o,o,o,o,k],
      [Y,Y,Y,Y,Y,Y,o,o],
    ]))


    images.add('floorWhite1', new Image([ // 003
      [g,g,g,g,g,g,g,g],
      [g,g,g,G,g,g,G,G],
      [G,g,G,k,G,G,k,w],
      [W,G,k,k,k,k,k,w],
      [W,k,k,k,k,k,k,w],
      [W,k,k,k,k,k,k,w],
      [W,k,k,k,k,k,k,w],
      [W,W,W,W,W,W,k,k],
    ]))

    images.add('floorWhite2', new Image([ // 004
      [g,g,g,g,g,g,g,g],
      [g,G,g,g,G,G,g,g],
      [G,k,G,G,k,k,G,G],
      [W,k,k,k,k,k,k,w],
      [W,k,k,k,k,k,k,w],
      [W,k,k,k,k,k,k,w],
      [W,k,k,k,k,k,k,w],
      [W,W,W,W,W,W,k,k],
    ]))

    images.add('floorLedge', new Image([ // 007
      [o,o,o,o,o,o,o,o],
      [R,R,R,R,R,R,R,R],
      [z,z,z,Y,Y,z,z,z],
      [z,z,z,Y,Y,z,z,z],
      [z,z,z,P,P,z,z,z],
      [z,z,z,P,P,z,z,z],
      [z,z,z,P,P,z,z,z],
      [z,z,z,z,z,z,z,z],
    ]))


    images.add('treeBottom', new Image([ // 014
      [g,g,g,g,g,g,g,g],
      [g,g,g,g,g,g,g,g],
      [g,g,g,g,g,g,g,g],
      [g,g,g,g,g,g,g,g],
      [g,g,g,g,g,g,g,g],
      [g,g,g,g,g,g,g,g],
      [G,G,g,G,G,g,g,G],
      [G,G,G,G,G,G,G,G],
    ]))

    images.add('treeTrunkLeft', new Image([ // 016
      [z,z,R,R,R,R,z,R],
      [z,z,z,z,z,R,z,R],
      [z,z,z,z,z,R,R,R],
      [z,z,z,z,z,z,R,R],
      [z,z,z,z,z,z,z,z],
      [z,z,z,z,R,R,R,R],
      [z,z,z,R,R,R,p,p],
      [z,z,z,R,R,p,R,p],
    ]))

    images.add('treeTrunkRight', new Image([ // 017
      [R,R,R,z,z,z,z,z],
      [R,z,z,z,z,z,z,z],
      [R,R,R,R,R,z,z,z],
      [R,R,R,p,R,R,z,z],
      [z,z,R,p,R,R,z,z],
      [R,R,R,p,R,R,z,z],
      [p,p,p,R,R,z,z,z],
      [p,R,R,R,z,z,z,z],
    ]))

    images.add('treeTopLeft', new Image([ // 008
      [g,g,g,g,g,g,g,g],
      [g,g,g,g,g,g,g,g],
      [g,g,g,g,g,g,g,g],
      [g,g,g,g,g,g,g,g],
      [g,g,g,G,g,g,g,g],
      [g,g,g,g,g,g,g,g],
      [g,g,g,g,g,g,g,g],
      [g,g,g,g,g,g,g,g],
    ]))

    images.add('treeTopRight', new Image([ // 009
      [g,g,g,g,g,g,g,g],
      [g,g,g,g,g,g,g,g],
      [g,g,g,g,g,g,g,g],
      [g,g,g,g,g,g,g,g],
      [g,g,g,g,g,g,g,g],
      [g,g,g,G,g,g,g,g],
      [g,g,G,g,G,g,g,g],
      [g,g,g,G,g,g,g,g],
    ]))

    

    images.add('wallOrange', new Image([ // 010
      [o,k,k,k,k,k,k,k],
      [R,o,o,o,o,o,o,k],
      [R,o,o,o,o,o,o,k],
      [R,o,o,o,o,o,o,k],
      [R,o,o,o,o,o,o,k],
      [R,o,o,o,o,o,o,k],
      [R,o,o,o,o,o,o,k],
      [R,R,R,R,R,R,o,o],
    ]))

    images.add('wallWhite', new Image([ // 011
      [k,w,w,w,w,w,w,w],
      [W,k,k,k,k,k,k,w],
      [W,k,k,k,k,k,k,w],
      [W,k,k,k,k,k,k,w],
      [W,k,k,k,k,k,k,w],
      [W,k,k,k,k,k,k,w],
      [W,k,k,k,k,k,k,w],
      [W,W,W,W,W,W,k,k],
    ]))

    images.add('wallCyan', new Image([ // 012
      [c,W,W,W,W,W,W,W],
      [P,c,c,c,c,c,c,W],
      [P,c,c,c,c,c,c,W],
      [P,c,c,c,c,c,c,W],
      [P,c,c,c,c,c,c,W],
      [P,c,c,c,c,c,c,W],
      [P,c,c,c,c,c,c,W],
      [P,P,P,P,P,P,c,c],
    ]))

    images.add('wallBrown', new Image([ // 013
      [Y,c,c,c,c,c,c,c],
      [P,Y,Y,Y,Y,Y,Y,c],
      [P,Y,Y,Y,Y,Y,Y,c],
      [P,Y,Y,Y,Y,Y,Y,c],
      [P,Y,Y,Y,Y,Y,Y,c],
      [P,Y,Y,Y,Y,Y,Y,c],
      [P,Y,Y,Y,Y,Y,Y,c],
      [P,P,P,P,P,P,Y,Y],
    ]))


    images.add('door', new Image([ // 236 & 252
      [K,K,K,K,K,K,K,K],
      [K,R,R,K,K,R,R,K],
      [K,R,R,K,K,R,R,K],
      [p,p,p,p,p,p,p,p],
      [R,R,R,R,R,R,R,R],
      [K,Y,Y,K,K,Y,Y,K],
      [K,R,R,K,K,R,R,K],
      [K,R,R,K,K,R,R,K],

      [K,R,R,K,K,R,R,K],
      [K,R,R,K,K,R,R,K],
      [K,R,R,K,K,R,R,K],
      [p,p,p,p,p,p,p,p],
      [R,R,R,R,R,R,R,R],
      [K,Y,Y,K,K,Y,Y,K],
      [K,K,Y,K,K,Y,Y,K],
      [K,K,K,K,K,K,K,K],
    ]))

    // Add all the images as single-image sprites too.
    for (const [name, image] of images.entries()) {
      sprites.add(name, Sprite.forSingleImage(image))
    }
  }

  init(sprites: SpriteController, instances: InstanceController) {
    const player = instances.factory('player', sprites.get('playerStanding'), playerUpdateFn)
    const floor1 = instances.simple(sprites, 'floorOrange1')
    const floor2 = instances.simple(sprites, 'floorOrange2')
    const floor3 = instances.simple(sprites, 'floorWhite1')
    const ledge = instances.simple(sprites, 'floorLedge')
    const wallO = instances.simple(sprites, 'wallOrange')
    const wallC = instances.simple(sprites, 'wallCyan')
    const wall2 = instances.simple(sprites, 'wallBrown')
    const door = instances.simple(sprites, 'door')

    const treeTopLeft = instances.simple(sprites, 'treeTopLeft')
    const treeTopRight = instances.simple(sprites, 'treeTopRight')
    const treeBottom = instances.simple(sprites, 'treeBottom')
    const treeTrunkLeft = instances.simple(sprites, 'treeTrunkLeft')
    const treeTrunkRight = instances.simple(sprites, 'treeTrunkRight')

    function g(item: GameObject<any, any>, pos: IPosition, zIndex: number) {
      // convert from grid coordinates to pixels
      const o = item.new({
        x: pos.x * 8,
        y: pos.y * 8,
      })
      if (zIndex === 0) { throw new Error('BUG: zIndex is only set to zero for the player')}
      o.zIndex = zIndex
      return o
    }


    g(floor1, {x:  5, y:  6}, 2)
    g(floor2, {x:  6, y:  6}, 2)
    g(floor1, {x:  7, y:  7}, 2)
    g(floor1, {x:  8, y:  7}, 2)
    g(floor2, {x:  9, y:  7}, 2)
    g(floor2, {x: 10, y:  7}, 2)
    g(floor1, {x: 11, y:  7}, 2)
    

    g(wallO, {x:  5, y:  7}, 2)
    g(wallO, {x:  6, y:  7}, 2)
    
    g(wallC, {x:  6, y:  8}, 2)
    g(wallC, {x:  7, y:  8}, 2)
    g(wallC, {x:  9, y:  8}, 2)
    g(wallC, {x: 10, y:  8}, 2)
    g(wallC, {x:  6, y:  9}, 2)
    g(wallC, {x:  7, y:  9}, 2)
    g(wallC, {x:  9, y:  9}, 2)
    g(wallC, {x: 10, y:  9}, 2)
    g(wallC, {x:  6, y: 10}, 2)
    g(wallC, {x:  7, y: 10}, 2)
    g(wallC, {x:  8, y: 10}, 3) // because of the sunken-in ledge
    g(wallC, {x:  9, y: 10}, 2)
    g(wallC, {x: 10, y: 10}, 2)
    g(wall2, {x:  6, y: 11}, 3)
    g(wallC, {x:  7, y: 11}, 3)
    g(wall2, {x:  8, y: 11}, 3)
    g(wallC, {x:  9, y: 11}, 3)

    g(door, {x:  8, y:  9}, 2)

    // draw these later so they show up on top of wall tiles
    g(ledge, {x:  5, y:  10}, 3)
    g(ledge, {x:  8, y:  10}, 2)
    g(ledge, {x: 11, y:  10}, 3)
    g(ledge, {x:  6, y:   9}, 1)
    g(ledge, {x: 10, y:   9}, 1)


    g(treeTrunkLeft,  {x: 8, y: 6}, 4)
    g(treeTrunkRight, {x: 9, y: 6}, 5)
    g(treeBottom,     {x: 8, y: 5}, 4)
    g(treeBottom,     {x: 9, y: 5}, 5)
    g(treeTopLeft,    {x: 8, y: 4}, 4)
    g(treeTopRight,   {x: 9, y: 4}, 5)



    // right side
    g(floor1, {x: 11, y:  7}, 3)
    g(floor1, {x: 11, y:  7}, 4)
    g(floor1, {x: 11, y:  7}, 5)
    
    g(floor3, {x: 11, y:  8}, 6) // these are just to keep the player up when rotating
    g(floor3, {x: 11, y:  8}, 7)
    g(floor3, {x: 11, y:  8}, 8)
    g(floor3, {x: 11, y:  8}, 9)
    g(floor3, {x: 11, y:  8}, 10)
    g(floor3, {x: 11, y:  8}, 11)

    g(door,   {x: 10, y:  9}, 3)
    g(door,   {x: 10, y:  9}, 4)
    g(wallC,  {x: 10, y:  8}, 5)
    g(wallC,  {x: 10, y:  9}, 5)
    // g(wallC,  {x:  9, y: 10}, 4)
    g(ledge,  {x: 10, y: 10}, 4)


    // back side
    g(wall2, {x:  8, y:  8}, 3)
    g(wall2, {x:  8, y:  9}, 3)
    g(ledge, {x:  8, y: 10}, 3)
    g(wallC, {x:  8, y: 11}, 2)
    g(wallC, {x:  7, y: 11}, 3)
    g(wallC, {x:  6, y: 11}, 2)


    

    g(player, {x: 11, y:  9}, 1)

  }

}

const EVERYTHING_BBOX = {
  minX: -1000,
  maxX: 1000,
  minY: -1000,
  maxY: 1000,
}

type PlayerProps = {
  zreal: number
  xreal: number
  yreal: number
  still: number
  dz: number
  maxfall: number
  coyote: number
  coyotemax: number
  reswait: number
  // tile coordinates
  x: number
  y: number
  z: number
  
  jump: number
  landed: boolean
  lwait: number
  dropwait: number
  dwaitmax: number
  canuse: boolean
  usewait: number
  useidle: number
  mir: boolean // horizontally mirror the sprite
  frame: number

  dpos: number
  floor: boolean
  xlast: number
  ylast: number
  zlast: number

  slast: number // side last
  open: boolean // not sure of the type
  olast: boolean

  side: number // the world orientation
}

function playerUpdateFn(o: ObjectInstance<PlayerProps, any>, gamepad: IGamepad, collisionChecker: CollisionChecker, sprites: SpriteController, instances: InstanceController, camera: Camera) {
  const floors = [
    sprites.get('treeTopLeft'),
    sprites.get('treeTopRight'),
    sprites.get('floorOrange1'),
    sprites.get('floorOrange2'),
    sprites.get('floorWhite1'),
    sprites.get('floorWhite2'),
    sprites.get('floorLedge'),
  ]

  // initialize the props
  if (o.props.zreal === undefined) {
    o.props.xreal = 40
    o.props.yreal = 30
    o.props.zreal = 100
    o.props.still = 0
    o.props.dz = -3 // since we start out mid-air
    o.props.maxfall = -9
    o.props.coyote = 0
    o.props.coyotemax = 5
    o.props.reswait = 0
    o.props.z = 0 // ???
    o.props.jump = 13


    o.props.landed = true
    o.props.lwait = 0
    o.props.dropwait = 0
    o.props.dwaitmax = 8
    o.props.canuse = false
    o.props.usewait = 0
    o.props.useidle = 0
    o.props.mir = false
    o.props.frame = 0
    o.props.still = 165

    o.props.side = 0 // front

    // initialize the 3D coordinates for each object
    collisionChecker.searchBBox(EVERYTHING_BBOX)
    .forEach(ob => {
      ob.props.x = from_real(ob.pos.x)
      ob.props.y = from_real(ob.pos.y)
      ob.props.z = checkNaN(ob.zIndex)
    })

    // the player is always in front
    o.zIndex = 0
  }

  move_player(o, gamepad, collisionChecker, sprites, instances, camera, floors)
  draw_player(true, o, sprites)

}


function move_player(o: ObjectInstance<PlayerProps, any>, gamepad: IGamepad, collisionChecker: CollisionChecker, sprites: SpriteController, instances: InstanceController, camera: Camera, floors: Sprite[]) {
  const p = o.props

  const n1 = -1 // negativeOne just to reduce tokens
  // only 1 of these is true
  const sfront = true
  const sleft = false
  const sright = false
  const sback = false
  const intro = 85
  let r_dir = 0
  let r_wait = 0

   // actions
   if (p.lwait > 0) { p.lwait -= 1 }
   if (intro >= 85) {
      if (gamepad.isButtonPressed(BUTTON_TYPE.BUMPER_TOP_LEFT)) { rotate_world(-2, o, collisionChecker) }
      if (gamepad.isButtonPressed(BUTTON_TYPE.BUMPER_TOP_RIGHT)) { rotate_world(+1, o, collisionChecker) }
      let count = Date.now()
      // HACK loop until user stopped pressing the button
      while (gamepad.isButtonPressed(BUTTON_TYPE.BUMPER_TOP_LEFT) || gamepad.isButtonPressed(BUTTON_TYPE.BUMPER_TOP_RIGHT)) {
        if (count + 1000 > Date.now()) { break }
      }
      // rotate right
      if (gamepad.isButtonPressed(BUTTON_TYPE.CLUSTER_BOTTOM) && p.landed) {
         r_dir = n1
         r_wait = 0
         sfx(11)
      // rotate left
      } else if (gamepad.isButtonPressed(BUTTON_TYPE.CLUSTER_LEFT) && p.landed) {
         r_dir = 1
         r_wait = 0
         sfx(10)
      } else {
         // move
         let dp = 0
         if (gamepad.isButtonPressed(BUTTON_TYPE.ARROW_LEFT)) { dp -= 1 }
         if (gamepad.isButtonPressed(BUTTON_TYPE.ARROW_RIGHT)) { dp += 1 }
         if (dp < 0) { p.mir = true
         } else if (dp > 0) { p.mir = false }
         
         p.dpos = dp
         
         if (sfront) {
            p.xreal += p.dpos
         } else if (sleft) {
            p.yreal += p.dpos
         } else if (sback) {
            p.xreal -= p.dpos
         } else if (sright) {
            p.yreal -= p.dpos
         }
      }
   }
   // animate
   if (p.dpos == 0) {
      if (p.still == 0) {
         p.frame = 0
      } else if (p.still > 200) {
         p.frame += 1
         if (p.frame > 5) {
            p.still,p.frame = 0,0
         }
      }
      p.still += 1
   } else {
      if (p.still > 0) {
         p.still,p.frame = 0,0
      }
      p.frame = incmod(p.frame,24)
   }
   pzmove(o, gamepad, collisionChecker, sprites, instances, camera, floors)
}



function sfx(id: number) { }

function incmod(n1: number, n2: number) {
  return (n1 + 1) % n2
}

function flr(n: number) {
  return Math.floor(n)
}

function pgetpos(o: ObjectInstance<PlayerProps, any>) {
  o.props.x = from_real(o.props.xreal)
  o.props.y = from_real(o.props.yreal)
  o.props.z = from_real(o.props.zreal)
}

function from_real(n: number) {
  return flr(n/8)
}

function to_real(n: number) {
  return n*8
}

function savelast() { }

function find_floor(layerNum: any, o: ObjectInstance<PlayerProps, any>, collisionChecker: CollisionChecker, floors: Sprite[]) {

  const bbox = o.toBBox()
  const x = Math.round((bbox.maxX + bbox.minX) / 2)
  const itemsBelow = collisionChecker.searchBBox({
    minX: x,
    maxX: x,
    minY: bbox.maxY + 1, // chose these because jumping does not result in mid-air player
    maxY: bbox.maxY + 7,
  })
  .filter(item => floors.indexOf(item.sprite) >= 0) // only look at the floors

  return itemsBelow.length !== 0
}











function pzmove(o: ObjectInstance<PlayerProps, any>, gamepad: IGamepad, collisionChecker: CollisionChecker, sprites: SpriteController, instances: InstanceController, camera: Camera, floors: Sprite[]) {
  const p = o.props

  const n1 = -1 // negativeOne just to reduce tokens
  // only 1 of these is true
  const sfront = true
  const sleft = false
  const sright = false
  const sback = false
  const intro = 85
  let r_dir = 0
  let r_wait = 0

  const talkline = 0
  let side = 0 // front,left,right,back or something
  
   pgetpos(o)
   // vertical movement
   p.floor = find_floor(p.z, o, collisionChecker, floors)
   // if in the air
   if (! p.floor || p.dz > 0) {
      p.landed = false
   }
   // if falling
   if (p.dz <= 0) {
      // if floor approaching
      if (p.floor) {
         let znext = from_real(p.zreal+flr(p.dz/3))
         if (znext < p.z) {
            // land
            p.zreal = checkNaN(p.z*8)
            if (p.zreal%8 == 0 && ! p.landed) {
               p.landed = true
               p.lwait = 3
               p.dz = 0
               p.coyote = p.coyotemax
               sfx(23)
            }
         }
      }
   }
   // jump/drop if (landed
   if (intro >= 85 && talkline == 0 && (p.landed || p.coyote > 0)) {
      if (p.lwait <= 0) {
         // drop down
         if (gamepad.isButtonPressed(BUTTON_TYPE.ARROW_DOWN) && p.usewait <= 0) {
            p.dropwait += 1
         } else {
            p.dropwait = 0
         }
         // execute jump/drop
         if (gamepad.isButtonPressed(BUTTON_TYPE.ARROW_UP) || gamepad.isButtonPressed(BUTTON_TYPE.CLUSTER_BOTTOM) || p.dropwait >= p.dwaitmax) {
            if (p.dropwait >= 5) {
              debugger
               p.dz = -2
            } else {
               p.dz = p.jump
               sfx(8)
            }
            p.dropwait,p.floor,p.landed,p.coyote = 0,false,false,0
         } else { p.dz = 0
         }
      }
   }
   // gravity/coyote time
   if (! p.landed && p.dz > p.maxfall) {
      if (p.coyote > 0) {
         p.coyote -= 1
      } else {
         p.dz -= 1
      }
   }
   // save last safe position
   if (p.coyote >= p.coyotemax) {
      savelast()
   }
   // update position
   p.zreal += checkNaN(flr(p.dz/3))
   // respawn
   if (p.zreal < 0) {
      if (p.reswait <= 0) {
         sfx(9)
         p.reswait = 30
      } else {
         p.reswait -= 1
         if (p.reswait <= 0) {
           p.xreal = p.xlast
           p.yreal = p.ylast
           p.zreal = checkNaN(p.zlast)
           side = p.slast
           p.open = p.olast
           p.landed = true
           p.dz = 0
           p.coyote = p.coyotemax
         }
      }
   }
}








function draw_player(front: boolean, o: ObjectInstance<any, any>, sprites: SpriteController) {
  const atrans = 0
  const happy = false

  const playerStanding = sprites.get('playerStanding')
  const playerWalking = sprites.get('playerWalking')
  const playerJumping = sprites.get('playerJumping')
  const playerFalling = sprites.get('playerFalling')
  // const happySprite = sprites.get('playerHappy')

  const p = o.props
  
  if (p.otrans > 0 || atrans > 0) {
    // pal_hidden()
    console.log('Draw shadowed sprite')
  }
  let sp = playerStanding
  // if (happy > 0) { sp = happySprite }
  /*else*/ if (p.dz > 0 || istalk()) { sp = playerJumping }
  else if (p.floor == false) { sp = playerFalling }
  else if (p.dpos != 0) { sp = playerWalking }


  o.setSprite(sp)
  
  // draw_player_feet(front,sp)
  draw_player_head(front, o)
  // pal()
}

function istalk() { return false }


function draw_player_head(front: boolean, o: ObjectInstance<any, any>) {
  const p = o.props

  const cur_x = 0
  const cur_y = 0
  const cur_z = 0
  const r_factor = 0
  const sleft = false
  const sright = false
  const sback = false

  if (front || (p.x == cur_x && p.y == cur_y && p.z+1 == cur_z)) {
  let zz = 112-p.zreal
  let xx = 12+p.xreal+r_factor*(p.yreal/8-4)
  if (p.usewait <= 0 &&
    !istalk() &&
    (p.lwait > 0 || p.dropwait > 0)) {
    zz += 1
  }
  if (sleft) {
    xx = 28+p.yreal-r_factor*(p.xreal/8-6)
  } else if (sback) {
    xx = 108-p.xreal-r_factor*(p.yreal/8-4)
  } else if (sright) {
    xx = 92-p.yreal+r_factor*(p.xreal/8-6)
  }

  o.hFlip = p.mir
  o.moveTo({x: xx, y: zz})
  //  sspr(8*flr(sp-32),16,8,10,xx,zz,8,10,p.mir,false)
  }
}


function checkNaN(n: number) {
  if (Number.isNaN(n)) { 
    throw new Error('Expected number to not be NaN but failed')
  }
  return n
}



function rotate_world(dir: number, o: ObjectInstance<PlayerProps, any>, collisionChecker: CollisionChecker) {
  o.props.side = (o.props.side + dir + 4) % 4
  const things = collisionChecker.searchBBox(EVERYTHING_BBOX)
  things.forEach(ob => {
    let x = 0
    let y = 0
    let z = 0
    switch (o.props.side) {
      case 0: // front
        x = ob.props.x
        y = ob.props.y
        z = ob.props.z
        break
      case 1: // right
        x = ob.props.z
        y = ob.props.y
        z = ob.props.x
        break
      case 2: // back
        x = 12-ob.props.x
        y = ob.props.y
        z = 1000 - ob.props.z // since zIndex needs to be positive
        break
      case 3: // left
        x = 12-ob.props.z
        y = ob.props.y
        z = 1000 - ob.props.x
        break
      default: throw new Error(`BUG: Invalid side "${o.props.side}"`)
    }
    ob.moveTo({
      x: to_real(x),
      y: to_real(y),
    })
    if (z <= 0) { throw new Error(`BUG: zIndex should always be > 0 but it was "${z}"`)}
    ob.zIndex = z
  })
  o.zIndex = 0 // player is always on top
}