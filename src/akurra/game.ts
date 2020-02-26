import { Game, Camera, SpriteController, Sprite, InstanceController, ObjectInstance, IPosition, DrawPixelsFn, SimpleObject, Opt, DrawTextFn } from '../common/engine'
import { IGamepad, BUTTON_TYPE } from '../common/gamepad'
import { loadImages } from './images'
import { loadRooms } from './rooms'
import { playerUpdateFn, crateUpdateFn } from './logic'

export class MyGame implements Game {
  load (gamepad: IGamepad, sprites: SpriteController) {
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
      grid: { width: 16, height: 16 },
      buttons: new Set([BUTTON_TYPE.DPAD_LEFT, BUTTON_TYPE.DPAD_RIGHT, BUTTON_TYPE.DPAD_DOWN, BUTTON_TYPE.DPAD_UP, BUTTON_TYPE.CLUSTER_DOWN])
    }
  }

  init (sprites: SpriteController, instances: InstanceController) {
    loadRooms(sprites, instances, playerUpdateFn, crateUpdateFn)
  }

  drawBackground (tiles: Array<ObjectInstance<any, any>>, camera: Camera, drawPixelsFn: DrawPixelsFn) {
    // All sprites have a background so this is not necessary
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
