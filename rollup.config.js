import { terser } from "rollup-plugin-terser";

const plugins = [];
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

export default [
  {
    input: "src/session.js",
    output: {
      file: "dist/dependable-session.esm.js",
      format: "esm",
    },
    plugins,
  },
  {
    input: "src/session.js",
    output: {
      file: "dist/dependable-session.esm.min.js",
      format: "esm",
    },
    plugins: plugins.concat(minifyPlugins),
  },
];
