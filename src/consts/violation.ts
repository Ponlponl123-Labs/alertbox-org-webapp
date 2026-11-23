import type { ViolationResponse, ViolationScope } from "@/types";

export const VIOLATION_BLOCK_LEVEL = 3;
export const VIOLATION_CACHE_TTL_MS = 60_000;

export const USE_SAMPLE_VIOLATIONS = false;

export const isSampleViolationsEnabled = (): boolean =>
  USE_SAMPLE_VIOLATIONS && process.env.NODE_ENV === "development";

export const SAMPLE_VIOLATIONS_BY_SCOPE: Record<ViolationScope, ViolationResponse> = {
  user: {
    level: 1,
    violate: [
      {
        timestamp: "2026-11-23T10:15:00.000Z",
        message: "Suspicious automated requests detected on account.",
        level: 1,
      },
    ],
  },
  org: {
    level: 3,
    violate: [
      {
        timestamp: "2026-11-23T12:00:00.000Z",
        message: "Repeated Terms of Service breach in webhook relay payload.",
        level: 3,
      },
      {
        timestamp: "2026-11-22T08:30:00.000Z",
        message: "Unverified payment callback domain.",
        level: 2,
      },
    ],
  },
  streamer: {
    level: 2,
    violate: [
      {
        timestamp: "2026-11-23T09:00:00.000Z",
        message: "Alertbox overlay content flagged for review.",
        level: 2,
      },
    ],
  },
};
