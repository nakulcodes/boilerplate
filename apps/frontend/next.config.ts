import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com"], // Add other domains as needed
  },
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
