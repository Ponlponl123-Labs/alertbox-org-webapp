import { allowed_uri } from "@/consts/regex";
import { isAllowedSocialHost } from "@/lib/security";
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

const SOCIAL_BASE_URLS: Record<string, string> = {
  twitch: "https://twitch.tv/",
  youtube: "https://youtube.com/@",
  twitter: "https://x.com/",
  facebook: "https://facebook.com/",
  reddit: "https://reddit.com/user/",
  discord: "https://discord.gg/",
};

export function getSocialUrl(platform: string, value: string): string {
  if (!value) return "";
  const trimmed = value.trim();

  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        return "";
      }
      if (!isAllowedSocialHost(platform, url.hostname)) {
        return "";
      }
      url.protocol = "https:";
      return url.toString();
    } catch {
      return "";
    }
  }

  const base = SOCIAL_BASE_URLS[platform.toLowerCase()];
  if (!base) return "";

  const cleanHandle = encodeURIComponent(trimmed.replace(/^[@/]+/, ""));
  if (!cleanHandle) return "";

  return `${base}${cleanHandle}`;
}

export function clamp(val: number, min: number, max: number) {
  return val < min ? min : val > max ? max : val;
}
