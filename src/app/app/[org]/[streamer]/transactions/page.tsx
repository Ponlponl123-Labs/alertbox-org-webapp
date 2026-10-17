"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import { getCookie } from "cookies-next";
import { Button } from "@/components/ui/button";
import {
  ArrowsClockwiseIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SortAscendingIcon,
  SortDescendingIcon,
  DotsThreeVerticalIcon,
  PaperPlaneTiltIcon,
  TrashIcon,
  ArrowCounterClockwiseIcon,
  CopyIcon,
  CheckIcon,
  StorefrontIcon,
  SparkleIcon,
  CaretLeftIcon,
  CaretRightIcon,
  MoneyIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn, getFallbackInitial } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TransactionItem {
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

interface StreamerConnections {
  bmac: { username: string; secret: string } | null;
  kofi: { username: string; secret: string } | null;
  stripe: string | null;
  xendit: string | null;
  ffp: string | null;
  streamlabs: boolean;
}

const PAGE_SIZE = 15;

export default function StreamerTransactionsPage() {
  const routeParams = useParams();
  const { activeOrg, activeStreamer, authFetch } = useUserContext();
  const orgTarget = activeOrg?.id || activeOrg?.slug || (routeParams?.org as string);
  const streamerTarget =
    activeStreamer?.id || activeStreamer?.name || (routeParams?.streamer as string);

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [wsStatus, setWsStatus] = useState<"connected" | "connecting" | "disconnected">("connecting");
  const [liveTxId, setLiveTxId] = useState<string | null>(null);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState<"createdAt" | "amount">("createdAt");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Keep references to active filters for client-side live WebSocket evaluation
  const filterProviderRef = useRef(selectedProvider);
  const filterStatusRef = useRef(selectedStatus);
  const filterSearchRef = useRef(searchQuery);
  const sortByRef = useRef(sortBy);
  const sortOrderRef = useRef(sortOrder);

  useEffect(() => {
    filterProviderRef.current = selectedProvider;
    filterStatusRef.current = selectedStatus;
    filterSearchRef.current = searchQuery;
    sortByRef.current = sortBy;
    sortOrderRef.current = sortOrder;
  }, [selectedProvider, selectedStatus, searchQuery, sortBy, sortOrder]);

  // Test Transaction Dialog
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testProvider, setTestProvider] = useState("BMAC");
  const [testAmount, setTestAmount] = useState("100");
  const [testCurrency, setTestCurrency] = useState("THB");
  const [testDonorName, setTestDonorName] = useState("Generous Supporter");
  const [testMessage, setTestMessage] = useState("Keep up the great stream! 🔥");
  const [sendingTest, setSendingTest] = useState(false);

  // Available connections for test dialog
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);

  // Action states
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const refetchTransactions = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Fetch Transactions on filter/page/sort change
  useEffect(() => {
    let active = true;
    if (!orgTarget || !streamerTarget) return;

    const queryParams = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String((currentPage - 1) * PAGE_SIZE),
      sortBy,
      sortOrder,
    });

    if (selectedProvider !== "ALL") queryParams.set("provider", selectedProvider);
    if (selectedStatus !== "ALL") queryParams.set("status", selectedStatus);
    if (searchQuery.trim()) queryParams.set("search", searchQuery.trim());

    authFetch(
      getApiUrl(
        `/api/v1/org/${orgTarget}/streamers/${streamerTarget}/transactions?${queryParams.toString()}`,
      ),
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active) return;
        if (data && Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
          setTotalCount(data.total || 0);
        }
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        if (active) toast.error("Failed to load transactions");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    orgTarget,
    streamerTarget,
    currentPage,
    sortBy,
    sortOrder,
    selectedProvider,
    selectedStatus,
    searchQuery,
    refreshKey,
    authFetch,
  ]);

  // Enterprise Secure WebSocket: Real-time Live Updates with Client-Side Filtering
  useEffect(() => {
    if (!orgTarget || !streamerTarget) return;

    let ws: WebSocket | null = null;
    let pingInterval: ReturnType<typeof setInterval> | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isDisposed = false;
    let reconnectAttempts = 0;

    const connectWebSocket = () => {
      if (isDisposed) return;
      setWsStatus("connecting");

      try {
        const rawCookie = getCookie("USRSS");
        let token = "";
        if (rawCookie) {
          try {
            token = atob(String(rawCookie));
          } catch {
            token = String(rawCookie);
          }
        }

        const apiEndpoint = getApiUrl("/");
        let wsHost = window.location.host;
        let wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";

        try {
          if (apiEndpoint.includes("://")) {
            const url = new URL(apiEndpoint);
            wsHost = url.host;
            wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
          } else if (
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1"
          ) {
            wsHost = `${window.location.hostname}:3001`;
          }
        } catch {
          // fallback to defaults
        }

        const wsUrl = `${wsProtocol}//${wsHost}/v1/org/${orgTarget}/streamers/${streamerTarget}/transactions/live?token=${encodeURIComponent(token)}`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (isDisposed) {
            ws?.close();
            return;
          }
          setWsStatus("connected");
          reconnectAttempts = 0;

          pingInterval = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "ping" }));
            }
          }, 25000);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (!data || typeof data !== "object") return;

            if (data.type === "transaction:new" && data.transaction) {
              const incoming: TransactionItem = data.transaction;

              // Client-side predicate check to eliminate server load
              const matchProvider =
                filterProviderRef.current === "ALL" ||
                incoming.provider.toUpperCase() === filterProviderRef.current.toUpperCase();

              const matchStatus =
                filterStatusRef.current === "ALL" ||
                incoming.status.toUpperCase() === filterStatusRef.current.toUpperCase();

              const q = filterSearchRef.current.trim().toLowerCase();
              const matchSearch =
                !q ||
                incoming.senderName?.toLowerCase().includes(q) ||
                incoming.message?.toLowerCase().includes(q) ||
                incoming.id.toLowerCase().includes(q);

              const passesFilter = matchProvider && matchStatus && matchSearch;

              if (passesFilter) {
                setTransactions((prev) => {
                  if (prev.some((t) => t.id === incoming.id)) return prev;
                  if (sortByRef.current === "createdAt" && sortOrderRef.current === "desc") {
                    return [incoming, ...prev.slice(0, PAGE_SIZE - 1)];
                  }
                  return [incoming, ...prev];
                });
                setTotalCount((c) => c + 1);

                setLiveTxId(incoming.id);
                setTimeout(() => setLiveTxId((id) => (id === incoming.id ? null : id)), 3000);

                toast.info(
                  `⚡ Live: ${incoming.senderName} tipped ${(incoming.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${incoming.currency}`,
                  {
                    description: incoming.message || undefined,
                  },
                );
              } else {
                // Client-side filtered out; keep server load at 0
                setTotalCount((c) => c + 1);
              }
            } else if (data.type === "transaction:updated" && data.transactionId) {
              setTransactions((prev) =>
                prev.map((t) =>
                  t.id === data.transactionId
                    ? {
                        ...t,
                        ...(typeof data.isDeleted === "boolean" ? { isDeleted: data.isDeleted } : {}),
                      }
                    : t,
                ),
              );
            } else if (data.type === "transaction:resend" && data.transactionId) {
              setLiveTxId(data.transactionId);
              setTimeout(() => setLiveTxId((id) => (id === data.transactionId ? null : id)), 2500);
            }
          } catch {
            // ignore non-json frames
          }
        };

        ws.onclose = () => {
          if (pingInterval) clearInterval(pingInterval);
          if (isDisposed) return;
          setWsStatus("disconnected");

          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 15000);
          reconnectAttempts++;
          reconnectTimeout = setTimeout(connectWebSocket, delay);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch {
        setWsStatus("disconnected");
      }
    };

    connectWebSocket();

    return () => {
      isDisposed = true;
      if (pingInterval) clearInterval(pingInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [orgTarget, streamerTarget]);

  // Fetch connected providers to populate test options
  useEffect(() => {
    let active = true;
    if (!orgTarget || !streamerTarget) return;

    authFetch(
      getApiUrl(`/api/v1/org/${orgTarget}/streamers/${streamerTarget}/connections`),
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((conns: StreamerConnections | null) => {
        if (!active) return;
        if (conns) {
          const list: string[] = [];
          if (conns.bmac) list.push("BMAC");
          if (conns.kofi) list.push("KOFI");
          if (conns.stripe) list.push("STRIPE");
          if (conns.xendit) list.push("XENDIT");
          if (conns.ffp) list.push("FFP");
          if (list.length === 0) list.push("BMAC", "KOFI", "STRIPE");
          setAvailableProviders(list);
          setTestProvider((prev) => (list.includes(prev) ? prev : list[0]));
        }
      })
      .catch(() => {
        if (active) setAvailableProviders(["BMAC", "KOFI", "STRIPE"]);
      });

    return () => {
      active = false;
    };
  }, [orgTarget, streamerTarget, authFetch]);

  // Handle Send Test Transaction
  const handleSendTest = async () => {
    if (!orgTarget || !streamerTarget) return;
    setSendingTest(true);

    try {
      const res = await authFetch(
        getApiUrl(`/api/v1/org/${orgTarget}/streamers/${streamerTarget}/transactions/test`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: testProvider,
            amount: Number(testAmount) || 50,
            currency: testCurrency,
            senderName: testDonorName,
            message: testMessage,
          }),
        },
      );

      if (!res.ok) throw new Error("Failed to send test alert");

      toast.success(`Test ${testProvider} alert dispatched successfully!`);
      setIsTestDialogOpen(false);
    } catch {
      toast.error("Failed to trigger test transaction");
    } finally {
      setSendingTest(false);
    }
  };

  // Handle Soft Delete Toggle
  const handleToggleSoftDelete = async (txId: string) => {
    if (!orgTarget || !streamerTarget) return;

    try {
      const res = await authFetch(
        getApiUrl(
          `/api/v1/org/${orgTarget}/streamers/${streamerTarget}/transactions/${txId}/soft-delete`,
        ),
        { method: "PATCH" },
      );

      if (!res.ok) throw new Error("Soft delete failed");
      const data = await res.json();

      setTransactions((prev) =>
        prev.map((t) => (t.id === txId ? { ...t, isDeleted: data.isDeleted } : t)),
      );

      toast.success(
        data.isDeleted ? "Transaction hidden (dashed)" : "Transaction restored",
      );
    } catch {
      toast.error("Failed to update transaction status");
    }
  };

  // Handle Resend Alert (Streamlabs replay style)
  const handleResendAlert = async (tx: TransactionItem) => {
    if (!orgTarget || !streamerTarget) return;

    try {
      const res = await authFetch(
        getApiUrl(
          `/api/v1/org/${orgTarget}/streamers/${streamerTarget}/transactions/${tx.id}/resend`,
        ),
        { method: "POST" },
      );

      if (!res.ok) throw new Error("Replay failed");

      toast.success(
        `Replayed alert for ${tx.senderName} (${(tx.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${tx.currency})`,
      );
    } catch {
      toast.error("Failed to resend alert");
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-5 max-w-6xl w-full py-4 select-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <StorefrontIcon size={16} weight="bold" />
            <span>Channel Financials</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-0.5">
            Transactions & Tips
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Consolidated supporter donations, tips, and gateway event history for @{streamerTarget}.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-border bg-card/60 shadow-xs backdrop-blur-xs">
            <span
              className={cn(
                "relative flex h-2 w-2 rounded-full",
                wsStatus === "connected"
                  ? "bg-emerald-500"
                  : wsStatus === "connecting"
                  ? "bg-amber-500"
                  : "bg-zinc-400",
              )}
            >
              {wsStatus === "connected" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              {wsStatus === "connected"
                ? "Live (WS)"
                : wsStatus === "connecting"
                ? "Connecting..."
                : "Offline"}
            </span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={refetchTransactions}
            disabled={loading}
            className="gap-1.5"
            title="Refetch data from server with current active filters"
          >
            <ArrowsClockwiseIcon
              size={14}
              weight="bold"
              className={cn(loading && "animate-spin")}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsTestDialogOpen(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <SparkleIcon size={15} weight="bold" />
            <span>Send Test Alert</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card">
        <div className="relative flex-1">
          <MagnifyingGlassIcon
            size={16}
            weight="bold"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search donor name or message..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FunnelIcon size={13} weight="bold" />
            <select
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-background border border-border text-foreground text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Gateways</option>
              <option value="BMAC">Buy Me a Coffee</option>
              <option value="KOFI">Ko-fi</option>
              <option value="STRIPE">Stripe</option>
              <option value="XENDIT">Xendit</option>
              <option value="FFP">PromptPay (FFP)</option>
            </select>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-background border border-border text-foreground text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as "createdAt" | "amount");
              setCurrentPage(1);
            }}
            className="bg-background border border-border text-foreground text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary"
          >
            <option value="createdAt">Sort: Date</option>
            <option value="amount">Sort: Amount</option>
          </select>

          <Button
            size="xs"
            variant="ghost"
            onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
            className="gap-1 text-xs"
            title={`Sorted by ${sortBy} ${sortOrder}`}
          >
            {sortOrder === "desc" ? (
              <SortDescendingIcon size={15} weight="bold" />
            ) : (
              <SortAscendingIcon size={15} weight="bold" />
            )}
            <span className="hidden sm:inline">
              {sortOrder === "desc" ? "Descending" : "Ascending"}
            </span>
          </Button>
        </div>
      </div>

      <div className="relative rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-xs flex items-center justify-center z-10">
            <Spinner className="size-6 text-primary" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Status & Type</th>
                <th className="py-3 px-4">Supporter</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {transactions.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <MoneyIcon size={32} weight="duotone" className="text-muted-foreground/60" />
                      <span className="font-medium text-foreground">No transactions recorded yet</span>
                      <span className="text-[11px] max-w-sm">
                        Incoming tips and donations from connected gateways will appear here in real-time.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isCompleted = tx.status === "COMPLETED";
                  const isFailed = tx.status === "FAILED";
                  const isPending = tx.status === "PENDING";
                  const isRefunded = tx.status === "REFUNDED";

                  return (
                    <tr
                      key={tx.id}
                      className={cn(
                        "group transition-all duration-300 hover:bg-muted/30",
                        liveTxId === tx.id && "bg-primary/10 ring-1 ring-inset ring-primary/40",
                        tx.isDeleted && "opacity-40 border-dashed bg-muted/10 line-through text-muted-foreground",
                      )}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "size-2 rounded-full shrink-0",
                              isCompleted && "bg-emerald-500",
                              isPending && "bg-amber-500",
                              isFailed && "bg-rose-500",
                              isRefunded && "bg-zinc-500",
                            )}
                          />
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground text-xs">
                              {tx.type}
                            </span>
                            {tx.isTest && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-amber-500/15 text-amber-500 border border-amber-500/20">
                                TEST
                              </span>
                            )}
                            {tx.isDeleted && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-rose-500/15 text-rose-500 border border-rose-500/20">
                                DELETED
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 min-w-50">
                        <div className="flex items-start gap-2.5">
                          <div className="size-7 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                            {getFallbackInitial(tx.senderName)}
                          </div>
                          <div className="grid leading-tight">
                            <span className="font-semibold text-foreground truncate">
                              {tx.senderName}
                            </span>
                            {tx.message && (
                              <span
                                className="text-[11px] text-muted-foreground truncate max-w-xs mt-0.5"
                                title={tx.message}
                              >
                                &ldquo;{tx.message}&rdquo;
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-baseline gap-1 font-mono font-bold text-sm text-foreground">
                          <span>
                            {tx.currency === "THB"
                              ? "฿"
                              : tx.currency === "USD"
                              ? "$"
                              : tx.currency === "EUR"
                              ? "€"
                              : ""}
                            {(tx.amount / 100).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            {tx.currency}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-md text-[11px] font-medium bg-muted text-foreground border border-border">
                          {tx.provider}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-muted-foreground font-mono">
                        {new Date(tx.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        <span className="opacity-75">
                          {new Date(tx.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Popover>
                          <PopoverTrigger
                            render={
                              <button
                                aria-label="Transaction Actions"
                                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <DotsThreeVerticalIcon size={16} weight="bold" />
                              </button>
                            }
                          />
                          <PopoverContent
                            align="end"
                            className="w-48 p-1.5 flex flex-col gap-1 rounded-xl bg-card border border-border shadow-xl text-xs"
                          >
                            <button
                              onClick={() => handleResendAlert(tx)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground transition-colors text-left font-medium"
                            >
                              <PaperPlaneTiltIcon size={14} weight="bold" className="text-primary" />
                              <span>Resend Alert</span>
                            </button>

                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(tx.id);
                                setCopiedId(tx.id);
                                toast.success("Transaction ID copied");
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground transition-colors text-left"
                            >
                              {copiedId === tx.id ? (
                                <CheckIcon size={14} weight="bold" className="text-emerald-500" />
                              ) : (
                                <CopyIcon size={14} weight="bold" />
                              )}
                              <span>Copy ID</span>
                            </button>

                            <div className="h-px bg-border my-0.5" />

                            <button
                              onClick={() => handleToggleSoftDelete(tx.id)}
                              className={cn(
                                "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-left font-medium",
                                tx.isDeleted
                                  ? "hover:bg-emerald-500/10 text-emerald-500"
                                  : "hover:bg-rose-500/10 text-rose-500",
                              )}
                            >
                              {tx.isDeleted ? (
                                <>
                                  <ArrowCounterClockwiseIcon size={14} weight="bold" />
                                  <span>Restore Row</span>
                                </>
                              ) : (
                                <>
                                  <TrashIcon size={14} weight="bold" />
                                  <span>Soft Delete</span>
                                </>
                              )}
                            </button>
                          </PopoverContent>
                        </Popover>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
          <span>
            Showing{" "}
            <strong className="text-foreground">
              {transactions.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}
            </strong>{" "}
            to{" "}
            <strong className="text-foreground">
              {Math.min(currentPage * PAGE_SIZE, totalCount)}
            </strong>{" "}
            of <strong className="text-foreground">{totalCount}</strong> transactions
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              size="xs"
              variant="outline"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="gap-1"
            >
              <CaretLeftIcon size={12} weight="bold" />
              <span>Prev</span>
            </Button>
            <span className="px-2 text-xs font-mono font-medium text-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              size="xs"
              variant="outline"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="gap-1"
            >
              <span>Next</span>
              <CaretRightIcon size={12} weight="bold" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <SparkleIcon size={20} weight="bold" className="text-primary" />
              <span>Simulate Donation Transaction</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Dispatch a mock donation alert through any configured payment gateway to test on-screen OBS alertbox widgets.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">
                Payment Gateway Provider
              </label>
              <select
                value={testProvider}
                onChange={(e) => setTestProvider(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary font-medium"
              >
                {availableProviders.map((p) => (
                  <option key={p} value={p}>
                    {p === "BMAC"
                      ? "Buy Me a Coffee (BMAC)"
                      : p === "KOFI"
                      ? "Ko-fi"
                      : p === "STRIPE"
                      ? "Stripe Payments"
                      : p === "XENDIT"
                      ? "Xendit"
                      : p === "FFP"
                      ? "PromptPay / FastPay"
                      : p}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-muted-foreground">
                Only integrations currently active or available for @{streamerTarget} are listed.
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Amount</label>
                <input
                  type="number"
                  min="1"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  placeholder="100"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Currency</label>
                <select
                  value={testCurrency}
                  onChange={(e) => setTestCurrency(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary font-mono"
                >
                  <option value="THB">THB (฿)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Donor Name</label>
              <input
                type="text"
                value={testDonorName}
                onChange={(e) => setTestDonorName(e.target.value)}
                placeholder="Donor nickname"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Donation Message</label>
              <textarea
                rows={2}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Alert message..."
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 mt-2">
            <DialogClose
              render={
                <Button size="sm" variant="ghost" disabled={sendingTest}>
                  Cancel
                </Button>
              }
            />
            <Button
              size="sm"
              onClick={handleSendTest}
              disabled={sendingTest}
              className="gap-2 bg-primary text-primary-foreground"
            >
              {sendingTest ? (
                <Spinner className="size-4" />
              ) : (
                <PaperPlaneTiltIcon size={14} weight="bold" />
              )}
              <span>Dispatch Alert</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
