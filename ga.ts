
export default class Ga<T> {
    fitnessFunction: (population: T[]) => Promise<number[]>
    crossoverFunction: (a: T, b: T) => T[]
    mutationFunction: (phenotype: T) => T
    population: T[]
    best: T
    bestScore: number = Number.MIN_SAFE_INTEGER

    constructor(
        fitnessFunction: (population: T[]) => Promise<number[]>,
        crossoverFunction: (a: T, b: T) => T[],
        mutationFunction: (phenotype: T) => T,
        seedPopulation: T[]) {
        this.fitnessFunction = fitnessFunction
        this.crossoverFunction = crossoverFunction
        this.mutationFunction = mutationFunction
        this.population = seedPopulation
    }

    getBest() {
        return this.best
    }

    getBestScore() {
        return this.bestScore
    }

    async evolve() {
        const nextGeneration: T[] = [];

        const fitness = await this.fitnessFunction(this.population)
        const maxValue = Math.max(...fitness)
        let minValue = Math.min(...fitness)
        if (maxValue === minValue) minValue -= 1
        const normalisedFitness = fitness.map(x => (x - minValue) / (maxValue - minValue))
        const total = normalisedFitness.reduce((a, b) => a + b, 0)

        const getByFitness = (value: Number) => {
            let subTotal = 0
            for (var i = 0; i < normalisedFitness.length; i++) {
                subTotal += normalisedFitness[i]
                if (subTotal > value) return this.population[i]
            }
            console.log('not found by fitness')
            return this.population[0]
        }

        const bestOfGeneration = this.population[fitness.indexOf(maxValue)]

        // always keep track of the fittest
        if (maxValue > this.bestScore) {
            this.best = bestOfGeneration
            this.bestScore = maxValue
        }

        if (this.best) {
            nextGeneration.push(this.mutationFunction(this.best)) // always preserve the best
            nextGeneration.push(this.mutationFunction(bestOfGeneration))
        }
        else {
            nextGeneration.push(this.mutationFunction(bestOfGeneration))
            nextGeneration.push(this.mutationFunction(bestOfGeneration))
        }

        while (nextGeneration.length < this.population.length) {
            const a = getByFitness(Math.random() * total)
            const b = getByFitness(Math.random() * total)
            const [nextA, nextB] = this.crossoverFunction(a, b)

            nextGeneration.push(this.mutationFunction(nextA))
            nextGeneration.push(this.mutationFunction(nextB))
        }

        this.population = nextGeneration;
    }

}
