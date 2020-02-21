import { IOutputter, Game, ObjectInstance, Camera, Size, SimpleObject, Opt, Dialog, SpriteController, IPosition } from '../common/engine'
import { categorize } from '../common/table'
import { DoubleArray } from '../common/doubleArray'
import { IRenderer, hexToRgb } from '../common/visual'

export class GridTableOutputter implements IOutputter {
  private readonly table: HTMLTableElement
  constructor (table: HTMLTableElement) {
    this.table = table
  }

  draw (game: Game, tiles: Array<ObjectInstance<any, any>>, camera: Camera, curTick: number, grid: Size, overlayState: SimpleObject, pendingDialog: Opt<Dialog>, sprites: SpriteController) {
    const model = new DoubleArray<Set<string>>()

    tiles.forEach(t => {
      const spritenames = model.get(t.pos, new Set())
      spritenames.add(categorize(t.sprite._name))
    })

    this.table.innerHTML = ''
    model.forEach(row => {
      const tr = document.createElement('tr')
      row.forEach(col => {
        const td = document.createElement('td')
        td.innerHTML = [...col.keys()].filter(s => !!s).join(', ')

        tr.appendChild(td)
      })
      this.table.appendChild(tr)
    })
  }
}

export class CanvasRenderer implements IRenderer {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private imageData: ImageData
  private readonly pixelSize: number

  constructor (canvas: HTMLCanvasElement, pixelSize: number = 1) {
    this.pixelSize = pixelSize
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height)
  }

  drawStart () {
    this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
  }

  drawEnd () {
    this.ctx.putImageData(this.imageData, 0, 0)
  }

  drawPixel (pos: IPosition, hex: string) {
    // if (!(pos.x >= 0 && pos.y >= 0)) { throw new Error(`BUG: Tried to draw outside of the camera range ${JSON.stringify(pos)}`) }
    
    // this.ctx.fillStyle = hex
    // this.ctx.fillRect(pos.x * this.pixelSize, pos.y * this.pixelSize, this.pixelSize, this.pixelSize)

    const rgb = hexToRgb(hex)
    const i = (pos.y * this.imageData.width + pos.x) * 4
    const data = this.imageData.data
    data[i + 0] = rgb.r
    data[i + 1] = rgb.g
    data[i + 2] = rgb.b
    data[i + 3] = 255
  }
}
