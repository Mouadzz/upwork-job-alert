import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, "index.html"),
        background: path.resolve(__dirname, "src/background.js"),
        "content-scripts/utils": path.resolve(
          __dirname,
          "src/content-scripts/utils.js"
        ),
        "content-scripts/parse-job-section": path.resolve(
          __dirname,
          "src/content-scripts/parse-job-section.js"
        ),
        "content-scripts/telegram-sender": path.resolve(
          __dirname,
          "src/content-scripts/telegram-sender.js"
        ),
        "content-scripts/job-checker": path.resolve(
          __dirname,
          "src/content-scripts/job-checker.js"
        ),
        "content-scripts/tab-switcher": path.resolve(
          __dirname,
          "src/content-scripts/tab-switcher.js"
        ),
        "content-scripts/main": path.resolve(
          __dirname,
          "src/content-scripts/main.js"
        ),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "background") {
            return "background.js";
          }
          if (chunkInfo.name.startsWith("content-scripts/")) {
            return `${chunkInfo.name}.js`;
          }
          return `assets/${chunkInfo.name}-[hash].js`;
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    // Add these options to prevent minification issues
    minify: false, // Try this temporarily to see if it fixes the duplicate 'c' variable issue
    outDir: "dist",
    emptyOutDir: true,
  },
});
