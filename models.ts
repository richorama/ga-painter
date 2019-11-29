export class Phenotype {
  constructor() {
    this.values = []
  }
  values: number[]
}

export const draw = (phenotype: Phenotype, ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => {
  ctx.fillStyle = `rgb(0,0,0)`
  ctx.fillRect(0, 0, 256, 256)
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
