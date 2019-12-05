import { Phenotype, draw, calculateScoreMatrix } from "./common"

let sourceData: Uint8ClampedArray = null
let scoreMatrix: number[]

onmessage = msg => {
  if (msg.data.init) {
    sourceData = msg.data.data
    scoreMatrix = calculateScoreMatrix(sourceData)
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

  for (let i = 0, n = pix.length; i < n; i += 4) {
    for (let p = 0; p < 3; p++) {
      const deviation = scoreMatrix[i]
      const delta = Math.abs(sourceData[i + p] - pix[i + p])
      score -= (delta * deviation)
    }
  }
  return score
}


console.log('worker ready')
