import os from "node:os";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

loadEnvConfig(process.cwd());

// shipped mean pre-build image for self-hosted, also allow localhost ip
export const allowedLocalhostWhen = ["development", "shipped"];

const localIps = Object.values(os.networkInterfaces())
  .flat()
  .filter((net): net is os.NetworkInterfaceInfo => !!net && net.family === "IPv4" && !net.internal)
  .map((net) => net.address);

const allowedDevOrigins = process.env.DEV_ALLOWED_HOST === "false"
  ? []
  : [
      ...localIps,
      ...(process.env.DEV_ALLOWED_HOST && process.env.DEV_ALLOWED_HOST !== "true"
        ? process.env.DEV_ALLOWED_HOST.split(",").map((h) => h.trim())
        : []),
    ];

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react", "lucide-react"],
  },
  env: {
    NEXT_PUBLIC_API_ENDPOINT: process.env["API_ENDPOINT"],
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, HEAD, OPTIONS" },
        ],
      },
    ];
  },
  allowedDevOrigins,
  images: {
    dangerouslyAllowLocalIP: allowedLocalhostWhen.includes(process.env.NODE_ENV || ""),
    remotePatterns: [
      new URL("https://cdn.discordapp.com/**"),
      new URL("https://ap-southeast1th-cdn.pattarapong.dev/**"),
      new URL("https://static.ponlponl123.com/**"),
      new URL("https://static.alertbox.org/**"),
      new URL("https://static.tip-to.me/**"),

      ...(allowedLocalhostWhen.includes(process.env.NODE_ENV || "")
        ? [
            new URL("http://localhost:3001/**"),
            ...allowedDevOrigins.map((host) => new URL(`http://${host}:3001/**`)),
          ]
        : []),
    ],
  },
};

export default nextConfig;
