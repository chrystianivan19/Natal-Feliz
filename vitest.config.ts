import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "node:path";

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    // Testes que batem no banco real só rodam com DB_TESTS=1 (npm run test:db).
    include: process.env.DB_TESTS ? ["supabase/tests/**/*.test.ts"] : ["tests/unit/**/*.test.ts"],
    env: loadEnv(mode, process.cwd(), ""),
    testTimeout: 20_000,
    fileParallelism: false,
  },
}));
