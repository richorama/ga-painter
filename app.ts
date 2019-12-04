
import Ga from './ga'
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

  const resultA = new Phenotype(new Uint8ClampedArray(solutionA.values.length))
  const resultB = new Phenotype(new Uint8ClampedArray(solutionA.values.length))
  for (let i = 0; i < solutionA.values.length; i++) {
    const a = solutionA.values[i]
    const b = solutionB.values[i]
    if (i < swapPosition) {
      resultA.values[i] = a
      resultB.values[i] = b
    }
    else {
      resultA.values[i] = b
      resultB.values[i] = a
    }
  }
  return [resultA, resultB]
}

const fitnessFunction = (population: Phenotype[]) => {
  return new Promise<number[]>((resolve) => {

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


const controlPointCount = 200
const population: Phenotype[] = []
const populationSize = 100
for (var p = 0; p < populationSize; p++) {
  const phenotype = new Phenotype(new Uint8ClampedArray(controlPointCount * 2))
  population.push(phenotype)
  for (var i = 0; i < controlPointCount * 2; i++) {
    phenotype.values[i] = getRandomNumber()
  }
}

let ga = new Ga<Phenotype>(fitnessFunction, crossoverFunction, mutationFunction, population)
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
    const best = ga.getBestScore()
    if (best !== lastBest) {
      draw(ga.getBest(), targetCtx, sourceData)
      lastBest = best
    }
    document.getElementById('status').innerText = `${generations} generations (${generationsPerSecond}/sec) score = ${best}`
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