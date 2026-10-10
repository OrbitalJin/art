import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";

// @composio/core ships workerd-specific builds for its node built-in shims.
// It references them through package-internal subpath imports (`#platform`,
// `#files`, …) that Vite cannot resolve on its own, so we alias each one to the
// matching `*.workerd.mjs` file. Revisit these paths when bumping the package.
const composioCore = path.resolve(
  __dirname,
  "./node_modules/@composio/core/dist",
);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    process.env.ANALYZE
      ? visualizer({
          filename: "dist/stats.html",
          gzipSize: true,
          brotliSize: true,
          template: "treemap",
        })
      : undefined,
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "#platform": path.join(composioCore, "platform/workerd.mjs"),
      "#files": path.join(composioCore, "models/Files.workerd.mjs"),
      "#file_tool_modifier": path.join(
        composioCore,
        "utils/modifiers/FileToolModifier.workerd.mjs",
      ),
      "#config_defaults": path.join(
        composioCore,
        "utils/config-defaults/ConfigDefaults.workerd.mjs",
      ),
      "#ssrf_guard": path.join(composioCore, "utils/ssrfGuard.workerd.mjs"),
    },
  },
  optimizeDeps: {
    include: [
      "@composio/core",
      "@composio/vercel",
      "@composio/client",
      "@composio/json-schema-to-zod",
      "zod-to-json-schema",
      "@cfworker/json-schema",
      "dequal",
      "semver",
      "picocolors",
      "zod/v3",
    ],
  },
});
