import { describe, expect, it } from "bun:test";
import {
  isSafePathSegment,
  isSafeIframeHandle,
  isSafeHostname,
  safeDecodeURIComponent,
  safeDecodeBase64,
  safeParseBigInt,
  isTrustedApiUrl,
  validateOAuthRedirectUrl,
  isAllowedSocialHost,
  isSafeHref,
  constantTimeEqual,
} from "../security";

describe("Security Primitives", () => {
  describe("isSafePathSegment", () => {
    it("accepts valid IDs, numeric IDs, and slugs", () => {
      expect(isSafePathSegment("org_123")).toBe(true);
      expect(isSafePathSegment("my-streamer_01")).toBe(true);
      expect(isSafePathSegment(42)).toBe(true);
      expect(isSafePathSegment(0)).toBe(true);
    });

    it("rejects traversal, dots, slashes, invalid numbers, empty, and control chars", () => {
      expect(isSafePathSegment("")).toBe(false);
      expect(isSafePathSegment(-1)).toBe(false);
      expect(isSafePathSegment(1.5)).toBe(false);
      expect(isSafePathSegment(Number.NaN)).toBe(false);
      expect(isSafePathSegment("..")).toBe(false);
      expect(isSafePathSegment("../admin")).toBe(false);
      expect(isSafePathSegment("a/b")).toBe(false);
      expect(isSafePathSegment("a?b=1")).toBe(false);
      expect(isSafePathSegment("a#hash")).toBe(false);
      expect(isSafePathSegment(null)).toBe(false);
    });
  });

  describe("isSafeIframeHandle", () => {
    it("accepts valid Ko-fi/BMAC handles and rejects injection", () => {
      expect(isSafeIframeHandle("ponlponl123")).toBe(true);
      expect(isSafeIframeHandle("creator_01-tv")).toBe(true);
      expect(isSafeIframeHandle("../evil")).toBe(false);
      expect(isSafeIframeHandle("foo?redirect=evil")).toBe(false);
      expect(isSafeIframeHandle("foo/bar")).toBe(false);
      expect(isSafeIframeHandle("")).toBe(false);
    });
  });

  describe("isSafeHostname", () => {
    it("accepts valid FQDNs and rejects URLs/paths", () => {
      expect(isSafeHostname("status.alertbox.org")).toBe(true);
      expect(isSafeHostname("sub-1.example.co.uk")).toBe(true);
      expect(isSafeHostname("evil.com/path")).toBe(false);
      expect(isSafeHostname("user@evil.com")).toBe(false);
      expect(isSafeHostname("localhost")).toBe(false);
      expect(isSafeHostname("")).toBe(false);
    });
  });

  describe("safeDecodeURIComponent & safeDecodeBase64", () => {
    it("never throws on malformed percent-encoding or base64", () => {
      expect(safeDecodeURIComponent("%E0%A4%A")).toBeNull();
      expect(safeDecodeURIComponent("%40streamer")).toBe("@streamer");
      expect(safeDecodeBase64("!!!not-base64!!!")).toBeNull();
      expect(safeDecodeBase64("aGVsbG8=")).toBe("hello");
    });
  });

  describe("safeParseBigInt", () => {
    it("parses valid integers and falls back on malformed inputs", () => {
      expect(safeParseBigInt("15")).toBe(BigInt(15));
      expect(safeParseBigInt(42)).toBe(BigInt(42));
      expect(safeParseBigInt(BigInt(8))).toBe(BigInt(8));
      expect(safeParseBigInt("-1")).toBe(BigInt(-1));
      expect(safeParseBigInt("not-a-number")).toBe(BigInt(0));
      expect(safeParseBigInt(null)).toBe(BigInt(0));
    });
  });

  describe("isTrustedApiUrl", () => {
    it("allows trusted API origin and relative /api paths, blocks third-party hosts", () => {
      expect(isTrustedApiUrl("https://api.alertbox.org/api/v1/me", "https://api.alertbox.org")).toBe(true);
      expect(isTrustedApiUrl("/api/v1/me", "https://api.alertbox.org")).toBe(true);
      expect(isTrustedApiUrl("https://evil.example/steal", "https://api.alertbox.org")).toBe(false);
      expect(isTrustedApiUrl("//evil.example/api/v1/me", "https://api.alertbox.org")).toBe(false);
      expect(isTrustedApiUrl("javascript:alert(1)", "https://api.alertbox.org")).toBe(false);
    });
  });

  describe("validateOAuthRedirectUrl", () => {
    it("allows exact allowlisted HTTPS OAuth providers and rejects untrusted hosts", () => {
      expect(
        validateOAuthRedirectUrl("https://connect.stripe.com/oauth/authorize?client_id=1"),
      ).toBe("https://connect.stripe.com/oauth/authorize?client_id=1");
      expect(
        validateOAuthRedirectUrl("https://streamlabs.com/api/v2.0/authorize?scope=alerts"),
      ).toBe("https://streamlabs.com/api/v2.0/authorize?scope=alerts");
      expect(
        validateOAuthRedirectUrl("http://connect.stripe.com/oauth/authorize"),
      ).toBeNull();
      expect(
        validateOAuthRedirectUrl("https://evil-stripe.com/oauth/authorize"),
      ).toBeNull();
      expect(
        validateOAuthRedirectUrl("javascript:alert(1)"),
      ).toBeNull();
    });
  });

  describe("isAllowedSocialHost & isSafeHref", () => {
    it("enforces per-platform host allowlists and safe URLs", () => {
      expect(isAllowedSocialHost("twitch", "www.twitch.tv")).toBe(true);
      expect(isAllowedSocialHost("twitch", "evil.com")).toBe(false);
      expect(isAllowedSocialHost("twitter", "x.com")).toBe(true);
      expect(isAllowedSocialHost("discord", "discord.gg")).toBe(true);
      expect(isAllowedSocialHost("youtube", "youtu.be")).toBe(true);

      expect(isSafeHref("https://alertbox.org")).toBe(true);
      expect(isSafeHref("/docs")).toBe(true);
      expect(isSafeHref("//evil.com")).toBe(false);
      expect(isSafeHref("javascript:alert(1)")).toBe(false);
      expect(isSafeHref("data:text/html,hi")).toBe(false);
    });
  });

  describe("constantTimeEqual", () => {
    it("compares equal and unequal strings accurately", () => {
      expect(constantTimeEqual("abc123", "abc123")).toBe(true);
      expect(constantTimeEqual("abc123", "abc124")).toBe(false);
      expect(constantTimeEqual("abc", "abcd")).toBe(false);
      expect(constantTimeEqual("", "a")).toBe(false);
      expect(constantTimeEqual("", "")).toBe(true);
    });
  });
});
