import { IOutputter, IPosition, Game, ObjectInstance, Camera, Size, SimpleObject, Opt, Dialog, IPixel, SpriteController, ROTATION_AMOUNT, posAdd } from './engine'
import { LETTERS } from './letters'

export interface IRenderer {
  drawStart(): void
  drawEnd(): void
  drawPixel(pos: IPosition, hex: string): void
}

export class VisualOutputter implements IOutputter {
  private readonly renderer: IRenderer
  constructor (renderer: IRenderer) {
    this.renderer = renderer
    this.drawPixels = this.drawPixels.bind(this)
    this.drawText = this.drawText.bind(this)
  }

  draw (game: Game, tiles: Array<ObjectInstance<any, any>>, camera: Camera, curTick: number, grid: Size, overlayState: SimpleObject, pendingDialog: Opt<Dialog>, sprites: SpriteController) {
    this.renderer.drawStart()

    game.drawBackground(tiles, camera, this.drawPixels)

    for (const t of tiles) {
      if (t.startTick === 0) { t.startTick = curTick }
      const image = t.sprite.tick(t.startTick, curTick)
      if (!image) { throw new Error('BUG: Could not find image for the sprite.') }
      const pixelPos = t.getPixelPos(grid)
      const screenPos = relativeTo({ x: pixelPos.x, y: pixelPos.y }, posAdd({x: -camera.screenPixelPos.x, y: -camera.screenPixelPos.y}, camera.topLeftPixelPos(grid)))
      // const screenPos = pixelPos

      let pixels = image.pixels
      if (t.maskColor) {
        pixels = pixels.map(row => row.map(c => c === null ? null : t.maskColor))
      }
      if (t.isGrayscale) {
        pixels = pixels.map(row => row.map(c => c === null ? null : toGrayscale(c)))
      }
      this.drawPixels(screenPos, pixels, t.hFlip, t.vFlip, t.rotation)
    }

    game.drawOverlay(this.drawPixels, this.drawText, overlayState, sprites)

    if (pendingDialog) {
      const target = pendingDialog.target ? relativeTo(pendingDialog.target, camera.topLeft()) : null
      game.drawDialog(pendingDialog.message, this.drawPixels, this.drawText, curTick - pendingDialog.startTick, target, pendingDialog.additional)
    }

    this.renderer.drawEnd()
  }

  private drawPixels (screenPos: IPosition, pixels: IPixel[][], hFlip: boolean, vFlip: boolean, rotationAmount: ROTATION_AMOUNT = ROTATION_AMOUNT.NONE) {
    const height = pixels.length
    let relY = 0
    for (const row of pixels) {
      if (!row) {
        relY++
        continue
      }
      const width = row.length
      let relX = 0
      for (const pixel of row) {
        const x1 = (hFlip ? width - 1 - relX : relX)
        const y1 = (vFlip ? height - 1 - relY : relY)

        let pos: IPosition
        switch (rotationAmount) {
          case ROTATION_AMOUNT.NONE: pos = { x: x1, y: y1 }; break
          case ROTATION_AMOUNT.UP: pos = { x: y1, y: width - x1 }; break
          case ROTATION_AMOUNT.LEFT: pos = { x: width - x1, y: height - y1 }; break
          case ROTATION_AMOUNT.DOWN: pos = { x: height - y1, y: x1 }; break
          default: throw new Error('ERROR: Can only rotate by 0,1,2,3. each is a 90-degrees amount')
        }

        const x = screenPos.x + pos.x
        const y = screenPos.y + pos.y
        if (pixel !== null && pixel !== undefined && x >= 0 && y >= 0) {
          this.renderer.drawPixel({ x, y }, pixel)
        }
        relX++
      }
      relY++
    }
  }

  private drawText (screenPos: IPosition, message: string, hexColor: string) {
    // convert the lines of text to characters
    const line = message
    for (let colNum = 0; colNum < line.length; colNum++) {
      const c = line[colNum]

      const l = LETTERS.get(c)
      if (!l) {
        throw new Error(`BUG: Do not have sprite for character "${c}"`)
      }
      const pixels = l.map(row => row.map(bit => bit ? hexColor : null))
      const x = screenPos.x + colNum * 4
      const y = screenPos.y
      this.drawPixels({ x, y }, pixels, false, false)
    }
  }
}

function relativeTo (pos1: IPosition, pos2: IPosition): IPosition {
  return {
    x: pos1.x - pos2.x,
    y: pos1.y - pos2.y
  }
}

function componentToHex (c: number) {
  var hex = c.toString(16)
  return hex.length === 1 ? `0${hex}` : `${hex}`
}

function rgbToHex (r: number, g: number, b: number) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

export function hexToRgb (hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function toGrayscale (hex: string) {
  const rgb = hexToRgb(hex)
  const avg = Math.round((rgb.r + rgb.g + rgb.b) / 3)
  return rgbToHex(avg, avg, avg)
}
