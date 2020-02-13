const fs = require('fs')
const {PNG} = require('pngjs')


const map = new Map()

fs.createReadStream('akurra-tiles.png')
.pipe(new PNG({
    filterType: 4
}))
.on('parsed', function() {
    const colors = []
    const pixels = []

    for (var y = 0; y < this.height; y++) {
        const row = []
        for (var x = 0; x < this.width; x++) {
            var idx = (this.width * y + x) << 2;
            const alpha = this.data[idx+3]
            if (alpha === 0) {
              row.push(null)
            } else {
                const r = this.data[idx]
                const g = this.data[idx+1]
                const b = this.data[idx+2]

                let rawHex = rgbToHex(r, g, b)
                if (map.has(rawHex)) {
                  rawHex = map.get(rawHex)
                }
                const normalizedHex = getOrAdd(colors, rawHex)
                row.push(normalizedHex)
            }
        }
        pixels.push(row)
    }

    console.log(`UNIQUE_COLORS_COUNT=${colors.length}`)
    colors.forEach(c1 => {
      const rgb1 = hexToRgb(c1)

      let closestColor = []
      let closestDistance = Number.POSITIVE_INFINITY
      colors.forEach(c2 => {
        if (c1 === c2) {
          return
        }
        const diff = similarity(rgb1, hexToRgb(c2))
        if (diff < 40) {
          closestColor.push(c2)
          closestDistance = diff
        } else if (diff === closestDistance && closestColor.indexOf(c2) < 0) {
          closestColor.push(c2)
        }
      })


      closestColor.forEach(c => {
        if (!map.has(c)) {
          map.set(c, c1)
          // console.log(`map.set('${c}', '${c1}') // dist=${closestDistance}`)
        }
      })

    })

    console.log(`END MAP_KEYS_COUNT=${[...map.keys()].length}`)
    console.log(`END MAP_VALUES_COUNT=${[...new Set(map.values())].length}`)

    // Clean up the PNG file so that the colorspace is smaller
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
          var idx = (this.width * y + x) << 2;
          const alpha = this.data[idx+3]
          if (alpha === 0) {
          } else {
              const r = this.data[idx]
              const g = this.data[idx+1]
              const b = this.data[idx+2]

              let rawHex = rgbToHex(r, g, b)
              if (map.has(rawHex)) {
                rawHex = map.get(rawHex)
              }

              const rgb = hexToRgb(rawHex)

              this.data[idx+0] = rgb.r
              this.data[idx+1] = rgb.g
              this.data[idx+2] = rgb.b
          }
      }
  }

  this.pack().pipe(fs.createWriteStream('akurra-tiles-reduced.png'))

  fs.writeFileSync('pixels.json', JSON.stringify({colors, pixels}))


  // Output code for each of the sprites. Use single-letter variables (lower/uppercase) for the colors
  const sprites = [
    ['Sand', 'Rock', 'Bush', 'GongDisabled', 'WallTopRightDown'],
    ['SandEdge', 'Box', 'GongRed', 'PillarRed', 'WallTopUpDown', 'Key'],
    ['Land', 'Lock', 'ArrowLeft', 'WallTopLeftRight', 'WallTopUpLeft', 'Pedestal'],
    ['LandCorner', 'LandBottom', 'ArrowLeftDisabled', 'Wall', 'WallVert', 'PlayerStandDown']
  ]
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY' // Z is null

  console.log(`const Z = null // transparent`)
  colors.forEach((hex, index) => {
    const letter = letters[index]
    console.log(`const ${letter} = '${hex}'`)
  })

  sprites.forEach((spriteRow, yy) => {
    spriteRow.forEach((spriteName, xx) => {
      const out = [`images.add('${spriteName}', new Image([`]

      for (let y = 0; y < 16; y++) {
        let row = '  ['
        for (let x = 0; x < 16; x++) {
          const colorIndex = pixels[yy * 16 + y][xx * 16 + x]
          let letter
          if (colorIndex === null) {
            letter = 'Z'
          } else {
            letter = letters[colorIndex]
          }

          if (!letter) { throw new Error(`Could not find color for ${colorIndex}. yy=${yy} xx=${xx} y=${y} x=${x}`)}

          row = `${row} ${letter},`
        }
        row = `${row} ],`
        
        out.push(row)
      }
      out.push(']))')

      console.log(out.join('\n'))
    })
  })
});


function getOrAdd(ary, item) {
  let i = ary.indexOf(item)
  if (i >= 0) {
    return i
  }
  i = ary.length
  ary.push(item)
  return i
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function similarity(c1, c2) {
  return Math.abs(c1.r - c2.r) +
    Math.abs(c1.g - c2.g) +
    Math.abs(c1.b - c2.b)
}