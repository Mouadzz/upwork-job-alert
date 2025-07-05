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
        "scripts/api-client": path.resolve(
          __dirname,
          "src/scripts/api-client.js"
        ),
        "scripts/icon-manager": path.resolve(
          __dirname,
          "src/scripts/icon-manager.js"
        ),
        "scripts/format-telegram-msg": path.resolve(
          __dirname,
          "src/scripts/format-telegram-msg.js"
        ),
        "scripts/job-monitor": path.resolve(
          __dirname,
          "src/scripts/job-monitor.js"
        ),
        "scripts/job-filter": path.resolve(
          __dirname,
          "src/scripts/job-filter.js"
        ),
        "scripts/notification-manager": path.resolve(
          __dirname,
          "src/scripts/notification-manager.js"
        ),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "background") {
            return "background.js";
          }
          if (chunkInfo.name.startsWith("scripts/")) {
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
