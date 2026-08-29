import { describe, expect, it } from "bun:test";
import { cn, getFallbackInitial, isValidUri, getSocialUrl, clamp } from "../utils";

describe("Frontend General Utilities", () => {
  describe("cn (Tailwind Class Merger)", () => {
    it("should merge classes cleanly", () => {
      expect(cn("px-2 py-1", "bg-red-500")).toBe("px-2 py-1 bg-red-500");
    });

    it("should resolve Tailwind conflicts preferring later classes", () => {
      expect(cn("px-2", "px-4")).toBe("px-4");
      expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    });

    it("should ignore falsy and conditional values", () => {
      const isFalse = false;
      const isNull = null;
      expect(cn("base", isFalse && "hidden", isNull, undefined, "active")).toBe(
        "base active",
      );
    });
  });

  describe("getFallbackInitial", () => {
    it("should extract uppercase initial letter", () => {
      expect(getFallbackInitial("alice")).toBe("A");
      expect(getFallbackInitial("Bob")).toBe("B");
      expect(getFallbackInitial("ผู้ใช้")).toBe("ผ");
    });

    it("should handle names starting with symbols", () => {
      expect(getFallbackInitial("@streamer")).toBe("S");
    });
  });

  describe("isValidUri", () => {
    it("should validate allowed URI slugs", () => {
      expect(isValidUri("streamer_123")).toBe(true);
      expect(isValidUri("streamer-invalid")).toBe(false);
      expect(isValidUri("streamer name")).toBe(false);
    });
  });

  describe("getSocialUrl", () => {
    it("should format Twitch URLs", () => {
      expect(getSocialUrl("twitch", "mychannel")).toBe("https://twitch.tv/mychannel");
    });

    it("should format YouTube URLs with @ prefix", () => {
      expect(getSocialUrl("youtube", "mychannel")).toBe("https://youtube.com/@mychannel");
      expect(getSocialUrl("youtube", "@mychannel")).toBe("https://youtube.com/@mychannel");
    });

    it("should format Twitter/X URLs", () => {
      expect(getSocialUrl("twitter", "@dev")).toBe("https://x.com/dev");
      expect(getSocialUrl("twitter", "dev")).toBe("https://x.com/dev");
    });

    it("should preserve full URLs as-is", () => {
      expect(getSocialUrl("twitch", "https://twitch.tv/custom")).toBe("https://twitch.tv/custom");
    });
  });

  describe("clamp", () => {
    it("should clamp values within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });
});
