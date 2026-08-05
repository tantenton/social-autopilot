import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.vercel.app"],
    },
  },
  headers: async () => [
    {
      source: "/sw.js",
      headers: [{ key: "Cache-Control", value: "no-cache" }],
    },
    {
      source: "/manifest.json",
      headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
    },
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "fal.media" },
      { protocol: "https", hostname: "*.fal.media" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  // Exclude worker files from Next.js build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
