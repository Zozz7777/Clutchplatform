import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix workspace root detection for deployment
  outputFileTracingRoot: process.cwd(),
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Handle WebSocket warnings during build
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Suppress WebSocket warnings during server-side rendering
      config.externals = config.externals || [];
      config.externals.push({
        'ws': 'commonjs ws',
      });
    }
    
    // Add fallback for WebSocket in browser builds
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'ws': false,
      'net': false,
      'tls': false,
      'crypto': false,
    };
    
    return config;
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
    // Ensure local images are served correctly
    formats: ['image/webp', 'image/avif'],
  },
  // Ensure static files are served correctly
  trailingSlash: false,
  // Ensure static assets are served with proper headers
  async rewrites() {
    return [
      {
        source: '/logos/:path*',
        destination: '/logos/:path*',
      },
    ];
  },
  // Ensure static files are properly served
  async redirects() {
    return [
      {
        source: '/logo/:path*',
        destination: '/logos/:path*',
        permanent: true,
      },
    ];
  },
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
      {
        source: '/logos/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
