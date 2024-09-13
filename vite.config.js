import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import fixReactVirtualized from "esbuild-plugin-react-virtualized";

export default defineConfig({
  build: {
    // rollupOptions: {
    //   moduleContext: (id) => {
    //     if (id.includes("bible-passage-reference-parser")) {
    //       return "window";
    //     }
    //   },
    // },
  },
  plugins: [
    react(),
    {
      name: "fix-bcv-parser-this-context",
      enforce: "pre",
      transform(code, id) {
        if (id.includes("bible-passage-reference-parser")) {
          const transformedCode = code.replace(
            /root\s*=\s*this;/,
            "root = window;",
          );
          return {
            code: transformedCode,
            map: null,
          };
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [fixReactVirtualized],
    },
  },
});
