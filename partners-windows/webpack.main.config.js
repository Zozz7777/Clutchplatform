const path = require('path');

module.exports = {
  mode: 'production',
  entry: './main/main.ts',
  target: 'electron-main',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              noEmit: false,
            },
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'main'),
  },
  node: {
    __dirname: false,
    __filename: false,
  },
};