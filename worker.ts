import { Phenotype, draw } from "./models"

let sourceData: Uint8ClampedArray = null

onmessage = msg => {
  if (msg.data.init) {
    sourceData = msg.data.data
  }
  if (msg.data.fitness) {
    const score = fitnessFunction(msg.data.data)
    postMessage({
      score,
      index: msg.data.index
    }, null)
  }
}

const canvas = new OffscreenCanvas(256, 256)
const ctx = canvas.getContext("2d", { alpha: false })

const fitnessFunction = (phenotype: Phenotype) => {

  draw(phenotype, ctx, sourceData)

  let score = 0
  const pix = ctx.getImageData(0, 0, 256, 256).data
  for (let x = 1; x < 255; x++) {
    for (let y = 1; y < 255; y++) {
      const renderedValue = getRgbValues(pix, x, y)
      const sourceValue = getRgbValues(sourceData, x, y)

      let delta = 0
      for (let col = 0; col < 3; col++) {
        delta += Math.abs(renderedValue[col] - sourceValue[col])
      }

      const up = getRgbValues(sourceData, x, y - 1)
      const down = getRgbValues(sourceData, x, y + 1)
      const left = getRgbValues(sourceData, x - 1, y)
      const right = getRgbValues(sourceData, x + 1, y)

      const directions = [
        up, down, left, right, sourceValue
      ]

      const devation =
        standardDeviation(directions.map(x => x[0]))
        + standardDeviation(directions.map(x => x[1]))
        + standardDeviation(directions.map(x => x[2]))

      //const delta = Math.abs(sourceData[i + p] - pix[i + p])
      score -= (delta * devation)
    }
  }
  for (let i = 0, n = pix.length; i < n; i += 4) {
    for (let p = 0; p < 3; p++) {
      const delta = Math.abs(sourceData[i + p] - pix[i + p])
      score -= (delta * delta)
    }
  }
  return score
}

const getRgbValues = (sourceData: Uint8ClampedArray, x: number, y: number) => {
  return [
    sourceData[(4 * 256 * y) + (4 * x)],
    sourceData[(4 * 256 * y) + (4 * x) + 1],
    sourceData[(4 * 256 * y) + (4 * x) + 2]]
}


function standardDeviation(values: number[]) {
  const avg = average(values);

  const squareDiffs = values.map(function (value) {
    const diff = value - avg;
    return diff * diff;
  });

  return Math.sqrt(average(squareDiffs));
}

function average(data: number[]) {
  const sum = data.reduce(function (sum, value) {
    return sum + value;
  }, 0);

  return sum / data.length;
}


console.log('worker ready')
