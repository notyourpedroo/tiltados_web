import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Gera .next/standalone com um server.js enxuto: o build roda no GitHub Actions
  // e o servidor (1 GB de RAM) só recebe o resultado pronto. Ver deploy/.
  output: "standalone",
  turbopack: {
    // Num worktree de agente, o node_modules é uma junction para o do checkout
    // principal, fora da raiz que o Turbopack deduz. TURBOPACK_ROOT aponta para
    // uma pasta que contém os dois (docs/agents/worktrees.md). Sem ela, nada muda.
    root: process.env.TURBOPACK_ROOT,
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
