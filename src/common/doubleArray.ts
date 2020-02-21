import { IPosition } from './engine'

export class DoubleArray<T> {
  private ary: T[][] = []
  private maxX = 0
  private maxY = 0

  clear () {
    this.ary = []
  }

  set (pos: IPosition, v: T) {
    let row = this.ary[pos.y]
    if (!row) {
      row = []
      this.ary[pos.y] = row
    }
    row[pos.x] = v

    this.maxY = Math.max(this.maxY, pos.y)
    this.maxX = Math.max(this.maxX, pos.x)
  }

  get (pos: IPosition, def: T): T {
    if (!this.ary[pos.y]) { return def }
    return this.ary[pos.y][pos.x] || def
  }

  dim () {
    return {
      width: this.maxX + 1,
      height: this.maxY + 1
    }
  }

  asArray () {
    return this.ary
  }

  forEach (fn: (value: T[], index: number, array: T[][]) => void) {
    this.ary.forEach(fn)
  }
}
