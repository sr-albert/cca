/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { contentVersion } from "./scripts/content-version";

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  define: {
    __CONTENT_VERSION__: JSON.stringify(contentVersion(process.env, command, "src/data/generated/fingerprint.json")),
  },
  test: { environment: "jsdom", setupFiles: ["./src/test/setup.ts"] },
}));
