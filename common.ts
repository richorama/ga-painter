import delaunator from 'delaunator'

export class Phenotype {
  constructor(values: Uint8ClampedArray) {
    this.values = values
  }
  values: Uint8ClampedArray
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

    const sourceIndex = (4 * 256 * y) + (4 * x)
    const r = sourceData[sourceIndex]
    const g = sourceData[sourceIndex + 1]
    const b = sourceData[sourceIndex + 2]

    ctx.strokeStyle = ctx.fillStyle = `rgb(${r}, ${g}, ${b})`

    ctx.moveTo(values[triangles[i]][0], values[triangles[i]][1])
    ctx.lineTo(values[triangles[i + 1]][0], values[triangles[i + 1]][1])
    ctx.lineTo(values[triangles[i + 2]][0], values[triangles[i + 2]][1])

    ctx.stroke()
    ctx.fill()
  }
}


export const getRgbValues = (sourceData: Uint8ClampedArray, x: number, y: number) => {
  return [
    sourceData[(4 * 256 * y) + (4 * x)],
    sourceData[(4 * 256 * y) + (4 * x) + 1],
    sourceData[(4 * 256 * y) + (4 * x) + 2]]
}


export const standardDeviation = (values: number[]) => {
  const avg = average(values);

  const squareDiffs = values.map(function (value) {
    const diff = value - avg;
    return diff * diff;
  });

  return Math.sqrt(average(squareDiffs));
}

export const average = (data: number[]) => {
  const sum = data.reduce(function (sum, value) {
    return sum + value;
  }, 0);

  return sum / data.length;
}

export const calculateScoreMatrix = (source: Uint8ClampedArray) => {
  const result:number[] = []

  for (let i = 0; i < source.length; i++) {
    result[i] = 1
  }
  let maxVal = 0

  for (let x = 1; x < 255; x++) {
    for (let y = 1; y < 255; y++) {
      const sourceValue = getRgbValues(source, x, y)

      const up = getRgbValues(source, x, y - 1)
      const down = getRgbValues(source, x, y + 1)
      const left = getRgbValues(source, x - 1, y)
      const right = getRgbValues(source, x + 1, y)

      const directions = [
        up, down, left, right, sourceValue
      ]

      const devation =
        standardDeviation(directions.map(x => x[0]))
        + standardDeviation(directions.map(x => x[1]))
        + standardDeviation(directions.map(x => x[2])) + 1

      if (devation > maxVal) maxVal = devation

      result[256 * 4 * y + x * 4] = devation
      result[256 * 4 * y + x * 4 + 1] = devation
      result[256 * 4 * y + x * 4 + 2] = devation
      result[256 * 4 * y + x * 4 + 3] = 255
    }
  }

  for (let i = 0; i < result.length; i += 4) {
    for (let p = 0; p < 3; p++) {
      let val = result[i + p]
      result[i + p] = Math.floor(255.0 * val / maxVal)
    }
  }

  return result
}