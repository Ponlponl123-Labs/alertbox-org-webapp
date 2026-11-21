import { describe, expect, it } from "bun:test";
import { BoundedLruCache, clearAllClientCaches } from "../lru-cache";

describe("BoundedLruCache", () => {
  it("evicts least-recently-used entries past maxEntries", () => {
    const cache = new BoundedLruCache<number>({
      maxEntries: 3,
      defaultTtlMs: 60_000,
    });
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);
    expect(cache.get("a")).toBe(1);
    cache.set("d", 4);

    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("a")).toBe(1);
    expect(cache.get("c")).toBe(3);
    expect(cache.get("d")).toBe(4);
    expect(cache.size).toBe(3);
  });

  it("expires entries after ttlMs", () => {
    const cache = new BoundedLruCache<string>({
      maxEntries: 10,
      defaultTtlMs: 5,
    });
    cache.set("k", "v");
    expect(cache.get("k")).toBe("v");

    const start = Date.now();
    while (Date.now() - start < 15) {}
    expect(cache.get("k")).toBeUndefined();
  });

  it("clears all registered caches on clearAllClientCaches()", () => {
    const cache = new BoundedLruCache<string>({
      maxEntries: 10,
      defaultTtlMs: 60_000,
    });
    cache.set("user:1", "Alice");
    expect(cache.size).toBe(1);
    clearAllClientCaches();
    expect(cache.size).toBe(0);
    expect(cache.get("user:1")).toBeUndefined();
  });
});
