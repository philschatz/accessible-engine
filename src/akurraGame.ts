import { Game, Camera, SpriteController, Image, DefiniteMap, Sprite, InstanceController, ObjectInstance, CollisionChecker, IPosition, GameObject, zIndexComparator, DrawPixelsFn, ShowDialogFn, SimpleObject, Opt, DrawTextFn } from './common/engine'
import { IGamepad, BUTTON_TYPE } from './common/gamepad'
import { loadImages } from './akurraImages'
import { BBox } from 'rbush'

// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316#47593316
var LCG = (s: number) => () => (2 ** 31 - 1 & (s = Math.imul(48271, s))) / 2 ** 31

const EVERYTHING_BBOX = {
  minX: -1000,
  maxX: 1000,
  minY: -1000,
  maxY: 1000
}

export class MyGame implements Game {
  load (gamepad: IGamepad, sprites: SpriteController) {
    // gamepad.listenTo([BUTTON_TYPE.ARROW_LEFT, BUTTON_TYPE.ARROW_RIGHT, BUTTON_TYPE.ARROW_DOWN, BUTTON_TYPE.ARROW_UP, BUTTON_TYPE.CLUSTER_BOTTOM])

    const images = loadImages()

    sprites.add('Water', new Sprite(20, true, [
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

    sprites.add('Key', new Sprite(1, true, [
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key1'),
      images.get('Key2'),
      images.get('Key3'),
      images.get('Key4'),
      images.get('Key5'),
      images.get('Key6'),
    ]))

    sprites.add('GongDisabled', new Sprite(1, false, [
      images.get('GongDisabled1'),
      images.get('GongDisabled2'),
      images.get('GongDisabled3'),
      images.get('GongDisabled4'),
      images.get('GongDisabled5'),
      images.get('GongDisabled6'),
    ]))

    sprites.add('PlayerWalkingRight', new Sprite(1, true, [
      images.get('PlayerWalkingRight1'),
      images.get('PlayerWalkingRight2'),
    ]))

    sprites.add('FloorSquare', new Sprite(2, false, [
      images.get('FloorPoof1'),
      images.get('FloorPoof2'),
      images.get('FloorPoof3Square'),
      images.get('FloorSquareDone'),
    ]))

    sprites.add('FloorDiamond', new Sprite(2, false, [
      images.get('FloorPoof1'),
      images.get('FloorPoof2'),
      images.get('FloorPoof3Diamond'),
      images.get('FloorDiamondDone'),
    ]))

    // Add all the images as single-image sprites too.
    for (const [name, image] of images.entries()) {
      sprites.add(name, Sprite.forSingleImage(image))
    }

    return {
      grid: {width: 16, height: 16}
    }
  }

  init (sprites: SpriteController, instances: InstanceController) {
    const player = instances.factory('player', sprites.get('PlayerStoppedDown'), -1000, playerUpdateFn)

    const bgZ = 100
    const obZ = 0
    const hoverZ = -1

    const Background = instances.simple(sprites, 'Background', bgZ)
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
      const o = item.new(pos)
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
    g(Land, { x, y })
    g(ArrowLeftDisabled, { x: x++, y })
    g(Land, { x, y })
    g(ArrowLeftDisabled, { x: x++, y })
    g(Land, { x, y })
    g(ArrowLeft, { x: x++, y })
    g(Land, { x, y })
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
    g(Background, { x, y })
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
    // g(Key, { x: x - 1 / 16, y: y - 5 / 16 }) // TODO: Make all keys have an offset instead of using this non-integer coordinates
    g(Key, { x, y }).offsetPos = { x: 0, y: -5}
    g(Pedestal, { x: x++, y })
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
    g(Sand, { x, y })
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

  drawOverlay (drawPixelsFn: DrawPixelsFn, drawTextFn: DrawTextFn, fields: SimpleObject, sprites: SpriteController) {
    const Key = sprites.get('Key')

    const OverlayTopLeft1 = sprites.get('OverlayTopLeft1')
    const OverlayTopLeft2 = sprites.get('OverlayTopLeft2')
    const OverlayTopRight1 = sprites.get('OverlayTopRight1')
    const OverlayTopRight2 = sprites.get('OverlayTopRight2')
    const OverlayTop = sprites.get('OverlayTop')

    const OverlayBottomLeft1 = sprites.get('OverlayBottomLeft1')
    const OverlayBottomLeft2 = sprites.get('OverlayBottomLeft2')
    const OverlayBottomRight1 = sprites.get('OverlayBottomRight1')
    const OverlayBottomRight2 = sprites.get('OverlayBottomRight2')
    const OverlayBottom = sprites.get('OverlayBottom')

    let x = 0
    let y = 0
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTopLeft1.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTopLeft2.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTopRight1.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayTopRight2.images[0].pixels, false, false)

    x = 0; y += 1
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottomLeft1.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottomLeft2.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottomRight1.images[0].pixels, false, false)
    drawPixelsFn({x: x++ * 16, y: y * 16}, OverlayBottomRight2.images[0].pixels, false, false)

    drawPixelsFn({ x: 22, y: 3}, Key.images[0].pixels, false, false)
    drawTextFn({x: 28, y: 20}, `${fields.keyCount}`, '#ffffff')
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
  // keyCount: number  stored in the overlayState
}

function playerUpdateFn (o: ObjectInstance<PlayerProps, any>, gamepad: IGamepad, collisionChecker: CollisionChecker, sprites: SpriteController, instances: InstanceController, camera: Camera, showDialog: ShowDialogFn, overlayState: SimpleObject, curTick: number) {
  // Follow the player for now
  // camera.nudge(o.pos, 32, 0)
  // camera.track(o.pos)

  const PlayerWalkingUp = sprites.get('PlayerWalkingUp')
  const PlayerWalkingDown = sprites.get('PlayerWalkingDown')
  const PlayerWalkingRight = sprites.get('PlayerWalkingRight')
  
  const PushingRight = sprites.get('PlayerPushingRight')
  const PushingUp = sprites.get('PlayerPushingUp')
  const PushingDown = sprites.get('PlayerPushingDown')

  const pushableSprites = [
    sprites.get('Crate'),
  ]

  const GongRed = sprites.get('GongRed')
  const GongDisabled = sprites.get('GongDisabled')
  const PillarRed = sprites.get('PillarRed')
  const Key = sprites.get('Key')
  const Lock = sprites.get('Lock')
  const ArrowLeft = sprites.get('ArrowLeft')
  const ArrowLeftDisabled = sprites.get('ArrowLeftDisabled')

  const FloorSquare = sprites.get('FloorSquare')
  const FloorDiamond = sprites.get('FloorDiamond')

  const wallSprites = [...pushableSprites,
    GongRed,
    GongDisabled,
    PillarRed,
    Lock,
    ArrowLeft,
    ArrowLeftDisabled,
    sprites.get('Rock'),
    sprites.get('Bush'),
    sprites.get('WallTopRightDown'),
    sprites.get('WallTopUpDown'),
    sprites.get('WallTopLeftRight'),
    sprites.get('WallTopUpLeft'),
    sprites.get('Wall'),
    sprites.get('WallVert'),
    sprites.get('Water')
  ]

  // initialize the props
  const p = o.props
  if (p.state === undefined) {
    p.dir = PLAYER_DIR.DOWN
    p.state = PLAYER_STATE.STOPPED
    overlayState.keyCount = 0
  }

  function reduce(i: number) {
    if (i < 0) { return i + 1 }
    else if (i > 0) { return i - 1 }
    else { return 0 }
  }

  if (o.offsetPos.x !== 0 || o.offsetPos.y !== 0) {
    // slowly move the sprite
    o.offsetPos = {
      x: reduce(o.offsetPos.x),
      y: reduce(o.offsetPos.y),
    }
    return
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
    .find((obj) => wallSprites.includes(obj.sprite))

  if (!!wallNeighbor) {
    o.moveTo(oldPos)
    p.state = PLAYER_STATE.PUSHING

    if (GongRed === wallNeighbor.sprite) {
      o.offsetPos = { x: 0, y: 0 }
      // remove all the pillars
      const pillars = collisionChecker.searchBBox(EVERYTHING_BBOX).filter(t => t.sprite === PillarRed)
      pillars.forEach(p => p.setSprite(FloorSquare))
      // wallNeighbor.setMask(null, true)
      wallNeighbor.setSprite(GongDisabled)

    } else if (pushableSprites.includes(wallNeighbor.sprite)) {
      // start pushing the box. Just immediately push it for now (if it is empty behind it)
      let neighborOld = wallNeighbor.pos

      let newNeighborPos: IPosition

      switch (p.dir) {
        case PLAYER_DIR.UP:    newNeighborPos = {x: wallNeighbor.pos.x, y: wallNeighbor.pos.y - 1}; break
        case PLAYER_DIR.DOWN:  newNeighborPos = {x: wallNeighbor.pos.x, y: wallNeighbor.pos.y + 1}; break
        case PLAYER_DIR.LEFT:  newNeighborPos = {x: wallNeighbor.pos.x - 1, y: wallNeighbor.pos.y}; break
        case PLAYER_DIR.RIGHT: newNeighborPos = {x: wallNeighbor.pos.x + 1, y: wallNeighbor.pos.y}; break
        default: throw new Error(`BUG: Invalid direction ${p.dir}`)
      }

      const isBehindNeighborFilled = collisionChecker.searchPoint(newNeighborPos)
        .find((obj) => wallSprites.includes(obj.sprite))

      if (isBehindNeighborFilled === wallNeighbor) {
        throw new Error('Should have .... oh, we already moved the neighbor... grrr')
      }

      if (!isBehindNeighborFilled) {
        // move the box, and move the player
        o.moveTo(neighborOld)
        wallNeighbor.moveTo(newNeighborPos)
      } else {
        
      }
    } else {
      o.offsetPos = { x: 0, y: 0 }
    }
  } else {
    p.state = PLAYER_STATE.STOPPED // Should be walking if moving
  }

  // Pick up a key
  const maybeKey = neighborSprites.find(obj => obj.sprite === Key)
  if (maybeKey) {
    overlayState.keyCount = typeof overlayState.keyCount === 'number' ? overlayState.keyCount + 1 : 1
    maybeKey.destroy() // TODO: animate it moving to the overlay
  }

  // Unlock a lock
  const maybeLock = neighborSprites.find(obj => obj.sprite === Lock)
  if (maybeLock && overlayState.keyCount > 0) {
    overlayState.keyCount = typeof overlayState.keyCount === 'number' ? overlayState.keyCount - 1 : 0
    maybeLock.setSprite(FloorDiamond)
  }

  // Unlock the arrow locks when pushing the correct direction
  const maybeArrowLeft = neighborSprites.find(obj => obj.sprite === ArrowLeft)
  if (maybeArrowLeft && p.dir === PLAYER_DIR.LEFT) {
    // loop and delete all the disabled arrowlefts
    let cur = maybeArrowLeft
    while (cur) {
      const pos = cur.pos
      cur.setSprite(FloorDiamond)
      cur = collisionChecker.searchPoint({x: pos.x - 1, y: pos.y}).find(obj => obj.sprite === ArrowLeftDisabled)
    }
  }

  o.hFlip = false
  switch (p.state) {
    case PLAYER_STATE.STOPPED: 
      switch (p.dir) {
        case PLAYER_DIR.UP: o.setSprite(PlayerWalkingUp); break
        case PLAYER_DIR.DOWN: o.setSprite(PlayerWalkingDown); break
        case PLAYER_DIR.RIGHT: o.setSprite(PlayerWalkingRight); break
        case PLAYER_DIR.LEFT: o.setSprite(PlayerWalkingRight); o.hFlip = true; break
      }
      break
    case PLAYER_STATE.PUSHING: 
      switch (p.dir) {
        case PLAYER_DIR.RIGHT: o.setSprite(PushingRight); break
        case PLAYER_DIR.UP: o.setSprite(PushingUp); break
        case PLAYER_DIR.LEFT: o.setSprite(PushingRight); o.hFlip = true; break
        case PLAYER_DIR.DOWN: o.setSprite(PushingDown); break
        default: throw new Error(`BUG: Invalid direction ${p.dir}`)
      }
      break
    default: throw new Error(`BUG: Invalid state ${p.state}`)
  }

  if (dx !== 0 || dy !== 0) {
    o.sprite.loop = true
  } else {
    o.sprite.loop = false
  }
}


function spriteToBBox(pos: IPosition, sprite: Sprite): BBox {
  const dim = sprite.tick(0, 0).getDimension()
  return { minX: pos.x, minY: pos.y, maxX: pos.x, maxY: pos.y }
}