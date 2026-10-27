"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { GlobeBars, BarMarker } from "@/components/ui/cobe-globe-bars";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import {
  TrendUpIcon,
  SparkleIcon,
} from "@phosphor-icons/react";

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

const PROVIDER_COLORS: Record<string, string> = {
  STRIPE: "#635BFF",
  PROMPTPAY: "#0284C7",
  KOFI: "#FF5E5B",
  BMAC: "#F59E0B",
  BUYMEACOFFEE: "#F59E0B",
  STREAMLABS: "#10B981",
  OTHER: "#8B5CF6",
};

const PROVIDER_NAMES: Record<string, string> = {
  STRIPE: "Stripe",
  PROMPTPAY: "PromptPay",
  KOFI: "Ko-fi",
  BMAC: "Buy Me a Coffee",
  BUYMEACOFFEE: "Buy Me a Coffee",
  STREAMLABS: "Streamlabs",
};

const CURRENCY_DEFAULT_COORDS: Record<string, [number, number]> = {
  THB: [13.75, 100.5],
  USD: [40.71, -74.01],
  EUR: [50.11, 8.68],
  JPY: [35.68, 139.65],
  GBP: [51.51, -0.13],
  SGD: [1.35, 103.82],
  AUD: [-33.87, 151.21],
};

export const formatCurrency = (amount: number, currency = "THB"): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: amount % 1 !== 0 ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: amount % 1 !== 0 ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;
  }
};

const generateMockAnalytics = (timeframe: Timeframe): OrgAnalyticsData => {
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

const gatewayChartConfig: ChartConfig = {
  count: { label: "Transactions" },
  PROMPTPAY: { label: "PromptPay", color: "#0284C7" },
  STRIPE: { label: "Stripe", color: "#635BFF" },
  KOFI: { label: "Ko-fi", color: "#FF5E5B" },
  BMAC: { label: "Buy Me a Coffee", color: "#F59E0B" },
  BUYMEACOFFEE: { label: "Buy Me a Coffee", color: "#F59E0B" },
  STREAMLABS: { label: "Streamlabs", color: "#10B981" },
  OTHER: { label: "Other", color: "#8B5CF6" },
};

const timelineChartConfig: ChartConfig = {
  amount: { label: "Revenue", color: "var(--primary)" },
  count: { label: "Transactions", color: "var(--primary)" },
};

function OrgAnalyticsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-36">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="relative rounded-2xl border border-border/80 bg-card/50 backdrop-blur-md p-5 flex flex-col justify-between overflow-hidden shadow-xs shimmer-shiny"
          >
            <Skeleton className="h-9 w-40 rounded-lg bg-muted/60" />
            <div className="flex flex-col gap-1.5 mt-auto">
              <Skeleton className="h-3.5 w-36 rounded bg-muted/50" />
              <Skeleton className="h-3 w-28 rounded bg-muted/30" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md p-6 flex flex-col justify-between shadow-xs relative overflow-hidden h-108 shimmer-shiny">
        <div className="w-full h-72 flex items-end gap-2 pt-4 px-2 opacity-25">
          {[35, 60, 45, 75, 50, 85, 40, 65, 80, 55, 70, 60, 90, 65, 45].map((h, idx) => (
            <div
              key={idx}
              style={{ height: `${h}%` }}
              className="flex-1 rounded-t-sm bg-muted/50"
            />
          ))}
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2 w-full pt-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-56 rounded-md bg-muted/60" />
            <Skeleton className="h-3.5 w-72 rounded bg-muted/40" />
          </div>
          <Skeleton className="h-5 w-24 rounded-full bg-muted/40" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md overflow-hidden relative p-6 flex flex-col justify-between min-h-115 shimmer-shiny">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-48 rounded-md bg-muted/60" />
            <Skeleton className="h-3.5 w-64 rounded bg-muted/40" />
          </div>
          <div className="absolute -bottom-16 -right-16 size-80 rounded-full border-36 border-muted/30 opacity-30 pointer-events-none" />
        </div>

        <div className="rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md p-6 flex flex-col justify-between shadow-xs overflow-hidden min-h-115 shimmer-shiny relative">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-56 rounded-md bg-muted/60" />
            <Skeleton className="h-3.5 w-72 rounded bg-muted/40" />
          </div>
          <div className="my-auto flex items-center justify-center py-6">
            <div className="size-52 rounded-full border border-border/40 bg-muted/15 flex items-center justify-center opacity-40">
              <div className="size-36 rounded-full border border-dashed border-border/60" />
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 w-full mt-auto">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-44 rounded-full bg-card/40 border border-border/40" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const OrgAnalytics = React.memo(function OrgAnalytics({ orgId }: { orgId?: string }) {
  const { authFetch } = useUserContext();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const [timeframe, setTimeframe] = React.useState<Timeframe>("30d");
  const [metric, setMetric] = React.useState<"revenue" | "volume">("revenue");
  const [data, setData] = React.useState<OrgAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const isDev = process.env.NODE_ENV === "development";
  const [showSample, setShowSample] = React.useState(isDev);

  React.useEffect(() => {
    if (!orgId || /^\d{4}-\d{2}-\d{2}/.test(orgId) || orgId.includes("GMT")) return;
    let active = true;

    authFetch(getApiUrl(`/api/v1/org/${orgId}/transactions/analytics?timeframe=${timeframe}`))
      .then((res) => (res.ok ? res.json() : null))
      .then((res: OrgAnalyticsData | null) => {
        if (!active) return;
        setData(res);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        if (active) setData(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orgId, timeframe, authFetch]);

  const displayData = React.useMemo(() => {
    if (!data || data.totals.transactions === 0) {
      if (isDev && showSample) return generateMockAnalytics(timeframe);
      return (
        data || {
          timeframe,
          totals: {
            revenue: 0,
            currency: "THB",
            transactions: 0,
            realTransactions: 0,
            testTransactions: 0,
            activeGateways: 0,
            activeStreamers: 0,
          },
          currencies: [],
          gateways: [],
          timeline: [],
        }
      );
    }
    return data;
  }, [data, timeframe, isDev, showSample]);

  const { totals, currencies, gateways, timeline } = displayData;

  const currencyMarkers: BarMarker[] = React.useMemo(() => {
    return currencies.map((c) => {
      const loc = CURRENCY_DEFAULT_COORDS[c.currency.toUpperCase()] || [13.75, 100.5];
      return {
        id: `curr-${c.currency.toLowerCase()}`,
        location: loc,
        value: c.percentage,
        label: c.currency,
      };
    });
  }, [currencies]);

  const [hoveredCurrency, setHoveredCurrency] = React.useState<string | null>(null);

  const activeLocation = React.useMemo(() => {
    if (!hoveredCurrency) return null;
    return CURRENCY_DEFAULT_COORDS[hoveredCurrency.toUpperCase()] || [13.75, 100.5];
  }, [hoveredCurrency]);

  const activeMarkerId = React.useMemo(() => {
    if (!hoveredCurrency) return null;
    return `curr-${hoveredCurrency.toLowerCase()}`;
  }, [hoveredCurrency]);

  const gatewaysWithColor = React.useMemo(() => {
    return gateways.map((g) => ({
      ...g,
      fill: PROVIDER_COLORS[g.provider] || PROVIDER_COLORS.OTHER,
    }));
  }, [gateways]);

  return (
    <section className="relative w-full mx-auto max-w-384 mt-6 pb-2 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {isDev && (!data || data.totals.transactions === 0) && (
            <button
              type="button"
              onClick={() => setShowSample((prev) => !prev)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg p-2 h-max text-xs font-medium backdrop-blur-xs",
                showSample
                  ? "bg-amber-500/15 text-amber-500 hover:text-amber-400"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <SparkleIcon weight={showSample ? "fill" : "regular"} className="size-3 text-amber-400" />
              <span>{showSample ? "Sample Active" : "Preview Sample"}</span>
            </button>
          )}

          <div className="inline-flex items-center rounded-lg border border-border bg-muted/60 p-0.5 backdrop-blur-xs">
            {(["revenue", "volume"] as const).map((m) => {
              const active = metric === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetric(m)}
                  className={`relative z-10 px-2.5 py-1 h-7 text-xs font-medium capitalize rounded-md transition-colors cursor-pointer ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {active && (
                    <motion.span
                      layoutId="analytics-metric-indicator"
                      className="absolute inset-0 rounded-md bg-muted/80 shadow-xs"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{m}</span>
                </button>
              );
            })}
          </div>

          <div className="inline-flex items-center rounded-lg border border-border bg-muted/60 p-0.5 backdrop-blur-xs">
            {(["7d", "30d", "90d", "1y"] as const).map((tf) => {
              const active = timeframe === tf;
              return (
                <button
                  key={tf}
                  type="button"
                  onClick={() => {
                    setTimeframe(tf);
                    setIsLoading(true);
                  }}
                  className={`relative z-10 px-2.5 h-7 py-1 text-xs font-medium uppercase rounded-md transition-colors cursor-pointer ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {active && (
                    <motion.span
                      layoutId="analytics-timeframe-indicator"
                      className="absolute inset-0 rounded-md bg-muted/80 shadow-xs"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tf}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="analytics-skeleton"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex flex-col gap-6"
          >
            <OrgAnalyticsSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key="analytics-content"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-36">
              <div className="relative rounded-2xl border border-border/80 bg-card/50 backdrop-blur-md p-5 flex flex-col justify-between overflow-hidden shadow-xs hover:border-border transition-colors">
                <div className="absolute inset-x-0 bottom-0 h-20 pointer-events-none opacity-20 dark:opacity-25">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 200, height: 80 }} className={"mask-l-from-0%"}>
                    <AreaChart data={timeline} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#10B981"
                        fill="#10B981"
                        strokeWidth={1.5}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="relative flex flex-col min-h-0 grow justify-between z-10">
                  <div className="text-4xl font-medium font-heading tracking-tight text-foreground tabular-nums">
                    {formatCurrency(totals.revenue, totals.currency)}
                  </div>
                  <div className="flex flex-col mt-auto">
                    <span className="text-xs font-medium">Total Organization Revenue</span>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-0.5 text-emerald-500 font-medium">
                        <TrendUpIcon size={12} weight="bold" />
                        <span>Active</span>
                      </span>
                      <span>across {currencies.length || 1} currencies</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative rounded-2xl border border-border/80 bg-card/50 backdrop-blur-md p-5 flex flex-col justify-between overflow-hidden shadow-xs hover:border-border transition-colors">
                <div className="absolute inset-x-0 bottom-0 h-20 pointer-events-none opacity-20 dark:opacity-25">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 200, height: 80 }} className={"mask-l-from-0%"}>
                    <AreaChart data={timeline} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="var(--primary)"
                        fill="var(--primary)"
                        strokeWidth={1.5}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="relative flex flex-col min-h-0 grow justify-between z-10">
                  <div className="text-4xl font-medium font-heading tracking-tight text-foreground tabular-nums">
                    {totals.transactions.toLocaleString()} TX
                  </div>
                  <div className="flex flex-col mt-auto">
                    <span className="text-xs font-medium">Transactions Processed</span>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                      <span className="text-foreground font-medium">{totals.realTransactions.toLocaleString()} real</span>
                      <span>·</span>
                      <span>{totals.testTransactions.toLocaleString()} test</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative rounded-2xl border border-border/80 bg-card/50 backdrop-blur-md p-5 flex flex-col justify-between overflow-hidden shadow-xs hover:border-border transition-colors">
                <div className="absolute inset-x-0 bottom-0 h-20 pointer-events-none opacity-20 dark:opacity-25">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 200, height: 80 }} className={"mask-l-from-0%"}>
                    <AreaChart data={timeline} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Area
                        type="monotone"
                        dataKey="realCount"
                        stroke="#0284C7"
                        fill="#0284C7"
                        strokeWidth={1.5}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="relative flex flex-col min-h-0 grow justify-between z-10">
                  <div className="text-4xl font-medium font-heading tracking-tight text-foreground tabular-nums">
                    {gateways.length}
                  </div>
                  <div className="flex flex-col mt-auto">
                    <span className="text-xs font-medium">Active Payment Gateways</span>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                      {gateways[0] ? (
                        <>
                          <span className="text-foreground font-medium">
                            {PROVIDER_NAMES[gateways[0].provider] || gateways[0].provider}
                          </span>
                          <span>({gateways[0].percentage}% lead)</span>
                        </>
                      ) : (
                        <span>No gateway connected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md p-6 flex flex-col gap-4 shadow-xs">
              <div className="w-full h-96 mask-b-from-20% pb-8">
                <ChartContainer config={timelineChartConfig} className="size-full">
                  <AreaChart data={timeline} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillTimelineTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(val) => {
                        const parts = String(val).split("-");
                        return parts.length === 3 ? `${parts[1]}/${parts[2]}` : val;
                      }}
                      className="text-[10px] font-mono fill-muted-foreground"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(val) =>
                        metric === "revenue" ? `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}` : val
                      }
                      className="text-[10px] font-mono fill-muted-foreground"
                    />
                    <ChartTooltip
                      cursor={{ stroke: "var(--border)", strokeWidth: 1, strokeDasharray: "3 3" }}
                      animationDuration={250}
                      animationEasing="ease-out"
                      content={
                        <ChartTooltipContent
                          formatter={(val) => [
                            metric === "revenue"
                              ? formatCurrency(Number(val), totals.currency) + " "
                              : `${Number(val).toLocaleString()} TXns `,
                            metric === "revenue" ? "Revenue" : "",
                          ]}
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey={metric === "revenue" ? "amount" : "count"}
                      stroke="var(--primary)"
                      strokeWidth={2}
                      fill="url(#fillTimelineTrend)"
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2 absolute bottom-0 w-full left-0 p-6">
                <div>
                  <h3 className="text-2xl font-medium text-foreground mb-2">
                    {metric === "revenue" ? "Revenue History Timeline" : "Transaction Volume History"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {metric === "revenue" ? "Detailed transaction revenue trend" : "Daily processed transaction volume"} in the past {timeframe}.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="size-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground capitalize">{metric}</span>
                </div>
              </div>
            </div>

            {totals.transactions > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border group border-border/80 bg-card/40 backdrop-blur-md overflow-hidden relative p-6 flex flex-col justify-between min-h-115">
                  <div>
                    <div className="flex items-center justify-between absolute z-10">
                      <div>
                        <h3 className="text-2xl font-medium mb-2 text-foreground">Payment Gateways</h3>
                        <p className="text-xs text-muted-foreground">Volume & share distribution across providers</p>
                      </div>
                    </div>

                    {gateways.length > 0 ? (
                      <ChartContainer config={gatewayChartConfig} className="size-96 group-hover:grayscale-0 grayscale transition-all duration-250 ease-in-out absolute bottom-0 right-6 aspect-square scale-125 mask-linear-from-0% mask-top-left">
                        <PieChart>
                          <ChartTooltip
                            cursor={false}
                            animationDuration={250}
                            animationEasing="ease-out"
                            content={
                              <ChartTooltipContent
                                nameKey="provider"
                                hideLabel
                                formatter={(val, name) => [
                                  PROVIDER_NAMES[String(name)] || String(name),
                                  ` (${Number(val).toLocaleString()} transactions)`,
                                ]}
                              />
                            }
                          />
                          <Pie
                            data={gatewaysWithColor}
                            dataKey="count"
                            nameKey="provider"
                            innerRadius={140}
                            outerRadius={190}
                            paddingAngle={3}
                            strokeWidth={0}
                          >
                            {gatewaysWithColor.map((entry) => (
                              <Cell
                                key={entry.provider}
                                fill={entry.fill}
                              />
                            ))}
                          </Pie>
                        </PieChart>
                      </ChartContainer>
                    ) : (
                      <div className="py-12 text-center text-xs text-muted-foreground">
                        No gateway transactions recorded yet
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl min-h-115 not-hover:grayscale transition-all duration-250 ease-in-out border border-border/80 bg-card/40 backdrop-blur-md p-6 flex flex-col justify-between shadow-xs overflow-hidden">
                  <div>
                    <div className="flex items-center justify-between absolute z-10">
                      <div>
                        <h3 className="text-2xl font-medium mb-2 text-foreground">Global Currency Breakdown</h3>
                        <p className="text-xs text-muted-foreground">Interactive 3D representation of donation sources</p>
                      </div>
                    </div>

                    <div className="w-full -mb-12">
                      <GlobeBars
                        markers={currencyMarkers}
                        dark={isDark}
                        focusLocation={activeLocation}
                        focusedMarkerId={activeMarkerId}
                      />
                    </div>

                    <div className="flex flex-wrap z-20 justify-center gap-2 w-full mt-2 absolute left-0 bottom-3">
                      {currencies.map((c) => {
                        const isHovered = hoveredCurrency === c.currency;
                        return (
                          <div
                            key={c.currency}
                            onMouseEnter={() => setHoveredCurrency(c.currency)}
                            onMouseLeave={() => setHoveredCurrency(null)}
                            className={cn(
                              "flex gap-6 items-center justify-between p-2 rounded-full w-max border text-xs z-20 backdrop-blur-lg select-none cursor-pointer transition-all duration-200",
                              isHovered
                                ? "border-sky-500/80 bg-sky-500/15 shadow-sm scale-105"
                                : "border-border/40 bg-card/20 hover:border-border/80 hover:bg-card/40"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "size-2 rounded-full shrink-0 transition-all duration-200",
                                  isHovered
                                    ? "bg-sky-400 scale-125 shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                                    : "bg-sky-500"
                                )}
                              />
                              <span className="font-semibold text-foreground">{c.currency}</span>
                              <span className="text-muted-foreground text-[11px]">
                                {c.currency === "THB"
                                  ? "Thailand"
                                  : c.currency === "USD"
                                    ? "United States"
                                    : c.currency === "EUR"
                                      ? "Europe"
                                      : "International"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 tabular-nums text-xs">
                              <span className="text-muted-foreground">{c.percentage}%</span>
                              <span className="font-bold text-foreground">
                                {formatCurrency(c.amount, c.currency)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});

export default OrgAnalytics;
