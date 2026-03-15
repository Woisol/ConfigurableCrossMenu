const path = require('path');

module.exports = {
  entry: './ts/index.ts',
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: 'configable-cross-menu.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    library: {
      name: 'ConfigableCrossMenu',
      type: 'umd',
    },
    globalObject: 'this',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};