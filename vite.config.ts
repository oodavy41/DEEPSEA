import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

import reactRefresh from "@vitejs/plugin-react-refresh";
import vitePluginImp from "vite-plugin-imp";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      { find: "@Rlyeh", replacement: path.resolve(__dirname, "src/Rlyeh") },
    ],
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  plugins: [
    react(),
    vitePluginImp({
      libList: [
        {
          libName: "antd",
          libDirectory: "es",
          style: (name) => `antd/es/${name}/style`,
        },
      ],
    }),
  ],
  build: {
    outDir: "docs",
    rollupOptions: {
      external: [],
    },
  },
});
