import { defineManifest } from "@aliou/vite-plugin-obsidian";

const isReleaseBuild = process.env.BUILD_CHANNEL === "prod";

export default defineManifest({
  id: isReleaseBuild ? "base-rollup" : "base-rollup-dev",
  name: isReleaseBuild ? "Base Rollup" : "Base Rollup (dev)",
  version: "0.1.0",
  minAppVersion: "1.10.0",
  description:
    "Registers a Bases table view that writes aggregate values back to the embedding note.",
  author: "aliou",
  authorUrl: "https://github.com/aliou",
  isDesktopOnly: false,
});
