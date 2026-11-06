import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // O indicador de dev fica no topo para não cobrir o menu inferior no celular.
  devIndicators: { position: "top-right" },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "davmxcpeembyirdpnkch.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
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
