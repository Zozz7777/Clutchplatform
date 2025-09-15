import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['admin.yourclutch.com', 'clutch-main-nk7x.onrender.com'],
    unoptimized: true, // Disable image optimization for static exports
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admin.yourclutch.com',
      },
      {
        protocol: 'https',
        hostname: 'clutch-main-nk7x.onrender.com',
      },
    ],
  },
  // Ensure static files are served correctly
  trailingSlash: false,
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
