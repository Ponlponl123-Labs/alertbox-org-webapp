export interface TransactionItem {
  id: string;
  provider: string;
  type: string;
  status: "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED";
  isTest: boolean;
  amount: number;
  currency: string;
  senderName: string;
  message: string | null;
  createdAt: string;
  isDeleted: boolean;
}

export interface StreamerConnections {
  bmac: { username: string; secret: string } | null;
  kofi: { username: string; secret: string } | null;
  stripe: string | null;
  xendit: string | null;
  ffp: string | null;
  streamlabs: boolean;
}
