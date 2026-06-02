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
