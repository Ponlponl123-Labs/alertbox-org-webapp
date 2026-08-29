import { allowed_uri } from "@/consts/regex";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFallbackInitial(name: string) {
  const match = name.match(/\p{L}/u);
  return (match?.[0] ?? name[0] ?? "").toUpperCase();
}

export function isValidUri(input: string): boolean {
  return allowed_uri.test(input);
}

export function getSocialUrl(platform: string, value: string): string {
  if (!value) return "";
  const trimmed = value.trim();

  // Block malicious protocols
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (url.protocol === "http:" || url.protocol === "https:") {
        return url.toString();
      }
    } catch {
      return "";
    }
    return "";
  }

  const cleanHandle = encodeURIComponent(trimmed.replace(/^[@/]/, ""));
  if (!cleanHandle) return "";

  switch (platform.toLowerCase()) {
    case "twitch":
      return `https://twitch.tv/${cleanHandle}`;
    case "youtube":
      return `https://youtube.com/@${cleanHandle}`;
    case "twitter":
      return `https://x.com/${cleanHandle}`;
    case "facebook":
      return `https://facebook.com/${cleanHandle}`;
    case "reddit":
      return `https://reddit.com/user/${cleanHandle}`;
    case "discord":
      return `https://discord.gg/${cleanHandle}`;
    default:
      return "";
  }
}

export function clamp(val: number, min: number, max: number) {
  return val < min ? min : val > max ? max : val;
}
