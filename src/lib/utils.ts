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
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  switch (platform.toLowerCase()) {
    case "twitch":
      return `https://twitch.tv/${trimmed}`;
    case "youtube":
      return `https://youtube.com/${trimmed.startsWith("@") ? trimmed : "@" + trimmed}`;
    case "twitter":
      return `https://x.com/${trimmed.replace(/^@/, "")}`;
    case "facebook":
      return `https://facebook.com/${trimmed}`;
    case "reddit":
      return `https://reddit.com/user/${trimmed}`;
    case "discord":
      return `https://discord.gg/${trimmed}`;
    default:
      return trimmed;
  }
}
