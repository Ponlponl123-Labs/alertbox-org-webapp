import { describe, expect, it, mock } from "bun:test";
import { isAlertboxProduction, isSelfHosted, checkIsAlertboxProduction } from "../instance";

describe("Instance & Deployment Mode Detection", () => {
  it("defaults to self-hosted when not yet checked or when endpoint returns 404", async () => {
    // Mock global fetch to return 404
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () => new Response("Not Found", { status: 404 })) as unknown as typeof fetch;

    try {
      const isProd = await checkIsAlertboxProduction();
      expect(isProd).toBe(false);
      expect(isAlertboxProduction()).toBe(false);
      expect(isSelfHosted()).toBe(true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
