import { describe, expect, it } from "bun:test";
import {
  hexColorToNumber,
  numberToHexColor,
  getAccentForeground,
  hexToOklch,
} from "../color";

describe("Frontend Color Utilities", () => {
  describe("hexColorToNumber", () => {
    it("should convert standard 6-char hex strings", () => {
      expect(hexColorToNumber("#ffffff")).toBe(16777215);
      expect(hexColorToNumber("#000000")).toBe(0);
      expect(hexColorToNumber("#f43f5e")).toBe(16007006);
    });

    it("should expand and convert 3-char shorthand hex strings", () => {
      expect(hexColorToNumber("#fff")).toBe(16777215);
      expect(hexColorToNumber("#000")).toBe(0);
      expect(hexColorToNumber("#f00")).toBe(16711680);
    });

    it("should handle missing # prefix cleanly", () => {
      expect(hexColorToNumber("ffffff")).toBe(16777215);
      expect(hexColorToNumber("000000")).toBe(0);
    });

    it("should return 0 for invalid hex values", () => {
      expect(hexColorToNumber("invalid")).toBe(0);
      expect(hexColorToNumber("")).toBe(0);
    });
  });

  describe("numberToHexColor", () => {
    it("should convert numeric colors back to 6-char hex with # prefix", () => {
      expect(numberToHexColor(16777215)).toBe("#ffffff");
      expect(numberToHexColor(0)).toBe("#000000");
      expect(numberToHexColor(16007006)).toBe("#f43f5e");
    });
  });

  describe("getAccentForeground", () => {
    it("should return black for bright backgrounds", () => {
      expect(getAccentForeground("#ffffff")).toBe("#000000");
      expect(getAccentForeground("#ffff00")).toBe("#000000");
      expect(getAccentForeground("#00ffff")).toBe("#000000");
    });

    it("should return white for dark backgrounds", () => {
      expect(getAccentForeground("#000000")).toBe("#ffffff");
      expect(getAccentForeground("#18181b")).toBe("#ffffff");
      expect(getAccentForeground("#09090b")).toBe("#ffffff");
    });
  });

  describe("hexToOklch", () => {
    it("should produce a valid oklch color string", () => {
      const oklch = hexToOklch("#f43f5e");
      expect(oklch.startsWith("oklch(")).toBe(true);
      expect(oklch.endsWith(")")).toBe(true);
    });
  });
});
