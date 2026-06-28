/**
 * Helper to resolve absolute API URLs dynamically using NEXT_PUBLIC_API_ENDPOINT.
 * Automatically handles trailing/leading slashes and strips the `/api` prefix.
 *
 * @param path The relative URL path (e.g., "/api/v1/auth" or "/api/health")
 * @returns The resolved absolute API URL
 */
export const getApiUrl = (path: string): string => {
  const endpoint =
    (typeof window !== "undefined"
      ? (window as any).__RUNTIME_API_ENDPOINT
      : process.env.API_ENDPOINT) ||
    process.env.NEXT_PUBLIC_API_ENDPOINT ||
    "";
  const cleanEndpoint = endpoint.endsWith("/") ? endpoint : `${endpoint}/`;

  let cleanPath = path.startsWith("/") ? path.slice(1) : path;
  if (cleanPath.startsWith("api/")) {
    cleanPath = cleanPath.slice(4);
  }

  return `${cleanEndpoint}${cleanPath}`;
};
