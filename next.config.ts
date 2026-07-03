import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: '5000mb',
    },
    proxyClientMaxBodySize: '5000mb',
  },
};

export default nextConfig;
