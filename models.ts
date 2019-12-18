export class Point {
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
  x: number
  y: number
}

export class PointCloud {
  constructor() {
    this.points = []
  }
  points: Point[]
}

export class GridScore {
  constructor(x: number, y: number, score: number) {
    this.x = x
    this.y = y
    this.score = score
  }
  x: number
  y: number
  score: number
}

export class Score {
  constructor() {
    this.scores = []
  }
  scores: GridScore[]
  total() {
    return this.scores.map(x => x.score).reduce((a, b) => a + b, 0)
  }
  lowest() {
    let lowest = this.scores[0]
    for (let i = 1; i < this.scores.length; i++) {
      if (this.scores[i].score < lowest.score) lowest = this.scores[i]
    }
    return lowest
  }
}