const jsx = require("./jsx-plugin.js");
const commonjs = require("rollup-plugin-commonjs");
const nodeResolve = require("rollup-plugin-node-resolve");
const typescript = require("rollup-plugin-typescript");
const react = require('react');

module.exports = {
  input: "src/index.tsx",
  output: {
    file: "dist/app.js",
    format: "esm",
  },
  external: [
    "renderer",
    "timer",
    "commodetto",
    "commodetto/Poco",
    "commodetto/outline",
    "commodetto/parseBMF",
    "Resource",
  ],
  plugins: [
    typescript(),
    nodeResolve(),
    commonjs({
      include: "node_modules/**",
      namedExports: {
        react: Object.keys(react)
      },
      sourceMap: false,
    }),
  ],
};
