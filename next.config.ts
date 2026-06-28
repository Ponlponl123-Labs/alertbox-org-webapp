import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react", "lucide-react"],
  },
  images: {
    remotePatterns: [
      new URL("https://cdn.discordapp.com/**"),
      new URL("https://ap-southeast1th-cdn.pattarapong.dev/**"),
      new URL("https://static.ponlponl123.com/**"),
      new URL("https://static.alertbox.org/**"),
      new URL("https://static.tip-to.me/**"),
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_ENDPOINT}:path*`,
      },
    ];
  },
};

export default nextConfig;
