import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // O indicador de dev fica no topo para não cobrir o menu inferior no celular.
  devIndicators: { position: "top-right" },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
