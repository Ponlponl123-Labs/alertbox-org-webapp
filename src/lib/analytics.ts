import type { OrgAnalyticsData, Timeframe } from "@/types/analytics.types";

export const generateMockAnalytics = (timeframe: Timeframe): OrgAnalyticsData => {
  const days = timeframe === "7d" ? 7 : timeframe === "90d" ? 90 : timeframe === "1y" ? 365 : 30;
  const now = new Date();
  const timeline: OrgAnalyticsData["timeline"] = [];
  let totalRevenue = 0;
  let totalTx = 0;
  let realTx = 0;
  let testTx = 0;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const wave = Math.sin((i / days) * Math.PI * 4) * 0.4 + 1;
    const count = Math.max(2, Math.round(wave * (12 + (i % 7) * 4)));
    const testCount = Math.round(count * 0.15);
    const realCount = count - testCount;
    const amount = realCount * (150 + (i % 5) * 60) + testCount * 50;

    totalRevenue += amount;
    totalTx += count;
    realTx += realCount;
    testTx += testCount;

    timeline.push({
      date: dateStr,
      amount,
      count,
      realCount,
      testCount,
    });
  }

  return {
    timeframe,
    totals: {
      revenue: totalRevenue,
      currency: "THB",
      transactions: totalTx,
      realTransactions: realTx,
      testTransactions: testTx,
      activeGateways: 3,
      activeStreamers: 3,
    },
    currencies: [
      { currency: "THB", amount: Math.round(totalRevenue * 0.76), count: Math.round(totalTx * 0.78), percentage: 76 },
      { currency: "USD", amount: Math.round(totalRevenue * 0.18), count: Math.round(totalTx * 0.16), percentage: 18 },
      { currency: "EUR", amount: Math.round(totalRevenue * 0.06), count: Math.round(totalTx * 0.06), percentage: 6 },
    ],
    gateways: [
      { provider: "PROMPTPAY", amount: Math.round(totalRevenue * 0.68), count: Math.round(totalTx * 0.7), currency: "THB", percentage: 68 },
      { provider: "STRIPE", amount: Math.round(totalRevenue * 0.22), count: Math.round(totalTx * 0.2), currency: "USD", percentage: 22 },
      { provider: "KOFI", amount: Math.round(totalRevenue * 0.1), count: Math.round(totalTx * 0.1), currency: "USD", percentage: 10 },
    ],
    timeline,
  };
};
