import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    // Lets tests import "@/lib/..." the same way the app does.
    alias: { "@": path.resolve(__dirname) },
  },
});
