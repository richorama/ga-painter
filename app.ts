import { PointCloud, Point } from "./models";
import { draw, fitnessFunction, explore } from './common'

const targetCtx = (<HTMLCanvasElement>document.getElementById('best')).getContext('2d', { alpha: false })


const getRandomNumber = (limit: number = 256) => Math.floor(Math.random() * limit)

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

image.src = 'target.jpg';


const solution = new PointCloud()
for (let i = 0; i < 50; i++) {
  solution.points.push(new Point(getRandomNumber(), getRandomNumber()))
}

// first, seed with some random points
const go = () => {
  const score = fitnessFunction(solution, sourceData)
  const lowest = score.lowest()
  const total = explore(solution, lowest.x, lowest.y, sourceData)
  draw(solution, targetCtx, sourceData);
  document.getElementById('status').innerText = `${solution.points.length} points, score = ${Math.floor(total)}`
  setTimeout(go, 0)
}