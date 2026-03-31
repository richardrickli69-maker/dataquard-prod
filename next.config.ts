import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/ai-trust',
        destination: '/ki-sicherheit',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
