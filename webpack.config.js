var webpack = require("webpack");

module.exports = {
  devtool: 'source-map',

  context: __dirname + '/src',
  entry: './main.ts',
  resolve: {
    extensions: ['', '.ts', '.js']
  },
  module: {
    loaders: [
      { test: /\.json$/, loader: 'json' },
      { test: /\.css$/, loader: 'raw' },
      { test: /\.html$/, loader: 'raw' },
      { test: /\.ts$/, loader: 'typescript-simple-loader' }
    ]
  },
  output: {
    path: __dirname + '/website',
    filename: "bundle.js"
  },
  plugins: [
    new webpack.ProvidePlugin({
      THREE: "three"
    })
  ]
}