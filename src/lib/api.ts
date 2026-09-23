import { allowedLocalhostWhen } from "@/consts/statement";

/**
 * Helper to resolve absolute API URLs dynamically using NEXT_PUBLIC_API_ENDPOINT.
 * Automatically handles trailing/leading slashes and strips the `/api` prefix.
 *
 * @param path The relative URL path (e.g., "/api/v1/auth" or "/api/health")
 * @returns The resolved absolute API URL
 */
export const getApiUrl = (path: string): string => {
  let endpoint =
    process.env.NEXT_PUBLIC_API_ENDPOINT ||
    (allowedLocalhostWhen.includes(process.env.NODE_ENV || "")
      ? "http://localhost:3001/"
      : "https://api.alertbox.org/");

  if (process.env.NODE_ENV === "production") {
    endpoint = "https://api.alertbox.org/";
  }
  const cleanEndpoint = endpoint.endsWith("/") ? endpoint : `${endpoint}/`;

  let cleanPath = path.startsWith("/") ? path.slice(1) : path;
  if (cleanPath.startsWith("api/")) {
    cleanPath = cleanPath.slice(4);
  }

  return `${cleanEndpoint}${cleanPath}`;
};
