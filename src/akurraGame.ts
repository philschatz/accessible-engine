import { Game, Camera, SpriteController, Image, DefiniteMap, Sprite, InstanceController, ObjectInstance, CollisionChecker, IPosition, GameObject, zIndexComparator, DrawPixelsFn, ShowDialogFn, SimpleObject, Opt, DrawTextFn } from './engine'
import { setMoveTo, DoubleArray } from './terminal'
import { IGamepad, BUTTON_TYPE } from './gamepad/api'

export class MyGame implements Game {
  load(gamepad: IGamepad, sprites: SpriteController) {
    // gamepad.listenTo([BUTTON_TYPE.ARROW_LEFT, BUTTON_TYPE.ARROW_RIGHT, BUTTON_TYPE.ARROW_DOWN, BUTTON_TYPE.ARROW_UP, BUTTON_TYPE.CLUSTER_BOTTOM])

    const images = new DefiniteMap<Image>()

    const Z = null // transparent
    const a = '#82beb4'
    const b = '#84bdb4'
    const c = '#ccfcea'
    const d = '#caf9f2'
    const e = '#1f2b30'
    const f = '#143143'
    const g = '#fffedf'
    const h = '#767676'
    const i = '#8bc1b6'
    const j = '#b8ebdb'
    const k = '#b7eddf'
    const l = '#f6cca8'
    const m = '#96cfc3'
    const n = '#2b5152'
    const o = '#629896'
    const p = '#467676'
    const q = '#234445'
    const r = '#3d6583'
    const s = '#5a8d89'
    const t = '#699fa0'
    const u = '#000000'
    const v = '#6a1311'
    const w = '#84beb5'
    const x = '#64281e'
    const y = '#ba9c5c'
    const z = '#cf4542'
    const A = '#d9fae3'
    const B = '#a4b467'
    const C = '#2f5b5e'
    const D = '#3d99d9'
    const E = '#3d9bdd'
    const F = '#6dc4e8'
    const G = '#6bc5ea'
    const H = '#1b393a'
    const I = '#8fc1b9'
    const J = '#5bb8e8'
    const K = '#6cb0b6'
    const L = '#7fb8b4'
    const M = '#366365'
    const N = '#dec496'
    const O = '#434343'
    const P = '#cc8c60'
    const Q = '#ea7f59'
    const R = '#ffffff'
    const S = '#8bbbb2'
    images.add('Sand', new Image([
      [a, b, c, b, d, d, d, d, d, d, d, d, d, d, b, b,],
      [a, b, b, d, b, d, d, d, d, d, d, d, d, d, d, b,],
      [b, b, b, i, j, i, d, d, d, d, d, d, d, d, d, k,],
      [b, b, b, b, d, b, d, d, d, d, d, d, d, d, d, d,],
      [d, b, b, b, b, d, b, d, b, d, d, d, d, d, d, d,],
      [d, d, b, b, b, b, b, b, d, b, d, d, d, d, d, d,],
      [d, d, d, b, b, b, b, b, b, d, b, b, d, d, d, d,],
      [d, d, d, d, d, b, b, b, b, b, b, d, b, b, d, d,],
      [d, d, d, d, d, d, d, d, b, b, b, b, b, d, b, d,],
      [d, d, d, d, d, d, d, d, d, b, b, b, b, b, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, a, b, b, b, d,],
      [d, d, d, d, d, d, d, d, d, d, d, k, b, b, b, m,],
      [d, d, d, d, d, d, d, d, d, d, d, d, b, b, b, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, d, a, b, b,],
      [b, d, d, d, d, d, d, d, d, d, d, d, d, b, b, b,],
      [b, b, d, d, d, d, d, d, d, d, d, d, d, d, b, b,],
    ]))
    images.add('Rock', new Image([
      [d, d, d, d, d, d, e, e, e, e, d, d, d, d, d, d,],
      [d, d, d, e, e, e, b, b, b, b, e, e, d, d, d, d,],
      [d, d, e, b, d, d, b, d, d, d, b, b, e, d, d, d,],
      [d, e, b, d, d, p, b, d, d, d, d, d, b, e, d, d,],
      [d, e, b, b, d, p, p, b, d, d, d, b, b, d, e, d,],
      [d, e, b, b, b, d, p, p, b, b, b, p, b, b, e, d,],
      [d, e, b, b, b, b, b, p, b, b, b, p, p, e, e, d,],
      [d, e, e, p, b, b, b, b, b, b, b, p, p, d, e, e,],
      [d, b, e, e, p, b, b, b, b, b, p, p, d, d, d, e,],
      [d, b, e, d, b, b, b, d, d, b, b, b, b, b, d, e,],
      [b, e, d, b, d, p, b, b, b, d, e, p, b, b, b, e,],
      [b, e, p, b, b, d, e, p, b, d, e, p, b, b, b, e,],
      [b, e, p, p, b, d, e, p, b, b, e, e, p, b, b, e,],
      [b, e, e, e, p, p, e, e, p, e, e, e, e, p, e, d,],
      [b, b, e, e, e, e, b, b, b, b, b, e, e, e, d, d,],
      [d, b, b, b, b, b, b, d, d, b, b, b, b, b, d, d,],
    ]))
    images.add('Bush', new Image([
      [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z,],
      [Z, Z, Z, Z, Z, Z, Z, f, f, Z, Z, Z, Z, Z, Z, Z,],
      [Z, Z, Z, Z, f, f, f, l, f, f, f, f, Z, Z, Z, Z,],
      [Z, Z, Z, f, l, f, f, l, l, f, f, Z, f, Z, Z, Z,],
      [Z, Z, f, f, f, l, f, l, Z, f, Z, f, f, f, Z, Z,],
      [Z, f, l, l, f, f, l, l, l, Z, f, f, l, l, f, Z,],
      [Z, Z, f, l, l, f, f, f, f, f, f, l, l, f, Z, Z,],
      [Z, Z, f, l, f, l, f, f, l, f, l, f, Z, f, Z, Z,],
      [f, Z, f, f, f, f, f, l, Z, f, f, f, f, f, Z, f,],
      [Z, f, l, f, f, l, l, l, l, l, Z, f, f, Z, f, Z,],
      [l, f, l, l, f, f, l, l, l, l, f, f, Z, Z, f, Z,],
      [l, f, f, l, l, f, f, f, f, f, f, l, l, f, f, Z,],
      [Z, l, f, f, f, f, l, l, l, Z, f, f, f, f, Z, Z,],
      [Z, l, l, f, f, f, f, f, f, f, f, f, f, Z, Z, Z,],
      [Z, Z, l, l, l, l, f, f, f, f, l, l, l, Z, Z, Z,],
      [Z, Z, Z, l, l, l, l, l, l, l, l, Z, Z, Z, Z, Z,],
    ]))
    images.add('GongDisabled', new Image([
      [f, f, f, f, f, g, f, f, f, f, f, f, f, f, f, f,],
      [f, h, h, h, h, h, h, f, f, h, h, h, h, h, h, f,],
      [Z, f, f, f, f, f, f, f, f, f, f, f, f, f, f, Z,],
      [Z, f, q, f, Z, Z, f, f, f, f, Z, Z, f, h, f, Z,],
      [Z, f, q, f, Z, f, f, h, h, f, f, Z, f, h, f, Z,],
      [Z, f, q, f, Z, f, q, q, h, h, f, Z, f, h, f, Z,],
      [Z, f, q, f, Z, f, q, f, f, h, f, Z, f, h, f, Z,],
      [Z, f, q, f, Z, f, f, q, q, f, f, Z, f, h, f, Z,],
      [f, q, h, f, Z, f, q, f, f, h, f, Z, f, q, h, f,],
      [f, q, h, f, Z, f, f, q, q, f, f, Z, f, q, h, f,],
      [f, q, q, f, Z, f, q, f, f, h, f, Z, f, q, q, f,],
      [f, q, q, f, Z, Z, f, f, f, f, Z, Z, f, q, q, f,],
      [f, q, q, f, Z, Z, Z, Z, Z, Z, Z, Z, f, q, q, f,],
      [f, q, q, f, Z, f, f, f, f, Z, Z, Z, f, q, q, f,],
      [f, q, q, f, Z, Z, Z, f, f, f, f, Z, f, q, q, f,],
      [Z, f, f, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, f, f, Z,],
    ]))
    images.add('WallTopRightDown', new Image([
      [d, d, b, f, f, f, f, f, f, f, f, f, f, f, f, f,],
      [d, b, f, f, f, f, f, f, f, f, f, f, f, f, f, f,],
      [m, n, f, f, o, o, o, o, o, o, o, o, o, o, o, o,],
      [f, f, f, o, b, b, b, b, b, b, b, b, b, b, b, b,],
      [f, f, r, b, b, b, b, b, b, b, b, b, b, b, b, b,],
      [f, f, b, b, b, b, b, b, b, b, b, b, b, b, b, b,],
      [f, f, b, b, b, b, b, s, s, s, s, s, s, s, s, s,],
      [f, f, b, b, b, b, b, f, f, f, f, f, f, f, f, f,],
      [f, f, b, b, b, b, f, f, f, f, f, f, f, f, f, f,],
      [f, f, b, b, b, b, f, f, f, f, f, f, f, f, f, f,],
      [f, f, b, b, b, b, f, f, f, f, k, c, c, c, c, f,],
      [f, f, b, b, b, b, f, f, f, d, d, d, d, d, d, f,],
      [f, f, b, b, b, b, f, f, f, d, d, d, d, d, d, f,],
      [f, f, b, b, b, b, f, f, f, d, d, d, k, b, b, f,],
      [f, f, b, b, b, b, f, f, f, d, d, d, b, b, t, f,],
      [f, f, b, b, b, b, f, f, f, d, d, b, b, s, f, f,],
    ]))
    images.add('SandEdge', new Image([
      [b, d, d, d, d, d, d, d, d, d, d, d, d, b, b, b,],
      [b, b, d, d, d, d, d, d, d, d, d, d, d, d, a, b,],
      [b, b, b, d, d, d, d, d, d, d, d, d, d, d, b, b,],
      [b, b, b, b, d, d, d, d, d, d, d, d, d, d, d, b,],
      [d, b, b, b, b, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, b, b, b, b, b, d, b, d, b, d, d, d, d, d,],
      [d, d, d, a, b, b, b, b, b, b, d, b, d, d, d, d,],
      [d, d, d, d, b, b, b, b, b, b, b, b, b, b, b, d,],
      [d, d, d, d, d, d, d, d, b, b, b, b, b, d, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, b, b, b, b, b, b, b, b, d, d,],
      [b, b, b, D, E, E, E, E, E, E, E, E, E, E, b, b,],
      [E, E, E, E, d, d, d, d, d, d, d, d, E, E, E, E,],
      [E, E, F, G, d, d, j, G, j, G, j, d, G, G, G, E,],
      [E, b, d, I, J, i, E, K, E, K, E, i, G, m, G, L,],
    ]))
    images.add('Box', new Image([
      [Z, u, u, u, u, u, u, u, u, u, u, u, u, u, u, Z,],
      [u, u, x, y, y, y, y, y, y, y, y, y, y, x, u, u,],
      [u, x, x, u, u, u, u, u, u, u, u, u, u, x, x, u,],
      [u, y, u, u, y, x, y, y, y, y, y, y, u, u, y, u,],
      [u, y, u, y, y, x, y, x, x, x, x, y, y, u, y, u,],
      [u, y, u, y, y, x, x, x, x, y, x, y, y, u, y, u,],
      [u, y, u, u, y, y, y, y, y, y, x, y, u, u, y, u,],
      [u, x, x, u, u, u, u, u, u, u, u, u, u, x, x, u,],
      [u, u, x, y, y, y, y, y, y, y, y, y, y, x, u, u,],
      [u, x, u, u, u, u, u, u, u, u, u, u, u, u, x, u,],
      [u, u, x, x, x, x, x, u, u, x, x, x, x, x, u, u,],
      [u, x, u, u, u, u, x, u, u, x, u, u, u, u, x, u,],
      [u, x, u, x, x, u, x, u, u, x, u, x, x, u, x, u,],
      [u, x, u, u, x, u, x, u, u, x, u, x, u, u, x, u,],
      [u, u, x, x, x, u, x, x, x, x, u, x, x, x, u, u,],
      [Z, u, u, u, u, u, u, u, u, u, u, u, u, u, u, Z,],
    ]))
    images.add('GongRed', new Image([
      [v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v,],
      [v, l, l, l, l, l, l, v, v, l, l, l, l, l, l, v,],
      [Z, v, v, v, v, v, v, v, v, v, v, v, v, v, v, Z,],
      [Z, v, z, v, Z, Z, v, v, v, v, Z, Z, v, l, v, Z,],
      [Z, v, z, v, Z, v, v, l, l, v, v, Z, v, l, v, Z,],
      [Z, v, z, v, Z, v, z, z, l, l, v, Z, v, l, v, Z,],
      [Z, v, z, v, Z, v, z, v, v, l, v, Z, v, l, v, Z,],
      [Z, v, z, v, Z, v, v, z, z, v, v, Z, v, l, v, Z,],
      [v, z, l, v, Z, v, z, v, v, l, v, Z, v, z, l, v,],
      [v, z, l, v, Z, v, v, z, z, v, v, Z, v, z, l, v,],
      [v, z, z, v, Z, v, z, v, v, l, v, Z, v, z, z, v,],
      [v, z, z, v, Z, Z, v, v, v, v, Z, Z, v, z, z, v,],
      [v, z, z, v, Z, Z, Z, Z, Z, Z, Z, Z, v, z, z, v,],
      [v, z, z, v, Z, v, v, v, v, Z, Z, Z, v, z, z, v,],
      [v, z, z, v, Z, Z, Z, v, v, v, v, Z, v, z, z, v,],
      [Z, v, v, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, v, v, Z,],
    ]))
    images.add('PillarRed', new Image([
      [Z, Z, Z, Z, Z, Z, v, v, v, v, Z, Z, Z, Z, Z, Z,],
      [Z, Z, Z, Z, v, v, l, l, l, l, v, v, Z, Z, Z, Z,],
      [Z, Z, Z, v, l, l, l, l, l, l, l, l, v, Z, Z, Z,],
      [Z, Z, Z, v, l, z, l, l, l, l, z, l, v, Z, Z, Z,],
      [Z, Z, v, z, v, z, l, l, l, l, z, v, l, v, Z, Z,],
      [Z, Z, v, z, v, z, z, l, l, z, z, v, z, v, Z, Z,],
      [Z, Z, v, v, z, z, z, z, z, z, z, z, z, v, Z, Z,],
      [Z, Z, v, v, v, z, z, z, z, z, z, z, v, v, Z, Z,],
      [Z, Z, v, v, z, z, z, v, v, z, z, v, l, v, Z, Z,],
      [Z, Z, v, v, z, z, v, z, z, v, z, l, z, v, Z, Z,],
      [Z, Z, v, v, z, z, z, v, v, z, z, z, v, v, Z, Z,],
      [Z, z, v, v, v, z, z, z, z, z, z, v, l, v, Z, Z,],
      [Z, z, v, v, z, v, v, v, v, v, v, l, v, v, Z, Z,],
      [Z, z, z, v, v, z, z, z, z, z, z, v, v, Z, Z, Z,],
      [Z, Z, z, z, v, v, v, v, v, v, v, v, z, Z, Z, Z,],
      [Z, Z, Z, z, z, z, z, z, z, z, z, z, Z, Z, Z, Z,],
    ]))
    images.add('WallTopUpDown', new Image([
      [f, f, b, b, b, b, f, f, f, w, d, b, s, f, f, f,],
      [f, f, b, b, b, b, f, f, f, d, d, b, b, f, f, f,],
      [f, f, b, b, b, b, f, f, f, d, d, b, b, b, f, f,],
      [f, f, b, b, b, b, f, f, f, d, d, b, b, b, f, f,],
      [f, f, b, b, b, b, f, f, f, d, d, d, b, b, f, f,],
      [f, f, b, b, b, b, f, f, f, f, f, f, b, b, f, f,],
      [f, f, b, b, b, b, f, f, f, f, f, f, f, b, f, f,],
      [f, f, b, b, b, b, f, f, f, f, k, f, f, f, f, f,],
      [f, f, b, b, b, b, f, f, f, f, d, p, f, f, f, f,],
      [f, f, b, b, b, b, f, f, f, f, d, d, f, f, f, f,],
      [f, f, b, b, b, b, f, f, f, C, d, b, b, f, f, f,],
      [f, f, b, b, b, b, f, f, f, d, d, b, b, f, f, f,],
      [f, f, b, b, b, b, f, f, f, d, d, b, b, b, f, f,],
      [f, f, b, b, b, b, f, f, f, d, d, b, b, b, f, f,],
      [f, f, b, b, b, b, f, f, f, H, H, d, b, b, f, f,],
      [f, f, f, b, b, f, f, f, f, f, f, f, f, b, f, f,],
    ]))
    images.add('Key', new Image([
      [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z,],
      [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z,],
      [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z,],
      [Z, Z, Z, Z, Z, Z, A, A, A, A, Z, Z, Z, Z, Z, Z,],
      [Z, Z, Z, Z, Z, A, u, u, u, u, A, Z, Z, Z, Z, Z,],
      [Z, Z, Z, Z, A, u, A, A, A, A, u, A, Z, Z, Z, Z,],
      [Z, Z, Z, Z, A, u, B, u, u, A, u, A, Z, Z, Z, Z,],
      [Z, Z, Z, Z, A, u, B, u, u, A, u, A, Z, Z, Z, Z,],
      [Z, Z, Z, Z, A, u, B, B, B, B, u, A, Z, Z, Z, Z,],
      [Z, Z, Z, Z, Z, A, u, u, B, u, A, Z, Z, Z, Z, Z,],
      [Z, Z, Z, Z, Z, A, u, Z, B, u, A, Z, Z, Z, Z, Z,],
      [Z, Z, Z, Z, Z, A, u, u, B, u, A, Z, Z, Z, Z, Z,],
      [Z, Z, Z, Z, Z, A, u, B, B, u, A, Z, Z, Z, Z, Z,],
      [Z, Z, Z, Z, Z, Z, A, u, u, A, Z, Z, Z, Z, Z, Z,],
      [Z, Z, Z, Z, Z, Z, Z, A, A, Z, Z, Z, Z, Z, Z, Z,],
      [Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z,],
    ]))
    images.add('Land', new Image([
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, d, d, N, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, N, d, N, d, N, d, d, d, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, N, d, N, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, N, d, d, d,],
      [d, N, d, d, d, d, d, d, d, d, N, d, N, d, N, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
    ]))
    images.add('Lock', new Image([
      [Z, u, u, u, u, u, u, u, u, u, u, u, u, u, u, Z,],
      [u, M, M, Z, Z, Z, Z, y, M, Z, Z, Z, Z, M, M, u,],
      [u, M, M, M, M, M, M, M, M, M, M, M, M, M, Z, u,],
      [u, M, M, M, y, y, y, y, y, y, y, y, M, Z, Z, u,],
      [u, M, M, M, y, y, Z, u, u, y, y, y, M, Z, Z, u,],
      [u, M, M, M, y, Z, u, u, u, u, y, y, M, Z, Z, u,],
      [u, M, M, M, y, Z, u, u, u, u, y, y, M, Z, Z, u,],
      [u, M, y, M, y, y, Z, u, u, y, y, y, M, M, Z, u,],
      [u, y, M, M, y, y, Z, u, u, y, y, y, M, Z, M, u,],
      [u, M, M, M, y, y, y, Z, Z, y, y, y, M, Z, Z, u,],
      [u, M, M, M, y, y, y, y, y, y, y, y, M, Z, Z, u,],
      [u, M, M, M, M, M, M, M, M, M, M, M, M, Z, Z, u,],
      [u, M, M, y, y, y, y, Z, M, y, y, y, y, M, Z, u,],
      [u, M, y, y, y, y, y, Z, M, y, y, y, y, y, M, u,],
      [u, y, y, y, y, y, y, Z, M, y, y, y, y, y, y, u,],
      [Z, u, u, u, u, u, u, u, u, u, u, u, u, u, u, Z,],
    ]))
    images.add('ArrowLeft', new Image([
      [Z, u, u, u, u, u, u, u, u, u, u, u, u, u, u, Z,],
      [u, M, M, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, M, M, u,],
      [u, M, M, M, M, M, M, M, M, M, M, M, M, M, Z, u,],
      [u, M, M, M, y, y, y, u, u, u, u, y, M, Z, Z, u,],
      [u, M, M, M, y, u, u, g, g, g, u, y, M, Z, Z, u,],
      [u, M, M, M, u, g, g, g, g, u, y, y, M, Z, Z, u,],
      [u, M, M, M, u, M, M, M, M, u, y, y, M, Z, Z, u,],
      [u, M, M, M, M, u, u, M, M, M, u, y, M, Z, Z, u,],
      [u, M, M, M, y, M, M, u, u, u, u, y, M, Z, Z, u,],
      [u, M, M, M, y, y, y, M, M, M, M, y, M, Z, Z, u,],
      [u, M, M, M, y, y, y, y, y, y, y, y, M, Z, Z, u,],
      [u, M, M, M, M, M, M, M, M, M, M, M, M, Z, Z, u,],
      [u, M, M, y, y, y, y, y, y, y, y, y, y, M, Z, u,],
      [u, M, y, M, M, y, M, M, M, M, y, M, M, y, M, u,],
      [u, y, M, y, M, M, M, y, y, M, M, M, y, M, y, u,],
      [Z, u, u, u, u, u, u, u, u, u, u, u, u, u, u, Z,],
    ]))
    images.add('WallTopLeftRight', new Image([
      [f, f, f, f, f, f, f, f, f, f, f, f, f, f, f, f,],
      [f, f, f, f, f, f, f, f, f, f, f, f, f, f, f, f,],
      [f, s, s, s, s, s, s, s, s, s, s, s, s, s, s, f,],
      [f, b, b, b, b, b, b, b, b, b, b, b, b, b, b, f,],
      [b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b,],
      [b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b,],
      [f, b, b, b, b, b, b, b, b, b, b, b, b, b, b, f,],
      [f, f, f, f, f, f, f, f, f, f, f, f, f, f, f, f,],
      [f, f, f, f, f, f, f, f, f, f, f, f, f, f, f, f,],
      [f, f, f, f, f, f, f, f, f, f, f, f, f, f, f, f,],
      [f, p, p, p, p, p, f, f, f, p, p, p, p, p, f, f,],
      [H, d, d, d, d, d, O, f, H, d, d, d, d, d, H, f,],
      [k, k, k, k, d, d, d, f, k, d, d, k, k, k, k, f,],
      [b, b, b, b, d, d, d, f, b, d, d, b, b, b, b, f,],
      [f, b, b, b, b, b, f, f, b, b, b, b, b, b, f, f,],
      [f, f, b, b, b, f, f, f, f, f, b, b, b, f, f, f,],
    ]))
    images.add('WallTopUpLeft', new Image([
      [f, f, b, b, b, b, f, f, f, f, f, f, f, f, f, f,],
      [f, C, b, b, b, b, f, f, f, f, r, p, f, f, f, f,],
      [s, b, b, b, b, C, f, f, f, t, d, m, s, f, f, f,],
      [b, b, b, b, b, f, f, f, f, d, d, b, b, f, f, f,],
      [b, b, b, b, b, f, f, f, f, d, d, b, b, f, f, f,],
      [b, b, b, b, f, f, f, f, f, d, d, d, b, f, f, f,],
      [b, b, f, f, f, f, f, f, f, d, d, b, b, b, f, f,],
      [f, f, f, f, f, f, f, f, f, d, d, b, b, b, f, f,],
      [f, f, f, f, f, f, f, f, f, p, d, b, b, b, f, f,],
      [f, f, f, f, f, f, m, m, f, f, C, b, b, b, f, f,],
      [f, f, r, r, p, p, d, d, p, f, f, b, b, s, f, f,],
      [f, H, d, d, d, d, d, d, d, f, f, b, t, f, f, f,],
      [f, d, d, d, k, k, k, b, b, f, f, s, f, f, f, f,],
      [f, d, d, d, b, b, b, b, b, f, f, f, f, f, f, f,],
      [f, b, b, b, b, b, b, b, b, f, f, f, f, f, f, f,],
      [f, b, b, b, b, b, b, b, f, f, f, f, f, d, f, f,],
    ]))
    images.add('Pedestal', new Image([
      [Z, Z, r, r, r, r, r, r, r, r, r, r, r, Z, Z, Z,],
      [Z, r, b, b, b, b, b, b, b, b, b, b, b, r, Z, Z,],
      [r, r, Z, r, r, r, r, r, r, r, r, r, b, r, r, Z,],
      [r, r, Z, r, b, r, b, b, Z, r, b, r, b, r, r, Z,],
      [r, r, Z, r, r, b, b, b, b, Z, r, r, b, r, r, Z,],
      [r, r, Z, r, b, b, b, b, b, b, Z, r, b, r, r, Z,],
      [r, r, Z, r, b, b, b, b, b, b, b, r, b, r, r, Z,],
      [r, r, Z, r, r, b, b, b, b, b, r, r, b, r, r, Z,],
      [r, r, Z, r, b, r, b, b, b, r, b, r, b, r, r, Z,],
      [r, r, Z, r, r, r, r, r, r, r, r, r, b, r, r, Z,],
      [r, r, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, r, r, b,],
      [r, r, b, b, b, b, b, b, b, b, b, b, Z, r, r, b,],
      [r, b, r, r, r, r, r, r, r, r, r, r, r, Z, r, b,],
      [r, b, b, b, b, b, b, b, b, b, b, b, b, b, r, b,],
      [b, r, r, r, r, r, r, r, r, r, r, r, r, r, b, b,],
      [Z, b, b, b, b, b, b, b, b, b, b, b, b, b, Z, Z,],
    ]))
    images.add('LandCorner', new Image([
      [P, N, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [Z, P, N, N, d, d, d, d, d, d, d, d, d, d, d, d,],
      [Z, P, N, N, d, d, d, d, d, d, d, d, d, d, d, d,],
      [P, N, N, d, d, d, d, d, d, d, d, N, d, d, d, d,],
      [P, N, N, N, d, d, d, d, d, d, d, N, d, N, d, d,],
      [P, N, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [P, N, N, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [Z, P, N, N, d, d, d, N, d, d, d, d, d, d, d, d,],
      [Z, P, N, N, N, d, d, d, d, d, d, d, d, d, d, d,],
      [P, N, N, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [P, N, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [P, N, N, d, d, d, d, d, N, d, d, d, d, N, d, d,],
      [P, N, N, N, d, N, d, N, N, N, d, N, d, N, N, d,],
      [Z, P, N, N, N, N, N, N, N, N, d, N, N, N, N, d,],
      [Z, Z, P, N, N, N, N, P, P, N, N, N, N, P, P, N,],
      [Z, Z, Z, P, P, P, P, Z, Z, P, P, P, P, Z, Z, P,],
    ]))
    images.add('LandBottom', new Image([
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, N, d, N, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, N, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, N, d, N, d, N, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, d, d, d, d, d, d, d, d, d, d,],
      [d, d, d, d, d, d, d, d, N, d, d, d, d, N, d, d,],
      [d, N, N, d, N, d, d, N, N, N, d, N, d, N, N, d,],
      [d, N, N, N, N, d, N, N, N, N, d, N, N, N, N, d,],
      [N, P, P, N, N, N, N, P, P, N, N, N, N, P, P, N,],
      [P, Z, Z, P, P, P, P, Z, Z, P, P, P, P, Z, Z, P,],
    ]))
    images.add('ArrowLeftDisabled', new Image([
      [Z, f, f, f, f, f, f, f, f, f, f, f, f, f, f, Z,],
      [f, s, s, Z, Z, Z, Z, Z, Z, Z, Z, Z, Z, s, s, f,],
      [f, s, s, s, s, s, s, s, s, s, s, s, s, s, Z, f,],
      [f, s, s, s, b, b, b, f, f, f, f, b, s, Z, Z, f,],
      [f, s, s, s, b, f, f, b, b, b, f, b, s, Z, Z, f,],
      [f, s, s, s, f, b, b, b, b, f, b, b, s, Z, Z, f,],
      [f, s, s, s, f, s, s, s, s, f, b, b, s, Z, Z, f,],
      [f, s, s, s, s, f, f, s, s, s, f, b, s, Z, Z, f,],
      [f, s, s, s, b, s, s, f, f, f, f, b, s, Z, Z, f,],
      [f, s, s, s, b, b, b, s, s, s, s, b, s, Z, Z, f,],
      [f, s, s, s, b, b, b, b, b, b, b, b, s, Z, Z, f,],
      [f, s, s, s, s, s, s, s, s, s, s, s, s, Z, Z, f,],
      [f, s, s, b, b, b, b, b, b, b, b, b, b, s, Z, f,],
      [f, s, b, s, s, b, s, s, s, s, b, s, s, b, s, f,],
      [f, b, s, b, s, s, s, b, b, s, s, s, b, s, b, f,],
      [Z, f, f, f, f, f, f, f, f, f, f, f, f, f, f, Z,],
    ]))
    images.add('Wall', new Image([
      [f, f, f, f, f, f, f, f, f, f, f, f, f, f, f, f,],
      [d, d, d, d, d, d, f, f, f, f, d, d, d, d, d, d,],
      [d, b, b, b, b, d, d, f, f, b, b, b, b, d, d, d,],
      [b, b, b, b, b, b, d, f, b, b, b, b, b, b, b, b,],
      [b, b, b, f, f, b, b, f, b, b, b, b, b, b, f, b,],
      [b, b, b, b, b, b, b, f, f, b, b, f, f, b, b, b,],
      [b, b, f, b, b, b, f, f, f, f, b, b, b, b, b, b,],
      [f, f, f, f, f, f, f, f, f, f, f, f, f, f, f, f,],
      [f, f, f, f, f, f, f, f, f, f, f, f, f, f, f, f,],
      [f, f, i, i, i, i, i, i, S, i, i, i, i, w, f, f,],
      [f, b, b, b, k, b, b, b, I, I, I, a, I, d, d, f,],
      [f, b, b, b, d, b, b, b, b, b, b, b, b, d, d, f,],
      [f, b, b, b, b, b, b, b, b, b, b, f, b, b, d, f,],
      [f, b, b, b, b, f, f, b, b, b, b, b, b, b, d, f,],
      [f, f, b, b, b, b, b, b, f, f, b, b, b, b, f, f,],
      [f, f, f, f, f, f, f, f, f, f, f, f, f, f, f, f,],
    ]))
    images.add('WallVert', new Image([
      [f, f, f, f, f, f, f, f, f, f, f, f, d, d, d, f,],
      [d, d, d, d, d, d, d, f, f, b, b, b, d, d, k, f,],
      [b, b, b, t, t, b, b, d, f, s, b, b, b, i, f, f,],
      [b, b, b, f, f, b, b, b, f, f, b, b, b, f, f, f,],
      [b, b, b, b, b, b, b, f, f, f, f, f, f, f, d, f,],
      [b, b, b, b, b, b, C, f, f, f, f, f, f, b, d, f,],
      [b, b, b, b, b, b, C, f, f, f, f, f, f, b, d, f,],
      [f, f, f, f, f, f, f, f, f, f, f, f, f, d, d, f,],
      [f, f, f, s, b, f, b, b, b, b, f, f, b, d, d, f,],
      [f, f, b, b, b, k, b, b, b, b, k, f, b, d, b, f,],
      [f, f, b, b, q, b, b, b, b, b, b, f, b, b, t, f,],
      [f, f, b, b, b, b, b, d, b, b, b, f, b, b, f, f,],
      [f, b, b, b, d, b, b, b, b, b, f, f, b, f, f, f,],
      [f, f, b, b, b, b, b, f, f, b, b, f, f, f, f, f,],
      [f, f, f, s, s, s, s, s, s, s, f, f, f, f, d, d,],
      [f, f, f, f, f, f, f, f, f, f, f, f, f, d, d, d,],
    ]))
    images.add('PlayerStandDown', new Image([
      [Z, Z, Z, Z, Z, u, u, u, u, u, u, u, u, Z, Z, Z,],
      [Z, Z, u, u, u, u, u, Q, g, u, u, u, Z, Z, Z, Z,],
      [Z, u, u, u, u, Q, u, Q, g, u, g, u, u, u, Z, Z,],
      [Z, Z, u, u, u, u, u, u, u, u, u, u, u, u, Z, Z,],
      [Z, u, u, u, u, u, u, Q, Q, u, u, u, u, u, u, Z,],
      [u, u, u, g, u, g, g, Q, Q, g, g, u, g, u, u, Z,],
      [Z, u, u, g, u, g, u, Q, Q, u, g, u, g, u, u, u,],
      [u, u, u, u, u, Q, Q, Q, Q, Q, Q, u, u, R, Q, u,],
      [u, u, Q, Q, Q, u, Q, Q, Q, Q, u, u, Q, R, Q, u,],
      [u, R, Q, Q, u, Q, u, u, u, u, u, Q, Q, Q, u, Z,],
      [u, Q, R, u, u, Q, Q, Q, Q, Q, Q, u, u, u, Z, Z,],
      [u, Q, Q, u, u, R, Q, Q, Q, Q, R, u, Z, Z, Z, Z,],
      [Z, u, u, u, g, u, R, R, R, R, u, g, u, Z, Z, Z,],
      [Z, Z, u, Q, u, g, u, g, u, g, u, u, u, Z, Z, Z,],
      [Z, Z, u, Q, Q, u, u, u, u, u, Q, Q, Q, u, Z, Z,],
      [Z, Z, u, u, u, Z, Z, Z, Z, Z, u, u, u, Z, Z, Z,],
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
    g(Bush, { x: 1, y }) // TreeTop
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
    g(Bush, { x: 21, y }) // TreeTop
    g(Bush, { x: 22, y }) // TreeTop
    g(Bush, { x: 23, y }) // TreeTop
    
    // Row6
    y += 1
    g(Bush, { x: 0, y })
    g(Bush, { x: 1, y }) // TreeBottom
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
    g(Bush, { x: 21, y }) // TreeBottom
    g(Bush, { x: 22, y }) // TreeBottom
    g(Bush, { x: 23, y }) // TreeBottom
    
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

interface PlayerProps {
  direction: number
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
    x: o.pos.x + dx * 8,
    y: o.pos.y + dy * 8 // 16/2 just to move faster
  }

  o.moveTo(newPos)

  // If there is a collision then move the player back
  const hasWall = !!collisionChecker.searchBBox(o.toBBox())
    .find((obj) => wallSprites.includes(obj.sprite))
  
  if (hasWall) {
    o.moveTo(oldPos)
  }
  
}

