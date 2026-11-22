import type { RelayLog } from "@/types/connections.types";

export const MAX_RELAY_LOGS = 200;

export const SAMPLE_RELAY_LOGS: RelayLog[] = [
  {
    id: "sample-1",
    provider: "buymeacoffee",
    type: "DONATION_SUCCESS",
    status: "COMPLETED",
    amount: 500,
    currency: "USD",
    senderName: "Alex Mercer",
    message: "Keep up the great streams!",
    errorMessage: null,
    createdAt: "2026-11-22T11:30:00.000Z",
  },
  {
    id: "sample-2",
    provider: "kofi",
    type: "DONATION_SUCCESS",
    status: "PENDING",
    amount: 1000,
    currency: "USD",
    senderName: "Natsuki",
    message: "Coffee time ☕",
    errorMessage: null,
    createdAt: "2026-11-22T11:25:00.000Z",
  },
  {
    id: "sample-3",
    provider: "stripe",
    type: "PAYMENT_SUCCESS",
    status: "FAILED",
    amount: 1500,
    currency: "USD",
    senderName: "Jordan Lee",
    message: null,
    errorMessage: "401 Unauthorized: Streamlabs token expired",
    createdAt: "2026-11-22T11:10:00.000Z",
  },
];

export const StreamlabsOption = {
  STRIPE_PAYMENT_SUCCESS: 1,
  BMAC_MEMBERSHIP_SUCCESS: 2,
  KOFI_DONATION_SUCCESS: 4,
  KOFI_PURCHASE_SUCCESS: 8,
  BMAC_DONATION_SUCCESS: 16,
  CONFIGURED_FLAG: 128,
} as const;

export const ALL_RELAY_BITS =
  StreamlabsOption.STRIPE_PAYMENT_SUCCESS |
  StreamlabsOption.BMAC_MEMBERSHIP_SUCCESS |
  StreamlabsOption.KOFI_DONATION_SUCCESS |
  StreamlabsOption.KOFI_PURCHASE_SUCCESS |
  StreamlabsOption.BMAC_DONATION_SUCCESS;

export const TOTAL_RULES = 5;
