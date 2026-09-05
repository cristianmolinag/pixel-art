import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      conditions: ["browser"],
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./tests/setup.js"],
      include: ["tests/**/*.test.js"],
      coverage: {
        provider: "v8",
        include: ["src/lib/**/*.js"],
      },
    },
  })
);
