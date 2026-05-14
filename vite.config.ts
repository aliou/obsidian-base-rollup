import { obsidian } from "@aliou/vite-plugin-obsidian";
import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
	plugins: [
		obsidian({
			entry: "src/main.ts",
			outDir: "dist",
			manifestConfigPath: path.resolve(__dirname, "manifest.config.mjs"),
		}),
	],
});
