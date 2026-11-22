import { OAUTH_STATE_KEY, OAUTH_STATE_TTL_MS } from "@/consts/oauth";
import { generateOAuthState } from "@/lib/security";

export function getOrCreateOAuthState(): string {
  try {
    const raw = sessionStorage.getItem(OAUTH_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { v?: unknown; ts?: unknown };
      if (
        typeof parsed.v === "string" &&
        parsed.v.length >= 16 &&
        typeof parsed.ts === "number" &&
        Date.now() - parsed.ts < 5 * 60 * 1000
      ) {
        return parsed.v;
      }
    }
  } catch {}
  const v = generateOAuthState();
  try {
    sessionStorage.setItem(OAUTH_STATE_KEY, JSON.stringify({ v, ts: Date.now() }));
  } catch {}
  return v;
}

export function consumeOAuthState(): string | null {
  try {
    const raw = sessionStorage.getItem(OAUTH_STATE_KEY);
    sessionStorage.removeItem(OAUTH_STATE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as { v?: unknown; ts?: unknown };
      if (
        typeof parsed.v === "string" &&
        typeof parsed.ts === "number" &&
        Date.now() - parsed.ts < OAUTH_STATE_TTL_MS
      ) {
        return parsed.v;
      }
      return null;
    } catch {
      return raw;
    }
  } catch {
    return null;
  }
}
