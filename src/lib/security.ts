const SAFE_ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;
const SAFE_HANDLE_RE = /^[a-zA-Z0-9_.-]{1,64}$/;
const SAFE_FQDN_RE =
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

const TRUSTED_OAUTH_HOSTS = new Set([
  "discord.com",
  "discordapp.com",
  "connect.stripe.com",
  "streamlabs.com",
  "www.streamlabs.com",
]);

const SOCIAL_HOST_ALLOWLIST: Record<string, readonly string[]> = {
  twitch: ["twitch.tv", "www.twitch.tv", "m.twitch.tv"],
  youtube: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"],
  twitter: ["x.com", "www.x.com", "twitter.com", "www.twitter.com"],
  facebook: ["facebook.com", "www.facebook.com", "fb.com", "m.facebook.com"],
  reddit: ["reddit.com", "www.reddit.com", "old.reddit.com"],
  discord: ["discord.gg", "discord.com", "www.discord.com", "discordapp.com"],
};

export function isSafePathSegment(value: string | number | null | undefined): value is string | number {
  if (typeof value === "number") {
    return Number.isInteger(value) && value >= 0 && SAFE_ID_RE.test(String(value));
  }
  return typeof value === "string" && SAFE_ID_RE.test(value);
}

export function isSafeIframeHandle(value: string | null | undefined): value is string {
  return (
    typeof value === "string" &&
    SAFE_HANDLE_RE.test(value) &&
    value !== "." &&
    value !== ".." &&
    !value.includes("..")
  );
}

export function isSafeHostname(value: string | null | undefined): value is string {
  return typeof value === "string" && SAFE_FQDN_RE.test(value.trim());
}

export function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

export function safeDecodeBase64(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return atob(value);
  } catch {
    return null;
  }
}

export function safeParseBigInt(
  value: string | bigint | number | null | undefined,
  fallback: bigint = BigInt(0),
): bigint {
  if (value === null || value === undefined || value === "") return fallback;
  try {
    if (typeof value === "bigint") return value;
    if (typeof value === "number") {
      if (!Number.isSafeInteger(value)) return fallback;
      return BigInt(value);
    }
    return BigInt(value.trim());
  } catch {
    return fallback;
  }
}

export function isTrustedApiUrl(url: string, trustedOrigin: string): boolean {
  try {
    const parsed = new URL(url, trustedOrigin);
    return parsed.origin === trustedOrigin;
  } catch {
    return false;
  }
}

export function validateOAuthRedirectUrl(rawUrl: string): string | null {
  try {
    const trimmed = rawUrl.trim();
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return null;
    const host = parsed.hostname.toLowerCase();
    if (!TRUSTED_OAUTH_HOSTS.has(host)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function isAllowedSocialHost(platform: string, hostname: string): boolean {
  const allowed = SOCIAL_HOST_ALLOWLIST[platform.toLowerCase()];
  if (!allowed) return false;
  return allowed.includes(hostname.toLowerCase());
}

export function isSafeHref(href: string | null | undefined): boolean {
  if (!href) return false;
  const trimmed = href.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function generateOAuthState(bytes = 24): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  let out = "";
  for (let i = 0; i < buf.length; i++) {
    out += buf[i].toString(16).padStart(2, "0");
  }
  return out;
}

export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function isHttpsRuntime(): boolean {
  return typeof window !== "undefined" && window.location.protocol === "https:";
}
