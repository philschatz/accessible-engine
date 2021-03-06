export const LETTERS: Map<string, number[][]> = new Map()
function addLetter (c: string, bits: number[][]) {
  LETTERS.set(c, bits)
}

addLetter('A', [
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 1],
  [1, 0, 1],
  [1, 0, 1]
])

addLetter('B', [
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 0],
  [1, 0, 1],
  [1, 1, 1]
])

addLetter('C', [
  [0, 1, 1],
  [1, 0, 0],
  [1, 0, 0],
  [1, 0, 0],
  [0, 1, 1]
])

addLetter('D', [
  [1, 1, 0],
  [1, 0, 1],
  [1, 0, 1],
  [1, 0, 1],
  [1, 1, 1]
])

addLetter('E', [
  [1, 1, 1],
  [1, 0, 0],
  [1, 1, 0],
  [1, 0, 0],
  [1, 1, 1]
])

addLetter('F', [
  [1, 1, 1],
  [1, 0, 0],
  [1, 1, 0],
  [1, 0, 0],
  [1, 0, 0]
])

addLetter('G', [
  [0, 1, 1],
  [1, 0, 0],
  [1, 0, 0],
  [1, 0, 1],
  [1, 1, 1]
])

addLetter('H', [
  [1, 0, 1],
  [1, 0, 1],
  [1, 1, 1],
  [1, 0, 1],
  [1, 0, 1]
])

addLetter('I', [
  [1, 1, 1],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [1, 1, 1]
])

addLetter('J', [
  [1, 1, 1],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [1, 1, 0]
])

addLetter('K', [
  [1, 0, 1],
  [1, 0, 1],
  [1, 1, 0],
  [1, 0, 1],
  [1, 0, 1]
])

addLetter('L', [
  [1, 0, 0],
  [1, 0, 0],
  [1, 0, 0],
  [1, 0, 0],
  [1, 1, 1]
])

addLetter('M', [
  [1, 1, 1],
  [1, 1, 1],
  [1, 0, 1],
  [1, 0, 1],
  [1, 0, 1]
])

addLetter('N', [
  [1, 1, 0],
  [1, 0, 1],
  [1, 0, 1],
  [1, 0, 1],
  [1, 0, 1]
])

addLetter('O', [
  [0, 1, 1],
  [1, 0, 1],
  [1, 0, 1],
  [1, 0, 1],
  [1, 1, 0]
])

addLetter('P', [
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 1],
  [1, 0, 0],
  [1, 0, 0]
])

addLetter('Q', [
  [0, 1, 0],
  [1, 0, 1],
  [1, 0, 1],
  [1, 1, 0],
  [0, 1, 1]
])

addLetter('R', [
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 0],
  [1, 0, 1],
  [1, 0, 1]
])

addLetter('S', [
  [0, 1, 1],
  [1, 0, 0],
  [1, 1, 1],
  [0, 0, 1],
  [1, 1, 0]
])

addLetter('T', [
  [1, 1, 1],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0]
])

addLetter('U', [
  [1, 0, 1],
  [1, 0, 1],
  [1, 0, 1],
  [1, 0, 1],
  [0, 1, 1]
])

addLetter('V', [
  [1, 0, 1],
  [1, 0, 1],
  [1, 0, 1],
  [1, 0, 1],
  [0, 1, 0]
])

addLetter('W', [
  [1, 0, 1],
  [1, 0, 1],
  [1, 0, 1],
  [1, 1, 1],
  [1, 1, 1]
])

addLetter('X', [
  [1, 0, 1],
  [1, 0, 1],
  [0, 1, 0],
  [1, 0, 1],
  [1, 0, 1]
])

addLetter('Y', [
  [1, 0, 1],
  [1, 0, 1],
  [0, 1, 1],
  [0, 0, 1],
  [1, 1, 1]
])

addLetter('Z', [
  [1, 1, 1],
  [0, 0, 1],
  [0, 1, 0],
  [1, 0, 0],
  [1, 1, 1]
])

addLetter(' ', [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0]
])

addLetter('.', [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 1, 0]
])

addLetter(',', [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 1, 0],
  [1, 0, 0]
])

addLetter('!', [
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 0, 0],
  [0, 1, 0]
])

addLetter('?', [
  [1, 1, 1],
  [0, 0, 1],
  [0, 1, 1],
  [0, 0, 0],
  [0, 1, 0]
])

addLetter('.', [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 1, 0]
])

addLetter('0', [
  [1, 1, 1],
  [1, 0, 1],
  [1, 0, 1],
  [1, 0, 1],
  [1, 1, 1]
])

addLetter('1', [
  [1, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [1, 1, 1]
])

addLetter('2', [
  [1, 1, 1],
  [0, 0, 1],
  [1, 1, 1],
  [1, 0, 0],
  [1, 1, 1]
])

addLetter('3', [
  [1, 1, 1],
  [0, 0, 1],
  [0, 1, 1],
  [0, 0, 1],
  [1, 1, 1]
])

addLetter('4', [
  [1, 0, 1],
  [1, 0, 1],
  [1, 1, 1],
  [0, 0, 1],
  [0, 0, 1]
])

addLetter('5', [
  [1, 1, 1],
  [1, 0, 0],
  [1, 1, 1],
  [0, 0, 1],
  [1, 1, 1]
])

addLetter('6', [
  [1, 0, 0],
  [1, 0, 0],
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 1]
])

addLetter('7', [
  [1, 1, 1],
  [0, 0, 1],
  [0, 0, 1],
  [0, 0, 1],
  [0, 0, 1]
])

addLetter('8', [
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 1]
])

addLetter('9', [
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 1],
  [0, 0, 1],
  [0, 0, 1]
])

addLetter('-', [
  [0, 0, 0],
  [0, 0, 0],
  [1, 1, 1],
  [0, 0, 0],
  [0, 0, 0]
])

addLetter('', [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0]
])
