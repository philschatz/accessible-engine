import { Game, Camera, SpriteController, Sprite, InstanceController, ObjectInstance, IPosition, DrawPixelsFn, SimpleObject, Opt, DrawTextFn } from '../common/engine'
import { IGamepad, BUTTON_TYPE } from '../common/gamepad'
import { loadImages } from './images'
import { loadRooms } from './rooms'
import { playerUpdateFn, crateUpdateFn } from './logic'

/** 
 * This example game is the first few rooms of https://www.akurra-game.com/
 * 
 * See ../../docs.md for details about creating a game.
 */
export class MyGame implements Game {
  load (gamepad: IGamepad, sprites: SpriteController) {
    const images = loadImages()

    // This is just an animation... apologies for how long it is.
    sprites.add('Water', new Sprite(20, true, images.getAll([
      'Water0',
      'Water0',
      'Water0',
      'Water0',
      'Water0',
      'Water0',
      'Water0',
      'Water0',
      'Water0',
      'Water0',
      'Water1',
      'Water2',
      'Water3',
      'Water4'
    ])))

    sprites.add('Key', new Sprite(2, true, images.getAll([
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key1',
      'Key2',
      'Key3',
      'Key4',
      'Key5',
      'Key6'
    ])))

    sprites.add('GongPlayMusic', new Sprite(3, false, images.getAll([
      'GongPlayMusic1',
      'GongPlayMusic2',
      'GongPlayMusic3',
      'GongPlayMusic4',
      'GongPlayMusic5',
      'GongPlayMusic6'
    ])))

    sprites.add('PlayerWalkingRight', new Sprite(1, true, images.getAll([
      'PlayerWalkingRight1',
      'PlayerWalkingRight2'
    ])))

    sprites.add('FloorSquare', new Sprite(3, false, images.getAll([
      'FloorPoof1',
      'FloorPoof2',
      'FloorPoof3Square',
      'FloorSquareDone'
    ])))

    sprites.add('FloorDiamond', new Sprite(3, false, images.getAll([
      'FloorPoof1',
      'FloorPoof2',
      'FloorPoof3Diamond',
      'FloorDiamondDone'
    ])))

    // Add all the images as single-image sprites too.
    for (const [name, image] of images.entries()) {
      sprites.add(name, Sprite.forSingleImage(image))
    }

    return {
      grid: { width: 16, height: 16 },
      buttons: new Set([BUTTON_TYPE.DPAD_LEFT, BUTTON_TYPE.DPAD_RIGHT, BUTTON_TYPE.DPAD_DOWN, BUTTON_TYPE.DPAD_UP])
    }
  }

  init (sprites: SpriteController, instances: InstanceController) {
    loadRooms(sprites, instances, playerUpdateFn, crateUpdateFn)
  }

  drawBackground (tiles: Array<ObjectInstance<any>>, camera: Camera, drawPixelsFn: DrawPixelsFn) {
    // All sprites have a background so this is not necessary
  }

  drawOverlay (drawPixelsFn: DrawPixelsFn, drawTextFn: DrawTextFn, fields: SimpleObject, sprites: SpriteController) {
    const [
      Key,
      OverlayTopLeft1,
      OverlayTopLeft2,
      OverlayTopRight1,
      OverlayTopRight2,
      OverlayTop,
      OverlayTopCrack,
      OverlayBottomLeft1,
      OverlayBottomLeft2,
      OverlayBottomRight1,
      OverlayBottomRight2,
      OverlayBottom,
      OverlayBottomCrack
    ] = sprites.getAll([
      'Key',
      'OverlayTopLeft1',
      'OverlayTopLeft2',
      'OverlayTopRight1',
      'OverlayTopRight2',
      'OverlayTop',
      'OverlayTopCrack',
      'OverlayBottomLeft1',
      'OverlayBottomLeft2',
      'OverlayBottomRight1',
      'OverlayBottomRight2',
      'OverlayBottom',
      'OverlayBottomCrack'
    ])

    let x = 0
    let y = 0
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTopLeft1.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTopLeft2.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTopCrack.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTopCrack.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTopCrack.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTop.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayTopCrack.images[0].pixels, false, false)
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
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottomCrack.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottomCrack.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottom.images[0].pixels, false, false)
    drawPixelsFn({ x: x++ * 16, y: y * 16 }, OverlayBottomCrack.images[0].pixels, false, false)
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
