import {Game, Camera, SpriteController, IGamepad, Image, DefiniteMap, Sprite, InstanceController, DPAD, ObjectInstance, CollisionChecker, IPosition, GameObject} from './engine'

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
    const floorLedge = instances.simple(sprites, 'floorLedge')
    const wallO = instances.simple(sprites, 'wallOrange')
    const wallC = instances.simple(sprites, 'wallCyan')
    const wall2 = instances.simple(sprites, 'wallBrown')
    const door = instances.simple(sprites, 'door')

    const treeTopLeft = instances.simple(sprites, 'treeTopLeft')
    const treeTopRight = instances.simple(sprites, 'treeTopRight')
    const treeBottom = instances.simple(sprites, 'treeBottom')
    const treeTrunkLeft = instances.simple(sprites, 'treeTrunkLeft')
    const treeTrunkRight = instances.simple(sprites, 'treeTrunkRight')

    function g(item: GameObject<any, any>, pos: IPosition) {
      // convert from grid coordinates to pixels
      item.new({
        x: pos.x * 8,
        y: pos.y * 8,
      })
    }


    g(floor1, {x:  5, y:  6})
    g(floor2, {x:  6, y:  6})
    g(floor1, {x:  7, y:  7})
    g(floor1, {x:  8, y:  7})
    g(floor2, {x:  9, y:  7})
    g(floor2, {x: 10, y:  7})
    g(floor1, {x: 11, y:  7})

    g(wallO, {x:  5, y:  7})
    g(wallO, {x:  6, y:  7})
    
    g(wallC, {x:  6, y:  8})
    g(wallC, {x:  7, y:  8})
    g(wallC, {x:  9, y:  8})
    g(wallC, {x: 10, y:  8})
    g(wallC, {x:  6, y:  9})
    g(wallC, {x:  7, y:  9})
    g(wallC, {x:  9, y:  9})
    g(wallC, {x: 10, y:  9})
    g(wallC, {x:  6, y: 10})
    g(wallC, {x:  7, y: 10})
    g(wallC, {x:  8, y: 10})
    g(wallC, {x:  9, y: 10})
    g(wallC, {x: 10, y: 10})
    g(wall2, {x:  6, y: 11})
    g(wallC, {x:  7, y: 11})
    g(wall2, {x:  8, y: 11})
    g(wallC, {x:  9, y: 11})

    g(door, {x:  8, y:  9})

    // draw these later so they show up on top of wall tiles
    g(floorLedge, {x:  8, y:  10})
    g(floorLedge, {x:  5, y:  10})
    g(floorLedge, {x: 11, y:  10})
    g(floorLedge, {x:  6, y:   9})
    g(floorLedge, {x: 10, y:   9})


    g(treeTrunkLeft,  {x: 8, y: 6})
    g(treeTrunkRight, {x: 9, y: 6})
    g(treeBottom,     {x: 8, y: 5})
    g(treeBottom,     {x: 9, y: 5})
    g(treeTopLeft,    {x: 8, y: 4})
    g(treeTopRight,   {x: 9, y: 4})


    g(player, {x:  11, y:  9})

  }

}


function playerUpdateFn(o: ObjectInstance<any, any>, gamepad: IGamepad, collisionChecker: CollisionChecker, sprites: SpriteController, instances: InstanceController, camera: Camera) {
  const playerJumping = sprites.get('playerJumping')
  const playerFalling = sprites.get('playerFalling')
  const playerWalking = sprites.get('playerWalking')
  const playerStanding = sprites.get('playerStanding')

  const floors = [
    sprites.get('treeTopLeft'),
    sprites.get('treeTopRight'),
    sprites.get('floorOrange1'),
    sprites.get('floorOrange2'),
    sprites.get('floorWhite1'),
    sprites.get('floorWhite2'),
    sprites.get('floorLedge'),
  ]

  if (o.props.dy === undefined) { o.props.dy = 0 }

  if (o.props.dy >= -3) o.props.dy -= 1 // terminal velocity so we do not fall through tiles (they are 8px tall)

  let newSprite = null
  let newX = o.pos.x
  let newY = o.pos.y

  const bbox = o.toBBox()
  const itemsBelow = collisionChecker.searchBBox({
    minX: bbox.minX,
    maxX: bbox.maxX,
    minY: bbox.maxY + 1,
    maxY: bbox.maxY + 1,
  }).filter(item => floors.indexOf(item.sprite) >= 0) // only look at the floors

  const hasAirBelow = itemsBelow.length === 0
  // Floor sprites are treeTopLeft,treeTopRight,floorOrange1,floorOrange2,floorWhite1,floorWhite2

  if (!hasAirBelow && o.props.dy <= 0) {
    o.props.lastSafePosition = o.pos // save in case player dies
    o.props.dy = 0
    newY = itemsBelow[0].pos.y - 8
  }


  if (gamepad.isDpadPressed()) {
    const dir = gamepad.dpadDir()
    switch (dir) {
      case DPAD.LEFT:
      case DPAD.RIGHT:
        newSprite = playerWalking
        // Flip the sprite if we press left/right
        o.hFlip = dir === DPAD.LEFT ? true : false
        break
      case DPAD.UP:
        if (!hasAirBelow && o.props.dy <= 0) o.props.dy = 10// 13
        break
      case DPAD.DOWN:
        break
    }

    newX += (dir === DPAD.RIGHT ? 1 : dir === DPAD.LEFT ? -1 : 0)
    newY += (dir === DPAD.DOWN  ? 8 : 0)

  } else {
    newSprite = playerStanding
  }



  if (o.props.dy !== 0) {
    newY -= Math.floor(o.props.dy / 3) // the game used '3'
  }

  if (o.props.dy > 0) {
    newSprite = playerJumping
  } else if (o.props.dy < 0) {
    newSprite = playerFalling
  }

  if (newSprite !== null) {
    o.setSprite(newSprite)
  }

  if (o.pos.y > 100) { 
    // restore the user from the last safe ground they stood on
    o.moveTo(o.props.lastSafePosition)
  } else {
    o.moveTo({
      x: newX,
      y: newY,
    })
  }

}