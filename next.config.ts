import os from "node:os";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

loadEnvConfig(process.cwd());

export const allowedLocalhostWhen = ["development", "shipped"];

const isDev = process.env.NODE_ENV !== "production";

const localIps = Object.values(os.networkInterfaces())
  .flat()
  .filter((net): net is os.NetworkInterfaceInfo => !!net && net.family === "IPv4" && !net.internal)
  .map((net) => net.address);

const allowedDevOrigins =
  process.env.DEV_ALLOWED_HOST === "false"
    ? []
    : [
        ...localIps,
        ...(process.env.DEV_ALLOWED_HOST && process.env.DEV_ALLOWED_HOST !== "true"
          ? process.env.DEV_ALLOWED_HOST.split(",").map((h) => h.trim())
          : []),
      ];

function resolveExtraConnectOrigins(): string[] {
  const raw = process.env.NEXT_PUBLIC_API_ENDPOINT || process.env.API_ENDPOINT;
  if (!raw) return [];
  try {
    const u = new URL(raw);
    const wsProto = u.protocol === "https:" ? "wss:" : "ws:";
    return [u.origin, `${wsProto}//${u.host}`];
  } catch {
    return [];
  }
}

function resolveExtraHttpOrigin(): string[] {
  const raw = process.env.NEXT_PUBLIC_API_ENDPOINT || process.env.API_ENDPOINT;
  if (!raw) return [];
  try {
    const u = new URL(raw);
    if (u.protocol === "https:" || u.protocol === "http:") {
      return [u.origin];
    }
    return [];
  } catch {
    return [];
  }
}

const extraConnect = resolveExtraConnectOrigins();
const extraHttpOrigins = resolveExtraHttpOrigin();
const devImgOrigins = isDev
  ? [
      "http://localhost:*",
      "http://127.0.0.1:*",
      ...localIps.map((ip) => `http://${ip}:*`),
    ]
  : [];
const devConnectOrigins = isDev
  ? [
      "http://localhost:*",
      "http://127.0.0.1:*",
      "ws://localhost:*",
      "ws://127.0.0.1:*",
      ...localIps.flatMap((ip) => [`http://${ip}:*`, `ws://${ip}:*`]),
    ]
  : [];

const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://discord.com https://connect.stripe.com https://streamlabs.com",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.scalar.com",
  `img-src 'self' data: blob: https://cdn.discordapp.com https://ap-southeast1th-cdn.pattarapong.dev https://static.ponlponl123.com https://static.alertbox.org https://static.tip-to.me ${[...extraHttpOrigins, ...devImgOrigins].join(" ")}`.trim(),
  "font-src 'self' data: https://cdn.jsdelivr.net https://fonts.scalar.com",
  `connect-src 'self' https://api.alertbox.org wss://api.alertbox.org https://status.alertbox.org https://status.ponlponl123.com ${[...extraConnect, ...devConnectOrigins].join(" ")}`.trim(),
  "frame-src https://ko-fi.com https://www.ko-fi.com https://buymeacoffee.com https://www.buymeacoffee.com https://maps.google.com https://www.google.com",
  "worker-src 'self' blob:",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspDirectives },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  {
    key: "Permissions-Policy",
    value:
      'camera=(), microphone=(), geolocation=(), payment=(self "https://ko-fi.com" "https://www.ko-fi.com" "https://buymeacoffee.com" "https://www.buymeacoffee.com" "https://js.stripe.com")',
  },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  compress: false,
  generateEtags: false,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react", "lucide-react"],
  },
  env: {
    NEXT_PUBLIC_API_ENDPOINT:
      process.env["NEXT_PUBLIC_API_ENDPOINT"] || process.env["API_ENDPOINT"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
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
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    dangerouslyAllowLocalIP: allowedLocalhostWhen.includes(process.env.NODE_ENV || ""),
    remotePatterns: [
      new URL("https://cdn.discordapp.com/**"),
      new URL("https://ap-southeast1th-cdn.pattarapong.dev/**"),
      new URL("https://static.ponlponl123.com/**"),
      new URL("https://static.alertbox.org/**"),
      new URL("https://static.tip-to.me/**"),

      ...(allowedLocalhostWhen.includes(process.env.NODE_ENV || "")
        ? [
            new URL("http://127.0.0.1:3001/**"),
            new URL("http://localhost:3001/**"),
            ...allowedDevOrigins.map((host) => new URL(`http://${host}:3001/**`)),
          ]
        : []),
    ],
  },
};

export default nextConfig;
