const webpack = require("webpack");
module.exports = {
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      fs: false,
      path: require.resolve("path-browserify"),
      net: false,
      crypto: require.resolve("crypto-browserify"),
      vm: require.resolve("vm-browserify"),
      os: require.resolve("os-browserify/browser"),
      util: require.resolve("util"),
      assert: false,
      stream: require.resolve("stream-browserify"),
      events: false,
      constants: false,
    },
  },
  mode: "production",
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ],
};
