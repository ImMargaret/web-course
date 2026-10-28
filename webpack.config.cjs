const path = require('node:path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = (_, argv) => ({
  entry: './src/main.jsx',
  output: { path: path.resolve(__dirname, 'docs'), filename: 'assets/app.[contenthash:8].js', publicPath: './', clean: true },
  devtool: argv.mode === 'production' ? false : 'eval-source-map',
  module: { rules: [
    { test: /\.jsx?$/, exclude: /node_modules/, use: { loader: 'babel-loader', options: { envName: argv.mode || 'development', presets: [['@babel/preset-react', { runtime: 'automatic', development: argv.mode !== 'production' }]] } } },
    { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
    { test: /\.(svg|png|jpe?g|webp)$/, type: 'asset/inline' },
  ] },
  plugins: [new HtmlWebpackPlugin({ template: './index.html', scriptLoading: 'defer' }), new MiniCssExtractPlugin({ filename: 'assets/style.[contenthash:8].css' })],
  resolve: { extensions: ['.js', '.jsx', '.mjs'] },
  devServer: { host: '0.0.0.0', port: Number(process.env.PORT || 3000), allowedHosts: 'all', hot: true, historyApiFallback: false, client: { overlay: true } },
  performance: { hints: false },
});
