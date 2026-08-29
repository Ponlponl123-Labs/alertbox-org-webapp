import { describe, expect, it } from "bun:test";
import { getApiUrl } from "../api";

describe("API Endpoint Resolver", () => {
  it("should resolve endpoint correctly", () => {
    const url = getApiUrl("/api/v1/profile");
    expect(typeof url).toBe("string");
    expect(url.endsWith("v1/profile")).toBe(true);
    expect(url.includes("api/api/")).toBe(false);
  });

  it("should strip duplicate api/ prefixes", () => {
    const url = getApiUrl("api/v1/auth/session");
    expect(url.endsWith("v1/auth/session")).toBe(true);
    expect(url.includes("api/api/")).toBe(false);
  });

  it("should handle paths without leading slashes", () => {
    const url = getApiUrl("v1/widget");
    expect(url.endsWith("v1/widget")).toBe(true);
  });
});
