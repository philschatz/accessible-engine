import { Game, Camera, SpriteController, Image, DefiniteMap, Sprite, InstanceController, ObjectInstance, CollisionChecker, IPosition, GameObject, zIndexComparator, DrawPixelsFn, ShowDialogFn, SimpleObject, Opt, DrawTextFn } from './engine'
import { setMoveTo, DoubleArray } from './terminal'
import { IGamepad, BUTTON_TYPE } from './gamepad/api'

// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316#47593316
var LCG=(s: number)=>()=>(2**31-1&(s=Math.imul(48271,s)))/2**31;

export class MyGame implements Game {
  load(gamepad: IGamepad, sprites: SpriteController) {
    // gamepad.listenTo([BUTTON_TYPE.ARROW_LEFT, BUTTON_TYPE.ARROW_RIGHT, BUTTON_TYPE.ARROW_DOWN, BUTTON_TYPE.ARROW_UP, BUTTON_TYPE.CLUSTER_BOTTOM])

    const images = new DefiniteMap<Image>()

    const Z = null // transparent
    const a = '#73c2b4'
    const b = '#c2ffeb'
    const c = '#06353b'
    const d = '#dec78f'
    const e = '#306387'
    const f = '#ffffe2'
    const g = '#000000'
    const h = '#93c453'
    const i = '#6a0009'
    const j = '#6b241b'
    const k = '#fd9150'
    const l = '#fed4a3'
    const m = '#e72e3d'
    const n = '#139dec'
    const o = '#3f6d54'
    const p = '#c09d53'
    const q = '#213531'
    const r = '#599388'
    const s = '#ffffff'
    const t = '#fc7953'
    const u = '#fffff2'
    images.add('Sand', new Image([
      [ a, a, b, a, b, b, b, b, b, b, b, b, b, b, a, a, ],
      [ a, a, a, b, a, b, b, b, b, b, b, b, b, b, b, a, ],
      [ a, a, a, a, b, a, b, b, b, b, b, b, b, b, b, b, ],
      [ b, a, a, a, a, b, a, b, a, b, b, b, b, b, b, b, ],
      [ b, b, a, a, a, a, a, a, b, a, b, b, b, b, b, b, ],
      [ b, b, b, a, a, a, a, a, a, b, a, a, b, b, b, b, ],
      [ b, b, b, b, b, a, a, a, a, a, a, b, a, a, b, b, ],
      [ b, b, b, b, b, b, b, b, a, a, a, a, a, b, a, b, ],
      [ b, b, b, b, b, b, b, b, b, a, a, a, a, a, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, a, a, a, a, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, a, a, a, a, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, a, a, a, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, a, a, a, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, a, a, a, ],
      [ a, b, b, b, b, b, b, b, b, b, b, b, b, a, a, a, ],
      [ a, a, b, b, b, b, b, b, b, b, b, b, b, b, a, a, ],
    ]))
    images.add('Rock', new Image([
      [ b, b, b, b, b, b, c, c, c, c, b, b, b, b, b, b, ],
      [ b, b, b, c, c, c, a, a, a, a, c, c, b, b, b, b, ],
      [ b, b, c, a, b, b, a, b, b, b, a, a, c, b, b, b, ],
      [ b, c, a, b, b, e, a, b, b, b, b, b, a, c, b, b, ],
      [ b, c, a, a, b, e, e, a, b, b, b, a, a, b, c, b, ],
      [ b, c, a, a, a, b, e, e, a, a, a, e, a, a, c, b, ],
      [ b, c, a, a, a, a, a, e, a, a, a, e, e, c, c, b, ],
      [ b, c, c, e, a, a, a, a, a, a, a, e, e, b, c, c, ],
      [ b, a, c, c, e, a, a, a, a, a, e, e, b, b, b, c, ],
      [ b, a, c, b, a, a, a, b, b, a, a, a, a, a, b, c, ],
      [ a, c, b, a, b, e, a, a, a, b, c, e, a, a, a, c, ],
      [ a, c, e, a, a, b, c, e, a, b, c, e, a, a, a, c, ],
      [ a, c, e, e, a, b, c, e, a, a, c, c, e, a, a, c, ],
      [ a, c, c, c, e, e, c, c, e, c, c, c, c, e, c, b, ],
      [ a, a, c, c, c, c, a, a, a, a, a, c, c, c, b, b, ],
      [ b, a, a, a, a, a, a, b, b, a, a, a, a, a, b, b, ],
    ]))
    images.add('Bush', new Image([
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, c, c, b, b, b, b, b, b, b, ],
      [ b, b, b, b, c, c, c, d, c, c, c, c, b, b, b, b, ],
      [ b, b, b, c, d, c, c, d, d, c, c, b, c, b, b, b, ],
      [ b, b, c, c, c, d, c, d, b, c, b, c, c, c, b, b, ],
      [ b, c, d, d, c, c, d, d, d, b, c, c, d, d, c, b, ],
      [ b, b, c, d, d, c, c, c, c, c, c, d, d, c, b, b, ],
      [ b, b, c, d, c, d, c, c, d, c, d, c, b, c, b, b, ],
      [ e, b, c, c, c, c, c, d, b, c, c, c, c, c, b, e, ],
      [ b, c, d, c, c, d, d, d, d, d, b, c, c, b, c, b, ],
      [ d, c, d, d, c, c, d, d, d, d, c, c, b, b, c, b, ],
      [ d, c, c, d, d, c, c, c, c, c, c, d, d, c, c, b, ],
      [ b, d, c, c, c, c, d, d, d, b, c, c, c, c, b, b, ],
      [ b, d, d, c, c, c, c, c, c, c, c, c, c, b, b, b, ],
      [ b, b, d, d, d, d, c, c, c, c, d, d, d, b, b, b, ],
      [ b, b, b, d, d, d, d, d, d, d, d, b, b, b, b, b, ],
    ]))
    images.add('GongDisabled', new Image([
      [ Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, ],
    ]))
    images.add('WallTopRightDown', new Image([
      [ b, b, a, c, c, c, c, c, c, c, c, c, c, c, c, c, ],
      [ b, a, c, c, c, c, c, c, c, c, c, c, c, c, c, c, ],
      [ a, c, c, c, a, a, a, a, a, a, a, a, a, a, a, a, ],
      [ c, c, c, a, a, a, a, a, a, a, a, a, a, a, a, a, ],
      [ c, c, a, a, a, a, a, a, a, a, a, a, a, a, a, a, ],
      [ c, c, a, a, a, a, a, a, a, a, a, a, a, a, a, a, ],
      [ c, c, a, a, a, a, a, c, c, c, c, c, c, c, c, c, ],
      [ c, c, a, a, a, a, c, c, c, c, c, c, c, c, c, c, ],
      [ c, c, a, a, a, a, c, c, c, c, c, c, c, c, c, c, ],
      [ c, c, a, a, a, a, c, c, c, c, b, b, b, b, b, c, ],
      [ c, c, a, a, a, a, c, c, c, b, b, b, b, b, b, c, ],
      [ c, c, a, a, a, a, c, c, c, b, b, b, b, a, a, c, ],
      [ c, c, a, a, a, a, c, c, c, b, b, b, a, a, a, c, ],
      [ c, c, a, a, a, a, c, c, c, b, b, a, a, a, c, c, ],
      [ c, c, a, a, a, a, c, c, c, b, b, a, a, c, c, c, ],
      [ c, c, a, a, a, a, c, c, c, c, c, c, c, c, c, c, ],
    ]))
    images.add('Key', new Image([
      [ Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, f, f, f, f, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, f, g, g, g, g, f, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, f, g, f, f, f, f, g, f, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, f, g, h, g, g, f, g, f, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, f, g, h, g, g, f, g, f, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, f, g, h, h, h, h, g, f, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, f, g, g, h, g, f, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, f, g, Z, h, g, f, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, f, g, g, h, g, f, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, f, g, h, h, g, f, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, h, g, g, h, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, Z, h, h, Z, Z, Z, Z, Z, Z, Z, ],
      [ Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, ],
    ]))
    images.add('SandEdge', new Image([
      [ a, a, a, b, b, b, b, b, b, b, b, b, b, b, a, a, ],
      [ a, a, a, a, b, b, b, b, b, b, b, b, b, b, b, a, ],
      [ b, a, a, a, a, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, a, a, a, a, a, b, a, b, a, b, b, b, b, b, ],
      [ b, b, b, a, a, a, a, a, a, a, b, a, b, b, b, b, ],
      [ b, b, b, b, a, a, a, a, a, a, a, a, a, a, a, b, ],
      [ b, b, b, b, b, b, b, b, a, a, a, a, a, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, a, a, a, a, a, a, a, a, b, b, ],
      [ a, a, a, n, n, n, n, n, n, n, n, n, n, n, a, a, ],
      [ n, n, n, n, b, b, b, b, b, b, b, b, n, n, n, n, ],
      [ n, n, b, b, b, b, a, n, a, n, a, b, b, b, b, n, ],
      [ n, a, b, a, n, a, n, a, n, a, n, a, n, a, n, a, ],
      [ a, n, a, n, a, n, n, n, n, n, n, n, a, n, a, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
    ]))
    images.add('Box', new Image([
      [ a, g, g, g, g, g, g, g, g, g, g, g, g, g, g, a, ],
      [ g, g, j, k, k, k, k, k, k, k, k, k, k, j, g, g, ],
      [ g, j, j, g, g, g, g, g, g, g, g, g, g, j, j, g, ],
      [ g, k, g, g, k, j, k, k, k, k, k, k, g, g, k, g, ],
      [ g, k, g, k, k, j, k, j, j, j, j, k, k, g, k, g, ],
      [ g, k, g, k, k, j, j, j, j, k, j, k, k, g, k, g, ],
      [ g, k, g, g, k, k, k, k, k, k, j, k, g, g, k, g, ],
      [ g, j, j, g, g, g, g, g, g, g, g, g, g, j, j, g, ],
      [ g, g, j, k, k, k, k, k, k, k, k, k, k, j, g, g, ],
      [ g, j, g, g, g, g, g, g, g, g, g, g, g, g, j, g, ],
      [ g, g, j, j, j, j, j, g, g, j, j, j, j, j, g, g, ],
      [ g, j, g, g, g, g, j, g, g, j, g, g, g, g, j, g, ],
      [ g, j, g, j, j, g, j, g, g, j, g, j, j, g, j, g, ],
      [ g, j, g, g, j, g, j, g, g, j, g, j, g, g, j, g, ],
      [ g, g, j, j, j, g, j, j, j, j, g, j, j, j, g, g, ],
      [ a, g, g, g, g, g, g, g, g, g, g, g, g, g, g, a, ],
    ]))
    images.add('GongRed', new Image([
      [ i, i, i, i, i, i, i, i, i, i, i, i, i, i, i, i, ],
      [ i, l, l, l, l, l, l, i, i, l, l, l, l, l, l, i, ],
      [ b, i, i, i, i, i, i, i, i, i, i, i, i, i, i, b, ],
      [ b, i, m, i, b, b, i, i, i, i, b, b, i, l, i, b, ],
      [ b, i, m, i, b, i, i, l, l, i, i, b, i, l, i, b, ],
      [ b, i, m, i, b, i, m, m, l, l, i, b, i, l, i, b, ],
      [ b, i, m, i, b, i, m, i, i, l, i, b, i, l, i, b, ],
      [ b, i, m, i, b, i, i, m, m, i, i, b, i, l, i, b, ],
      [ i, m, l, i, b, i, m, i, i, l, i, b, i, m, l, i, ],
      [ i, m, l, i, b, i, i, m, m, i, i, b, i, m, l, i, ],
      [ i, m, l, i, b, i, m, i, i, l, i, b, i, m, m, i, ],
      [ i, m, m, i, b, b, i, i, i, i, b, b, i, m, m, i, ],
      [ i, m, m, i, b, b, b, b, b, b, b, b, i, m, m, i, ],
      [ i, m, m, i, b, i, i, i, i, b, b, b, i, m, m, i, ],
      [ i, m, m, i, b, b, b, i, i, i, i, b, i, m, m, i, ],
      [ b, i, i, b, b, b, b, b, b, b, b, b, b, i, i, b, ],
    ]))
    images.add('PillarRed', new Image([
      [ b, b, b, b, b, b, i, i, i, i, b, b, b, b, b, b, ],
      [ b, b, b, b, i, i, l, l, l, l, i, i, b, b, b, b, ],
      [ b, b, b, i, l, l, l, l, l, l, l, l, i, b, b, b, ],
      [ b, b, b, i, l, m, l, l, l, l, m, l, i, b, b, b, ],
      [ b, b, i, m, i, m, l, l, l, l, m, i, l, i, b, b, ],
      [ b, b, i, m, i, m, m, l, l, m, m, i, m, i, b, b, ],
      [ b, b, i, i, m, m, m, m, m, m, m, m, m, i, b, b, ],
      [ b, b, i, i, i, m, m, m, m, m, m, m, i, i, b, b, ],
      [ b, b, i, i, m, m, m, i, i, m, m, i, l, i, b, b, ],
      [ b, b, i, i, m, m, i, m, m, i, m, l, m, i, b, b, ],
      [ b, m, i, i, m, m, m, i, i, m, m, m, i, i, b, b, ],
      [ b, m, i, i, i, m, m, m, m, m, m, i, l, i, b, b, ],
      [ b, m, i, i, m, i, i, i, i, i, i, l, i, i, b, b, ],
      [ b, m, m, i, i, m, m, m, m, m, m, i, i, b, b, b, ],
      [ b, b, m, m, i, i, i, i, i, i, i, i, m, b, b, b, ],
      [ b, b, b, m, m, m, m, m, m, m, m, m, b, b, b, b, ],
    ]))
    images.add('WallTopUpDown', new Image([
      [ c, c, c, a, a, c, c, c, c, c, c, c, c, c, c, c, ],
      [ c, c, a, a, a, a, c, c, c, c, b, b, c, c, c, c, ],
      [ c, c, a, a, a, a, c, c, c, b, b, a, a, c, c, c, ],
      [ c, c, a, a, a, a, c, c, c, b, b, a, a, a, c, c, ],
      [ c, c, a, a, a, a, c, c, c, b, b, a, a, a, c, c, ],
      [ c, c, a, a, a, a, c, c, c, b, b, b, a, a, c, c, ],
      [ c, c, a, a, a, a, c, c, c, c, c, c, a, a, c, c, ],
      [ c, c, a, a, a, a, c, c, c, c, c, c, c, a, c, c, ],
      [ c, c, a, a, a, a, c, c, c, c, b, c, c, c, c, c, ],
      [ c, c, a, a, a, a, c, c, c, c, b, b, c, c, c, c, ],
      [ c, c, a, a, a, a, c, c, c, c, b, a, a, c, c, c, ],
      [ c, c, a, a, a, a, c, c, c, b, b, a, a, c, c, c, ],
      [ c, c, a, a, a, a, c, c, c, b, b, a, a, a, c, c, ],
      [ c, c, a, a, a, a, c, c, c, b, b, a, a, a, c, c, ],
      [ c, c, a, a, a, a, c, c, c, c, c, b, a, a, c, c, ],
      [ c, c, c, a, a, c, c, c, c, c, c, c, c, a, c, c, ],
    ]))
    images.add('Pedestal', new Image([
      [ Z, Z, e, e, e, e, e, e, e, e, e, e, e, Z, Z, Z, ],
      [ Z, e, a, a, a, a, a, a, a, a, a, a, a, e, Z, Z, ],
      [ e, e, b, e, e, e, e, e, e, e, e, e, a, e, e, Z, ],
      [ e, e, b, e, a, e, a, a, b, e, a, e, a, e, e, Z, ],
      [ e, e, b, e, e, a, a, a, a, b, e, e, a, e, e, Z, ],
      [ e, e, b, e, a, a, a, a, a, a, b, e, a, e, e, Z, ],
      [ e, e, b, e, a, a, a, a, a, a, a, e, a, e, e, Z, ],
      [ e, e, b, e, e, a, a, a, a, a, e, e, a, e, e, Z, ],
      [ e, e, b, e, a, e, a, a, a, e, a, e, a, e, e, Z, ],
      [ e, e, b, e, e, e, e, e, e, e, e, e, a, e, e, Z, ],
      [ e, e, b, b, b, b, b, b, b, b, b, b, b, e, e, a, ],
      [ e, e, a, a, a, a, a, a, a, a, a, a, b, e, e, a, ],
      [ e, a, e, e, e, e, e, e, e, e, e, e, e, b, e, a, ],
      [ e, a, a, a, a, a, a, a, a, a, a, a, a, a, e, a, ],
      [ a, e, e, e, e, e, e, e, e, e, e, e, e, e, a, a, ],
      [ Z, a, a, a, a, a, a, a, a, a, a, a, a, a, Z, Z, ],
    ]))
    images.add('Land', new Image([
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, d, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, d, b, d, b, d, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, d, b, d, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, d, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, d, b, d, b, d, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
    ]))
    images.add('Lock', new Image([
      [ f, g, g, g, g, g, g, g, g, g, g, g, g, g, g, f, ],
      [ g, o, o, f, f, f, f, h, o, f, f, f, f, o, o, g, ],
      [ g, o, o, o, o, o, o, o, o, o, o, o, o, o, f, g, ],
      [ g, o, o, o, h, h, h, h, h, h, h, h, o, f, f, g, ],
      [ g, o, o, o, h, h, f, g, g, h, h, h, o, f, f, g, ],
      [ g, o, o, o, h, f, g, g, g, g, h, h, o, f, f, g, ],
      [ g, o, o, o, h, f, g, g, g, g, h, h, o, f, f, g, ],
      [ g, o, h, o, h, h, f, g, g, h, h, h, o, o, f, g, ],
      [ g, h, o, o, h, h, f, g, g, h, h, h, o, f, o, g, ],
      [ g, o, o, o, h, h, h, f, f, h, h, h, o, f, f, g, ],
      [ g, o, o, o, h, h, h, h, h, h, h, h, o, f, f, g, ],
      [ g, o, o, o, o, o, o, o, o, o, o, o, o, f, f, g, ],
      [ g, o, o, h, h, h, h, f, o, h, h, h, h, o, f, g, ],
      [ g, o, h, h, h, h, h, f, o, h, h, h, h, h, o, g, ],
      [ g, h, h, h, h, h, h, f, o, h, h, h, h, h, h, g, ],
      [ f, g, g, g, g, g, g, g, g, g, g, g, g, g, g, f, ],
    ]))
    images.add('ArrowLeft', new Image([
      [ f, g, g, g, g, g, g, g, g, g, g, g, g, g, g, f, ],
      [ g, o, o, f, f, f, f, f, f, f, f, f, f, o, o, g, ],
      [ g, o, o, o, o, o, o, o, o, o, o, o, o, o, f, g, ],
      [ g, o, o, o, h, h, h, g, g, g, g, h, o, f, f, g, ],
      [ g, o, o, o, h, g, g, f, f, f, g, h, o, f, f, g, ],
      [ g, o, o, o, g, f, f, f, f, g, h, h, o, f, f, g, ],
      [ g, o, o, o, g, o, o, o, o, g, h, h, o, f, f, g, ],
      [ g, o, o, o, o, g, g, o, o, o, g, h, o, f, f, g, ],
      [ g, o, o, o, h, o, o, g, g, g, g, h, o, f, f, g, ],
      [ g, o, o, o, h, h, h, o, o, o, o, h, o, f, f, g, ],
      [ g, o, o, o, h, h, h, h, h, h, h, h, o, f, f, g, ],
      [ g, o, o, o, o, o, o, o, o, o, o, o, o, f, f, g, ],
      [ g, o, o, h, h, h, h, h, h, h, h, h, h, o, f, g, ],
      [ g, o, h, o, o, h, o, o, o, o, h, o, o, h, o, g, ],
      [ g, h, o, h, o, o, o, h, h, o, o, o, h, o, h, g, ],
      [ f, g, g, g, g, g, g, g, g, g, g, g, g, g, g, f, ],
    ]))
    images.add('WallTopLeftRight', new Image([
      [ c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, ],
      [ c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, ],
      [ c, a, a, a, a, a, a, a, a, a, a, a, a, a, a, c, ],
      [ a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, ],
      [ a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, ],
      [ c, a, a, a, a, a, a, a, a, a, a, a, a, a, a, c, ],
      [ c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, ],
      [ c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, ],
      [ c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, ],
      [ c, b, b, b, b, b, c, c, c, b, b, b, b, b, c, c, ],
      [ b, b, b, b, b, b, b, c, b, b, b, b, b, b, b, c, ],
      [ a, a, a, a, b, b, b, c, a, b, b, a, a, a, a, c, ],
      [ c, a, a, a, a, a, c, c, a, a, a, a, a, a, c, c, ],
      [ c, c, a, a, a, c, c, c, c, c, a, a, a, c, c, c, ],
      [ c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, ],
      [ c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, ],
    ]))
    images.add('WallTopUpLeft', new Image([
      [ c, c, a, a, a, a, c, c, c, c, c, c, c, c, c, c, ],
      [ c, a, a, a, a, a, c, c, c, c, b, b, c, c, c, c, ],
      [ a, a, a, a, a, c, c, c, c, b, b, a, a, c, c, c, ],
      [ a, a, a, a, a, c, c, c, c, b, b, a, a, c, c, c, ],
      [ a, a, a, a, c, c, c, c, c, b, b, b, a, c, c, c, ],
      [ a, a, c, c, c, c, c, c, c, b, b, a, a, a, c, c, ],
      [ c, c, c, c, c, c, c, c, c, b, b, a, a, a, c, c, ],
      [ c, c, c, c, c, c, c, c, c, c, b, a, a, a, c, c, ],
      [ c, c, c, c, c, c, b, b, c, c, c, a, a, a, c, c, ],
      [ c, c, b, b, b, b, b, b, b, c, c, a, a, c, c, c, ],
      [ c, b, b, b, b, b, b, a, a, c, c, a, c, c, c, c, ],
      [ c, b, b, b, a, a, a, a, a, c, c, c, c, c, c, c, ],
      [ c, a, a, a, a, a, a, a, a, c, c, c, c, c, c, c, ],
      [ c, a, a, a, a, a, a, a, c, c, c, c, c, b, c, c, ],
      [ c, c, c, c, c, c, c, c, c, c, c, c, b, b, c, c, ],
      [ c, c, c, c, c, c, c, c, c, c, c, b, b, b, c, c, ],
    ]))
    images.add('LandCorner', new Image([
      [ p, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, p, d, d, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, p, d, d, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ p, d, d, b, b, b, b, b, b, b, b, d, b, b, b, b, ],
      [ p, d, d, d, b, b, b, b, b, b, b, d, b, d, b, b, ],
      [ p, d, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ p, d, d, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, p, d, d, b, b, b, d, b, b, b, b, b, b, b, b, ],
      [ b, p, d, d, d, b, b, b, b, b, b, b, b, b, b, b, ],
      [ p, d, d, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ p, d, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ p, d, d, b, b, b, b, b, d, b, b, b, b, d, b, b, ],
      [ p, d, d, d, b, d, b, d, d, d, b, d, b, d, d, b, ],
      [ b, p, d, d, d, d, d, d, d, d, b, d, d, d, d, b, ],
      [ b, b, p, d, d, d, d, p, p, d, d, d, d, p, p, d, ],
      [ b, b, b, p, p, p, p, b, b, p, p, p, p, b, b, p, ],
    ]))
    images.add('LandBottom', new Image([
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, d, b, d, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, d, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, d, b, d, b, d, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, d, b, b, b, b, d, b, b, ],
      [ b, d, d, b, d, b, b, d, d, d, b, d, b, d, d, b, ],
      [ b, d, d, d, d, b, d, d, d, d, b, d, d, d, d, b, ],
      [ d, p, p, d, d, d, d, p, p, d, d, d, d, p, p, d, ],
      [ p, b, b, p, p, p, p, b, b, p, p, p, p, b, b, p, ],
    ]))
    images.add('ArrowLeftDisabled', new Image([
      [ a, q, q, q, q, q, q, q, q, q, q, q, q, q, q, a, ],
      [ q, r, r, a, a, a, a, a, a, a, a, a, a, r, r, q, ],
      [ q, r, r, r, r, r, r, r, r, r, r, r, r, r, a, q, ],
      [ q, r, r, r, a, a, a, q, q, q, q, a, r, a, a, q, ],
      [ q, r, r, r, a, q, q, a, a, a, q, a, r, a, a, q, ],
      [ q, r, r, r, q, a, a, a, a, q, a, a, r, a, a, q, ],
      [ q, r, r, r, q, r, r, r, r, q, a, a, r, a, a, q, ],
      [ q, r, r, r, r, q, q, r, r, r, q, a, r, a, a, q, ],
      [ q, r, r, r, a, r, r, q, q, q, q, a, r, a, a, q, ],
      [ q, r, r, r, a, a, a, r, r, r, r, a, r, a, a, q, ],
      [ q, r, r, r, a, a, a, a, a, a, a, a, r, a, a, q, ],
      [ q, r, r, r, r, r, r, r, r, r, r, r, r, a, a, q, ],
      [ q, r, r, a, a, a, a, a, a, a, a, a, a, r, a, q, ],
      [ q, r, a, r, r, a, r, r, r, r, a, r, r, a, r, q, ],
      [ q, a, r, a, r, r, r, a, a, r, r, r, a, r, a, q, ],
      [ a, q, q, q, q, q, q, q, q, q, q, q, q, q, q, a, ],
    ]))
    images.add('Wall', new Image([
      [ b, b, b, b, b, b, c, c, c, c, b, b, b, b, b, b, ],
      [ b, a, a, a, a, b, b, c, c, a, a, a, a, b, b, b, ],
      [ a, a, a, a, a, a, b, c, a, a, a, a, a, a, a, a, ],
      [ a, a, a, c, c, a, a, c, a, a, a, a, a, a, c, a, ],
      [ a, a, a, a, a, a, a, c, c, a, a, c, c, a, a, a, ],
      [ a, a, c, a, a, a, c, c, c, c, a, a, a, a, a, a, ],
      [ c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, ],
      [ c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, ],
      [ c, c, b, b, b, b, b, b, b, b, b, b, b, b, c, c, ],
      [ c, a, a, a, a, a, a, a, b, b, b, a, b, b, b, c, ],
      [ c, a, a, a, b, a, a, a, a, a, a, a, a, b, b, c, ],
      [ c, a, a, a, a, a, a, a, a, a, a, c, a, a, b, c, ],
      [ c, a, a, a, a, c, c, a, a, a, a, a, a, a, b, c, ],
      [ c, c, a, a, a, a, a, a, c, c, a, a, a, a, c, c, ],
      [ c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, ],
      [ c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, ],
    ]))
    images.add('WallVert', new Image([
      [ b, b, b, b, c, c, c, c, c, c, b, a, a, b, c, c, ],
      [ a, b, b, b, b, c, c, c, c, b, a, a, a, a, c, c, ],
      [ a, a, a, a, b, b, c, c, a, a, a, a, a, c, c, c, ],
      [ a, a, a, a, a, b, c, c, a, a, c, a, c, c, c, c, ],
      [ a, a, c, c, a, a, c, c, a, a, a, c, c, b, c, c, ],
      [ a, a, a, a, a, c, c, c, a, a, c, c, c, b, c, c, ],
      [ c, c, c, c, c, c, c, c, c, c, c, c, b, b, c, c, ],
      [ c, c, c, c, c, c, c, c, c, c, c, b, b, b, c, c, ],
      [ c, c, b, b, b, b, b, b, c, c, c, b, a, b, c, c, ],
      [ c, c, a, a, a, a, a, a, b, c, c, a, a, a, c, c, ],
      [ c, a, c, a, a, a, b, a, a, b, c, a, a, a, c, c, ],
      [ c, a, a, a, c, c, a, a, a, a, c, a, a, c, c, c, ],
      [ c, a, a, a, a, a, a, a, c, a, c, c, c, c, c, c, ],
      [ c, a, a, a, a, a, a, a, a, c, c, c, c, b, c, c, ],
      [ c, c, c, c, c, c, c, c, c, c, c, c, b, b, c, c, ],
      [ c, c, c, c, c, c, c, c, c, c, c, b, b, b, c, c, ],
    ]))
    images.add('Water0', new Image([
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
    ]))
    images.add('Water1', new Image([
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, s, n, s, s, n, n, n, s, s, s, s, n, s, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
    ]))
    images.add('Water2', new Image([
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, s, s, s, s, s, s, s, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, s, s, s, n, n, ],
      [ n, n, n, n, n, n, n, n, n, s, s, s, s, s, s, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
    ]))
    images.add('Water3', new Image([
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, s, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, s, s, s, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, s, s, n, s, s, n, n, n, n, n, n, n, n, n, ],
      [ s, s, n, n, n, n, s, s, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, s, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, s, s, s, s, n, n, n, ],
      [ n, n, n, n, n, n, n, s, s, s, s, n, s, s, n, n, ],
      [ n, n, n, n, n, s, s, s, n, n, n, n, n, s, s, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
    ]))
    images.add('Water4', new Image([
      [ n, n, n, n, n, n, s, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, s, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, s, s, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, s, s, n, s, s, n, n, n, n, n, n, n, n, n, ],
      [ n, s, s, n, n, n, n, s, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, s, n, s, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, s, n, s, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, s, s, s, n, n, n, ],
      [ n, n, n, n, n, n, n, n, s, s, n, n, s, s, n, n, ],
      [ n, n, n, n, n, n, s, s, s, n, n, n, n, n, s, n, ],
      [ n, n, n, n, s, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
      [ n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, ],
    ]))
    images.add('TreeTop', new Image([
      [ b, b, b, b, b, c, c, c, b, b, c, c, c, b, b, b, ],
      [ b, b, b, c, c, c, a, a, c, c, a, a, a, c, b, b, ],
      [ b, b, c, c, a, a, c, a, a, a, c, c, a, a, c, b, ],
      [ b, b, c, a, a, c, a, a, c, a, a, c, c, c, a, c, ],
      [ b, c, c, a, c, c, a, a, c, c, a, a, c, c, c, c, ],
      [ b, c, c, a, c, a, a, c, a, c, c, c, a, c, b, c, ],
      [ b, c, c, c, c, a, a, c, c, a, c, c, c, c, b, b, ],
      [ b, c, c, c, c, c, a, c, c, a, a, c, c, c, c, b, ],
      [ b, c, c, b, c, c, c, c, c, c, a, c, b, c, c, b, ],
      [ b, c, c, b, c, c, c, c, c, c, c, c, b, b, c, b, ],
      [ b, b, c, b, c, c, c, c, c, c, c, c, c, b, b, b, ],
      [ b, b, b, b, c, c, c, c, d, c, b, c, c, c, b, b, ],
      [ b, b, b, b, c, b, c, d, c, c, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, c, c, b, c, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, c, c, c, c, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, c, c, b, c, b, b, b, b, b, b, ],
    ]))
    images.add('PlayerStandDown', new Image([
      [ Z, Z, Z, Z, Z, g, g, g, g, g, g, g, g, Z, Z, Z, ],
      [ Z, Z, g, g, g, g, g, t, u, g, g, g, Z, Z, Z, Z, ],
      [ Z, g, g, g, g, t, g, t, u, g, u, g, g, g, Z, Z, ],
      [ Z, Z, g, g, g, g, g, g, g, g, g, g, g, g, Z, Z, ],
      [ Z, g, g, g, g, g, g, t, t, g, g, g, g, g, g, Z, ],
      [ g, g, g, u, g, u, u, t, t, u, u, g, u, g, g, Z, ],
      [ Z, g, g, u, g, u, g, t, t, g, u, g, u, g, g, g, ],
      [ g, g, g, g, g, t, t, t, t, t, t, g, g, s, t, g, ],
      [ g, g, t, t, t, g, t, t, t, t, g, g, t, s, t, g, ],
      [ g, u, t, t, g, t, g, g, g, g, g, t, t, t, g, Z, ],
      [ g, t, u, g, g, t, t, t, t, t, t, g, g, g, Z, Z, ],
      [ g, t, t, g, g, s, t, t, t, t, s, g, Z, Z, Z, Z, ],
      [ Z, g, g, g, u, g, u, u, u, u, g, u, g, Z, Z, Z, ],
      [ Z, Z, g, t, g, u, g, u, g, u, g, g, g, Z, Z, Z, ],
      [ Z, Z, g, t, t, g, g, g, g, g, t, t, t, g, Z, Z, ],
      [ Z, Z, g, g, g, Z, Z, Z, Z, Z, g, g, g, Z, Z, Z, ],
    ]))
    images.add('TreeBottom', new Image([
      [ b, b, b, b, b, b, c, d, c, c, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, c, c, c, b, c, b, b, b, b, b, ],
      [ b, b, b, b, b, b, c, d, d, b, c, b, b, c, b, b, ],
      [ b, b, b, b, b, b, c, d, c, c, c, b, c, c, b, b, ],
      [ b, b, c, b, b, b, c, c, c, c, b, c, c, b, c, b, ],
      [ b, c, c, b, c, b, c, d, d, d, b, c, a, c, c, b, ],
      [ b, c, b, c, b, c, d, d, d, c, c, c, a, c, b, c, ],
      [ c, a, a, a, b, c, c, c, c, c, c, b, c, a, c, b, ],
      [ c, a, c, a, c, c, a, c, d, c, d, c, b, c, c, b, ],
      [ b, c, a, c, c, a, a, c, c, d, c, c, c, a, c, c, ],
      [ c, a, a, c, c, a, c, a, c, c, c, d, c, c, a, c, ],
      [ b, c, c, c, c, c, a, c, c, c, c, c, c, a, a, c, ],
      [ b, b, c, c, a, c, c, c, c, c, c, c, a, c, c, b, ],
      [ b, b, b, a, a, b, c, c, a, a, a, a, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, a, a, b, b, b, b, b, b, ],
      [ b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, ],
    ]))    

    // sprites.add('playerWalking', new Sprite(1, [
    //   images.get('playerWalk1'),
    //   images.get('playerWalk2'),
    //   images.get('playerWalk3'),
    //   images.get('playerWalk4'),
    //   images.get('playerWalk5'),
    //   images.get('playerWalk6'),
    //   images.get('playerWalk7'),
    //   images.get('playerWalk8')
    // ]))

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
      images.get('Water4'),
    ]))


    // Add all the images as single-image sprites too.
    for (const [name, image] of images.entries()) {
      sprites.add(name, Sprite.forSingleImage(image))
    }
  }

  init(sprites: SpriteController, instances: InstanceController) {
    const player = instances.factory('player', sprites.get('PlayerStandDown'), playerUpdateFn)


    const Sand = instances.simple(sprites, 'Sand')
    const Rock = instances.simple(sprites, 'Rock')
    const Bush = instances.simple(sprites, 'Bush')
    const GongDisabled = instances.simple(sprites, 'GongDisabled')
    const WallTopRightDown = instances.simple(sprites, 'WallTopRightDown')
    const SandEdge = instances.simple(sprites, 'SandEdge')
    const Box = instances.simple(sprites, 'Box')
    const GongRed = instances.simple(sprites, 'GongRed')
    const PillarRed = instances.simple(sprites, 'PillarRed')
    const WallTopUpDown = instances.simple(sprites, 'WallTopUpDown')
    const Key = instances.simple(sprites, 'Key')
    const Land = instances.simple(sprites, 'Land')
    const Lock = instances.simple(sprites, 'Lock')
    const ArrowLeft = instances.simple(sprites, 'ArrowLeft')
    const WallTopLeftRight = instances.simple(sprites, 'WallTopLeftRight')
    const WallTopUpLeft = instances.simple(sprites, 'WallTopUpLeft')
    const Pedestal = instances.simple(sprites, 'Pedestal')
    const LandCorner = instances.simple(sprites, 'LandCorner')
    const LandBottom = instances.simple(sprites, 'LandBottom')
    const ArrowLeftDisabled = instances.simple(sprites, 'ArrowLeftDisabled')
    const Wall = instances.simple(sprites, 'Wall')
    const WallVert = instances.simple(sprites, 'WallVert')
    const TreeTop = instances.simple(sprites, 'TreeTop')
    const TreeBottom = instances.simple(sprites, 'TreeBottom')
    const Water = instances.simple(sprites, 'Water')    

    const Grass = Land // Just because we do not have all the sprites



    const validator = {}
    function g(item: GameObject<any, any>, pos: IPosition) {
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

      o.zIndex = 0

      return o
    }

    const rand = LCG(2020)

    // Setart each Ocean tile at a random spot so the ocean waves will crest randomly
    function waterAnim(o: ObjectInstance<any, any>) {
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
    g(Key, { x: 17 - 1/16, y: y - 5/16 }).zIndex = -1000
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
    g(player, { x: 11, y }).zIndex = -1000
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

  drawBackground(tiles: Array<ObjectInstance<any, any>>, camera: Camera, drawPixelsFn: DrawPixelsFn) {
    const bbox = camera.toBBox()
    const color = '#FFFFFF' // white

    const pixels = Array(bbox.maxY - bbox.minY).fill(Array(bbox.maxX - bbox.minX).fill(color))

    drawPixelsFn({ x: 0, y: 0 }, pixels, false, false)
  }

  drawOverlay(drawPixelsFn: DrawPixelsFn, drawTextFn: DrawTextFn, fields: SimpleObject) {
  }

  drawDialog(message: string, drawPixelsFn: DrawPixelsFn, drawTextFn: DrawTextFn, elapsedMs: number, target: Opt<IPosition>, additional: Opt<SimpleObject>) {
  }
}

enum PLAYER_STATE {
  STOPPED = 'STOPPED',
  WALKING = 'WALKING',
  PUSHING = 'PUSHING'
}

interface PlayerProps {
  direction: number
  state: PLAYER_STATE
  stateStart: number
}

function playerUpdateFn(o: ObjectInstance<PlayerProps, any>, gamepad: IGamepad, collisionChecker: CollisionChecker, sprites: SpriteController, instances: InstanceController, camera: Camera, showDialog: ShowDialogFn, overlayState: SimpleObject) {
  
  // Follow the player for now
  camera.track(o.pos)

  const wallSprites = [
    sprites.get('Rock'),

    sprites.get('Rock'),
    sprites.get('Bush'),
    sprites.get('GongDisabled'),
    sprites.get('WallTopRightDown'),
    sprites.get('Box'),
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
    sprites.get('Water'),
  ]

  // initialize the props
  const p = o.props
  if (p.direction === undefined) {
    p.direction = 3 // down
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

  const oldPos = o.pos
  const newPos = {
    x: o.pos.x + dx * 4,
    y: o.pos.y + dy * 4 // 16/4 just to move faster
  }

  o.moveTo(newPos)

  // If there is a collision then move the player back
  const hasWall = !!collisionChecker.searchBBox(o.toBBox())
    .find((obj) => wallSprites.includes(obj.sprite))
  
  if (hasWall) {
    o.moveTo(oldPos)
  }
  
}

