const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv-webpack')

module.exports = {
  module: {
    rules: [
      {
        test: /\.s(c|a)ss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            // Requires sass-loader@^7.0.0
            options: {
              implementation: require('sass'),
              indentedSyntax: true // optional
            },
            // Requires sass-loader@^8.0.0
            options: {
              implementation: require('sass'),
              sassOptions: {
                indentedSyntax: true // optional
              },
            },
          },
        ],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: 'url-loader?limit=25000'
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ]
  }, 
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  plugins: [
    // Extract CSS into separate files
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new Dotenv()
  ],
  entry: './content.js',
  output: {
    filename: 'newc.js',
    path: path.resolve(__dirname, 'build/dist'),
  }
};