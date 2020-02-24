import { Game, Camera, SpriteController, Sprite, InstanceController, ObjectInstance, CollisionChecker, IPosition, GameObject, DrawPixelsFn, ShowDialogFn, SimpleObject, Opt, DrawTextFn, posAdd, ROTATION_AMOUNT } from './common/engine'
import { IGamepad, BUTTON_TYPE } from './common/gamepad'
import { loadImages } from './akurraImages'

// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316#47593316
var LCG = (s: number) => () => (2 ** 31 - 1 & (s = Math.imul(48271, s))) / 2 ** 31

const ROOM_SIZE = { width: 24, height: 12 }

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
    const FieldTopRight = instances.simple(sprites, 'FieldTopRight', bgZ)
    const FieldLeft = instances.simple(sprites, 'FieldLeft', bgZ)

    const WallLadder = instances.simple(sprites, 'WallLadder', bgZ)

    const Hole = instances.simple(sprites, 'Hole', obZ)
    const HoleCrate = instances.simple(sprites, 'HoleCrate', obZ)
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
    g(Water, { x: x++, y })
    g(WallTopUpDown, { x: x++, y }).flip(true, false)
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(WallTopUpDown, { x: x++, y })
    g(Bush, { x: x++, y })
    g(Bush, { x: x++, y })
    g(Bush, { x: x++, y })
    g(Bush, { x: x++, y })
    g(Bush, { x: x++, y })
    g(Stump, { x: x++, y }) // Land + Arrow
    g(Stump, { x: x++, y }) // Land + Arrow
    g(Bush, { x: x++, y })
    g(Bush, { x: x++, y })
    g(Bush, { x: x++, y })
    g(WallTopUpLeft, { x: x++, y }).flip(true, false)
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })

    // Row 1
    x = xStart; y += 1
    g(Water, { x: x++, y })
    g(WallTopUpDown, { x: x++, y }).flip(true, false)
    g(GrassMid, { x: x++, y })
    g(Key, { x, y }).offsetPos = { x: 0, y: -5 }
    g(Pedestal, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(WallTopRightDown, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopUpLeft, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(player, { x, y: y })
    g(Land, { x: x++, y })
    g(Rock, { x: x++, y })
    g(GongRed, { x: x++, y })
    g(WallVert, { x: x++, y }).flip(true, false)
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })

    // Row 2
    x = xStart; y += 1
    g(Water, { x: x++, y })
    g(WallTopUpDown, { x: x++, y }).flip(true, false)
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(WallTopUpDown, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(WallVert, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Land, { x: x++, y })
    g(WallVert, { x: x++, y }).flip(true, false)
    g(WallTopUpDown, { x: x++, y }).flip(true, false)
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })

    // Row 3
    x = xStart; y += 1
    g(Water, { x: x++, y })
    g(WallTopUpDown, { x: x++, y }).flip(true, false)
    g(WallTopRightDown, { x: x++, y })
    g(WallLadder, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopUpLeft, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(WallVert, { x: x++, y })
    g(GrassTopLeft, { x: x++, y })
    g(GrassTop, { x: x++, y })
    g(GrassTopRight, { x: x++, y })
    g(Stump, { x: x++, y })
    g(Stump, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Rock, { x: x++, y })
    g(HoleStraw, { x: x++, y })
    g(WallVert, { x: x++, y }).flip(true, false)
    g(WallTopUpLeft, { x: x++, y }).flip(true, false)
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })

    // Row 4
    x = xStart; y += 1
    g(Water, { x: x++, y })
    g(WallTopUpLeft, { x: x++, y }).flip(true, false)
    g(WallTopUpLeft, { x: x++, y })
    g(WallLadder, { x: x++, y })
    g(Wall, { x: x++, y })
    g(WallVert, { x: x++, y })
    g(Key, { x, y }).offsetPos = { x: 0, y: -5 }
    g(Pedestal, { x: x++, y })
    g(ChimePillarBlue, { x: x++, y })
    g(Land, { x: x++, y })
    g(GrassLeft, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassLeft, { x: x++, y }).flip(true, false)
    g(Crate, { x, y })
    g(Land, { x: x++, y })
    g(Hole, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Crate, { x, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(WallVert, { x: x++, y }).flip(true, false)
    g(WallVert, { x: x++, y }).flip(true, false)
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })

    // Row 5
    x = xStart; y += 1
    g(Water, { x: x++, y })
    g(WallVert, { x: x++, y }).flip(true, false)
    g(WallVert, { x: x++, y })
    g(WallLadder, { x: x++, y })
    g(Wall, { x: x++, y })
    g(WallVert, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Land, { x: x++, y })
    g(GrassCorner, { x: x++, y })
    g(GrassBottom, { x: x++, y })
    g(GrassCorner, { x: x++, y }).flip(true, false)
    g(Stump, { x: x++, y })
    g(Crate, { x, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(FieldTopLeft, { x: x++, y })
    g(FieldTop, { x: x++, y })
    g(FieldTopLeft, { x: x++, y }).flip(true, false)
    g(Land, { x: x++, y })
    g(Land, { x: x++, y }).flip(true, false)
    g(WallVert, { x: x++, y }).flip(true, false)
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })

    // Row 6
    x = xStart; y += 1
    g(Water, { x: x++, y })
    g(WallVert, { x: x++, y }).flip(true, false)
    g(WallVert, { x: x++, y })
    g(Crate, { x, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(LandLeft, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Pit, { x: x++, y })
    g(Land, { x: x++, y })
    g(FieldLeft, { x: x++, y })
    g(Rock, { x: x++, y })
    g(FieldLeft, { x: x++, y }).flip(true, false)
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(HoleStraw, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    
    // Row 7
    x = xStart; y += 1
    g(Water, { x: x++, y })
    g(Water, { x: x++, y })
    g(SandLeft, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(LandLeft, { x: x++, y })
    g(Land, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(FieldCorner, { x: x++, y })
    g(FieldBottom, { x: x++, y })
    g(FieldCorner, { x: x++, y }).flip(true, false)
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Hole, { x: x++, y }) // No Escape!
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })

    // Row 8
    x = xStart; y += 1
    g(Water, { x: x++, y })
    g(Water, { x: x++, y })
    g(SandLeft, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(LandLeft, { x: x++, y })
    g(Land, { x: x++, y })
    g(Rock, { x: x++, y })
    g(ChimeBlue, { x: x++, y })
    g(PillarRed, { x: x++, y })
    g(Land, { x: x++, y })
    g(Hole, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(WallTopUpLeft, { x: x++, y }).flip(true, true)
    g(WallTopLeftRight, { x: x++, y }).flip(false, true)
    g(WallTopLeftRight, { x: x++, y }).flip(false, true)
    g(WallTopLeftRight, { x: x++, y }).flip(false, true)
    g(WallTopLeftRight, { x: x++, y }).flip(false, true)

    // Row 9
    x = xStart; y += 1
    g(Water, { x: x++, y })
    g(Water, { x: x++, y })
    g(SandLeft, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x: x++, y })
    g(WallTopUpLeft, { x: x++, y }).flip(true, true)
    g(WallTopLeftRight, { x: x++, y }).flip(false, true)
    g(WallTopLeftRight, { x: x++, y }).flip(false, true)
    g(WallTopLeftRight, { x: x++, y }).flip(false, true)
    g(WallTopLeftRight, { x: x++, y }).flip(false, true)
    g(WallTopLeftRight, { x: x++, y }).flip(false, true)
    g(WallTopLeftRight, { x: x++, y }).flip(false, true)
    g(WallTopLeftRight, { x: x++, y }).flip(false, true)
    g(WallTopLeftRight, { x: x++, y }).flip(false, true)
    g(WallTopLeftRight, { x: x++, y }).flip(false, true)
    g(WallTopUpLeft, { x: x++, y }).flip(false, true)
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(WallTopUpDown, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })

    // Row 9
    x = xStart; y += 1
    g(Water, { x: x++, y })
    g(Water, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Sand, { x: x++, y })
    g(TreeTop, { x: x++, y })
    g(WallTopUpDown, { x: x++, y }).flip(true, false)
    g(GrassBottom, { x: x++, y })
    g(GrassBottom, { x: x++, y })
    g(GrassBottom, { x: x++, y })
    g(GrassBottom, { x: x++, y })
    g(GrassBottom, { x: x++, y })
    g(GrassBottom, { x: x++, y })
    g(GrassBottom, { x: x++, y })
    g(GrassBottom, { x: x++, y })
    g(GrassBottom, { x: x++, y })
    g(WallTopUpDown, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(WallTopUpDown, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })

    // Row 10
    x = xStart; y += 1
    g(Water, { x: x++, y })
    g(Water, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x, y }) // Blocker
    g(Sand, { x: x++, y })
    g(TreeTop, { x: x++, y })
    g(WallTopUpDown, { x: x++, y }).flip(true, false)
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(WallTopUpDown, { x: x++, y })
    g(Stump, { x: x++, y })
    g(Stump, { x: x++, y })
    g(Stump, { x: x++, y })
    g(WallTopUpDown, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })






    // -------------------------------
    // Big Door Room
    // -------------------------------
    xStart = ROOM_SIZE.width
    x = xStart; y = 0

    // Row 0
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopUpLeft, { x: x++, y })
    g(BigDoor0, { x: x++, y })
    g(BigDoor1, { x: x++, y })
    g(BigDoor2, { x: x++, y })
    g(BigDoor3, { x: x++, y })
    g(WallTopUpLeft, { x: x++, y }).hFlip = true
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopLeftRight, { x: x++, y })

    // Row 1
    x = xStart; y += 1
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(WallVert, { x: x++, y })
    g(BigDoor4, { x: x++, y })
    g(BigDoor5, { x: x++, y })
    g(BigDoor6, { x: x++, y })
    g(BigDoor7, { x: x++, y })
    g(WallVert, { x: x++, y }).hFlip = true
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    
    // Row 2
    x = xStart; y += 1
    g(GrassMid, { x: x++, y })
    g(WallTopUpDown, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(WallVert, { x: x++, y })
    g(BigDoor8, { x: x++, y })
    g(BigDoor9, { x: x++, y })
    g(BigDoor10, { x: x++, y })
    g(BigDoor11, { x: x++, y })
    g(WallVert, { x: x++, y }).hFlip = true
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(WallTopUpDown, { x: x++, y }).hFlip = true
    g(GrassMid, { x: x++, y })

    // Row 3
    x = xStart; y += 1
    g(WallTopLeftRight, { x: x++, y })
    g(WallTopUpLeft, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(WallVert, { x: x++, y })
    g(BigDoor12, { x: x++, y })
    g(BigDoor13, { x: x++, y })
    g(BigDoor14, { x: x++, y })
    g(BigDoor15, { x: x++, y })
    g(WallVert, { x: x++, y }).hFlip = true
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(WallTopUpLeft, { x: x++, y }).hFlip = true
    g(WallTopLeftRight, { x: x++, y })

    // Row 4
    x = xStart; y += 1
    g(Wall, { x: x++, y })
    g(WallVert, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(WallVert, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field, { x: x++, y })
    g(WallVert, { x: x++, y }).hFlip = true
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(WallVert, { x: x++, y }).hFlip = true
    g(Wall, { x: x++, y })
    
    // Row 5
    x = xStart; y += 1
    g(Wall, { x: x++, y })
    g(WallVert, { x: x++, y })
    g(PillarRed, { x: x++, y })
    g(FieldCorner, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field2, { x: x++, y })
    g(Field2, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field2, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field2, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field2, { x: x++, y })
    g(Field, { x: x++, y })
    g(FieldBottom, { x: x++, y })
    g(FieldCorner, { x: x++, y }).hFlip = true
    g(Rock, { x: x++, y })
    g(WallVert, { x: x++, y }).hFlip = true
    g(Wall, { x: x++, y })
    
    // Row 7
    x = xStart; y += 1
    g(NextRoomArrow, { x, y }).setOffset({ x: 0, y: 8 }).rotate(ROTATION_AMOUNT.LEFT)
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(ArrowDown, { x: x++, y })
    g(Land, { x: x++, y })
    g(FieldCorner, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field2, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field2, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field2, { x: x++, y })
    g(Field, { x: x++, y })
    g(FieldCorner, { x: x++, y }).hFlip = true
    g(Land2, { x: x++, y })
    g(Land, { x: x++, y })
    g(ArrowUpDisabled, { x: x++, y })
    g(Land, { x: x++, y })
    g(NextRoomArrow, { x, y }).setOffset({ x: 0, y: 8 })
    g(Land, { x: x++, y })

    // Row 8
    x = xStart; y += 1
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(ArrowDownDisabled, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(FieldCorner, { x: x++, y })
    g(FieldBottom, { x: x++, y })
    g(FieldBottom, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field, { x: x++, y })
    g(Field2, { x: x++, y })
    g(Field, { x: x++, y })
    g(FieldBottom, { x: x++, y })
    g(FieldCorner, { x: x++, y }).hFlip = true
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(ArrowUp, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })

    // Row 9
    x = xStart; y += 1
    g(WallTopLeftRight, { x: x++, y }).vFlip = true
    g(WallTopUpLeft, { x: x++, y }).vFlip = true
    g(Rock, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(FieldCorner, { x: x++, y })
    g(FieldBottom, { x: x++, y })
    g(FieldBottom, { x: x++, y })
    g(FieldBottom, { x: x++, y })
    g(FieldBottom, { x: x++, y })
    g(FieldBottom, { x: x++, y })
    g(FieldBottom, { x: x++, y })
    g(FieldCorner, { x: x++, y }).hFlip = true
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Land, { x: x++, y })
    g(WallTopUpLeft, { x: x++, y }).flip(true, true)
    g(WallTopLeftRight, { x: x++, y }).vFlip = true


    // Row 10
    x = xStart; y += 1
    g(GrassMid, { x: x++, y })
    g(WallTopUpDown, { x: x++, y })
    g(GongRed, { x: x++, y })
    g(Land, { x: x++, y })
    g(Hole, { x: x++, y })
    g(Land, { x: x++, y })
    g(Crate, { x, y })
    g(Land, { x: x++, y })
    g(Land2, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land2, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Lock, { x: x++, y })
    g(Land, { x: x++, y })
    g(WallTopUpDown, { x: x++, y }).hFlip = true
    g(GrassMid, { x: x++, y })

    // Row 11
    x = xStart; y += 1
    g(GrassMid, { x: x++, y })
    g(WallTopRightDown, { x: x++, y }).vFlip = true
    g(WallTopLeftRight, { x: x++, y }).vFlip = true
    g(WallTopLeftRight, { x: x++, y }).vFlip = true
    g(WallTopLeftRight, { x: x++, y }).vFlip = true
    g(WallTopLeftRight, { x: x++, y }).vFlip = true
    g(WallTopLeftRight, { x: x++, y }).vFlip = true
    g(WallTopLeftRight, { x: x++, y }).vFlip = true
    g(WallTopLeftRight, { x: x++, y }).vFlip = true
    g(WallTopUpLeft, { x: x++, y }).vFlip = true
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(WallTopUpLeft, { x: x++, y }).flip(true, true)
    g(WallTopLeftRight, { x: x++, y }).vFlip = true
    g(WallTopLeftRight, { x: x++, y }).vFlip = true
    g(WallTopLeftRight, { x: x++, y }).vFlip = true
    g(WallTopLeftRight, { x: x++, y }).vFlip = true
    g(WallTopLeftRight, { x: x++, y }).vFlip = true
    g(WallTopLeftRight, { x: x++, y }).vFlip = true
    g(WallTopLeftRight, { x: x++, y }).vFlip = true
    g(WallTopRightDown, { x: x++, y }).flip(true, true)
    g(GrassMid, { x: x++, y })

    // Row 12
    x = xStart; y += 1
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(WallTopUpDown, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(WallTopUpDown, { x: x++, y }).hFlip = true
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })










        
    // -------------------------------
    // Initial Shipwreck Room
    // -------------------------------
    x = xStart; y += 1

    // Row0
    g(Rock, { x: x++, y })
    g(GrassLeft, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(WallTopUpDown, { x: x++, y })
    g(Land, { x: x++, y })
    g(NextRoomArrow, { x, y }).setOffset({ x: 8, y: 0 }).rotate(ROTATION_AMOUNT.UP)
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(Land, { x: x++, y })
    g(WallTopUpDown, { x: x++, y }).hFlip = true
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassMid, { x: x++, y })
    g(GrassLeft, { x: x++, y }).hFlip = true
    g(Rock, { x: x++, y })

    // Row1
    x = xStart; y += 1
    g(Rock, { x: x++, y })
    g(GrassLeft, { x: x++, y })
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
    g(GrassMid, { x: x++, y })
    g(GrassLeft, { x: x++, y }).hFlip = true
    g(Rock, { x: x++, y })

    // Row2
    x = xStart; y += 1
    g(Bush, { x: x++, y })
    g(GrassLeft, { x: x++, y })
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
    g(GrassMid, { x: x++, y })
    g(GrassLeft, { x: x++, y }).hFlip = true
    g(Bush, { x: x++, y })

    // Row3
    x = xStart; y += 1
    g(Bush, { x: x++, y })
    g(GrassCorner, { x: x++, y })
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
    g(GrassBottom, { x: x++, y })
    g(GrassCorner, { x: x++, y }).hFlip = true
    g(Bush, { x: x++, y })

    // Row4
    x = xStart; y += 1
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
    g(Key, { x, y }).offsetPos = { x: 0, y: -5 }
    g(Pedestal, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Sand, { x: x++, y })
    g(WallTopUpDown, { x: x++, y }).hFlip = true
    g(Bush, { x: x++, y })
    g(Bush, { x: x++, y })
    g(Bush, { x: x++, y })

    // Row5
    x = xStart; y += 1
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
    x = xStart; y += 1
    g(Bush, { x: x++, y })
    g(TreeBottom, { x: x++, y })
    g(WallTopUpDown, { x: x++, y })
    g(Rock, { x: x++, y })
    g(Sand, { x: x++, y })
    g(Sand, { x, y })
    g(Crate, { x, y })
    g(Sand, { x: x++, y })
    g(Crate, { x, y })
    g(Sand, { x: x++, y })
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
    x = xStart; y += 1
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
    g(Sand, { x: x++, y })
    // g(player, { x, y: y })
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
    x = xStart; y += 1
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(WallVert, { x: x++, y })
    g(SandBottom, { x: x++, y })
    g(SandBottom, { x: x++, y })
    g(SandBottom, { x: x++, y })
    g(SandBottom, { x: x++, y })
    g(SandBottom, { x: x++, y })
    g(SandBottom, { x: x++, y })
    g(SandBottom, { x: x++, y })
    g(SandBottom, { x: x++, y })
    g(SandBottom, { x: x++, y })
    g(SandBottom, { x: x++, y })
    g(SandBottom, { x: x++, y })
    g(SandBottom, { x: x++, y })
    g(SandBottom, { x: x++, y })
    g(SandBottom, { x: x++, y })
    g(SandBottom, { x: x++, y })
    g(SandBottom, { x: x++, y })
    g(SandBottom, { x: x++, y })
    g(WallVert, { x: x++, y }).hFlip = true
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })
    g(Wall, { x: x++, y })

    // Row9
    x = xStart; y += 1
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
    x = xStart; y += 1
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
    x = xStart; y += 1
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
    drawTextFn({ x: 28, y: 20 }, `${fields.keyCount}`, '#ffffff')
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
  // keyCount: number  stored in the overlayState
}

function currentRoomCorner(playerGridPos: IPosition) {
  return {
    x: Math.floor(playerGridPos.x / ROOM_SIZE.width) * ROOM_SIZE.width,
    y: Math.floor(playerGridPos.y / ROOM_SIZE.height) * ROOM_SIZE.height,
  }
}

function currentRoomBBox(playerGridPos: IPosition) {
  const pos = currentRoomCorner(playerGridPos)
  return {
    minX: pos.x,
    minY: pos.y,
    maxX: pos.x + ROOM_SIZE.width,
    maxY: pos.y + ROOM_SIZE.height,
  }
}

function playerUpdateFn (o: ObjectInstance<PlayerProps, any>, gamepad: IGamepad, collisionChecker: CollisionChecker, sprites: SpriteController, instances: InstanceController, camera: Camera, showDialog: ShowDialogFn, overlayState: SimpleObject, curTick: number) {
  camera.resize({
    width: ROOM_SIZE.width,
    height: ROOM_SIZE.height + 2,
  })

  const playerRoomPos = currentRoomCorner(o.pos)

  camera.pos = posAdd(playerRoomPos, { x: ROOM_SIZE.width / 2, y: ROOM_SIZE.height / 2 - 2 })

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
    sprites.get('BigDoor15'),
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
    overlayState.keyCount = 0
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
      const doRing = (instrument: Sprite, pillar:Sprite, disabled: Sprite) => {
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

      let newNeighborPos = posAdd(wallNeighbor.pos, neighborPos(p.dir))

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
  function checkArrow(sprite: Sprite, disabledSprite: Sprite, playerDir: PLAYER_DIR) {
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

  checkArrow(ArrowUp,    ArrowUpDisabled, PLAYER_DIR.UP)
  checkArrow(ArrowDown,  ArrowDownDisabled, PLAYER_DIR.DOWN)
  checkArrow(ArrowLeft,  ArrowLeftDisabled, PLAYER_DIR.LEFT)
  checkArrow(ArrowRight,  ArrowRightDisabled, PLAYER_DIR.RIGHT)

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


function neighborPos(dir: PLAYER_DIR) {
  switch (dir) {
    case PLAYER_DIR.UP: return {x: 0, y: -1}
    case PLAYER_DIR.DOWN: return {x: 0, y: 1}
    case PLAYER_DIR.LEFT: return {x: -1, y: 0}
    case PLAYER_DIR.RIGHT: return {x: 1, y: 0}
    default: throw new Error(`BUG: Invalid dir ${dir}`)
  }

}