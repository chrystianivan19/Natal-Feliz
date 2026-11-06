import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "node:path";

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    include: ["tests/unit/**/*.test.ts", "supabase/tests/**/*.test.ts"],
    env: loadEnv(mode, process.cwd(), ""),
    testTimeout: 20_000,
    fileParallelism: false,
  },
}));
