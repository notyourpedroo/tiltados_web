import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Gera .next/standalone com um server.js enxuto: o build roda no GitHub Actions
  // e o servidor (1 GB de RAM) só recebe o resultado pronto. Ver deploy/.
  output: "standalone",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [{ source: "/", destination: "/2026", permanent: false }];
  },
};

export default nextConfig;
