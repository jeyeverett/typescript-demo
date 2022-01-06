const path = require("path");

module.exports = {
  entry: "./src/app.ts", // your apps entry point
  output: {
    filename: "bundle.js", // use 'bundle.[contenthash].js' to create a unique hash for every build (helps with caching)
    path: path.resolve(__dirname, "dist"), // the path to your bundle.js file,
    publicPath: "dist", // needed for the dev server HMR
  },
  mode: "development",
  module: {
    rules: [{ test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ }], // use a regex to find the files the loader will apply to
  },
  resolve: {
    extensions: [".ts", ".js"], // webpack will only look for .js files by default
  },
  devtool: "inline-source-map", // tells webpack to use the generated source maps (TS will generate the sourcemap since we set sourceMap to true in tsconfig)
  devServer: {
    static: {
      directory: path.resolve(__dirname, "./"), // tells webpack to look for the index.html file in the root
    },
    compress: true, // optional - tells webpack to use gzip
    port: 3000, // optional - default is PORT 8080
  },
};
