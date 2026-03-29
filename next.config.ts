import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  // Suprime o aviso de workspace root com lockfiles múltiplos
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
