import { PointCloud, Score, GridScore, Point } from "./models"
import delaunator from 'delaunator'

export const draw = (pointCloud: PointCloud, ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, sourceData: Uint8ClampedArray) => {

  const values: Array<Array<number>> = pointCloud.points.map(x => [x.x, x.y])

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

const getRgbValues = (sourceData: Uint8ClampedArray, x: number, y: number) => {
  return [
    sourceData[(4 * 256 * y) + (4 * x)],
    sourceData[(4 * 256 * y) + (4 * x) + 1],
    sourceData[(4 * 256 * y) + (4 * x) + 2]]
}

const stride = 16;
const canvas = new OffscreenCanvas(256, 256)
const ctx = canvas.getContext("2d", { alpha: false })

export const fitnessFunction = (pointCloud: PointCloud, sourceData: Uint8ClampedArray) => {

  draw(pointCloud, ctx, sourceData)

  const pix = ctx.getImageData(0, 0, 256, 256).data

  const score = new Score()

  for (let xBlock = 0; xBlock < stride; xBlock++) {
    for (let yBlock = 0; yBlock < stride; yBlock++) {
      let subTotal = 0
      for (let x = 0; x < stride; x++) {
        for (let y = 0; y < stride; y++){

          const sourceValues = getRgbValues(sourceData, xBlock * stride + x, yBlock * stride + y)
          const renderedValues = getRgbValues(pix, xBlock * stride + x, yBlock * stride + y)

          let sub = 0;
          for (let i = 0; i < 3; i++) {
            sub += Math.pow(sourceValues[0] - renderedValues[0], 2)
          }
          subTotal -= Math.sqrt(sub)
        }
      }

      score.scores.push(new GridScore(xBlock, yBlock, subTotal))
    }
  }

  return score
}

export const explore = (pointCloud: PointCloud, xBlock: number, yBlock: number, sourceData: Uint8ClampedArray) => {
  const nextPoint = new Point(0,0)
  pointCloud.points.push(nextPoint)
  let bestX = 0
  let bestY = 0
  let bestScore = Number.MIN_SAFE_INTEGER
  for (let x = 0; x < stride; x++) {
    for (let y = 0; y < stride; y++) {
      nextPoint.x = xBlock * stride + x
      nextPoint.y = yBlock * stride + y

      const score = fitnessFunction(pointCloud, sourceData)
      const total = score.total()
      if (total > bestScore) {
        bestX = nextPoint.x
        bestY = nextPoint.y
        bestScore = total
      }
    }
  }
  nextPoint.x = bestX
  nextPoint.y = bestY
  return bestScore
}