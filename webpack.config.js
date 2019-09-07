"use strict";

const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: "./app/main.ts",
  output: {
    path: __dirname + "/server/public",
    filename: "js/app.js"
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"]
  },
  module: {
    rules: [
      // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
      { test: /\.tsx?$/, use: ["ts-loader"], exclude: /node_modules/ }
    ]
  },
  plugins: [
    new CopyPlugin([
      { from: "node_modules/@fortawesome/fontawesome-free/css/all.min.css", to: "css" },
      { from: "node_modules/@fortawesome/fontawesome-free/js/all.min.js", to: "js" },
      { from: "node_modules/@fortawesome/fontawesome-free/webfonts", to: "webfonts" },
      { from: "node_modules/bootstrap/dist/css/bootstrap.min.css", to: "css" },
      { from: "node_modules/bootstrap/dist/css/bootstrap-grid.min.css", to: "css" },
      { from: "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js", to: "js" },
      { from: "node_modules/jquery/dist/jquery.min.js", to: "js" },
      { from: "node_modules/react-bootstrap-typeahead/css/Typeahead-bs4.min.css", to: "css" },
      { from: "node_modules/vis-network/dist/img", to: "css/img" },
      { from: "node_modules/vis-network/dist/vis-network.min.css", to: "css" },
      { from: "node_modules/vis-network/dist/vis-network.min.js", to: "js" },
      { from: "app/assets", to: "." },
    ]),
  ],
};