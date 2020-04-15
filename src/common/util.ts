/*
 * util for dealing with array and object index signatures
 * don't include undefined
 *
 * ref: https://github.com/Microsoft/TypeScript/issues/13778
 */
export const assertDefined = <X>(x: X, message: string = 'BUG: Expected this to be defined') => {
  if (x === undefined) {
    throw new Error(message)
  }
  return x!
}

export const assertSomething = <X>(x: X, message: string = 'BUG: Expected this to be defined and not null') => {
  if (x === undefined || x === null) {
    throw new Error(message)
  }
  return x!
}

export function filterNulls<T> (items: Array<T | null | undefined>) {
  const ret: T[] = []
  items.forEach((x) => {
    if (x) { ret.push(x) }
  })
  return ret
}
