const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const Dotenv = require('dotenv-webpack');

module.exports = {
  devtool: "source-map",
  stats: {
    all: false,
    errors: true,
    builtAt: true,
  },
  module: {
    rules: [
      {
        test: /\.s(c|a)ss$/,
        use: [
          "vue-style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            // Requires sass-loader@^7.0.0
            options: {
              implementation: require("sass"),
              indentedSyntax: true, // optional
            },
            // Requires sass-loader@^8.0.0
            options: {
              implementation: require("sass"),
              sassOptions: {
                indentedSyntax: true, // optional
              },
            },
          },
        ],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: "url-loader?limit=25000",
      },
      {
        test: /\.css$/,
        use: ["vue-style-loader", MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          loaders: {},
          // other vue-loader options go here
        },
      },
    ],
  },
  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm.js",
    },
  },
  plugins: [
    // Extract CSS into separate files
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new VueLoaderPlugin(),
    new Dotenv()
  ],
  entry: {
    popup: "./popup.js",
    background: "./background.js",
    content: "./content.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "build"),
  },
};
