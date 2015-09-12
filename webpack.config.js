var webpack = require("webpack");

module.exports = {
  devtool: 'source-map',

  context: __dirname + '/src',
  entry: {
    main: './main.ts',
    obj: './lowpoly.ts'
  },
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
    path: __dirname,
    filename: "[name].bundle.js"
  },
  plugins: [
    new webpack.ProvidePlugin({
      THREE: __dirname + "/src/lib/three"
    })
  ],
  devServer: {
    contentBase: ".",
    noInfo: true,
    hot: true,
    inline: true,
    port: 9000
  }
}