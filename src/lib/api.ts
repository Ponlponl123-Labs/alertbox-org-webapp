import { allowedLocalhostWhen } from "@/consts/statement";

export const resolveApiEndpoint = (): string => {
  const configured = process.env.NEXT_PUBLIC_API_ENDPOINT?.trim();
  if (configured) {
    return configured.endsWith("/") ? configured : `${configured}/`;
  }
  return allowedLocalhostWhen.includes(process.env.NODE_ENV || "")
    ? "http://127.0.0.1:3001/"
    : "https://api.alertbox.org/";
};

export const getApiOrigin = (): string => {
  return new URL(resolveApiEndpoint()).origin;
};

export const getDiscordRedirectUri = (): string => {
  const configured = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI?.trim();
  if (configured) return configured;
  if (typeof window !== "undefined") {
    return `${window.location.origin}/app/login/discord`;
  }
  return "https://alertbox.org/app/login/discord";
};

export const getApiUrl = (path: string): string => {
  const cleanEndpoint = resolveApiEndpoint();
  let cleanPath = path.startsWith("/") ? path.slice(1) : path;
  if (cleanPath.startsWith("api/")) {
    cleanPath = cleanPath.slice(4);
  }
  return `${cleanEndpoint}${cleanPath}`;
};
