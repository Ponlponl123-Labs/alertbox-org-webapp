import type { ReactNode } from "react";

export interface RelayLog {
  id: string;
  provider: string;
  type: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  amount: number;
  currency: string;
  senderName: string;
  message: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export type LogStatusFilter = "ALL" | "COMPLETED" | "FAILED" | "PENDING";

export interface ProviderItem {
  api_endpoint: string;
  icon: ReactNode;
  name: string;
  description: string;
  privacy?: string;
  payout?: string;
  isConnected: boolean;
  isUseOauth?: boolean;
  key: string;
  soon: boolean;
}
