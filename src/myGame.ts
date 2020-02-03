import { Game, Camera, SpriteController, Image, DefiniteMap, Sprite, InstanceController, DPAD, ObjectInstance, CollisionChecker, IPosition, GameObject, zIndexComparator, IPixel, DrawPixelsFn, ShowDialogFn, SimpleObject, Opt, DrawTextFn } from './engine'
import { setMoveTo, DoubleArray } from './terminal'
import { BBox } from 'rbush'
import { IGamepad, BUTTON_TYPE } from './gamepad/api'

const CAMERA_SIZE = {
  width: 128,
  height: 96
}

export class MyGame implements Game {

  load(gamepad: IGamepad, sprites: SpriteController) {
    // gamepad.listenTo([BUTTON_TYPE.ARROW_LEFT, BUTTON_TYPE.ARROW_RIGHT, BUTTON_TYPE.ARROW_DOWN, BUTTON_TYPE.ARROW_UP, BUTTON_TYPE.CLUSTER_BOTTOM])

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
      [z, z, z, z, z, z, z, z],
      [z, z, z, z, z, z, z, z],
      [z, z, z, z, z, z, z, z],
      [z, z, g, r, z, z, z, z],
      [z, g, Y, r, z, z, z, z],
      [z, W, w, w, w, w, w, z],
      [W, w, w, w, w, w, w, w],
      [W, w, B, w, w, w, B, w],

      [W, w, w, w, w, w, w, w],
      [z, W, w, w, w, w, w, z],
      [z, z, z, W, w, z, z, z],
      [z, z, w, w, w, w, z, z],
      [z, w, w, w, w, w, W, z],
      [z, z, W, w, w, w, z, z],
      [z, z, W, w, w, w, z, z],
      [z, z, W, z, z, W, z, z],
    ]))

    images.add('playerIdle1', new Image([ // 033 & 049
      [z, z, z, z, z, z, z, z],
      [z, z, z, z, z, z, z, z],
      [z, z, z, z, z, z, z, z],
      [z, z, g, r, z, z, z, z],
      [z, g, Y, r, z, z, z, z],
      [z, W, w, w, w, w, w, z],
      [W, w, w, w, w, w, w, w],
      [W, w, W, W, w, W, W, w],

      [W, w, w, w, w, w, w, w],
      [z, W, w, w, w, w, w, z],
      [z, z, z, W, w, z, z, z],
      [z, z, w, w, w, w, z, z],
      [z, w, w, w, w, w, W, z],
      [z, z, W, w, K, w, z, z],
      [z, z, W, w, w, w, z, z],
      [z, z, W, z, z, W, z, z],
    ]))

    images.add('playerIdle2', new Image([ // 034 & 050
      [z, z, z, z, z, z, z, z],
      [z, z, z, z, z, z, z, z],
      [z, z, z, z, z, z, z, z],
      [z, z, g, r, z, z, z, z],
      [z, g, Y, r, z, z, z, z],
      [z, W, w, w, w, w, w, z],
      [W, w, w, w, w, w, w, w],
      [W, w, p, p, w, p, p, w],

      [W, w, w, w, w, w, w, w],
      [z, W, w, w, w, w, w, z],
      [z, z, z, W, w, z, z, z],
      [z, z, w, w, w, w, z, z],
      [z, w, w, w, w, w, W, z],
      [z, z, W, w, w, w, z, z],
      [z, z, W, w, w, w, z, z],
      [z, z, W, z, z, W, z, z],
    ]))

    images.add('playerWalk1', new Image([ // 035 & 051
      [z, z, z, z, z, z, z, z],
      [z, z, z, z, z, z, z, z],
      [z, z, g, r, z, z, z, z],
      [z, z, g, r, z, z, z, z],
      [z, W, w, w, w, w, w, z],
      [W, w, w, w, w, w, w, w],
      [W, w, B, w, w, w, B, w],
      [W, w, w, w, B, w, w, w],

      [z, W, w, w, w, w, w, z],
      [z, z, z, W, w, z, z, z],
      [z, z, w, w, w, w, z, z],
      [z, z, w, w, w, w, z, z],
      [z, w, W, w, w, w, W, z],
      [z, z, w, w, w, w, z, z],
      [z, z, z, z, z, w, z, z],
      [z, z, z, z, z, W, z, z],
    ]))

    images.add('playerWalk2', new Image([ // 036 & 052
      [z, z, z, z, z, z, z, z],
      [z, z, g, r, z, z, z, z],
      [z, g, Y, r, z, z, z, z],
      [z, W, w, w, w, w, w, z],
      [W, w, w, w, w, w, w, w],
      [W, w, B, w, w, w, B, w],
      [W, w, w, w, B, B, w, w],
      [z, W, w, w, w, w, w, z],

      [z, z, z, W, w, z, z, z],
      [z, z, w, w, w, w, z, z],
      [z, w, w, w, w, w, W, z],
      [z, z, w, w, w, w, z, z],
      [z, z, w, w, w, w, z, z],
      [z, z, W, z, W, w, z, z],
      [z, z, z, z, z, z, z, z],
      [z, z, z, z, z, z, z, z],
    ]))

    images.add('playerWalk3', new Image([ // 037 & 053
      [z, z, z, z, z, z, z, z],
      [z, z, z, z, z, z, z, z],
      [z, g, g, r, z, z, z, z],
      [z, z, Y, r, z, z, z, z],
      [z, W, w, w, w, w, w, z],
      [W, w, w, w, w, w, w, w],
      [W, w, B, w, w, w, B, w],
      [W, w, w, w, B, B, w, w],

      [z, W, w, w, w, w, w, z],
      [z, z, z, W, w, z, z, z],
      [z, w, w, w, w, w, W, z],
      [z, z, w, w, w, w, z, z],
      [z, z, W, w, w, w, z, z],
      [z, z, w, w, w, w, z, z],
      [z, z, W, w, W, z, z, z],
      [z, z, z, W, z, z, z, z],
    ]))


    images.add('playerWalk4', new Image([ // 038 & 054
      [z, z, z, z, z, z, z, z],
      [z, z, z, z, z, z, z, z],
      [z, z, z, z, z, z, z, z],
      [z, z, g, r, z, z, z, z],
      [z, g, Y, r, z, z, z, z],
      [z, W, w, w, w, w, w, z],
      [W, w, w, w, w, w, w, w],
      [W, w, B, w, w, w, B, w],

      [W, w, w, w, w, B, w, w],
      [z, W, w, w, w, w, w, z],
      [z, z, z, W, w, z, z, z],
      [z, z, w, w, w, w, z, z],
      [z, w, w, w, w, w, W, z],
      [z, z, W, w, w, w, z, z],
      [z, z, w, w, w, W, z, z],
      [z, z, W, z, z, z, z, z],
    ]))

    images.add('playerWalk5', new Image([ // 039 & 055
      [z, z, z, z, z, z, z, z],
      [z, z, z, z, z, z, z, z],
      [z, z, g, r, z, z, z, z],
      [z, z, g, r, z, z, z, z],
      [z, W, w, w, w, w, w, z],
      [W, w, w, w, w, w, w, w],
      [W, w, B, w, w, w, B, w],
      [W, w, w, w, w, w, w, w],

      [z, W, w, w, w, w, w, z],
      [z, z, z, W, w, z, z, z],
      [z, z, W, w, w, w, z, z],
      [z, z, w, w, w, w, z, z],
      [z, z, w, W, w, w, z, z],
      [z, z, W, w, w, w, W, z],
      [z, z, w, z, z, z, z, z],
      [z, z, W, z, z, z, z, z],
    ]))

    images.add('playerWalk6', new Image([ // 040 & 056
      [z, z, z, z, z, z, z, z],
      [z, z, g, r, z, z, z, z],
      [z, g, Y, r, z, z, z, z],
      [z, W, w, w, w, w, w, z],
      [W, w, w, w, w, w, w, w],
      [W, w, B, w, w, w, B, w],
      [W, w, w, w, w, w, w, w],
      [z, W, w, w, w, w, w, z],

      [z, z, z, W, w, z, z, z],
      [z, z, W, w, w, w, z, z],
      [z, z, W, w, w, w, z, z],
      [z, z, w, W, w, w, z, z],
      [z, z, w, w, w, w, w, z],
      [z, W, w, z, z, z, W, z],
      [z, z, z, z, z, z, z, z],
      [z, z, z, z, z, z, z, z],
    ]))


    images.add('playerWalk7', new Image([ // 041 & 057
      [z, z, z, z, z, z, z, z],
      [z, z, z, z, z, z, z, z],
      [z, g, g, r, z, z, z, z],
      [z, z, Y, r, z, z, z, z],
      [z, W, w, w, w, w, w, z],
      [W, w, w, w, w, w, w, w],
      [W, w, B, w, w, w, B, w],
      [W, w, w, w, w, w, w, w],

      [z, W, w, w, w, w, w, z],
      [z, z, z, W, w, z, z, z],
      [z, z, W, w, w, w, z, z],
      [z, z, w, W, w, w, z, z],
      [z, z, w, w, w, w, z, z],
      [z, W, w, w, w, w, z, z],
      [z, z, z, z, z, W, w, z],
      [z, z, z, z, z, z, W, z],
    ]))

    images.add('playerWalk8', new Image([ // 042 & 058
      [z, z, z, z, z, z, z, z],
      [z, z, z, z, z, z, z, z],
      [z, z, z, z, z, z, z, z],
      [z, z, g, r, z, z, z, z],
      [z, g, Y, r, z, z, z, z],
      [z, W, w, w, w, w, w, z],
      [W, w, w, w, w, w, w, w],
      [W, w, B, w, w, w, B, w],

      [W, w, w, w, w, w, w, w],
      [z, W, w, w, w, w, w, z],
      [z, z, z, W, w, z, z, z],
      [z, z, W, w, w, w, z, z],
      [z, z, w, w, w, w, z, z],
      [z, z, W, W, w, w, z, z],
      [z, z, W, w, w, w, z, z],
      [z, z, z, z, z, w, z, z],
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
      [z, z, z, z, z, z, z, z],
      [z, z, z, z, z, z, z, z],
      [z, z, z, z, z, z, z, z],
      [z, z, g, r, z, z, z, z],
      [z, g, Y, r, z, z, z, z],
      [z, W, w, w, w, w, w, z],
      [W, w, B, w, w, w, B, w],
      [W, w, w, w, w, w, w, w],

      [W, w, w, w, w, w, w, w],
      [z, W, w, w, w, w, w, z],
      [z, z, z, W, w, z, z, z],
      [z, z, w, w, w, w, z, z],
      [z, w, w, w, w, w, W, z],
      [z, z, W, w, w, w, z, z],
      [z, z, W, w, w, w, z, z],
      [z, z, W, z, z, W, z, z],
    ]))

    images.add('playerFalling', new Image([ // 045 & 061
      [z, z, z, z, z, z, z, z],
      [z, z, z, z, z, z, z, z],
      [z, z, g, z, z, z, z, z],
      [z, z, g, r, z, z, z, z],
      [z, z, Y, r, z, z, z, z],
      [z, W, w, w, w, w, w, z],
      [W, w, B, w, w, w, B, w],
      [W, w, w, w, B, B, w, w],

      [W, w, w, w, p, B, w, w],
      [z, W, w, w, w, w, w, z],
      [z, z, z, W, w, z, z, z],
      [z, w, w, w, w, w, W, z],
      [z, z, w, w, w, w, z, z],
      [z, z, W, w, w, w, z, z],
      [z, W, W, w, w, w, W, z],
      [z, z, z, z, z, z, z, z],
    ]))

    images.add('floorOrange1', new Image([ // 001
      [g, g, g, g, g, g, g, g],
      [g, G, g, G, G, g, g, G],
      [G, o, G, o, o, G, G, k],
      [Y, o, o, o, o, o, o, k],
      [Y, o, o, o, o, o, o, k],
      [Y, o, o, o, o, o, o, k],
      [Y, o, o, o, o, o, o, k],
      [Y, Y, Y, Y, Y, Y, o, o],
    ]))

    images.add('floorOrange2', new Image([ // 002
      [g, g, g, g, g, g, g, g],
      [g, G, G, g, G, G, g, g],
      [G, o, o, G, o, o, G, g],
      [Y, o, o, o, o, o, o, G],
      [Y, o, o, o, o, o, o, k],
      [Y, o, o, o, o, o, o, k],
      [Y, o, o, o, o, o, o, k],
      [Y, Y, Y, Y, Y, Y, o, o],
    ]))


    images.add('floorWhite1', new Image([ // 003
      [g, g, g, g, g, g, g, g],
      [g, g, g, G, g, g, G, G],
      [G, g, G, k, G, G, k, w],
      [W, G, k, k, k, k, k, w],
      [W, k, k, k, k, k, k, w],
      [W, k, k, k, k, k, k, w],
      [W, k, k, k, k, k, k, w],
      [W, W, W, W, W, W, k, k],
    ]))

    images.add('floorWhite2', new Image([ // 004
      [g, g, g, g, g, g, g, g],
      [g, G, g, g, G, G, g, g],
      [G, k, G, G, k, k, G, G],
      [W, k, k, k, k, k, k, w],
      [W, k, k, k, k, k, k, w],
      [W, k, k, k, k, k, k, w],
      [W, k, k, k, k, k, k, w],
      [W, W, W, W, W, W, k, k],
    ]))

    images.add('floorLedge', new Image([ // 007
      [o, o, o, o, o, o, o, o],
      [R, R, R, R, R, R, R, R],
      [z, z, z, Y, Y, z, z, z],
      [z, z, z, Y, Y, z, z, z],
      [z, z, z, P, P, z, z, z],
      [z, z, z, P, P, z, z, z],
      [z, z, z, P, P, z, z, z],
      [z, z, z, z, z, z, z, z],
    ]))


    images.add('treeBottom', new Image([ // 014
      [g, g, g, g, g, g, g, g],
      [g, g, g, g, g, g, g, g],
      [g, g, g, g, g, g, g, g],
      [g, g, g, g, g, g, g, g],
      [g, g, g, g, g, g, g, g],
      [g, g, g, g, g, g, g, g],
      [G, G, g, G, G, g, g, G],
      [G, G, G, G, G, G, G, G],
    ]))

    images.add('treeTrunkLeft', new Image([ // 016
      [z, z, R, R, R, R, z, R],
      [z, z, z, z, z, R, z, R],
      [z, z, z, z, z, R, R, R],
      [z, z, z, z, z, z, R, R],
      [z, z, z, z, z, z, z, z],
      [z, z, z, z, R, R, R, R],
      [z, z, z, R, R, R, p, p],
      [z, z, z, R, R, p, R, p],
    ]))

    images.add('treeTrunkRight', new Image([ // 017
      [R, R, R, z, z, z, z, z],
      [R, z, z, z, z, z, z, z],
      [R, R, R, R, R, z, z, z],
      [R, R, R, p, R, R, z, z],
      [z, z, R, p, R, R, z, z],
      [R, R, R, p, R, R, z, z],
      [p, p, p, R, R, z, z, z],
      [p, R, R, R, z, z, z, z],
    ]))

    images.add('treeTopLeft', new Image([ // 008
      [g, g, g, g, g, g, g, g],
      [g, g, g, g, g, g, g, g],
      [g, g, g, g, g, g, g, g],
      [g, g, g, g, g, g, g, g],
      [g, g, g, G, g, g, g, g],
      [g, g, g, g, g, g, g, g],
      [g, g, g, g, g, g, g, g],
      [g, g, g, g, g, g, g, g],
    ]))

    images.add('treeTopRight', new Image([ // 009
      [g, g, g, g, g, g, g, g],
      [g, g, g, g, g, g, g, g],
      [g, g, g, g, g, g, g, g],
      [g, g, g, g, g, g, g, g],
      [g, g, g, g, g, g, g, g],
      [g, g, g, G, g, g, g, g],
      [g, g, G, g, G, g, g, g],
      [g, g, g, G, g, g, g, g],
    ]))



    images.add('wallOrange', new Image([ // 010
      [o, k, k, k, k, k, k, k],
      [R, o, o, o, o, o, o, k],
      [R, o, o, o, o, o, o, k],
      [R, o, o, o, o, o, o, k],
      [R, o, o, o, o, o, o, k],
      [R, o, o, o, o, o, o, k],
      [R, o, o, o, o, o, o, k],
      [R, R, R, R, R, R, o, o],
    ]))

    images.add('wallWhite', new Image([ // 011
      [k, w, w, w, w, w, w, w],
      [W, k, k, k, k, k, k, w],
      [W, k, k, k, k, k, k, w],
      [W, k, k, k, k, k, k, w],
      [W, k, k, k, k, k, k, w],
      [W, k, k, k, k, k, k, w],
      [W, k, k, k, k, k, k, w],
      [W, W, W, W, W, W, k, k],
    ]))

    images.add('wallCyan', new Image([ // 012
      [c, W, W, W, W, W, W, W],
      [P, c, c, c, c, c, c, W],
      [P, c, c, c, c, c, c, W],
      [P, c, c, c, c, c, c, W],
      [P, c, c, c, c, c, c, W],
      [P, c, c, c, c, c, c, W],
      [P, c, c, c, c, c, c, W],
      [P, P, P, P, P, P, c, c],
    ]))

    images.add('wallBrown', new Image([ // 013
      [Y, c, c, c, c, c, c, c],
      [P, Y, Y, Y, Y, Y, Y, c],
      [P, Y, Y, Y, Y, Y, Y, c],
      [P, Y, Y, Y, Y, Y, Y, c],
      [P, Y, Y, Y, Y, Y, Y, c],
      [P, Y, Y, Y, Y, Y, Y, c],
      [P, Y, Y, Y, Y, Y, Y, c],
      [P, P, P, P, P, P, Y, Y],
    ]))


    images.add('door', new Image([ // 236 & 252
      [K, K, K, K, K, K, K, K],
      [K, R, R, K, K, R, R, K],
      [K, R, R, K, K, R, R, K],
      [p, p, p, p, p, p, p, p],
      [R, R, R, R, R, R, R, R],
      [K, Y, Y, K, K, Y, Y, K],
      [K, R, R, K, K, R, R, K],
      [K, R, R, K, K, R, R, K],

      [K, R, R, K, K, R, R, K],
      [K, R, R, K, K, R, R, K],
      [K, R, R, K, K, R, R, K],
      [p, p, p, p, p, p, p, p],
      [R, R, R, R, R, R, R, R],
      [K, Y, Y, K, K, Y, Y, K],
      [K, K, Y, K, K, Y, Y, K],
      [K, K, K, K, K, K, K, K],
    ]))


    images.add('caveOpenLeft', new Image([ // 172 & 188
      [c, W, c, W, c, W, W, W],
      [P, c, P, c, P, P, P, c],
      [c, W, c, W, K, K, K, K],
      [P, c, P, c, K, K, K, K],
      [c, W, W, W, K, K, K, K],
      [P, c, c, W, K, K, K, K],
      [P, c, c, W, K, K, K, K],
      [P, P, P, c, K, K, K, K],

      [c, W, W, W, K, K, K, K],
      [P, c, c, W, K, K, K, K],
      [P, c, c, W, K, K, K, K],
      [P, P, P, c, K, K, K, K],
      [c, W, W, W, K, K, K, K],
      [P, c, c, W, K, K, K, K],
      [P, c, c, W, K, K, K, K],
      [P, P, P, c, K, K, K, K],
    ]))

    images.add('caveOpenRight', new Image([ // 173 & 189
      [c, W, W, W, c, W, c, W],
      [P, P, P, c, P, c, P, c],
      [K, K, K, K, c, W, c, W],
      [K, K, K, K, P, c, P, c],
      [K, K, K, K, c, W, W, W],
      [K, K, K, K, P, c, c, W],
      [K, K, K, K, P, c, c, W],
      [K, K, K, K, P, P, P, c],

      [K, K, K, K, c, W, W, W],
      [K, K, K, K, P, c, c, W],
      [K, K, K, K, P, c, c, W],
      [K, K, K, K, P, P, P, c],
      [K, K, K, K, c, W, W, W],
      [K, K, K, K, P, c, c, W],
      [K, K, K, K, P, c, c, W],
      [K, K, K, K, P, P, P, c],
    ]))

    images.add('caveCloseLeft', new Image([ // 172 & 188
      [c, W, c, W, c, W, W, W],
      [P, c, P, c, P, P, P, c],
      [c, W, c, W, c, c, c, c],
      [P, c, P, c, c, c, c, c],
      [c, W, W, W, c, c, c, c],
      [P, c, c, W, c, c, c, c],
      [P, c, c, W, c, c, c, c],
      [P, P, P, c, c, c, c, P],

      [c, W, W, W, c, c, c, P],
      [P, c, c, W, c, c, c, c],
      [P, c, c, W, c, c, c, c],
      [P, P, P, c, c, c, c, c],
      [c, W, W, W, c, c, c, c],
      [P, c, c, W, c, c, c, c],
      [P, c, c, W, c, c, c, c],
      [P, P, P, c, c, c, c, c],
    ]))

    images.add('caveCloseRight', new Image([ // 173 & 189
      [c, W, W, W, c, W, c, W],
      [P, P, P, c, P, c, P, c],
      [c, c, c, c, c, W, c, W],
      [c, c, c, c, P, c, P, c],
      [c, c, c, c, c, W, W, W],
      [c, c, c, c, P, c, c, W],
      [c, c, c, c, P, c, c, W],
      [P, c, c, c, P, P, P, c],

      [P, c, c, c, c, W, W, W],
      [c, c, c, c, P, c, c, W],
      [c, c, c, c, P, c, c, W],
      [c, c, c, c, P, P, P, c],
      [c, c, c, c, c, W, W, W],
      [c, c, c, c, P, c, c, W],
      [c, c, c, c, P, c, c, W],
      [c, c, c, c, P, P, P, c],
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
    const caveOpenLeft = instances.simple(sprites, 'caveOpenLeft')
    const caveOpenRight = instances.simple(sprites, 'caveOpenRight')
    const caveCloseLeft = instances.simple(sprites, 'caveCloseLeft')
    const caveCloseRight = instances.simple(sprites, 'caveCloseRight')

    const treeTopLeft = instances.simple(sprites, 'treeTopLeft')
    const treeTopRight = instances.simple(sprites, 'treeTopRight')
    const treeBottom = instances.simple(sprites, 'treeBottom')
    const treeTrunkLeft = instances.simple(sprites, 'treeTrunkLeft')
    const treeTrunkRight = instances.simple(sprites, 'treeTrunkRight')

    const validator = {}
    function g(item: GameObject<any, any>, pos: IPosition, zIndex: number) {
      const key = `${pos.x}, ${pos.y}, ${zIndex}`
      if (validator[key]) {
        throw new Error(`BUG: 2 voxels in the same spot: ${key}`)
      }
      validator[key] = true

      // convert from grid coordinates to pixels
      const o = item.new({
        x: (pos.x - 6) * 8,
        y: pos.y * 8,
      })

      o.zIndex = zIndex - 2
      return o
    }


    g(floor1, { x: 5, y: 6 }, 2)
    g(floor2, { x: 6, y: 6 }, 2)
    g(floor1, { x: 7, y: 7 }, 2)
    g(floor1, { x: 8, y: 7 }, 2)
    g(floor2, { x: 9, y: 7 }, 2)
    g(floor2, { x: 10, y: 7 }, 2)
    g(floor1, { x: 11, y: 7 }, 2)


    g(wallO, { x: 5, y: 7 }, 2)
    g(wallO, { x: 6, y: 7 }, 2)

    g(wallC, { x: 6, y: 8 }, 2)
    g(wallC, { x: 7, y: 8 }, 2)
    g(wallC, { x: 9, y: 8 }, 2)
    g(wallC, { x: 10, y: 8 }, 2)
    g(wallC, { x: 6, y: 9 }, 2)
    g(wallC, { x: 7, y: 9 }, 2)
    g(wallC, { x: 9, y: 9 }, 2)
    g(wallC, { x: 10, y: 9 }, 2)
    g(wallC, { x: 6, y: 10 }, 2)
    g(wallC, { x: 7, y: 10 }, 2)
    g(wallC, { x: 8, y: 10 }, 3) // because of the sunken-in ledge
    g(wallC, { x: 9, y: 10 }, 2)
    g(wallC, { x: 10, y: 10 }, 2)
    g(wall2, { x: 6, y: 11 }, 3)
    g(wallC, { x: 7, y: 11 }, 3)
    g(wall2, { x: 8, y: 11 }, 3)
    g(wallC, { x: 9, y: 11 }, 3)

    g(door, { x: 8, y: 9 }, 2)

    // draw these later so they show up on top of wall tiles
    g(ledge, { x: 5, y: 10 }, 3)
    g(ledge, { x: 8, y: 10 }, 2)
    g(ledge, { x: 11, y: 10 }, 3)
    g(ledge, { x: 6, y: 9 }, 1)
    g(ledge, { x: 10, y: 9 }, 1)


    g(treeTrunkLeft, { x: 8, y: 6 }, 4)
    g(treeTrunkRight, { x: 9, y: 6 }, 5)
    g(treeBottom, { x: 8, y: 5 }, 4)
    g(treeBottom, { x: 9, y: 5 }, 5)
    g(treeTopLeft, { x: 8, y: 4 }, 4)
    g(treeTopRight, { x: 9, y: 4 }, 5)



    // right side
    g(floor1, { x: 11, y: 7 }, 3)
    g(floor1, { x: 11, y: 7 }, 4)
    g(floor1, { x: 11, y: 7 }, 5)

    g(floor3, { x: 11, y: 8 }, 6) // these are just to keep the player up when rotating
    g(floor3, { x: 11, y: 8 }, 7)
    g(floor3, { x: 11, y: 8 }, 8)
    g(floor3, { x: 11, y: 8 }, 9)
    g(floor3, { x: 11, y: 8 }, 10)
    g(floor3, { x: 11, y: 8 }, 11)
    g(floor3, { x: 11, y: 8 }, 12)
    g(floor3, { x: 11, y: 8 }, 13)
    g(floor3, { x: 11, y: 8 }, 14)
    g(floor3, { x: 11, y: 8 }, 15)
    g(floor3, { x: 11, y: 8 }, 16)
    g(floor3, { x: 11, y: 8 }, 17)
    g(floor3, { x: 11, y: 8 }, 18)
    g(floor3, { x: 11, y: 8 }, 19)
    g(floor1, { x: 11, y: 8 }, 20)

    g(caveOpenRight, { x: 10, y: 9 }, 3)
    g(caveOpenLeft, { x: 10, y: 9 }, 4)
    g(wallC, { x: 10, y: 8 }, 5)
    g(wallC, { x: 10, y: 9 }, 5)
    // g(wallC,  {x:  9, y: 10}, 4)
    g(ledge, { x: 10, y: 10 }, 4)


    // left side
    g(caveCloseLeft, { x: 6, y: 9 }, 3)
    g(caveCloseRight, { x: 6, y: 9 }, 4)
    g(wallC, { x: 6, y: 8 }, 5)
    g(wallC, { x: 6, y: 9 }, 5)


    // back side
    g(wall2, { x: 8, y: 8 }, 3)
    g(wall2, { x: 8, y: 9 }, 3)
    g(ledge, { x: 8, y: 10 }, 4) // since the front ledge was recessed
    g(wallC, { x: 8, y: 11 }, 2)
    // g(wallC, {x:  7, y: 11}, 3)
    g(wallC, { x: 6, y: 11 }, 2)




    g(player, { x: 11, y: 2 }, 1)

  }

  drawBackground(tiles: ObjectInstance<any, any>[], camera: Camera, drawPixelsFn: DrawPixelsFn) {
    const bbox = camera.toBBox()
    const color = '#29ADFF' // (light blue)

    const pixels = Array(bbox.maxY - bbox.minY).fill(Array(bbox.maxX - bbox.minX).fill(color))

    drawPixelsFn({ x: 0, y: 0 }, pixels, false, false)
  }

  drawOverlay(drawPixelsFn: DrawPixelsFn, drawTextFn: DrawTextFn, fields: SimpleObject) {
    CAMERA_SIZE.width - 16
  }

  drawDialog(message: string, drawPixelsFn: DrawPixelsFn, drawTextFn: DrawTextFn, elapsedMs: number, target: null, additional: Opt<SimpleObject>) {
    const canvas = new DoubleArray<string>()

    const len = (message.length * 4) + 6 // padding

    const mid = CAMERA_SIZE.width / 2

    const tl = { x: Math.round(mid - len / 2), y: 4 }
    const br = { x: Math.round(mid + len / 2), y: 7 + 8 } // 1 line of text



    for (let y = tl.y; y < br.y; y++) {
      for (let x = tl.x; x < br.x; x++) {
        // skip the corners
        if (x === tl.x && y === tl.y ||
          x === tl.x && y === br.y - 1 ||
          x === br.x - 1 && y === br.y - 1 ||
          x === br.x - 1 && y === tl.y
        ) {
          continue
        }
        canvas.set({ x, y }, '#000000')
      }
    }

    drawPixelsFn({ x: 0, y: 0 }, canvas.asArray(), false, false)

    drawTextFn({x: tl.x + 3, y: tl.y + 3}, message, '#FFF1E8')

  }

}

enum POSITION {
  ABSOLUTE,
  RELATIVE
}

enum PLACEMENT {
  UP,
  DOWN,
  AWAY
}

type DialogOptions = {
  position: POSITION // at the top/bottom of the screen or above/below the target
  placement: PLACEMENT
  target?: IPosition
  maxLines: number
  cornerSprite?: Sprite // (top-left)
  nonCornerSprite?: Sprite // top/left/bottom/right
  gradualMessage: boolean
  // gradualSfX: SFX  // or maybe just use this instead of the boolean
  title?: string
  titleFgColor?: string
  titleBgColor?: string

  message: string
  messageFgColor: string
  messageShadowColor?: string
  bgColor: string

  actionIcon?: Sprite
  actionBounce?: boolean

  caretSprite?: Sprite
}


function drawDialog(camera: Camera, startTick: number, currentTick: number, drawPixelsFn: DrawPixelsFn, o: DialogOptions) {
  const bbox = camera.toBBox()
  const { width, height } = camera.size()

  let top = 0
  let left = 0
  let bottom = 0
  let right = 0
  switch (o.position) {
    case POSITION.ABSOLUTE:
      switch (o.placement) {
        case PLACEMENT.UP:
          top = 0
          left = 0
          bottom = o.maxLines * (8 + 2) // 2 pixels for padding
          right = width
          break
        case PLACEMENT.DOWN:
          top = height - (o.maxLines * (8 + 2))
          left = 0
          bottom = height
          right = width
          break
        default: throw new Error('BUG: Unsupported so far')
      }
      break

    default: throw new Error('BUG: Unsupported so far')
  }

  // Draw the border
  if (o.cornerSprite && o.maxLines === 1) {
    if (top !== bottom) throw new Error('We are assuming that we will render only one line')
    const endpoint = o.cornerSprite.tick(startTick, currentTick).pixels
    drawPixelsFn({ x: left, y: top }, endpoint, false, false)
    drawPixelsFn({ x: right, y: top }, endpoint, true, false)
  } else if (o.cornerSprite) {
    const corner = o.cornerSprite.tick(startTick, currentTick).pixels
    drawPixelsFn({ x: left, y: top }, corner, false, false)
    drawPixelsFn({ x: right, y: top }, corner, true, false)
    drawPixelsFn({ x: left, y: bottom }, corner, false, true)
    drawPixelsFn({ x: right, y: bottom }, corner, true, true)

    if (o.nonCornerSprite) {
      const nonCorner = o.nonCornerSprite.tick(startTick, currentTick).pixels

      for (let x = 0; x < right - left; x++) {
        drawPixelsFn({ x, y: top }, nonCorner, false, false)
        drawPixelsFn({ x, y: bottom }, nonCorner, false, true)
      }
      for (let y = 0; y < bottom - top; y++) {
        drawPixelsFn({ x: left, y }, nonCorner, true, false)
        drawPixelsFn({ x: right, y }, nonCorner, true, true)
      }
    }
  } else {
    const pixels = Array(bottom - top).fill(Array(right - left).fill(o.bgColor))
    drawPixelsFn({ x: left, y: top }, pixels, false, false)
  }

  // convert the lines of text to characters
  const lines = o.message.split('\n')
  lines.forEach((line, rowNum) => {
    // drawText({x: left, y: top}, line, o.messageFgColor)
  })
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

  shadowed: boolean

  r_dir: number
  r_wait: number
  r_factor: number

  tick: number // just used for local testing
}

function playerUpdateFn(o: ObjectInstance<PlayerProps, any>, gamepad: IGamepad, collisionChecker: CollisionChecker, sprites: SpriteController, instances: InstanceController, camera: Camera, showDialog: ShowDialogFn) {
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
  const p = o.props
  if (p.zreal === undefined) {
    p.tick = 0
    p.xreal = 0
    p.yreal = 30
    p.zreal = 100
    p.still = 0
    p.dz = -3 // since we start out mid-air
    p.maxfall = -9
    p.coyote = 0
    p.coyotemax = 5
    p.reswait = 0
    p.z = 0 // ???
    p.jump = 13


    p.landed = true
    p.lwait = 0
    p.dropwait = 0
    p.dwaitmax = 8
    p.canuse = false
    p.usewait = 0
    p.useidle = 0
    p.mir = false
    p.frame = 0
    p.still = 165

    p.side = 0 // front

    p.shadowed = false

    p.r_dir = 0
    p.r_wait = 11 // done rotating
    p.r_factor = 0

    // initialize the 3D coordinates for each object
    collisionChecker.searchBBox(EVERYTHING_BBOX)
      .forEach(ob => {
        ob.props.x = from_real(ob.pos.x)
        ob.props.y = from_real(ob.pos.y)
        ob.props.z = checkNaN(ob.zIndex)
      })

    // the player is always in front
    o.zIndex = -1000
  }

  // Show a test dialog all the time
  const options = {
    position: POSITION.ABSOLUTE,
    placement: PLACEMENT.UP,
    maxLines: 3,
    gradualMessage: false,
    message: ['GOMEZ...', 'SOMETHING WENT WRONG.'],
    messageFgColor: '#ffffff',
    bgColor: '#00ff00'
  }

  p.tick += 1
  let mult = 200
  let msg = 'GOMEZ...'
  if (p.tick >= mult * 1) { msg = 'SOMETHING WENT WRONG.' }
  if (p.tick >= mult * 2) { msg = 'THE WARP GATE BROKE!' }
  if (p.tick >= mult * 3) { msg = 'WE ARE STRANDED HERE!' }
  if (p.tick >= mult * 4) { msg = 'MAYBE YOU CAN FIND' }
  if (p.tick >= mult * 5) { msg = 'SOME WAY TO FIX IT?' }
  if (p.tick >= mult * 6) { msg = '' }

  if (msg) {
    showDialog(msg, null)
  }




  if (p.r_wait > 10) { // ignore player movement & collision detection while rotating
    move_player(o, gamepad, collisionChecker, sprites, instances, camera, floors)
  }
  rotate_world(o, collisionChecker)
  draw_player(true, o, sprites)

  camera.pos = { x: camera.pos.x, y: 50 } // keep the camera @ a constant height
  camera.nudge(o.pos, 20, null)
  // Log the player's coordinates
  process.stdout.write(setMoveTo(0, 0))
  const now = process.hrtime()
  const diff = process.hrtime(lastRender)
  lastRender = now
  const seconds = diff[0] + diff[1] / (1000 * 1000 * 1000)
  console.log(`Player: grid=(${o.props.x},${o.props.y},${o.props.z}H) win=(${o.pos.x},${o.pos.y}) Real=(${o.props.xreal},${o.props.yreal},${o.props.zreal}H) FPS:${(new Number(1 / seconds)).toFixed(1)}     `)
}

let lastRender: [number, number] = [0, 0]


function move_player(o: ObjectInstance<PlayerProps, any>, gamepad: IGamepad, collisionChecker: CollisionChecker, sprites: SpriteController, instances: InstanceController, camera: Camera, floors: Sprite[]) {
  const p = o.props

  const n1 = -1 // negativeOne just to reduce tokens
  // only 1 of these is true
  const sfront = o.props.side === 0
  const sleft = o.props.side === 1
  const sback = o.props.side === 2
  const sright = o.props.side === 3
  const intro = 85

  // actions
  if (p.lwait > 0) { p.lwait -= 1 }
  if (intro >= 85) {
    // if (gamepad.isButtonPressed(BUTTON_TYPE.BUMPER_TOP_LEFT) && p.rotateCooldown === 0)  { p.rotateCooldown = 10; rotate_world(-1, o, collisionChecker) }
    // if (gamepad.isButtonPressed(BUTTON_TYPE.BUMPER_TOP_RIGHT) && p.rotateCooldown === 0) { p.rotateCooldown = 10; rotate_world(+1, o, collisionChecker) }

    // rotate right
    if (gamepad.isButtonPressed(BUTTON_TYPE.BUMPER_TOP_RIGHT) && p.landed) {
      p.r_dir = n1
      p.r_wait = 0
      sfx(11)
      // rotate left
    } else if (gamepad.isButtonPressed(BUTTON_TYPE.BUMPER_TOP_LEFT) && p.landed) {
      p.r_dir = 1
      p.r_wait = 0
      sfx(10)
    } else {
      // move
      let dp = 0
      if (gamepad.isButtonPressed(BUTTON_TYPE.DPAD_LEFT)) { dp -= 1 }
      if (gamepad.isButtonPressed(BUTTON_TYPE.DPAD_RIGHT)) { dp += 1 }
      if (dp < 0) {
      p.mir = true
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
        p.still, p.frame = 0, 0
      }
    }
    p.still += 1
  } else {
    if (p.still > 0) {
      p.still, p.frame = 0, 0
    }
    p.frame = incmod(p.frame, 24)
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
  return flr(n / 8)
}

function to_real(n: number) {
  return n * 8
}

function savelast(p: PlayerProps) {
  p.xlast = p.xreal
  p.ylast = p.yreal
  p.zlast = p.zreal
}

function find_floor(layer: number, o: ObjectInstance<PlayerProps, any>, collisionChecker: CollisionChecker, floors: Sprite[]) {

  const p = o.props
  const bbox = o.toBBox()
  const x = Math.round((bbox.maxX + bbox.minX) / 2)


  // Find out if there are walls in front of us
  const walls = collisionChecker.searchBBox(bbox)
    .filter(thing => thing !== o) // exclude the player
    .sort(zIndexComparator)

  let hasWallsInFront = false
  if (walls.length > 0) {
    const front = walls[0]
    switch (p.side) {
      case 0: hasWallsInFront = front.props.z <= p.y; break // front
      case 2: hasWallsInFront = front.props.z >= p.y; break // back
      case 1: hasWallsInFront = front.props.x <= p.x; break // left
      case 3: hasWallsInFront = front.props.x >= p.x; break // right
    }
  }

  // check if there is a floor below
  const floorsBelow = collisionChecker.searchBBox({
    minX: x,
    maxX: x,
    minY: bbox.maxY + 1, // chose these because jumping does not result in mid-air player
    maxY: bbox.maxY + 7,
  })
    .filter(item => floors.indexOf(item.sprite) >= 0) // only look at the floors
    .sort(zIndexComparator)

  p.shadowed = hasWallsInFront
  if (hasWallsInFront) {
    // look for floors in the back (reverse the list)
    floorsBelow.reverse()
  }

  if (floorsBelow.length > 0) {
    // Shift the player to be above the floor
    const front = floorsBelow[0]
    switch (p.side) {
      case 0: p.yreal = to_real(front.props.z) + 4; break // front
      case 2: p.yreal = to_real(front.props.z) - 4; break // back
      case 1: p.xreal = to_real(front.props.x) + 4; break // left
      case 3: p.xreal = to_real(front.props.x) - 4; break // right
    }
  } else if (walls.length > 0) {
    // move player to front
    const front = walls[0]
    switch (p.side) {
      case 0: p.yreal = to_real(front.props.z) - 1; break // front
      case 2: p.yreal = to_real(front.props.z) + 1; break // back
      case 1: p.xreal = to_real(front.props.x) - 1; break // left
      case 3: p.xreal = to_real(front.props.x) + 1; break // right
    }
  }

  return floorsBelow.length !== 0
}

function ismid(x: number, a: number, z: number) {
  return a <= x && x <= z
}




function pzmove(o: ObjectInstance<PlayerProps, any>, gamepad: IGamepad, collisionChecker: CollisionChecker, sprites: SpriteController, instances: InstanceController, camera: Camera, floors: Sprite[]) {
  const p = o.props

  const n1 = -1 // negativeOne just to reduce tokens
  // only 1 of these is true
  const sfront = o.props.side === 0
  const sleft = o.props.side === 1
  const sback = o.props.side === 2
  const sright = o.props.side === 3
  const intro = 85

  const talkline = 0
  let side = 0 // front,left,right,back or something

  pgetpos(o)
  // vertical movement
  p.floor = find_floor(p.z, o, collisionChecker, floors)
  // if in the air
  if (!p.floor || p.dz > 0) {
    p.landed = false
  }
  // if falling
  if (p.dz <= 0) {
    // if floor approaching
    if (p.floor) {
      let znext = from_real(p.zreal + flr(p.dz / 3))
      if (znext < p.z) {
        // land
        p.zreal = checkNaN(p.z * 8)
        if (p.zreal % 8 == 0 && !p.landed) {
          p.landed = true
          p.lwait = 3
          p.dz = 0
          p.coyote = p.coyotemax
          sfx(23)
          savelast(p)
        }
      }
    }
  }
  // jump/drop if (landed
  if (intro >= 85 && talkline == 0 && (p.landed || p.coyote > 0)) {
    if (p.lwait <= 0) {
      // drop down
      if (gamepad.isButtonPressed(BUTTON_TYPE.DPAD_DOWN) && p.usewait <= 0) {
        p.dropwait += 1
      } else {
        p.dropwait = 0
      }
      // execute jump/drop
      if (gamepad.isButtonPressed(BUTTON_TYPE.DPAD_UP) || gamepad.isButtonPressed(BUTTON_TYPE.CLUSTER_DOWN) || p.dropwait >= p.dwaitmax) {
        if (p.dropwait >= 5) {
          p.dz = -2
        } else {
          p.dz = p.jump
          sfx(8)
        }
        p.dropwait, p.floor, p.landed, p.coyote = 0, false, false, 0
      } else {
      p.dz = 0
      }
    }
  }
  // gravity/coyote time
  if (!p.landed && p.dz > p.maxfall) {
    if (p.coyote > 0) {
      p.coyote -= 1
    } else {
      p.dz -= 1
    }
  }

  // save last safe position
  //  if (p.coyote >= p.coyotemax) {
  //     savelast(p)
  //  }
  // update position
  p.zreal += checkNaN(flr(p.dz / 3))
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
  // if happy > 0) { sp = happySprite }
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
  const sfront = o.props.side === 0
  const sleft = o.props.side === 1
  const sback = o.props.side === 2
  const sright = o.props.side === 3

  if (front || (p.x == cur_x && p.y == cur_y && p.z + 1 == cur_z)) {
    let zz = 112 - p.zreal
    let xx = p.xreal + Math.round(p.r_factor * (p.yreal / 8 - 4))
    if (p.usewait <= 0 &&
      !istalk() &&
      (p.lwait > 0 || p.dropwait > 0)) {
      zz += 1
    }
    if (sleft) {
      xx = p.yreal - Math.round(p.r_factor * (p.xreal / 8 - 6))
    } else if (sback) {
      xx = -p.xreal - Math.round(p.r_factor * (p.yreal / 8 - 4))
    } else if (sright) {
      xx = -p.yreal + Math.round(p.r_factor * (p.xreal / 8 - 6))
    }

    o.hFlip = p.mir
    o.moveTo({ x: xx, y: zz })
    //  sspr(8*flr(sp-32),16,8,10,xx,zz,8,10,p.mir,false)
  }
}


function checkNaN(n: number) {
  if (Number.isNaN(n)) {
    throw new Error('Expected number to not be NaN but failed')
  }
  return n
}



function rotate_world(o: ObjectInstance<PlayerProps, any>, collisionChecker: CollisionChecker) {
  const p = o.props
  if (p.r_wait <= 10) {
    if (p.r_wait < 5) { p.r_factor = p.r_wait * p.r_dir / 2 }
    else if (p.r_wait < 10) { p.r_factor = (p.r_wait - 10) * p.r_dir / 2 }
    else p.r_factor = 0

    if (p.r_wait === 5) { p.side = (p.side + p.r_dir + 4) % 4 }

    p.r_wait += 1

    const things = collisionChecker.searchBBox(EVERYTHING_BBOX)
    things.forEach(ob => {
      let x = 0
      let y = 0
      let z = 0
      switch (p.side) {
        case 0: // front
          x = to_real(ob.props.x) + Math.round(p.r_factor * ob.props.z)
          y = ob.props.y
          z = ob.props.z
          break
        case 1: // left
          x = to_real(ob.props.z) + Math.round(p.r_factor * ob.props.x)
          y = ob.props.y
          z = ob.props.x
          break
        case 2: // back
          x = -(to_real(ob.props.x) + Math.round(p.r_factor * ob.props.z))
          y = ob.props.y
          z = -ob.props.z
          break
        case 3: // right
          x = -(to_real(ob.props.z) + Math.round(p.r_factor * ob.props.x))
          y = ob.props.y
          z = -ob.props.x
          break
        default: throw new Error(`BUG: Invalid side "${p.side}"`)
      }
      ob.moveTo({
        x,
        y: to_real(y),
      })
      ob.zIndex = z
    })
    o.zIndex = -1000 // player is always on top

  }
}




// Refer to: http://rosettacode.org/wiki/Bitmap/Bresenham's_line_algorithm#JavaScript
function bline(x0: number, y0: number, x1: number, y1: number, setPixel: (x: number, y: number) => void) {
  var dx = Math.abs(x1 - x0),
    sx = x0 < x1 ? 1 : -1;
  var dy = Math.abs(y1 - y0),
    sy = y0 < y1 ? 1 : -1;
  var err = (dx > dy ? dx : -dy) / 2;
  while (true) {
    setPixel(x0, y0);
    if (x0 === x1 && y0 === y1) break;
    var e2 = err;
    if (e2 > -dx) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dy) {
      err += dx;
      y0 += sy;
    }
  }
}

// from https://www.cc.gatech.edu/grads/m/Aaron.E.McClennen/Bresenham/code.html
function drawLine(canvas: DoubleArray<string>, start: IPosition, end: IPosition, color: string) {
  bline(start.x, start.y, end.x, end.y, (x, y) => canvas.set({ x, y }, color))
}

function drawRect(canvas: DoubleArray<string>, start: IPosition, end: IPosition, color: string) {
  drawLine(canvas, { x: start.x, y: start.y }, { x: end.x, y: start.y }, color)
  drawLine(canvas, { x: start.x, y: end.y }, { x: end.x, y: end.y }, color)
  drawLine(canvas, { x: start.x, y: start.y }, { x: start.x, y: end.y }, color)
  drawLine(canvas, { x: end.x, y: start.y }, { x: end.x, y: end.y }, color)
}


function dialogOne(message: string[], camera: Camera, startTick: number, currentTick: number, drawPixelsFn: DrawPixelsFn) {

  const canvas = new DoubleArray<string>()

  const tl = { x: 4, y: 4 }
  const br = { x: 124, y: 5 + (5 + 2) * message.length } // 2 lines of text

  // draw diagonal shadow grid
  for (let y = tl.y; y < br.y; y++) {
    for (let x = tl.x; x < br.x; x++) {
      if ((x + y) % 2 === 0) {
        canvas.set({ x, y }, '#1D2B53') // dark blue
      }
    }
  }

  drawRect(canvas, tl, br, '#FFF1E8') // white
  // shadow
  drawLine(canvas, { x: tl.x + 1, y: br.y + 1 }, { x: br.x + 1, y: br.y + 1 }, '#1D2B53') // blue
  drawLine(canvas, { x: br.x + 1, y: tl.y + 1 }, { x: br.x + 1, y: br.y + 1 }, '#1D2B53') // blue

  drawPixelsFn({ x: 0, y: 0 }, canvas.asArray(), false, false)

  // convert the lines of text to characters
  const lines = message
  lines.forEach((line, rowNum) => {
    // drawTextFn({x: tl.x + 2, y: tl.y + 2}, line, '#FFF1E8'
  })

}


function dialogTwo(message: string[], camera: Camera, startTick: number, currentTick: number, drawPixelsFn: DrawPixelsFn) {

  const canvas = new DoubleArray<string>()

  const len = (message[0].length * 4) + 6 // padding

  const cameraBbox = camera.toBBox()
  const mid = camera.size().width / 2 // (cameraBbox.maxX + cameraBbox.minX) / 2

  const tl = { x: Math.round(mid - len / 2), y: 4 }
  const br = { x: Math.round(mid + len / 2), y: 7 + 8 } // 1 line of text



  for (let y = tl.y; y < br.y; y++) {
    for (let x = tl.x; x < br.x; x++) {
      // skip the corners
      if (x === tl.x && y === tl.y ||
        x === tl.x && y === br.y - 1 ||
        x === br.x - 1 && y === br.y - 1 ||
        x === br.x - 1 && y === tl.y
      ) {
        continue
      }
      canvas.set({ x, y }, '#000000')
    }
  }

  drawPixelsFn({ x: 0, y: 0 }, canvas.asArray(), false, false)

  // drawLettersFn({x: tl.x + 3, y: tl.y + 3}, message, '#FFF1E8')
}
