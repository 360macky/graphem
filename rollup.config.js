import cjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";

export default {
  input: "./dist/index.js",
  output: {
    dir: "dist",
    format: "umd",
    name: "Graphem",
  },
  plugins: [
    resolve(),
    cjs({
      include: ["node_modules/hello-world-js/**"],
    }),
  ],
};
