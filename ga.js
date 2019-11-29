module.exports = function geneticAlgorithmConstructor(options) {

    let values = {}
    function settingDefaults() {
        return {
            mutationFunction: function (phenotype) { return phenotype },
            crossoverFunction: function (a, b) { return [a, b] },
            fitnessFunction: function (phenotype) { return 0 },
            population: [],
            populationSize: 100,
        }
    }

    function settingWithDefaults(settings, defaults) {
        settings = settings || {}

        settings.mutationFunction = settings.mutationFunction || defaults.mutationFunction
        settings.crossoverFunction = settings.crossoverFunction || defaults.crossoverFunction
        settings.fitnessFunction = settings.fitnessFunction || defaults.fitnessFunction

        settings.population = settings.population || defaults.population
        if (settings.population.length <= 0) throw Error("population must be an array and contain at least 1 phenotypes")

        settings.populationSize = settings.populationSize || defaults.populationSize
        if (settings.populationSize <= 0) throw Error("populationSize must be greater than 0")

        return settings
    }

    var settings = settingWithDefaults(options, settingDefaults())

    function cloneJSON(object) {
        return JSON.parse(JSON.stringify(object))
    }

    async function compete() {
        var nextGeneration = []

        const fitness = await settings.fitnessFunction(settings.population)
        const maxValue = Math.max(...fitness)
        let minValue = Math.min(...fitness)
        if (maxValue === minValue) minValue -= 1
        const normalisedFitness = fitness.map(x => (x - minValue) / (maxValue - minValue))
        const total = normalisedFitness.reduce((a, b) => a + b, 0)

        const getByFitness = value => {
            let subTotal = 0
            for (var i = 0; i < normalisedFitness.length; i++) {
                subTotal += normalisedFitness[i]
                if (subTotal > value) return settings.population[i]
            }
            console.log('not found by fitness')
            return settings.population[0]
        }

        // always keep the fittest
        const fittest = settings.population[fitness.indexOf(maxValue)]
        values.best = fittest
        values.bestScore = maxValue
        if (fittest) {
            nextGeneration.push(fittest)
            nextGeneration.push(fittest)
        }
        if (!fittest) console.log('fittest is null')
        while (nextGeneration.length < settings.population.length) {
            const a = getByFitness(Math.random() * total)
            const b = getByFitness(Math.random() * total)
            const [nextA, nextB] = settings.crossoverFunction(a, b)

            nextGeneration.push(settings.mutationFunction(nextA))
            nextGeneration.push(settings.mutationFunction(nextB))
        }

        settings.population = nextGeneration;
    }



    function randomizePopulationOrder() {

        for (var index = 0; index < settings.population.length; index++) {
            var otherIndex = Math.floor(Math.random() * settings.population.length)
            var temp = settings.population[otherIndex]
            settings.population[otherIndex] = settings.population[index]
            settings.population[index] = temp
        }
    }

    return {
        evolve: async function (options) {

            if (options) {
                settings = settingWithDefaults(options, settings)
            }

            //populate()
            //randomizePopulationOrder()
            await compete()
            return this
        },
        best: function () {
            return values.best
        },
        bestScore: function () {
            return values.bestScore
        },
        population: function () {
            return cloneJSON(this.config().population)
        },
        scoredPopulation: function () {
            return this.population().map(function (phenotype) {
                return {
                    phenotype: cloneJSON(phenotype),
                    score: settings.fitnessFunction(phenotype)
                }
            })
        },
        config: function () {
            return cloneJSON(settings)
        },
        clone: function (options) {
            return geneticAlgorithmConstructor(
                settingWithDefaults(options,
                    settingWithDefaults(this.config(), settings)
                )
            )
        }
    }
}
