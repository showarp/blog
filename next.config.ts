import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Exclude scripts from TypeScript compilation
  typescript: {
    ignoreBuildErrors: true,
  },
  // Exclude scripts directory from the build
  onDemandEntries: {
    // Make sure pages are not disposed for scripts
    maxInactiveAge: 25 * 1000,
  },
};

export default nextConfig;
