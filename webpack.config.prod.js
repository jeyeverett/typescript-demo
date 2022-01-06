const path = require("path");
const CleanPlugin = require("clean-webpack-plugin");

module.exports = {
  entry: "./src/app.ts", // your apps entry point
  output: {
    filename: "bundle.js", // use 'bundle.[contenthash].js' to create a unique hash for every build (helps with caching)
    path: path.resolve(__dirname, "dist"), // the path to your bundle.js file,
  },
  devtool: false, // don't need a sourcemap in production
  mode: "production",
  module: {
    rules: [{ test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ }], // use a regex to find the files the loader will apply to
  },
  resolve: {
    extensions: [".ts", ".js"], // webpack will only look for .js files by default
  },
  plugins: [
    // plugins apply to the entire project
    new CleanPlugin.CleanWebpackPlugin(), // clears the dist folder before writing to it
  ],
};
