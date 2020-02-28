import { IOutputter, IPosition, Game, ObjectInstance, Camera, Size, SimpleObject, SimpleValue, Opt, Dialog, SpriteController } from './engine'

export interface IRenderer {
  drawStart(): void
  drawEnd(): void
  drawPixel(pos: IPosition, hex: string): void
}

// https://stackoverflow.com/a/30521308
export function toSnakeCase (s: string) {
  return s.replace(/\.?([A-Z]+)/g, function (x, y: string) { return ' ' + y }).replace(/^ /, '')
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
categories.set('Stump', 'Wall')
categories.set('Background', null)
categories.set('Sand', null)
categories.set('SandEdge', null)
categories.set('SandBottom', null)
categories.set('SandLeft', null)
categories.set('Land', null)
categories.set('LandCorner', null)
categories.set('LandBottom', null)
categories.set('LandLeft', null)
categories.set('Grass', null)
categories.set('GrassCorner', null)
categories.set('GrassLeft', null)
categories.set('GrassBottom', null)
categories.set('GrassTopLeft', null)
categories.set('GrassTop', null)
categories.set('GrassTopRight', null)
categories.set('FieldCorner', null)
categories.set('FieldBottom', null)
categories.set('FieldTopLeft', null)
categories.set('FieldTop', null)
categories.set('FieldTopRight', null)
categories.set('FieldLeft', null)
categories.set('Land2', null)
categories.set('Field', null)
categories.set('Field2', null)
categories.set('FloorSquare', null)
categories.set('FloorDiamond', null)
categories.set('Pedestal', null)

categories.set('BigDoor0', 'Wall')
categories.set('BigDoor1', 'Wall')
categories.set('BigDoor2', 'Wall')
categories.set('BigDoor3', 'Wall')
categories.set('BigDoor4', 'Wall')
categories.set('BigDoor5', 'Wall')
categories.set('BigDoor6', 'Wall')
categories.set('BigDoor7', 'Wall')
categories.set('BigDoor8', 'Wall')
categories.set('BigDoor9', 'Wall')
categories.set('BigDoor10', 'Wall')
categories.set('BigDoor11', 'Wall')
categories.set('BigDoor12', 'Wall')
categories.set('BigDoor13', 'Wall')
categories.set('BigDoor14', 'Wall')
categories.set('BigDoor15', 'Wall')

categories.set('PlayerWalkingRight', 'PLAYER')
categories.set('PlayerWalkingUp', 'PLAYER')
categories.set('PlayerWalkingDown', 'PLAYER')
categories.set('PlayerPushingUp', 'PLAYER')
categories.set('PlayerPushingDown', 'PLAYER')
categories.set('PlayerPushingRight', 'PLAYER')

export function categorize (spriteName: string) {
  if (categories.has(spriteName)) {
    return categories.get(spriteName)
  }
  return spriteName
}

export type LoggerFn = (message?: any, ...optionalParams: any[]) => void

export class AudioOutputter implements IOutputter {
  private readonly logger: LoggerFn
  prev = new Map<ObjectInstance<any, any>, {pos: IPosition, category: string}>()
  prevOverlay = new Map<string, SimpleValue>()

  constructor (logger: LoggerFn = console.log.bind(console)) {
    this.logger = logger
  }

  draw (game: Game, tiles: Array<ObjectInstance<any, any>>, camera: Camera, curTick: number, grid: Size, overlayState: SimpleObject, pendingDialog: Opt<Dialog>) {
    const current = new Map<ObjectInstance<any, any>, {pos: IPosition, category: string}>()
    tiles.forEach(t => {
      const c = categorize(t.sprite._name)
      if (c) {
        current.set(t, { pos: t.pos, category: c })
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
    const messages: string[] = []

    if (this.prev.size === 0) {
      // Output the initial stats
      this.prevOverlay = currentOverlay
      if (currentOverlay.size > 0) {
        messages.push('START: Items in the Inventory');
        [...currentOverlay.entries()].forEach(([key, value]) => {
          messages.push(`  item ${key} has value ${value}`)
        })
        messages.push('END: Items in the Inventory')
      }

      messages.push('START: Initial Room Information')
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
          messages.push(`  1 ${category} sprite`)
        // } else if (positions.length === 2) {
        //   messages.push(`  2 ${category} sprites @ ${positionToString(positions[0])} and @ ${positionToString(positions[1])}`)
        } else {
          messages.push(`  ${positions.length} ${category} sprites`)
        }
      }

      messages.push('END: Initial Room Information')
    } else {
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
          moved.set(i, { from: p.pos, to: c.pos })
        }
        if (p.category !== c.category) {
          changed.set(i, { from: p.category, to: c.category })
        }
      }

      // Print out all the changes
      if (moved.size > 0) {
        const movedMessages = [...moved.entries()].map(([i, { from, to }]) => {
          const c = categorize(i.sprite._name)
          if (!c) { return '' }
          const msg = [c]
          if (to.x < from.x) {
            msg.push('LEFT')
          } else if (to.x > from.x) {
            msg.push('RIGHT')
          }

          if (to.y < from.y) {
            if (msg.length > 1) { msg.push('and') }
            msg.push('UP')
          } else if (to.y > from.y) {
            if (msg.length > 1) { msg.push('and') }
            msg.push('DOWN')
          }
          return msg.join(' ')
        })
        if (moved.size === 1) {
          messages.push(`Moved ${movedMessages[0]}`)
        } else {
          messages.push(`${moved.size} things moved: ${movedMessages.join(', ')}`)
        }
      }

      if (changed.size > 0) {
        const changedMessages = [...changed.entries()].map(([i, { from, to }]) => {
          return `FROM ${from} TO ${to}`
        })
        if (changed.size === 1) {
          messages.push(`changed ${changedMessages[0]}`)
        } else {
          messages.push(`${changed.size} things changed: ${changedMessages.join(', ')}`)
        }
      }

      const disappearedSprites = [...disappeared].map(i => this.prev.get(i).category).filter(s => !!s) // remove nulls
      const appearedSprites = [...appeared].map(i => current.get(i).category).filter(s => !!s) // remove nulls
      if (disappearedSprites.length === 1) {
        messages.push(`1 thing disappeared: ${disappearedSprites[0]}`)
      } else if (disappearedSprites.length > 0) {
        messages.push(`${disappearedSprites.length} things disappeared: ${disappearedSprites.join(', ')}`)
      }
      if (appearedSprites.length === 1) {
        messages.push(`1 thing appeared: ${appearedSprites[0]}`)
      } else if (appearedSprites.length > 0) {
        messages.push(`${appearedSprites.length} things appeared: ${JSON.stringify(appearedSprites)}`)
      }

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
            changed.set(i, { from: p, to: c })
          }
        }

        if (appeared.size + disappeared.size + changed.size > 0) {
          // messages.push('START Inventory updates')

          if (appeared.size > 0) {
            [...appeared.keys()].forEach((key) => {
              const value = currentOverlay.get(key)
              messages.push(`  ${key} in inventory was added with value ${value}`)
            })
          }

          if (disappeared.size > 0) {
            [...disappeared.keys()].forEach((key) => {
              const value = this.prevOverlay.get(key)
              messages.push(`  ${key} in inventory was removed with value ${value}`)
            })
          }

          if (changed.size > 0) {
            [...changed.entries()].forEach(([key, { from, to }]) => {
              messages.push(`  ${key} in inventory changed from ${from} to ${to}`)
            })
          }

          // messages.push('END Inventory Updates')
        }

        this.prevOverlay = currentOverlay
      }
    }
    // only log when actual messages occurred
    if (messages.length > 0) {
      this.logger(messages.map(m => toSnakeCase(m)).join('.\n'))
    }
    this.prev = current
  }
}

function setDifference<T> (s1: Set<T>, s2: Set<T>) {
  const ret = new Set<T>()
  for (const i of s1) {
    if (!s2.has(i)) {
      ret.add(i)
    }
  }
  return ret
}

function setIntersection<T> (s1: Set<T>, s2: Set<T>) {
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
  private readonly outs: Set<IOutputter>
  constructor (outs: IOutputter[]) {
    this.outs = new Set(outs)
  }

  draw (game: Game, tiles: Array<ObjectInstance<any, any>>, camera: Camera, curTick: number, grid: Size, overlayState: SimpleObject, pendingDialog: Opt<Dialog>, sprites: SpriteController) {
    for (const o of this.outs) {
      o.draw(game, tiles, camera, curTick, grid, overlayState, pendingDialog, sprites)
    }
  }
}
