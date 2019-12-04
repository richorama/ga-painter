
import GeneticAlgorithmConstructor from './ga'
import { Phenotype, draw } from './models'

const getRandomNumber = (limit: number = 256) => Math.floor(Math.random() * limit)

const mutationFunction = (phenotype: Phenotype) => {

  const mutationCount = getRandomNumber(10)

  if (getRandomNumber(5) === 1) {
    // make a major mutation
    const position = getRandomNumber(phenotype.values.length / 2)
    phenotype.values[position * 2] = getRandomNumber()
    phenotype.values[position * 2 + 1] = getRandomNumber()
    return phenotype
  }

  // try a minor adjustment
  for (let i = 0; i < mutationCount; i++) {
    const position = getRandomNumber(phenotype.values.length)
    let value = phenotype.values[position]
    value += (getRandomNumber(4) - 2)
    phenotype.values[position] = Math.max(0, Math.min(255, value))
  }

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

const fitnessFunction = (population: Phenotype[]) => {
  return new Promise<number[]>((resolve, reject) => {

    const responses: number[] = []
    let responseCount = 0
    workerPool.forEach(x => x.onmessage = msg => {
      responses[msg.data.index] = msg.data.score
      responseCount += 1
      if (responseCount === population.length) resolve(responses)
    })

    population.forEach((data, index) => {
      workerPool[index % workerPool.length].postMessage({
        data,
        index,
        fitness: true
      })
    })
  })
}


const controlPointCount = 150
const population: Phenotype[] = []
const populationSize = 100
for (var p = 0; p < populationSize; p++) {
  const phenotype = new Phenotype()
  population.push(phenotype)
  for (var i = 0; i < controlPointCount * 2; i++) {
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
let generations = 0
let lastGenerations = 0
let generationsPerSecond = 0
let lastBest = 0

setInterval(() => {
  generationsPerSecond = generations - lastGenerations
  lastGenerations = generations
}, 1000)



const go = () => {
  ga.evolve().then(() => {
    generations += 1
    const best = ga.best()
    if (best !== lastBest) {
      draw(best, targetCtx, sourceData)
      lastBest = best
    }
    document.getElementById('status').innerText = `${generations} generations (${generationsPerSecond}/sec) score = ${ga.bestScore()}`
    setTimeout(go, 0)
  })
}


const workerPool: Worker[] = []

const initialiseWorkerPool = (data: Uint8ClampedArray) => {
  for (let i = 0; i < navigator.hardwareConcurrency; i++) {
    const worker = new Worker('dist/worker.min.js')
    workerPool.push(worker)
    worker.postMessage({
      init: true,
      data
    })
  }
}

const targetCtx = (<HTMLCanvasElement>document.getElementById('best')).getContext('2d', { alpha: false })

const image = new Image();
let sourceData: Uint8ClampedArray

image.onload = function () {
  const canvas = <HTMLCanvasElement>document.getElementById('target')
  const ctx = canvas.getContext("2d", { alpha: false })
  ctx.drawImage(image, 0, 0, 256, 256)
  sourceData = ctx.getImageData(0, 0, 256, 256).data
  initialiseWorkerPool(sourceData)
  go()
}


image.src = 'target.jpg';