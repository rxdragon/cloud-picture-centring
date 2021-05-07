const path = require('path')

module.exports = {
  entry: [
    './src/background-main.js'
  ],
  target: 'node',
  devtool: 'source-map',
  output: {
    filename: 'background-main.js',
    path: path.resolve(__dirname, 'dist_vue')
  },
  externals: {
    'electron': 'require("electron")',
    'original-fs': 'require("original-fs")'
  }
}
