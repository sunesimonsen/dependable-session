import { terser } from "rollup-plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const plugins = [nodeResolve(), commonjs()];
const minifyPlugins = [
  terser({
    compress: true,
    mangle: {
      reserved: [],
      properties: {
        regex: /^_/,
      },
    },
  }),
];

const external = ["@dependable/state"];

export default [
  {
    input: "src/session.js",
    output: {
      file: "dist/dependable-session.esm.js",
      format: "esm",
    },
    external,
    plugins,
  },
  {
    input: "src/session.js",
    output: {
      file: "dist/dependable-session.esm.min.js",
      format: "esm",
    },
    external,
    plugins: plugins.concat(minifyPlugins),
  },
];
