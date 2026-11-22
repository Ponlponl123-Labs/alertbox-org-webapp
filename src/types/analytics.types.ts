export type Timeframe = "7d" | "30d" | "90d" | "1y";

export interface OrgAnalyticsData {
  timeframe: string;
  totals: {
    revenue: number;
    currency: string;
    transactions: number;
    realTransactions: number;
    testTransactions: number;
    activeGateways: number;
    activeStreamers: number;
  };
  currencies: Array<{
    currency: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  gateways: Array<{
    provider: string;
    amount: number;
    count: number;
    currency: string;
    percentage: number;
  }>;
  timeline: Array<{
    date: string;
    amount: number;
    count: number;
    realCount: number;
    testCount: number;
  }>;
}
