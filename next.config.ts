import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iyaypvpkozntojbasjuh.supabase.co',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;
