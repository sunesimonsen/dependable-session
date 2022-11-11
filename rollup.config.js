import { terser } from "rollup-plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const plugins = [nodeResolve()];
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
