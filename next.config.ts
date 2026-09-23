import type { NextConfig } from "next";

// shipped mean pre-build image for self-hosted, also allow localhost ip
export const allowedLocalhostWhen = ["development", "shipped"];

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react", "lucide-react"],
  },
  env: {
    NEXT_PUBLIC_API_ENDPOINT: process.env["API_ENDPOINT"],
  },
  images: {
    dangerouslyAllowLocalIP: allowedLocalhostWhen.includes(process.env.NODE_ENV || ""),
    remotePatterns: [
      new URL("https://cdn.discordapp.com/**"),
      new URL("https://ap-southeast1th-cdn.pattarapong.dev/**"),
      new URL("https://static.ponlponl123.com/**"),
      new URL("https://static.alertbox.org/**"),
      new URL("https://static.tip-to.me/**"),

      ...(allowedLocalhostWhen.includes(process.env.NODE_ENV || "") ? [new URL("http://localhost:3001/**")] : []),
    ],
  },
};

export default nextConfig;
