import path from "node:path";
import { obsidian } from "@aliou/vite-plugin-obsidian";
import { defineConfig } from "vite";

export default defineConfig(() => {
  const isReleaseBuild = process.env.BUILD_CHANNEL === "prod";

  return {
    plugins: [
      obsidian({
        entry: "src/main.ts",
        outDir: "dist",
        manifestConfigPath: path.resolve(__dirname, "manifest.config.ts"),
        minify: isReleaseBuild,
        sourcemap: isReleaseBuild ? false : "inline",
      }),
    ],
  };
});
