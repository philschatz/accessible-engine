import { IOutputter, Game, ObjectInstance, Camera, Size, SimpleObject, Opt, Dialog, SpriteController, IPosition } from '../common/engine'
import { categorize } from '../common/output'
import { DoubleArray } from '../common/doubleArray'
import { IRenderer, hexToRgb } from '../common/visual'
import { h, patch } from './vdom'
import { Keymaster } from './input'

export class GridTableOutputter implements IOutputter {
  private readonly root: HTMLElement
  private prevDom: any

  constructor (root: HTMLElement) {
    this.root = root
  }

  draw (game: Game, tiles: Array<ObjectInstance<any, any>>, camera: Camera, curTick: number, grid: Size, overlayState: SimpleObject, pendingDialog: Opt<Dialog>, sprites: SpriteController) {
    const model = new DoubleArray<Set<string>>()

    tiles.forEach(t => {
      const spritenames = model.get(t.pos, new Set())
      spritenames.add(categorize(t.sprite._name))
    })

    const overlayInfo = ['Inventory Info:']
    for (const key in overlayState) {
      const v = overlayState[key]
      overlayInfo.push(`Item ${key} is ${v}`)
    }

    const next = h('table', null,
      h('caption', null, overlayInfo.join(' ')),
      h('tbody', null, ...model.asArray().filter(s => !!s).map(row => {
        return h('tr', null, ...row.filter(s => !!s).map(col => {
          return h('td', null, ...[...col.keys()].filter(s => !!s).map(s => {
            return h('span', { className: s.toLowerCase() }, `${s} `)
          }))
        }))
      }))
    )

    patch(this.root, next, this.prevDom)
    this.prevDom = next
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

export class GridInspector {
  private readonly table: HTMLTableElement
  private readonly logger: (msg: string) => void
  private readonly km: Keymaster<string>
  private lastPlayerPos: IPosition
  private relPos: IPosition
  constructor (table: HTMLTableElement, logger: (msg: string) => void, keyContext: Opt<HTMLElement>) {
    this.table = table
    this.logger = logger
    this.listen = this.listen.bind(this)
    this.km = new Keymaster<string>(x => x, this.listen, keyContext)
    this.lastPlayerPos = { x: -2, y: -2 } // just invalid
    this.relPos = { x: 0, y: 0 }
  }

  listen (key: string, pressed: boolean) {
    if (pressed) {
      let dx = 0
      let dy = 0
      switch (key) {
        case 'i': dy = -1; break
        case 'j': dx = -1; break
        case 'l': dx = 1; break
        case 'k': dy = 1; break
        default: return
      }

      const newPlayerPos = this.findPlayerPos()
      if (this.lastPlayerPos.x !== newPlayerPos.x || this.lastPlayerPos.y !== newPlayerPos.y) {
        this.relPos = { x: dx, y: dy }
        this.lastPlayerPos = newPlayerPos
      } else {
        this.relPos = {
          x: this.relPos.x + dx,
          y: this.relPos.y + dy
        }
      }

      const pos = {
        x: this.lastPlayerPos.x + this.relPos.x,
        y: this.lastPlayerPos.y + this.relPos.y
      }
      const td = this.table.querySelector(`tr:nth-child(${pos.y + 1}) > td:nth-child(${pos.x + 1})`)
      if (td) {
        const sprites = Array.from(td.querySelectorAll('span')).map(s => s.innerHTML)
        this.logger(`Inspecting @ (${pos.x}, ${pos.y}) there is: ${sprites.join(' ') || 'NOTHING'}`)
      } else {
        this.logger('End of screen reached')
      }
    }
  }

  findPlayerPos () {
    const players = this.table.querySelectorAll('tr td .player')
    if (players.length !== 1) { throw new Error(`BUG: Expected to always find exactly 1 player but found ${players.length}`) }
    const player = players[0]
    const td = player.parentElement
    const tr = td.parentElement
    const tbody = tr.parentElement
    return {
      x: indexOf(tr, td),
      y: indexOf(tbody, tr)
    }
  }
}

function indexOf (parent: HTMLElement, child: Element): number {
  return Array.prototype.indexOf.call(parent.children, child)
}
