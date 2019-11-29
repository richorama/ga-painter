import { Phenotype, draw } from "./models"

let sourceData:Uint8ClampedArray = null

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

const fitnessFunction = (phenotype: Phenotype) => {
  const canvas = new OffscreenCanvas(256, 256)
  const ctx = canvas.getContext("2d")

  draw(phenotype, ctx)

  let score = 0
  const pix = ctx.getImageData(0, 0, 256, 256).data
  for (let i = 0, n = pix.length; i < n; i += 4) {
    for (let p = 0; p < 3; p++) {
      score -= Math.abs(sourceData[i + p] - pix[i + p])
    }
  }
  return score
}



console.log('worker ready')
