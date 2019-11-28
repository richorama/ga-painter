
import GeneticAlgorithmConstructor from 'geneticalgorithm'

class Phenotype {
  constructor() {
    this.values = []
  }
  values: number[]
}

const getRandomNumber = (limit: number = 256) => Math.floor(Math.random() * limit)

const mutationFunction = (phenotype: Phenotype) => {
  const position = getRandomNumber(phenotype.values.length)
  phenotype.values[position] = getRandomNumber()
  return phenotype
}

const crossoverFunction = (solutionA: Phenotype, solutionB: Phenotype) => {
  const swapPosition = getRandomNumber(solutionA.values.length)

  const resultA = new Phenotype()
  const resultB = new Phenotype()
  for (let i = 0; i < solutionA.values.length; i++) {
    const a = solutionA.values[i]
    const b = solutionB.values[i]
    if (i < swapPosition) {
      resultA.values.push(a)
      resultB.values.push(b)
    }
    else {
      resultA.values.push(b)
      resultB.values.push(a)
    }
  }
  return [resultA, resultB]
}

const draw = (phenotype: Phenotype, ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, 256, 256)
  let position = 0
  const nextValue = () => phenotype.values[position++]
  while (position < phenotype.values.length) {
    ctx.beginPath()
    ctx.moveTo(nextValue(), nextValue())
    ctx.lineTo(nextValue(), nextValue())
    ctx.lineTo(nextValue(), nextValue())
    ctx.closePath()
    ctx.fillStyle = `rgba(${nextValue()}, ${nextValue()}, ${nextValue()}, ${nextValue() / 255})`
    ctx.fill();
  }
}

const fitnessFunction = (phenotype: Phenotype) => {
  const canvas = <HTMLCanvasElement>document.getElementById('canvas')
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


const triangleCount = 50
const population: Phenotype[] = []
const populationSize = 100
for (var p = 0; p < populationSize; p++) {
  const phenotype = new Phenotype()
  population.push(phenotype)
  for (var i = 0; i < triangleCount * 10; i++) {
    phenotype.values.push(getRandomNumber())
  }
}

const config = {
  mutationFunction,
  crossoverFunction,
  fitnessFunction,
  population,
  populationSize
}

let ga = GeneticAlgorithmConstructor(config)

const go = () => {
  requestAnimationFrame(() => {
    ga.evolve()
    console.log(ga.bestScore())

    const best = ga.best()
    draw(best, targetCtx)
    go()
  })
}


const targetCtx = (<HTMLCanvasElement>document.getElementById('best')).getContext('2d')

const image = new Image();
let sourceData: Uint8ClampedArray

image.onload = function () {
  const canvas = <HTMLCanvasElement>document.getElementById('target')
  const ctx = canvas.getContext("2d")
  ctx.drawImage(image, 0, 0, 256, 256)
  sourceData = ctx.getImageData(0, 0, 256, 256).data
  go()
}

image.src = 'target.jpg';