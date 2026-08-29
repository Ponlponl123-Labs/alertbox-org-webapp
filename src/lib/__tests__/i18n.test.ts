import { describe, expect, it } from "bun:test";
import en from "../../data/langs/en.json";
import th from "../../data/langs/th.json";

describe("i18n Localization Integrity", () => {
  it("should have top-level structural parity between EN and TH", () => {
    const enKeys = Object.keys(en).sort();
    const thKeys = Object.keys(th).sort();

    expect(enKeys).toEqual(thKeys);
  });

  it("should have common navigation and header sections defined in both languages", () => {
    expect(en.header).toBeDefined();
    expect(th.header).toBeDefined();
    expect(en.footer).toBeDefined();
    expect(th.footer).toBeDefined();
  });

  it("should have identical app route translations in both dictionaries", () => {
    expect(Object.keys(en.app).sort()).toEqual(Object.keys(th.app).sort());
  });

  it("should have identical landing page translations in both dictionaries", () => {
    expect(Object.keys(en.pages).sort()).toEqual(Object.keys(th.pages).sort());
  });
});
