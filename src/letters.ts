export const LETTERS: Map<string, number[][]> = new Map()
function addLetter(c: string, bits: number[][]) {
  LETTERS.set(c, bits)
}

addLetter('a', [
  [0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
  [1, 0, 0, 1, 0],
  [1, 0, 0, 1, 0],
  [0, 1, 1, 1, 0]
])
addLetter('b', [
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 1, 1, 0, 0],
  [1, 0, 0, 1, 0],
  [0, 1, 1, 0, 0]
])
addLetter('c', [
  [0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [0, 1, 1, 1, 0]
])
addLetter('d', [
  [0, 0, 0, 1, 0],
  [0, 0, 0, 1, 0],
  [0, 1, 1, 1, 0],
  [1, 0, 0, 1, 0],
  [0, 1, 1, 0, 0]
])
addLetter('e', [
  [0, 1, 1, 0, 0],
  [1, 0, 0, 1, 0],
  [1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0],
  [0, 1, 1, 0, 0]
])
addLetter('f', [
  [0, 0, 0, 0, 0],
  [0, 0, 1, 1, 0],
  [0, 1, 0, 0, 0],
  [1, 1, 1, 0, 0],
  [0, 1, 0, 0, 0]
])
addLetter('g', [
  [0, 1, 1, 0, 0],
  [1, 0, 0, 1, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 0, 1, 0],
  [0, 1, 1, 0, 0]
])
addLetter('h', [
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 1, 1, 0, 0],
  [1, 0, 0, 1, 0],
  [1, 0, 0, 1, 0]
])
addLetter('i', [
  [0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 1, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 1, 1, 0]
])
addLetter('j', [
  [0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [1, 0, 1, 0, 0],
  [0, 1, 0, 0, 0]
])
addLetter('k', [
  [1, 0, 0, 0, 0],
  [1, 0, 0, 1, 0],
  [1, 1, 1, 0, 0],
  [1, 0, 0, 1, 0],
  [1, 0, 0, 1, 0]
])
addLetter('l', [
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 1, 0],
  [0, 1, 1, 0, 0]
])
addLetter('m', [
  [0, 0, 0, 0, 0],
  [0, 1, 0, 1, 0],
  [1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1]
])
addLetter('n', [
  [0, 0, 0, 0, 0],
  [0, 1, 1, 0, 0],
  [1, 0, 0, 1, 0],
  [1, 0, 0, 1, 0],
  [1, 0, 0, 1, 0]
])
addLetter('o', [
  [0, 0, 0, 0, 0],
  [0, 1, 1, 0, 0],
  [1, 0, 0, 1, 0],
  [1, 0, 0, 1, 0],
  [0, 1, 1, 0, 0]
])
addLetter('p', [
  [0, 0, 0, 0, 0],
  [0, 1, 1, 0, 0],
  [1, 0, 0, 1, 0],
  [1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0]
])
addLetter('q', [
  [0, 0, 0, 0, 0],
  [0, 1, 1, 0, 0],
  [1, 0, 0, 1, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 0, 1, 0]
])
addLetter('r', [
  [0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0]
])
addLetter('s', [
  [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 0],
  [0, 1, 1, 0, 0],
  [0, 0, 0, 1, 0],
  [1, 1, 1, 0, 0]
])
addLetter('t', [
  [0, 1, 0, 0, 0],
  [1, 1, 1, 0, 0],
  [0, 1, 0, 0, 0],
  [0, 1, 0, 0, 1],
  [0, 0, 1, 1, 0]
])
addLetter('u', [
  [0, 0, 0, 0, 0],
  [1, 0, 0, 1, 0],
  [1, 0, 0, 1, 0],
  [1, 0, 0, 1, 0],
  [1, 1, 1, 0, 0]
])
addLetter('v', [
  [0, 0, 0, 0, 0],
  [1, 0, 0, 1, 0],
  [1, 0, 1, 0, 0],
  [1, 1, 0, 0, 0],
  [1, 0, 0, 0, 0]
])
addLetter('w', [
  [0, 0, 0, 0, 0],
  [1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1],
  [0, 1, 0, 1, 0]
])
addLetter('x', [
  [0, 0, 0, 0, 0],
  [1, 0, 0, 1, 0],
  [0, 1, 1, 0, 0],
  [0, 1, 1, 0, 0],
  [1, 0, 0, 1, 0]
])
addLetter('y', [
  [1, 0, 0, 1, 0],
  [1, 0, 0, 1, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 0, 1, 0],
  [1, 1, 1, 0, 0]
])
addLetter('z', [
  [0, 0, 0, 0, 0],
  [1, 1, 1, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 0, 0, 0],
  [1, 1, 1, 1, 0]
])
addLetter('A', [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1]
])
addLetter('B', [
  [1, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 0]
])
addLetter('C', [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1]
])
addLetter('D', [
  [1, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 0]
])
addLetter('E', [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1]
])
addLetter('F', [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0]
])
addLetter('G', [
  [0, 1, 1, 1, 1],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 1, 1],
  [1, 0, 0, 0, 1],
  [0, 1, 1, 1, 1]
])
addLetter('H', [
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1]
])
addLetter('I', [
  [1, 1, 1, 1, 1],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [1, 1, 1, 1, 1]
])
addLetter('J', [
  [1, 1, 1, 1, 1],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [1, 1, 1, 0, 0]
])
addLetter('K', [
  [1, 0, 0, 0, 1],
  [1, 0, 1, 1, 0],
  [1, 1, 0, 0, 0],
  [1, 0, 1, 1, 0],
  [1, 0, 0, 0, 1]
])
addLetter('L', [
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1]
])
addLetter('M', [
  [1, 1, 1, 1, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1]
])
addLetter('N', [
  [1, 0, 0, 0, 1],
  [1, 1, 0, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 1, 1],
  [1, 0, 0, 0, 1]
])
addLetter('O', [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1]
])
addLetter('P', [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0]
])
addLetter('Q', [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 1],
  [0, 0, 0, 0, 1]
])
addLetter('R', [
  [1, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1]
])
addLetter('S', [
  [0, 1, 1, 1, 1],
  [1, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 0, 0, 1],
  [1, 1, 1, 1, 0]
])
addLetter('T', [
  [1, 1, 1, 1, 1],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0]
])
addLetter('U', [
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1]
])
addLetter('V', [
  [1, 0, 0, 0, 1],
  [0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0]
])
addLetter('W', [
  [1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1],
  [0, 1, 0, 1, 0]
])
addLetter('X', [
  [1, 0, 0, 0, 1],
  [0, 1, 0, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 0, 1, 0],
  [1, 0, 0, 0, 1]
])
addLetter('Y', [
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0]
])
addLetter('Z', [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 0, 0, 0],
  [1, 1, 1, 1, 1]
])
addLetter('0', [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 1, 1],
  [1, 0, 1, 0, 1],
  [1, 1, 0, 0, 1],
  [1, 1, 1, 1, 1]
])
addLetter('1', [
  [1, 1, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [1, 1, 1, 1, 1]
])
addLetter('2', [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1]
])
addLetter('3', [
  [1, 1, 1, 1, 0],
  [0, 0, 0, 0, 1],
  [0, 0, 1, 1, 0],
  [0, 0, 0, 0, 1],
  [1, 1, 1, 1, 0]
])
addLetter('4', [
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 1, 0],
  [1, 1, 1, 1, 1],
  [0, 0, 0, 1, 0]
])
addLetter('5', [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0],
  [1, 1, 1, 1, 0],
  [0, 0, 0, 0, 1],
  [1, 1, 1, 1, 0]
])
addLetter('6', [
  [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 0],
  [1, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [0, 1, 1, 1, 0]
])
addLetter('7', [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 1],
  [0, 0, 0, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 0, 0, 0]
])
addLetter('8', [
  [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [0, 1, 1, 1, 0]
])
addLetter('9', [
  [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [0, 1, 1, 1, 1],
  [0, 0, 0, 0, 1],
  [0, 1, 1, 1, 0]
])
addLetter('.', [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0]
])
addLetter(',', [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 1, 0, 0]
])
addLetter(';', [
  [0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 1, 0, 0]
])
addLetter(':', [
  [0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0]
])
addLetter('?', [
  [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [0, 0, 1, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0]
])
addLetter('!', [
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0]
])
addLetter('@', [
  [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0],
  [0, 1, 1, 1, 0]
])
addLetter('£', [
  [0, 1, 1, 1, 0],
  [0, 1, 0, 0, 1],
  [1, 1, 1, 0, 0],
  [0, 1, 0, 0, 0],
  [1, 1, 1, 1, 1]
])
addLetter('$', [
  [0, 1, 1, 1, 1],
  [1, 0, 1, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 1],
  [1, 1, 1, 1, 0]
])
addLetter('%', [
  [1, 1, 0, 0, 1],
  [1, 1, 0, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 0, 1, 1],
  [1, 0, 0, 1, 1]
])
addLetter('^', [
  [0, 0, 1, 0, 0],
  [0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0]
])
addLetter('&', [
  [0, 1, 1, 0, 0],
  [1, 0, 0, 0, 0],
  [0, 1, 0, 1, 1],
  [1, 0, 0, 1, 0],
  [0, 1, 1, 0, 0]
])
addLetter('*', [
  [0, 1, 0, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0]
])
addLetter('(', [
  [0, 0, 0, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0]
])
addLetter(')', [
  [0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 0, 0, 0]
])
addLetter('+', [
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [1, 1, 1, 1, 1],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0]
])
addLetter('-', [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0]
])
addLetter('_', [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1]
])
addLetter('=', [
  [0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0]
])
addLetter(' ', [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0]
])
addLetter('{', [
  [0, 0, 1, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 1, 0]
])
addLetter('}', [
  [0, 1, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 1, 0, 0]
])
addLetter('[', [
  [0, 0, 1, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 1, 0]
])
addLetter(']', [
  [0, 1, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 1, 0, 0]
])
addLetter('\'', [
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0]
])
addLetter('"', [
  [0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0]
])
addLetter('/', [
  [0, 0, 0, 0, 1],
  [0, 0, 0, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 0, 0, 0],
  [1, 0, 0, 0, 0]
])
addLetter('\\', [
  [1, 0, 0, 0, 0],
  [0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0],
  [0, 0, 0, 0, 1]
])
addLetter('|', [
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0]
])
addLetter('<', [
  [0, 0, 0, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0]
])
addLetter('>', [
  [0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 0, 0, 0]
])
addLetter('~', [
  [0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0],
  [1, 0, 1, 0, 1],
  [0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0]
])
addLetter('`', [
  [0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0]
])
addLetter('#', [
  [0, 1, 0, 1, 0],
  [1, 1, 1, 1, 1],
  [0, 1, 0, 1, 0],
  [1, 1, 1, 1, 1],
  [0, 1, 0, 1, 0]
])