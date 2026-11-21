export interface LruEntry<T> {
  value: T;
  expiresAt: number;
}

const activeCaches = new Set<{ clear: () => void }>();

export function clearAllClientCaches(): void {
  for (const cache of activeCaches) {
    cache.clear();
  }
}

export class BoundedLruCache<T> {
  private readonly store = new Map<string, LruEntry<T>>();
  private readonly maxEntries: number;
  private readonly defaultTtlMs: number;
  private readonly storageKey?: string;
  private flushScheduled = false;
  private flushHandle: number | ReturnType<typeof setTimeout> | null = null;

  constructor(options: {
    maxEntries: number;
    defaultTtlMs: number;
    storageKey?: string;
  }) {
    this.maxEntries = Math.max(1, options.maxEntries);
    this.defaultTtlMs = Math.max(1, options.defaultTtlMs);
    this.storageKey = options.storageKey;
    activeCaches.add(this);
    if (this.storageKey) {
      this.hydrateFromSession();
    }
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  set(key: string, value: T, ttlMs: number = this.defaultTtlMs): void {
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) {
        this.store.delete(oldestKey);
      }
    }
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
    this.scheduleFlush();
  }

  delete(key: string): void {
    if (this.store.delete(key)) {
      this.scheduleFlush();
    }
  }

  clear(): void {
    this.store.clear();
    if (this.flushHandle !== null) {
      if (
        typeof window !== "undefined" &&
        "cancelIdleCallback" in window &&
        typeof this.flushHandle === "number"
      ) {
        window.cancelIdleCallback(this.flushHandle);
      } else {
        clearTimeout(this.flushHandle as ReturnType<typeof setTimeout>);
      }
      this.flushHandle = null;
      this.flushScheduled = false;
    }
    if (this.storageKey && typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(this.storageKey);
      } catch {}
    }
  }

  get size(): number {
    return this.store.size;
  }

  keys(): IterableIterator<string> {
    return this.store.keys();
  }

  private hydrateFromSession(): void {
    if (!this.storageKey || typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(this.storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Array<[string, LruEntry<T>]>;
      if (!Array.isArray(parsed)) return;
      const now = Date.now();
      for (const item of parsed) {
        if (!Array.isArray(item) || item.length !== 2) continue;
        const [k, entry] = item;
        if (
          typeof k === "string" &&
          entry &&
          typeof entry.expiresAt === "number" &&
          entry.expiresAt > now
        ) {
          this.store.set(k, entry);
          if (this.store.size >= this.maxEntries) break;
        }
      }
    } catch {}
  }

  private scheduleFlush(): void {
    if (!this.storageKey || typeof window === "undefined" || this.flushScheduled) {
      return;
    }
    this.flushScheduled = true;
    const write = () => {
      this.flushScheduled = false;
      this.flushHandle = null;
      if (!this.storageKey) return;
      try {
        const now = Date.now();
        const live: Array<[string, LruEntry<T>]> = [];
        for (const [k, entry] of this.store.entries()) {
          if (entry.expiresAt > now) {
            live.push([k, entry]);
          }
        }
        sessionStorage.setItem(this.storageKey, JSON.stringify(live));
      } catch {}
    };

    if ("requestIdleCallback" in window) {
      this.flushHandle = window.requestIdleCallback(write, { timeout: 1000 });
    } else {
      this.flushHandle = setTimeout(write, 350);
    }
  }
}
