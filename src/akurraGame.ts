import { Game, Camera, SpriteController, Sprite, InstanceController, ObjectInstance, CollisionChecker, IPosition, GameObject, DrawPixelsFn, ShowDialogFn, SimpleObject, Opt, DrawTextFn, posAdd, ROTATION_AMOUNT } from './common/engine'
import { IGamepad, BUTTON_TYPE } from './common/gamepad'
import { loadImages } from './akurraImages'

// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316#47593316
var LCG = (s: number) => () => (2 ** 31 - 1 & (s = Math.imul(48271, s))) / 2 ** 31

const ROOM_SIZE = { width: 24, height: 12 }

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
      images.get('Key6')
    ]))

    sprites.add('GongDisabled', new Sprite(1, false, [
      images.get('GongDisabled1'),
      images.get('GongDisabled2'),
      images.get('GongDisabled3'),
      images.get('GongDisabled4'),
      images.get('GongDisabled5'),
      images.get('GongDisabled6')
    ]))

    sprites.add('PlayerWalkingRight', new Sprite(1, true, [
      images.get('PlayerWalkingRight1'),
      images.get('PlayerWalkingRight2')
    ]))

    sprites.add('FloorSquare', new Sprite(2, false, [
      images.get('FloorPoof1'),
      images.get('FloorPoof2'),
      images.get('FloorPoof3Square'),
      images.get('FloorSquareDone')
    ]))

    sprites.add('FloorDiamond', new Sprite(2, false, [
      images.get('FloorPoof1'),
      images.get('FloorPoof2'),
      images.get('FloorPoof3Diamond'),
      images.get('FloorDiamondDone')
    ]))

    // Add all the images as single-image sprites too.
    for (const [name, image] of images.entries()) {
      sprites.add(name, Sprite.forSingleImage(image))
    }

    return {
      grid: { width: 16, height: 16 }
    }
  }

  init (sprites: SpriteController, instances: InstanceController) {
    const player = instances.factory('player', sprites.get('PlayerStoppedDown'), -1000, playerUpdateFn)

    const bgZ = 100
    const obZ = 0
    const hoverZ = -1

    const Background = instances.simple(sprites, 'Background', bgZ)
    const Sand = instances.simple(sprites, 'Sand', bgZ)
    const SandBottom = instances.simple(sprites, 'SandBottom', bgZ)
    const SandLeft = instances.simple(sprites, 'SandLeft', bgZ)
    const Rock = instances.simple(sprites, 'Rock', obZ)
    const Bush = instances.simple(sprites, 'Bush', obZ)
    const WallTopRightDown = instances.simple(sprites, 'WallTopRightDown', obZ)
    const Crate = instances.factory('Crate', sprites.get('Crate'), obZ, crateUpdateFn)
    const GongRed = instances.simple(sprites, 'GongRed', obZ)
    const PillarRed = instances.simple(sprites, 'PillarRed', obZ)
    const ChimePillarBlue = instances.simple(sprites, 'ChimePillarBlue', obZ)
    const ChimeBlue = instances.simple(sprites, 'ChimeBlue', obZ)
    const WallTopUpDown = instances.simple(sprites, 'WallTopUpDown', obZ)
    const Key = instances.simple(sprites, 'Key', hoverZ)
    const Land = instances.simple(sprites, 'Land', bgZ)
    const Lock = instances.simple(sprites, 'Lock', obZ)
    const WallTopLeftRight = instances.simple(sprites, 'WallTopLeftRight', obZ)
    const WallTopUpLeft = instances.simple(sprites, 'WallTopUpLeft', obZ)
    const Pedestal = instances.simple(sprites, 'Pedestal', obZ)
    const LandCorner = instances.simple(sprites, 'LandCorner', bgZ)
    const LandBottom = instances.simple(sprites, 'LandBottom', bgZ)
    const Land2 = instances.simple(sprites, 'Land2', bgZ)
    const LandLeft = instances.simple(sprites, 'LandLeft', bgZ)
    const Wall = instances.simple(sprites, 'Wall', obZ)
    const WallVert = instances.simple(sprites, 'WallVert', obZ)
    const TreeTop = instances.simple(sprites, 'TreeTop', hoverZ)
    const TreeBottom = instances.simple(sprites, 'TreeBottom', obZ)
    const Water = instances.simple(sprites, 'Water', obZ)

    const GrassCorner = instances.simple(sprites, 'GrassCorner', bgZ)
    const GrassBottom = instances.simple(sprites, 'GrassBottom', bgZ)
    const GrassMid = instances.simple(sprites, 'Grass', bgZ)
    const GrassLeft = instances.simple(sprites, 'GrassLeft', bgZ)
    const GrassTopLeft = instances.simple(sprites, 'GrassTopLeft', bgZ)
    const GrassTop = instances.simple(sprites, 'GrassTop', bgZ)
    const GrassTopRight = instances.simple(sprites, 'GrassTopRight', bgZ)

    const NextRoomArrow = instances.simple(sprites, 'NextRoomArrow', bgZ)

    const FieldCorner = instances.simple(sprites, 'FieldCorner', bgZ)
    const FieldBottom = instances.simple(sprites, 'FieldBottom', bgZ)
    const Field = instances.simple(sprites, 'Field', bgZ)
    const Field2 = instances.simple(sprites, 'Field2', bgZ)
    const FieldTopLeft = instances.simple(sprites, 'FieldTopLeft', bgZ)
    const FieldTop = instances.simple(sprites, 'FieldTop', bgZ)
    const FieldLeft = instances.simple(sprites, 'FieldLeft', bgZ)

    const WallLadder = instances.simple(sprites, 'WallLadder', bgZ)

    const Hole = instances.simple(sprites, 'Hole', obZ)
    const HoleStraw = instances.simple(sprites, 'HoleStraw', obZ)

    const BigDoor0 = instances.simple(sprites, 'BigDoor0', obZ)
    const BigDoor1 = instances.simple(sprites, 'BigDoor1', obZ)
    const BigDoor2 = instances.simple(sprites, 'BigDoor2', obZ)
    const BigDoor3 = instances.simple(sprites, 'BigDoor3', obZ)
    const BigDoor4 = instances.simple(sprites, 'BigDoor4', obZ)
    const BigDoor5 = instances.simple(sprites, 'BigDoor5', obZ)
    const BigDoor6 = instances.simple(sprites, 'BigDoor6', obZ)
    const BigDoor7 = instances.simple(sprites, 'BigDoor7', obZ)
    const BigDoor8 = instances.simple(sprites, 'BigDoor8', obZ)
    const BigDoor9 = instances.simple(sprites, 'BigDoor9', obZ)
    const BigDoor10 = instances.simple(sprites, 'BigDoor10', obZ)
    const BigDoor11 = instances.simple(sprites, 'BigDoor11', obZ)
    const BigDoor12 = instances.simple(sprites, 'BigDoor12', obZ)
    const BigDoor13 = instances.simple(sprites, 'BigDoor13', obZ)
    const BigDoor14 = instances.simple(sprites, 'BigDoor14', obZ)
    const BigDoor15 = instances.simple(sprites, 'BigDoor15', obZ)

    const Stump = instances.simple(sprites, 'Stump', obZ)
    const Pit = instances.simple(sprites, 'Pit', bgZ)

    const ArrowLeft = instances.simple(sprites, 'ArrowLeft', obZ)
    const ArrowLeftDisabled = instances.simple(sprites, 'ArrowLeftDisabled', obZ)

    const ArrowDown = instances.simple(sprites, 'ArrowDown', obZ)
    const ArrowDownDisabled = instances.simple(sprites, 'ArrowDownDisabled', obZ)
    const ArrowUp = instances.simple(sprites, 'ArrowUp', obZ)
    const ArrowUpDisabled = instances.simple(sprites, 'ArrowUpDisabled', obZ)

    function g (item: GameObject<any, any>, pos: IPosition) {
      // convert from grid coordinates to pixels
      const o = item.new(pos)
      return o
    }

    function i (item: GameObject<any, any>) {
      const pos = { x: x++, y }
      return g(item, pos)
    }

    function o (item: GameObject<any, any>) {
      return g(item, { x, y })
    }

    const rand = LCG(2020)

    // Setart each Ocean tile at a random spot so the ocean waves will crest randomly
    function waterAnim (o: ObjectInstance<any, any>) {
      const next = Math.round(rand() * 1000)
      o.startTick = -next
    }

    let y = 0
    let x = 0
    let xStart = 0

    // -------------------------------
    // Puzzle Room
    // -------------------------------

    // Row 0
    waterAnim(i(Water))
    i(WallTopUpDown).flip(true, false)
    i(Rock)
    i(Rock)
    i(Rock)
    i(Rock)
    i(Rock)
    i(Rock)
    i(WallTopUpDown)
    i(Bush)
    i(Bush)
    i(Bush)
    i(Bush)
    i(Bush)
    i(Stump) // Land + Arrow
    i(Stump) // Land + Arrow
    i(Bush)
    i(Bush)
    i(Bush)
    i(WallTopUpLeft).flip(true, false)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)

    // Row 1
    x = xStart; y += 1
    waterAnim(i(Water))
    i(WallTopUpDown).flip(true, false)
    i(GrassMid)
    o(Key).offsetPos = { x: 0, y: -5 }
    i(Pedestal)
    i(GrassMid)
    i(WallTopRightDown)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopUpLeft)
    i(Rock)
    i(Rock)
    i(Rock)
    i(Rock)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(Rock)
    i(GongRed)
    i(WallVert).flip(true, false)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)

    // Row 2
    x = xStart; y += 1
    waterAnim(i(Water))
    i(WallTopUpDown).flip(true, false)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(WallTopUpDown)
    i(Wall)
    i(Wall)
    i(WallVert)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(Rock)
    i(Land)
    i(WallVert).flip(true, false)
    i(WallTopUpDown).flip(true, false)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)

    // Row 3
    x = xStart; y += 1
    waterAnim(i(Water))
    i(WallTopUpDown).flip(true, false)
    i(WallTopRightDown)
    i(WallLadder)
    i(WallTopLeftRight)
    i(WallTopUpLeft)
    i(Wall)
    i(Wall)
    i(WallVert)
    i(GrassTopLeft)
    i(GrassTop)
    i(GrassTopRight)
    i(Stump)
    i(Stump)
    i(Land)
    i(Land)
    i(Land)
    i(Rock)
    i(HoleStraw)
    i(WallVert).flip(true, false)
    i(WallTopUpLeft).flip(true, false)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)

    // Row 4
    x = xStart; y += 1
    waterAnim(i(Water))
    i(WallTopUpLeft).flip(true, false)
    i(WallTopUpLeft)
    i(WallLadder)
    i(Wall)
    i(WallVert)
    o(Key).offsetPos = { x: 0, y: -5 }
    i(Pedestal)
    i(ChimePillarBlue)
    i(Land)
    i(GrassLeft)
    i(GrassMid)
    i(GrassLeft).flip(true, false)
    o(Crate)
    i(Land)
    i(Hole)
    i(Land)
    i(Land)
    i(Land)
    o(Crate)
    i(Land)
    i(Land)
    i(WallVert).flip(true, false)
    i(WallVert).flip(true, false)
    i(Wall)
    i(Wall)
    i(Wall)

    // Row 5
    x = xStart; y += 1
    waterAnim(i(Water))
    i(WallVert).flip(true, false)
    i(WallVert)
    i(WallLadder)
    i(Wall)
    i(WallVert)
    i(Rock)
    i(Rock)
    i(Land)
    i(GrassCorner)
    i(GrassBottom)
    i(GrassCorner).flip(true, false)
    i(Stump)
    o(Crate)
    i(Land)
    i(Land)
    i(FieldTopLeft)
    i(FieldTop)
    i(FieldTopLeft).flip(true, false)
    i(Land)
    i(Land).flip(true, false)
    i(WallVert).flip(true, false)
    i(Wall)
    i(Wall)
    i(Wall)

    // Row 6
    x = xStart; y += 1
    waterAnim(i(Water))
    i(WallVert).flip(true, false)
    i(WallVert)
    o(Crate)
    i(Sand)
    i(Sand)
    i(LandLeft)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(Pit)
    i(Land)
    i(FieldLeft)
    i(Rock)
    i(FieldLeft).flip(true, false)
    i(Land)
    i(Land)
    i(HoleStraw)
    i(Land)
    i(Land)
    i(Land)

    // Row 7
    x = xStart; y += 1
    waterAnim(i(Water))
    waterAnim(i(Water))
    i(SandLeft)
    i(Sand)
    i(Sand)
    i(LandLeft)
    i(Land)
    i(Rock)
    i(Rock)
    i(Rock)
    i(Rock)
    i(Rock)
    i(Land)
    i(Land)
    i(Land)
    i(FieldCorner)
    i(FieldBottom)
    i(FieldCorner).flip(true, false)
    i(Land)
    i(Land)
    i(Hole) // No Escape!
    i(Land)
    i(Land)
    i(Land)

    // Row 8
    x = xStart; y += 1
    waterAnim(i(Water))
    waterAnim(i(Water))
    i(SandLeft)
    i(Sand)
    i(Sand)
    i(LandLeft)
    i(Land)
    i(Rock)
    i(ChimeBlue)
    i(PillarRed)
    i(Land)
    i(Hole)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(WallTopUpLeft).flip(true, true)
    i(WallTopLeftRight).flip(false, true)
    i(WallTopLeftRight).flip(false, true)
    i(WallTopLeftRight).flip(false, true)
    i(WallTopLeftRight).flip(false, true)

    // Row 9
    x = xStart; y += 1
    waterAnim(i(Water))
    waterAnim(i(Water))
    i(SandLeft)
    i(Sand)
    i(Sand)
    i(WallTopUpLeft).flip(true, true)
    i(WallTopLeftRight).flip(false, true)
    i(WallTopLeftRight).flip(false, true)
    i(WallTopLeftRight).flip(false, true)
    i(WallTopLeftRight).flip(false, true)
    i(WallTopLeftRight).flip(false, true)
    i(WallTopLeftRight).flip(false, true)
    i(WallTopLeftRight).flip(false, true)
    i(WallTopLeftRight).flip(false, true)
    i(WallTopLeftRight).flip(false, true)
    i(WallTopUpLeft).flip(false, true)
    i(Land)
    i(Land)
    i(Land)
    i(WallTopUpDown)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)

    // Row 9
    x = xStart; y += 1
    waterAnim(i(Water))
    waterAnim(i(Water))
    i(Rock)
    i(Sand)
    i(TreeTop)
    i(WallTopUpDown).flip(true, false)
    i(GrassBottom)
    i(GrassBottom)
    i(GrassBottom)
    i(GrassBottom)
    i(GrassBottom)
    i(GrassBottom)
    i(GrassBottom)
    i(GrassBottom)
    i(GrassBottom)
    i(WallTopUpDown)
    i(Land)
    i(Land)
    i(Land)
    i(WallTopUpDown)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)

    // Row 10
    x = xStart; y += 1
    waterAnim(i(Water))
    waterAnim(i(Water))
    i(Rock)
    o(Rock) // Blocker
    i(Sand)
    i(TreeTop)
    i(WallTopUpDown).flip(true, false)
    i(Rock)
    i(Rock)
    i(Rock)
    i(Rock)
    i(Rock)
    i(Rock)
    i(Rock)
    i(Rock)
    i(Rock)
    i(WallTopUpDown)
    i(Stump)
    i(Stump)
    i(Stump)
    i(WallTopUpDown)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)

    // -------------------------------
    // Big Door Room
    // -------------------------------
    xStart = ROOM_SIZE.width
    x = xStart; y = 0

    // Row 0
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopUpLeft)
    i(BigDoor0)
    i(BigDoor1)
    i(BigDoor2)
    i(BigDoor3)
    i(WallTopUpLeft).hFlip = true
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)

    // Row 1
    x = xStart; y += 1
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(WallVert)
    i(BigDoor4)
    i(BigDoor5)
    i(BigDoor6)
    i(BigDoor7)
    i(WallVert).hFlip = true
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)

    // Row 2
    x = xStart; y += 1
    i(GrassMid)
    i(WallTopUpDown)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(WallVert)
    i(BigDoor8)
    i(BigDoor9)
    i(BigDoor10)
    i(BigDoor11)
    i(WallVert).hFlip = true
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(WallTopUpDown).hFlip = true
    i(GrassMid)

    // Row 3
    x = xStart; y += 1
    i(WallTopLeftRight)
    i(WallTopUpLeft)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(WallVert)
    i(BigDoor12)
    i(BigDoor13)
    i(BigDoor14)
    i(BigDoor15)
    i(WallVert).hFlip = true
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(WallTopUpLeft).hFlip = true
    i(WallTopLeftRight)

    // Row 4
    x = xStart; y += 1
    i(Wall)
    i(WallVert)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(WallVert)
    i(Field)
    i(Field)
    i(Field)
    i(Field)
    i(WallVert).hFlip = true
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(WallVert).hFlip = true
    i(Wall)

    // Row 5
    x = xStart; y += 1
    i(Wall)
    i(WallVert)
    i(PillarRed)
    i(FieldCorner)
    i(Field)
    i(Field)
    i(Field2)
    i(Field2)
    i(Field)
    i(Field2)
    i(Field)
    i(Field)
    i(Field)
    i(Field2)
    i(Field)
    i(Field)
    i(Field)
    i(Field2)
    i(Field)
    i(FieldBottom)
    i(FieldCorner).hFlip = true
    i(Rock)
    i(WallVert).hFlip = true
    i(Wall)

    // Row 7
    x = xStart; y += 1
    o(NextRoomArrow).setOffset({ x: 0, y: 8 }).rotate(ROTATION_AMOUNT.LEFT)
    i(Land)
    i(Land)
    i(ArrowDown)
    i(Land)
    i(FieldCorner)
    i(Field)
    i(Field)
    i(Field2)
    i(Field)
    i(Field)
    i(Field2)
    i(Field)
    i(Field)
    i(Field)
    i(Field)
    i(Field)
    i(Field2)
    i(Field)
    i(FieldCorner).hFlip = true
    i(Land2)
    i(Land)
    i(ArrowUpDisabled)
    i(Land)
    o(NextRoomArrow).setOffset({ x: 0, y: 8 })
    i(Land)

    // Row 8
    x = xStart; y += 1
    i(Land)
    i(Land)
    i(ArrowDownDisabled)
    i(Land)
    i(Land)
    i(FieldCorner)
    i(FieldBottom)
    i(FieldBottom)
    i(Field)
    i(Field)
    i(Field)
    i(Field)
    i(Field)
    i(Field)
    i(Field2)
    i(Field)
    i(FieldBottom)
    i(FieldCorner).hFlip = true
    i(Land)
    i(Land)
    i(Land)
    i(ArrowUp)
    i(Land)
    i(Land)

    // Row 9
    x = xStart; y += 1
    i(WallTopLeftRight).vFlip = true
    i(WallTopUpLeft).vFlip = true
    i(Rock)
    i(Rock)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(FieldCorner)
    i(FieldBottom)
    i(FieldBottom)
    i(FieldBottom)
    i(FieldBottom)
    i(FieldBottom)
    i(FieldBottom)
    i(FieldCorner).hFlip = true
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(Rock)
    i(Land)
    i(WallTopUpLeft).flip(true, true)
    i(WallTopLeftRight).vFlip = true

    // Row 10
    x = xStart; y += 1
    i(GrassMid)
    i(WallTopUpDown)
    i(GongRed)
    i(Land)
    i(Hole)
    i(Land)
    o(Crate)
    i(Land)
    i(Land2)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(Land2)
    i(Land)
    i(Land)
    i(Lock)
    i(Land)
    i(WallTopUpDown).hFlip = true
    i(GrassMid)

    // Row 11
    x = xStart; y += 1
    i(GrassMid)
    i(WallTopRightDown).vFlip = true
    i(WallTopLeftRight).vFlip = true
    i(WallTopLeftRight).vFlip = true
    i(WallTopLeftRight).vFlip = true
    i(WallTopLeftRight).vFlip = true
    i(WallTopLeftRight).vFlip = true
    i(WallTopLeftRight).vFlip = true
    i(WallTopLeftRight).vFlip = true
    i(WallTopUpLeft).vFlip = true
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(WallTopUpLeft).flip(true, true)
    i(WallTopLeftRight).vFlip = true
    i(WallTopLeftRight).vFlip = true
    i(WallTopLeftRight).vFlip = true
    i(WallTopLeftRight).vFlip = true
    i(WallTopLeftRight).vFlip = true
    i(WallTopLeftRight).vFlip = true
    i(WallTopLeftRight).vFlip = true
    i(WallTopRightDown).flip(true, true)
    i(GrassMid)

    // Row 12
    x = xStart; y += 1
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(WallTopUpDown)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(WallTopUpDown).hFlip = true
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)

    // -------------------------------
    // Initial Shipwreck Room
    // -------------------------------
    x = xStart; y += 1

    // Row0
    i(Rock)
    i(GrassLeft)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(WallTopUpDown)
    i(Land)
    o(NextRoomArrow).setOffset({ x: 8, y: 0 }).rotate(ROTATION_AMOUNT.UP)
    i(Land)
    i(Land)
    i(Land)
    i(WallTopUpDown).hFlip = true
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassMid)
    i(GrassLeft).hFlip = true
    i(Rock)

    // Row1
    x = xStart; y += 1
    i(Rock)
    i(GrassLeft)
    i(WallTopRightDown)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopUpLeft)
    i(Land)
    i(Land)
    i(Land)
    i(Land)
    i(WallTopUpLeft).hFlip = true
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopRightDown).hFlip = true
    i(GrassMid)
    i(GrassLeft).hFlip = true
    i(Rock)

    // Row2
    x = xStart; y += 1
    i(Bush)
    i(GrassLeft)
    i(WallTopUpDown)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(WallVert)
    i(Rock)
    i(Land)
    i(Land)
    i(Rock)
    i(WallVert).hFlip = true
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(WallTopUpDown).hFlip = true
    i(GrassMid)
    i(GrassLeft).hFlip = true
    i(Bush)

    // Row3
    x = xStart; y += 1
    i(Bush)
    i(GrassCorner)
    i(WallTopUpDown)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(WallVert)
    o(Land)
    i(ArrowLeftDisabled)
    o(Land)
    i(ArrowLeftDisabled)
    o(Land)
    i(ArrowLeft)
    o(Land)
    i(Lock)
    i(WallVert).hFlip = true
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(Wall)
    i(WallTopUpDown).hFlip = true
    i(GrassBottom)
    i(GrassCorner).hFlip = true
    i(Bush)

    // Row4
    x = xStart; y += 1
    i(Bush)
    i(Bush)
    i(WallTopUpDown)
    o(Background)
    i(GongRed)
    i(Sand)
    i(Sand)
    i(Rock)
    i(Rock)
    i(Sand)
    i(LandCorner)
    i(LandBottom)
    i(LandBottom)
    i(LandBottom)
    i(LandBottom)
    i(LandCorner).hFlip = true
    i(Sand)
    i(Rock)
    o(Key).offsetPos = { x: 0, y: -5 }
    i(Pedestal)
    i(Rock)
    i(Sand)
    i(WallTopUpDown).hFlip = true
    i(Bush)
    i(Bush)
    i(Bush)

    // Row5
    x = xStart; y += 1
    i(Bush)
    i(TreeTop)
    i(WallTopUpDown)
    i(Rock)
    i(Rock)
    i(Sand)
    i(Sand)
    i(Rock)
    i(Rock)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Rock)
    o(Sand)
    i(PillarRed)
    i(Rock)
    i(Sand)
    i(WallTopUpDown).hFlip = true
    i(TreeTop)
    i(TreeTop)
    i(TreeTop)

    // Row6
    x = xStart; y += 1
    i(Bush)
    i(TreeBottom)
    i(WallTopUpDown)
    i(Rock)
    i(Sand)
    o(Sand)
    o(Crate)
    i(Sand)
    o(Crate)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Rock)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    i(WallTopUpDown).hFlip = true
    i(TreeBottom)
    i(TreeBottom)
    i(TreeBottom)

    // Row7
    x = xStart; y += 1
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopUpLeft)
    i(Rock)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    o(player) // PLAYER
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    i(Sand)
    i(WallTopUpLeft).hFlip = true
    i(WallTopLeftRight)
    i(WallTopLeftRight)
    i(WallTopLeftRight)

    // Row8
    x = xStart; y += 1
    i(Wall)
    i(Wall)
    i(WallVert)
    i(SandBottom)
    i(SandBottom)
    i(SandBottom)
    i(SandBottom)
    i(SandBottom)
    i(SandBottom)
    i(SandBottom)
    i(SandBottom)
    i(SandBottom)
    i(SandBottom)
    i(SandBottom)
    i(SandBottom)
    i(SandBottom)
    i(SandBottom)
    i(SandBottom)
    i(SandBottom)
    i(SandBottom)
    i(WallVert).hFlip = true
    i(Wall)
    i(Wall)
    i(Wall)

    // Row9
    x = xStart; y += 1
    i(Wall)
    i(Wall)
    i(WallVert)
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    i(WallVert).hFlip = true
    i(Wall)
    i(Wall)
    i(Wall)

    // Row10
    x = xStart; y += 1
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))

    // Row11
    x = xStart; y += 1
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
    waterAnim(i(Water))
  }

  drawBackground (tiles: Array<ObjectInstance<any, any>>, camera: Camera, drawPixelsFn: DrawPixelsFn) {
    // const bbox = camera.toBBox()
    // const color = '#FFFFFF' // white

    // const pixels = Array(bbox.maxY - bbox.minY).fill(Array(bbox.maxX - bbox.minX).fill(color))

    // drawPixelsFn({ x: 0, y: 0 }, pixels, false, false)
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
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTopLeft1.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTopLeft2.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTopRight1.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTopRight2.images[0].pixels, false, false)

    x = 0; y += 1
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottomLeft1.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottomLeft2.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottomRight1.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottomRight2.images[0].pixels, false, false)

    drawPixelsFn({ x: 22, y: 3 }, Key.images[0].pixels, false, false)
    drawTextFn({ x: 28, y: 20 }, `${fields.keys}`, '#ffffff')
  }

  drawDialog (message: string, drawPixelsFn: DrawPixelsFn, drawTextFn: DrawTextFn, elapsedMs: number, target: Opt<IPosition>, additional: Opt<SimpleObject>) {
    throw new Error('BUG: This game should not have any dialogs')
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
  // keys: number  stored in the overlayState
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

function playerUpdateFn (o: ObjectInstance<PlayerProps, any>, gamepad: IGamepad, collisionChecker: CollisionChecker, sprites: SpriteController, instances: InstanceController, camera: Camera, showDialog: ShowDialogFn, overlayState: SimpleObject, curTick: number) {
  camera.screenPixelPos = { x: 0, y: 16 * 2 /* for the overlay */ }
  camera.resize({
    width: ROOM_SIZE.width,
    height: ROOM_SIZE.height
  })

  const playerRoomPos = currentRoomCorner(o.pos)

  camera.pos = posAdd(playerRoomPos, { x: Math.round(ROOM_SIZE.width / 2), y: Math.round(ROOM_SIZE.height / 2) })

  const PlayerWalkingUp = sprites.get('PlayerWalkingUp')
  const PlayerWalkingDown = sprites.get('PlayerWalkingDown')
  const PlayerWalkingRight = sprites.get('PlayerWalkingRight')

  const PushingRight = sprites.get('PlayerPushingRight')
  const PushingUp = sprites.get('PlayerPushingUp')
  const PushingDown = sprites.get('PlayerPushingDown')

  const pushableSprites = [
    sprites.get('Crate')
  ]

  const GongRed = sprites.get('GongRed')
  const PillarRed = sprites.get('PillarRed')
  const GongBlue = sprites.get('GongBlue')
  const PillarBlue = sprites.get('PillarBlue')
  const ChimeRed = sprites.get('ChimeRed')
  const ChimePillarRed = sprites.get('ChimePillarRed')
  const ChimeBlue = sprites.get('ChimeBlue')
  const ChimePillarBlue = sprites.get('ChimePillarBlue')

  const GongDisabled = sprites.get('GongDisabled')
  const Key = sprites.get('Key')
  const Lock = sprites.get('Lock')
  const ArrowLeft = sprites.get('ArrowLeft')
  const ArrowLeftDisabled = sprites.get('ArrowLeftDisabled')
  const ArrowUp = sprites.get('ArrowUp')
  const ArrowUpDisabled = sprites.get('ArrowUpDisabled')
  const ArrowRight = sprites.get('ArrowRight')
  const ArrowRightDisabled = sprites.get('ArrowRightDisabled')
  const ArrowDown = sprites.get('ArrowDown')
  const ArrowDownDisabled = sprites.get('ArrowDownDisabled')

  const FloorSquare = sprites.get('FloorSquare')
  const FloorDiamond = sprites.get('FloorDiamond')

  const pushableWallSprites = [...pushableSprites,
    GongRed,
    PillarRed,
    GongBlue,
    PillarBlue,
    ChimeRed,
    ChimePillarRed,
    ChimeBlue,
    ChimePillarBlue,
    GongDisabled,
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
    .find((obj) => playerWallSprites.includes(obj.sprite))

  if (wallNeighbor) {
    o.moveTo(oldPos)
    p.state = PLAYER_STATE.PUSHING

    if ([GongRed, GongBlue, ChimeRed, ChimeBlue].includes(wallNeighbor.sprite)) {
      const doRing = (instrument: Sprite, pillar: Sprite, disabled: Sprite) => {
        if (instrument === wallNeighbor.sprite) {
          // remove all the pillars in the current room
          const pillars = collisionChecker.searchBBox(currentRoomBBox(o.pos)).filter(t => t.sprite === pillar)
          pillars.forEach(p => p.setSprite(FloorSquare))
          // wallNeighbor.setMask(null, true)
          wallNeighbor.setSprite(disabled)
        }
      }

      o.offsetPos = { x: 0, y: 0 }
      doRing(GongRed, PillarRed, GongDisabled)
      doRing(GongBlue, PillarBlue, GongDisabled)
      doRing(ChimeRed, ChimePillarRed, GongDisabled)
      doRing(ChimeBlue, ChimePillarBlue, GongDisabled)
    } else if (pushableSprites.includes(wallNeighbor.sprite)) {
      // start pushing the box. Just immediately push it for now (if it is empty behind it)
      const neighborOld = wallNeighbor.pos

      const newNeighborPos = posAdd(wallNeighbor.pos, neighborPos(p.dir))

      const isBehindNeighborFilled = collisionChecker.searchPoint(newNeighborPos)
        .find((obj) => pushableWallSprites.includes(obj.sprite))

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
  }

  // Pick up a key
  const maybeKey = neighborSprites.find(obj => obj.sprite === Key)
  if (maybeKey) {
    overlayState.keys = typeof overlayState.keys === 'number' ? overlayState.keys + 1 : 1
    maybeKey.destroy() // TODO: animate it moving to the overlay
  }

  // Unlock a lock
  const maybeLock = neighborSprites.find(obj => obj.sprite === Lock)
  if (maybeLock && overlayState.keys > 0) {
    overlayState.keys = typeof overlayState.keys === 'number' ? overlayState.keys - 1 : 0
    maybeLock.setSprite(FloorDiamond)
  }

  // Unlock the arrow locks when pushing the correct direction
  function checkArrow (sprite: Sprite, disabledSprite: Sprite, playerDir: PLAYER_DIR) {
    const maybeArrow = neighborSprites.find(obj => obj.sprite === sprite)
    if (maybeArrow && p.dir === playerDir) {
      // loop and delete all the disabled arrowlefts
      let cur = maybeArrow
      while (cur) {
        const pos = cur.pos
        cur.setSprite(FloorDiamond)
        cur = collisionChecker.searchPoint(posAdd(pos, neighborPos(playerDir))).find(obj => obj.sprite === disabledSprite)
      }
    }
  }

  checkArrow(ArrowUp, ArrowUpDisabled, PLAYER_DIR.UP)
  checkArrow(ArrowDown, ArrowDownDisabled, PLAYER_DIR.DOWN)
  checkArrow(ArrowLeft, ArrowLeftDisabled, PLAYER_DIR.LEFT)
  checkArrow(ArrowRight, ArrowRightDisabled, PLAYER_DIR.RIGHT)

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

function crateUpdateFn (o: ObjectInstance<PlayerProps, any>, gamepad: IGamepad, collisionChecker: CollisionChecker, sprites: SpriteController, instances: InstanceController, camera: Camera, showDialog: ShowDialogFn, overlayState: SimpleObject, curTick: number) {
  const Hole = sprites.get('Hole')
  const HoleStraw = sprites.get('HoleStraw')
  const HoleCrate = sprites.get('HoleCrate')

  const holes = [
    Hole,
    HoleStraw
  ]

  const maybeHole = collisionChecker.searchPoint(o.pos).find(obj => holes.includes(obj.sprite))
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
