/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
const { build } = require("esbuild");
const { Generator } = require("npm-dts");
const { dependencies, peerDependencies } = require("../../package.json");

const main = async () => {
  await new Generator({
    entry: "src/index.ts",
    output: "dist/index.d.ts",
  }).generate();

  const shared = {
    entryPoints: ["src/index.ts"],
    bundle: true,
    external: Object.keys(dependencies).concat(Object.keys(peerDependencies)),
  };

  await build({
    ...shared,
    outfile: "dist/index.js",
  });

  await build({
    ...shared,
    outfile: "dist/index.esm.js",
    format: "esm",
  });
  console.log("🚀 Build successfully completed");
};

main().catch((err) => console.log("Some error happened during building", err));
