import delaunator from 'delaunator'

export class Phenotype {
  constructor() {
    this.values = []
  }
  values: number[]
}

export const draw = (phenotype: Phenotype, ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, sourceData: Uint8ClampedArray) => {

  let position = 0

  const values: Array<Array<number>> = []
  while (position < phenotype.values.length) {
    values.push([phenotype.values[position++], phenotype.values[position++]])
  }

  const { triangles } = delaunator.from(values)

  ctx.fillStyle = `rgb(0,0,0)`
  ctx.fillRect(0, 0, 256, 256)

  for (let i = 0; i < triangles.length; i += 3) {
    ctx.beginPath()
    let x = 0;
    let y = 0;
    for (let j = 0; j < 3; j++) {
      x += values[triangles[i + j]][0]
      y += values[triangles[i + j]][1]
    }
    x = Math.floor(x / 3)
    y = Math.floor(y / 3)

    const r = sourceData[(4 * 256 * y) + (4 * x)]
    const g = sourceData[(4 * 256 * y) + (4 * x) + 1]
    const b = sourceData[(4 * 256 * y) + (4 * x) + 2]

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
    //ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`

    ctx.moveTo(values[triangles[i]][0], values[triangles[i]][1])
    ctx.lineTo(values[triangles[i + 1]][0], values[triangles[i + 1]][1])
    ctx.lineTo(values[triangles[i + 2]][0], values[triangles[i + 2]][1])
    ctx.closePath()


    ctx.fill();
  }
}
