// From https://medium.com/@deathmood/how-to-write-your-own-virtual-dom-ee74acc13060

interface ObjectLiteral {
  [key: string]: string
}

interface Tree {
  type: string
  props: ObjectLiteral
  children: Array<Tree | string>
}

type Fn = (x: ObjectLiteral | undefined) => Tree

export function h (type: string, props: ObjectLiteral | undefined, ...children: Array<Tree | string | undefined>): Tree {
  if (isFunction(type)) {
    const t = (type as any) as Fn
    return t(props)
  }
  if (isArray(head(children))) {
    children = (head(children) as any) as Tree[]
  }
  return { type, props: props || {}, children }
}

function createElement (node: Tree | string) {
  if (typeof node === 'string') {
    return document.createTextNode(String(node))
  }
  const $el = document.createElement(node.type)
  applyProps($el, node.props)
  node.children.map(child => $el.appendChild(createElement(child)))
  return $el
}

export function patch ($parent: Element, newTree: Tree, oldTree: Tree | undefined, index = 0) {
  if (!oldTree) {
    $parent.appendChild(createElement(newTree))
  } if (!newTree) {
    removeChildren($parent, index)
  } else if (changed(newTree, oldTree)) {
    $parent.replaceChild(createElement(newTree), $parent.childNodes[index])
  } else if (!isUndefined(newTree.type)) {
    applyProps($parent.children[index], newTree.props, oldTree.props)
    patchNodes($parent, newTree, oldTree, index)
  }
}

function changed (a, b) {
  return (typeof a !== typeof b) || (!isObject(a) && a !== b) || (a.type !== b.type)
}

function patchNodes ($parent: Element, newTree, oldTree, index: number) {
  const len = Math.max(newTree.children.length, oldTree.children.length)
  let i = -1
  while (++i < len) {
    if (!$parent.childNodes[index]) { console.log($parent); throw new Error(`BUG: VDom Found null child in $parent ${i}`) }
    patch(
      $parent.children[index],
      newTree.children[i],
      oldTree.children[i],
      i
    )
  }
}

function removeChildren ($parent: Element, index: number) {
  let times = ($parent.childNodes.length || 0) - index
  while (times-- > 0) {
    if ($parent.lastChild) {
      $parent.removeChild($parent.lastChild)
    }
  }
}

function applyProps ($el: Element, newProps: ObjectLiteral, oldProps: ObjectLiteral = {}) {
  const props = merge(newProps, oldProps)
  Object.keys(props).map(name => {
    const newValue = newProps[name]
    const oldValue = oldProps[name]
    if (isObject(newValue)) {
      applyProps($el[name], (newValue as any) as ObjectLiteral, (oldValue as any) as ObjectLiteral)
    } else {
      if (!newValue) {
        removeProp($el, name)
      } else if (newValue !== oldValue) {
        setProp($el, name, newValue)
      }
    }
  })
}

function setProp ($el: Element, name: string, value: string) {
  if (name === 'className') {
    $el.setAttribute('class', value)
  } else {
    $el[name] = value
  }
}

function removeProp ($el: Element, name: string) {
  if (name === 'className') {
    $el.removeAttribute('class')
  } else {
    $el.removeAttribute(name)
  }
}

function isObject (x: any) {
  return typeof x === 'object' && x !== null
}

function isFunction (x: any) {
  return typeof x === 'function'
}

function isUndefined (x: any) {
  return x === undefined
}

const isArray = Array.isArray || function (obj) {
  return Object.prototype.toString.call(obj) === '[object Array]'
}

function head<T> (x: string | T[]) {
  return typeof x === 'string' ? x.charAt(0) : x[0]
}

function merge (a: ObjectLiteral, b: ObjectLiteral) {
  return Object.assign({}, a, b)
}
