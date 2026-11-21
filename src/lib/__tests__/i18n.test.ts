import { describe, expect, it } from "bun:test";
import en from "../../data/langs/en.json";
import th from "../../data/langs/th.json";
import { formatCount, formatI18n, isValidLanguageKey } from "../i18n";

function extractPlaceholders(value: string): string[] {
  const matches = value.match(/\{([a-zA-Z0-9_]+)\}/g) ?? [];
  return Array.from(new Set(matches)).sort();
}

function collectLeaves(
  obj: unknown,
  prefix = "",
  out: Record<string, string> = {},
): Record<string, string> {
  if (typeof obj === "string") {
    out[prefix] = obj;
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => {
      collectLeaves(item, `${prefix}[${idx}]`, out);
    });
    return out;
  }
  if (obj && typeof obj === "object") {
    for (const [key, val] of Object.entries(obj)) {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      collectLeaves(val, nextPrefix, out);
    }
  }
  return out;
}

function assertRecursiveParity(a: unknown, b: unknown, path = "root") {
  expect(typeof a).toBe(typeof b);
  if (Array.isArray(a)) {
    expect(Array.isArray(b)).toBe(true);
    const bArr = b as unknown[];
    expect(bArr.length).toBe(a.length);
    for (let i = 0; i < a.length; i++) {
      assertRecursiveParity(a[i], bArr[i], `${path}[${i}]`);
    }
    return;
  }
  if (a && typeof a === "object") {
    const aKeys = Object.keys(a as Record<string, unknown>).sort();
    const bKeys = Object.keys(b as Record<string, unknown>).sort();
    expect(bKeys).toEqual(aKeys);
    for (const key of aKeys) {
      assertRecursiveParity(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
        `${path}.${key}`,
      );
    }
  }
}

describe("i18n Localization Integrity", () => {
  it("should have deep recursive key and array-length parity between EN and TH", () => {
    assertRecursiveParity(en, th);
  });

  it("should have non-empty strings and matching {placeholders} on every leaf", () => {
    const enLeaves = collectLeaves(en);
    const thLeaves = collectLeaves(th);
    const keys = Object.keys(enLeaves);

    expect(keys.length).toBeGreaterThan(800);
    for (const key of keys) {
      expect(enLeaves[key]?.trim().length, `empty EN key: ${key}`).toBeGreaterThan(0);
      expect(thLeaves[key]?.trim().length, `empty TH key: ${key}`).toBeGreaterThan(0);
      expect(extractPlaceholders(thLeaves[key]), `placeholder mismatch at ${key}`).toEqual(
        extractPlaceholders(enLeaves[key]),
      );
    }
  });

  it("should validate language keys properly", () => {
    expect(isValidLanguageKey("en-US")).toBe(true);
    expect(isValidLanguageKey("th-TH")).toBe(true);
    expect(isValidLanguageKey("fr-FR")).toBe(false);
    expect(isValidLanguageKey("")).toBe(false);
  });

  it("should interpolate variables in single pass without re-interpolating replacement text", () => {
    expect(formatI18n("Hello {name}, {count} items", { name: "Alice", count: 3 })).toBe(
      "Hello Alice, 3 items",
    );
    expect(formatI18n("Hi {a} -> {b}", { a: "{b}", b: "safe" })).toBe("Hi {b} -> safe");
    expect(formatI18n("Keep {missing}", {})).toBe("Keep {missing}");
  });

  it("should choose singular vs plural via formatCount", () => {
    expect(formatCount("{count} Channel", "{count} Channels", 1)).toBe("{count} Channel");
    expect(formatCount("{count} Channel", "{count} Channels", 0)).toBe("{count} Channels");
    expect(formatCount("{count} Channel", "{count} Channels", 5)).toBe("{count} Channels");
  });
});
