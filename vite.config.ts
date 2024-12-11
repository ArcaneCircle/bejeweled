import { webxdcViteConfig } from "@webxdc/vite-plugins";
import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(
  webxdcViteConfig({
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
      },
    },
  }),
);
