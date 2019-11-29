module.exports = {
  entry: {
    app: "./app.ts",
    worker: "./worker.ts"
  },
  output: {
    filename: "[name].min.js"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [{
          loader: 'ts-loader',
        }],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
}