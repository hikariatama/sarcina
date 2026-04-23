import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const runtimeEnv = loadEnv(mode, process.cwd(), "");

  return {
    base:
      mode === "development"
        ? "/"
        : runtimeEnv.VITE_ASSET_BASE && runtimeEnv.VITE_ASSET_BASE.length > 0
          ? runtimeEnv.VITE_ASSET_BASE
          : "./",
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
