module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: "./app/main.ts",
  output: {
    path: '/home/rob/FIT/ELIXIR/30-Projects/50-Working/2018 Darci/30-Working/MDR-Simulator-2/public/js',
    filename: "app.js"
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"]
  },
  module: {
    rules: [
      // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
      { test: /\.tsx?$/, use: ["ts-loader"], exclude: /node_modules/ }
    ]
  }
}