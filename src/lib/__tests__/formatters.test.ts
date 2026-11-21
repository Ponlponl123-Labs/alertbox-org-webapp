import { describe, expect, it } from "bun:test";
import {
  getCurrencyFractionDigits,
  getCachedNumberFormat,
  getCachedDateFormat,
  formatMoneyMinorUnits,
} from "../formatters";

describe("Currency & Intl Formatter Utilities", () => {
  describe("getCurrencyFractionDigits", () => {
    it("returns ISO 4217 decimal digits for 0, 2, and 3-decimal currencies", () => {
      expect(getCurrencyFractionDigits("JPY")).toBe(0);
      expect(getCurrencyFractionDigits("krw")).toBe(0);
      expect(getCurrencyFractionDigits("THB")).toBe(2);
      expect(getCurrencyFractionDigits("USD")).toBe(2);
      expect(getCurrencyFractionDigits("KWD")).toBe(3);
      expect(getCurrencyFractionDigits("BHD")).toBe(3);
    });
  });

  describe("formatMoneyMinorUnits", () => {
    it("formats zero-decimal currencies without dividing by 100", () => {
      const jpy = formatMoneyMinorUnits(500, "JPY", "en-US");
      expect(jpy).toContain("500");
      expect(jpy).not.toContain("5.00");
    });

    it("formats 2-decimal and 3-decimal currencies accurately", () => {
      const usd = formatMoneyMinorUnits(1234, "USD", "en-US");
      expect(usd).toContain("12.34");
      const kwd = formatMoneyMinorUnits(1500, "KWD", "en-US");
      expect(kwd).toContain("1.500");
    });
  });

  describe("Intl Formatter Caching", () => {
    it("returns identical cached instances for identical options", () => {
      const nf1 = getCachedNumberFormat("en-US", { style: "currency", currency: "USD" });
      const nf2 = getCachedNumberFormat("en-US", { style: "currency", currency: "USD" });
      expect(nf1).toBe(nf2);

      const df1 = getCachedDateFormat("en-US", { month: "short", day: "numeric" });
      const df2 = getCachedDateFormat("en-US", { month: "short", day: "numeric" });
      expect(df1).toBe(df2);
    });
  });
});
