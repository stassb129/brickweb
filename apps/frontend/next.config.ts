import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  output: "standalone",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
  async rewrites() {
    // Only proxy in development when NEXT_PUBLIC_API_URL is unset.
    if (process.env.NEXT_PUBLIC_API_URL) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/:path*",
      },
    ];
  },
};

export default nextConfig;
