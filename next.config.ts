import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avswwi5vtnxsddjy.public.blob.vercel-storage.com',
        // Note: Next.js image host allow-lists must be static at build time.
        // Hardcoding the blob hostname is intentional and keeps the optimizer secure.
      },
    ],
  },
};

export default nextConfig;

