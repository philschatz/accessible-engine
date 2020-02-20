import { IOutputter, IPosition, Game, ObjectInstance, Camera, Size, SimpleObject, SimpleValue, Opt, Dialog, IPixel, SpriteController } from "./engine"
import { DoubleArray } from "./terminal"

export interface IRenderer {
  drawStart(): void
  drawEnd(): void
  drawPixel(pos: IPosition, hex: string): void
}

// HACK lookup table. This should be a property of the ObjectClass
const categories = new Map<string, string>()
categories.set('WallTopUpLeft', 'Wall')
categories.set('WallTopRightDown', 'Wall')
categories.set('WallTopUpDown', 'Wall')
categories.set('WallTopLeftRight', 'Wall')
categories.set('WallVert', 'Wall')
categories.set('Bush', 'Wall')
categories.set('Rock', 'Wall')
categories.set('TreeTop', 'Wall')
categories.set('TreeBottom', 'Wall')
categories.set('Background', null)
categories.set('Sand', null)
categories.set('SandEdge', null)
categories.set('Land', null)
categories.set('LandCorner', null)
categories.set('LandBottom', null)
categories.set('FloorSquare', null)
categories.set('FloorDiamond', null)
categories.set('PlayerWalkingRight', 'PLAYER')
categories.set('PlayerWalkingUp', 'PLAYER')
categories.set('PlayerWalkingDown', 'PLAYER')
categories.set('PlayerPushingUp', 'PlayerPushing')
categories.set('PlayerPushingDown', 'PlayerPushing')
categories.set('PlayerPushingRight', 'PlayerPushing')

function categorize(spriteName: string) {
  if (categories.has(spriteName)) {
    return categories.get(spriteName)
  }
  return spriteName
}

export class TableOutputter implements IOutputter {
  draw(game: Game, tiles: ObjectInstance<any, any>[], camera: Camera, curTick: number, grid: Size, overlayState: SimpleObject, pendingDialog: Opt<Dialog>) {
    const table = new DoubleArray<string[]>()

    for (const t of tiles) {
      const pos = t.pos
      const s = categorize(t.sprite._name)
      if (s) { // could be null
        table.get(pos, []).push(s)
      }
    }

    const dialogMessage = pendingDialog ? pendingDialog.message : null
    console.log('---------------')
    console.log('<table>')
    table.forEach(row => {
      const tr = ['<tr>']
      row.forEach(col => {
        tr.push('<td>')
        col.forEach(sprite => {
          tr.push(`${sprite} `)
        })
        tr.push('</td>')
      })
      tr.push('</tr>')
      console.log(tr.join(''))
    })
    console.log('</table>')
    console.log(`<p>Overlay Info: ${JSON.stringify(overlayState)}</p>`)
    if (dialogMessage) console.log(`<p>Dialog message: ${dialogMessage}</p>`)
  }
}

function positionToString(pos: IPosition) {
  return `x ${pos.x}, y ${pos.y}`
}

export type LoggerFn = (message?: any, ...optionalParams: any[]) => void

export class AudioOutputter implements IOutputter {
  private readonly logger: LoggerFn
  prev = new Map<ObjectInstance<any, any>, {pos: IPosition, category: string}>()
  prevOverlay = new Map<string, SimpleValue>()

  constructor(logger: LoggerFn = console.log.bind(console)) {
    this.logger = logger
  }

  draw(game: Game, tiles: ObjectInstance<any, any>[], camera: Camera, curTick: number, grid: Size, overlayState: SimpleObject, pendingDialog: Opt<Dialog>) {
    const current = new Map<ObjectInstance<any, any>, {pos: IPosition, category: string}>()
    tiles.forEach(t => {
      const c = categorize(t.sprite._name)
      if (c) {
        current.set(t, {pos: t.pos, category: c})
      }
    })

    const currentOverlay = new Map<string, SimpleValue>()
    for (const key in overlayState) {
      const v = overlayState[key]
      currentOverlay.set(key, v)
    }


    // We notify for 4 things:
    // New thing appeared
    // Old thing disappeared
    // Thing moved
    // Thing changed sprite category

    if (this.prev.size === 0) {
      // Output the initial stats
      this.prevOverlay = currentOverlay
      if (currentOverlay.size > 0) {
        this.logger('START: Items in the Overlay');
        [...currentOverlay.entries()].forEach(([key, value]) =>{
          this.logger(`  item ${key} has value ${value}`)
        })
        this.logger('END: Items in the Overlay');
      }

      this.logger('START: Initial Room Information')
      const catPositions = new Map<string, IPosition[]>()
      for (const v of current.values()) {
        let p = catPositions.get(v.category)
        if (!p) {
          p = []
          catPositions.set(v.category, p)
        }
        p.push(v.pos)
      }

      const sorted = [...catPositions.entries()].sort((a, b) => {
        return a[1].length - b[1].length
      })
      for (const v of sorted) {
        const positions = v[1]
        const category = v[0]
        if (positions.length === 1) {
          this.logger(`  1 ${category} sprite @ ${positionToString(positions[0])}`)
        } else if (positions.length === 2) {
          this.logger(`  2 ${category} sprites @ ${positionToString(positions[0])} and @ ${positionToString(positions[1])}`)
        } else {
          this.logger(`  ${positions.length} ${category} sprites`)
        }
      }

      this.logger('END: Initial Room Information')
    } else {
      // Do the changed for the overlay info
      {
        const cur = new Set(currentOverlay.keys())
        const prev = new Set(this.prevOverlay.keys())
  
        const appeared = setDifference(cur, prev)
        const disappeared = setDifference(prev, cur)
        const stillAround = setIntersection(prev, cur)
        
        const changed = new Map()
        for (const i of stillAround) {
          const p = this.prevOverlay.get(i)
          const c = currentOverlay.get(i)
          if (p !== c) {
            changed.set(i, {from: p, to: c})
          }
        }

        if (appeared.size + disappeared.size + changed.size > 0) {
          this.logger('START: Overlay updates')

          if (appeared.size > 0) {
            [...appeared.keys()].forEach((key) => {
              const value = currentOverlay.get(key)
              this.logger(`  Item ${key} added with value ${value}`)
            })
          }

          if (disappeared.size > 0) {
            [...disappeared.keys()].forEach((key) => {
              const value = this.prevOverlay.get(key)
              this.logger(`  Item ${key} removed with value ${value}`)
            })
          }

          if (changed.size > 0) {
            [...changed.entries()].forEach(([key, {from, to}]) => {
              this.logger(`  Item ${key} changed from ${from} to ${to}`)
            })
          }
        
          this.logger(`END: Overlay Updates`)
        }
  
        this.prevOverlay = currentOverlay
      }


      const cur = new Set(current.keys())
      const prev = new Set(this.prev.keys())

      const appeared = setDifference(cur, prev)
      const disappeared = setDifference(prev, cur)
      const stillAround = setIntersection(prev, cur)

      const moved = new Map()
      const changed = new Map()
      for (const i of stillAround) {
        const p = this.prev.get(i)
        const c = current.get(i)
        if (p.pos.x !== c.pos.x || p.pos.y !== c.pos.y) {
          moved.set(i, {from: p.pos, to: c.pos})
        }
        if (p.category !== c.category) {
          changed.set(i, {from: p.category, to: c.category})
        }
      }

      // Print out all the changes
      const appearedSprites = [...appeared].map(i => current.get(i).category).filter(s => !!s) // remove nulls
      const disappearedSprites = [...disappeared].map(i => this.prev.get(i).category).filter(s => !!s) // remove nulls
      if (appearedSprites.length === 1) {
        this.logger(`1 thing appeared: ${appearedSprites[0]}`)
      } else if (appearedSprites.length > 0) {
        this.logger(`${appearedSprites.length} things appeared: ${JSON.stringify(appearedSprites)}`)
      }
      if (disappearedSprites.length === 1) {
        this.logger(`1 thing disappeared: ${disappearedSprites[0]}`)
      } else if (disappearedSprites.length > 0) {
        this.logger(`${disappearedSprites.length} things disappeared: ${disappearedSprites.join(', ')}`)
      }
      if (moved.size > 0) {
        const movedMessages = [...moved.entries()].map(([i, {from, to}]) => {
          const c = categorize(i.sprite._name)
          if (!c) { return '' }
          const msg = [c]
          if (to.x < from.x) {
            msg.push(`LEFT ${from.x - to.x}`)
          } else if (to.x > from.x) {
            msg.push(`RIGHT ${to.x - from.x}`)
          }

          if (to.y < from.y) {
            if (msg.length > 1) { msg.push('and') }
            msg.push(`UP ${from.y - to.y}`)
          } else if (to.y > from.y) {
            if (msg.length > 1) { msg.push('and') }
            msg.push(`DOWN ${to.y - from.y}`)
          }
          return msg.join(' ')
        })
        if (moved.size === 1) {
          this.logger(`Moved ${movedMessages[0]}`)
        } else {
          this.logger(`${moved.size} things moved: ${movedMessages.join(', ')}`)
        }
      }

      if (changed.size > 0) {
        const changedMessages = [...changed.entries()].map(([i, {from, to}]) => {
          return `FROM ${from} TO ${to}`
        })
        if (changed.size === 1) {
          this.logger(`changed ${changedMessages[0]}`)
        } else {
          this.logger(`${changed.size} things changed: ${changedMessages.join(', ')}`)
        }
        
      }
    }
    this.prev = current
  }
}

function distance(p1: IPosition, p2: IPosition) {
  return Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y)
}

function setDifference<T>(s1: Set<T>, s2: Set<T>) {
  const ret = new Set<T>()
  for (const i of s1) {
    if (!s2.has(i)) {
      ret.add(i)
    }
  }
  return ret
}

function setUnion<T>(s1: Set<T>, s2: Set<T>) {
  const ret = new Set<T>()
  for (const i of s1) { ret.add(i) }
  for (const i of s2) { ret.add(i) }
  return ret
}

function setIntersection<T>(s1: Set<T>, s2: Set<T>) {
  let sA: Set<T>
  let sB: Set<T>
  if (s1.size < s2.size) {
    sA = s1
    sB = s2
  } else {
    sA = s2
    sB = s1
  }
  const ret = new Set<T>()
  sA.forEach(i => {
    if (sB.has(i)) {
      ret.add(i)
    }
  })
  return ret
}

export class AndOutputter implements IOutputter {
  private readonly outs: IOutputter[]
  constructor(outs: IOutputter[]) {
    this.outs = outs
  }
  draw(game: Game, tiles: ObjectInstance<any, any>[], camera: Camera, curTick: number, grid: Size, overlayState: SimpleObject, pendingDialog: Opt<Dialog>, sprites: SpriteController) {
    for (const o of this.outs) {
      o.draw(game, tiles, camera, curTick, grid, overlayState, pendingDialog, sprites)
    }
  }
}