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
  SortAscendingIcon,
  SortDescendingIcon,
  DotsThreeVerticalIcon,
  PaperPlaneTiltIcon,
  TrashIcon,
  ArrowCounterClockwiseIcon,
  CopyIcon,
  CheckIcon,
  SparkleIcon,
  CaretLeftIcon,
  CaretRightIcon,
  MoneyIcon,
  XIcon,
} from "@phosphor-icons/react";
import { toast } from "@/components/custom-ui/toast";
import { cn, getFallbackInitial } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { AutoHeight } from "@/components/animate-ui/primitives/effects/auto-height";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import JellyRadio from "@/components/JellyRadio";
import { Input } from "react-smooth-input";
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
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatTableDate } from "@/lib/audit-format";
import { DEFAULT_TRANSACTION_PAGE_SIZE } from "@/consts/payment";

const GATEWAY_NAMES: Record<string, string> = {
  STRIPE: "Stripe",
  BUYMEACOFFEE: "Buy Me a Coffee",
  BMAC: "Buy Me a Coffee",
  KOFI: "Ko-fi",
  FEELFREEPAY: "FeelFreePay",
  FFP: "PromptPay",
  XENDIT: "Xendit",
};

const TRANSACTION_STATUS_TABS = [
  { value: "ALL", label: "All Status" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PENDING", label: "Pending" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

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

const PAGE_SIZE = DEFAULT_TRANSACTION_PAGE_SIZE;

export default function StreamerTransactionsPage() {
  const routeParams = useParams();
  const { activeOrg, activeStreamer, authFetch } = useUserContext();
  const orgTarget = activeOrg?.id || activeOrg?.slug || (routeParams?.org as string);
  const streamerTarget =
    activeStreamer?.id || activeStreamer?.name || (routeParams?.streamer as string);

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
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

  const fetchTransactions = useCallback(() => {
    if (!orgTarget || !streamerTarget) return;

    setLoading(true);
    const startTime = Date.now();
    const MIN_SKELETON_MS = 280;

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
      .then(async (data) => {
        if (data && Array.isArray(data.transactions)) {
          const elapsed = Date.now() - startTime;
          if (elapsed < MIN_SKELETON_MS) {
            await new Promise((resolve) => setTimeout(resolve, MIN_SKELETON_MS - elapsed));
          }
          setTransactions(data.transactions);
          setTotalCount(data.total || 0);
        }
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        toast.error("Failed to load transactions");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    orgTarget,
    streamerTarget,
    currentPage,
    sortBy,
    sortOrder,
    selectedProvider,
    selectedStatus,
    searchQuery,
    authFetch,
  ]);

  const refetchTransactions = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    let ignore = false;
    queueMicrotask(() => {
      if (!ignore) fetchTransactions();
    });
    return () => {
      ignore = true;
    };
  }, [fetchTransactions]);

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mx-auto max-w-384 px-12 pt-12 flex flex-col gap-6 z-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <MoneyIcon size={16} weight="bold" />
            <span>Channel Financials</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-foreground my-3">
            Transactions & Tips
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Consolidated supporter donations, tips, and gateway event history for @{streamerTarget}.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border/80 bg-card/60 shadow-xs backdrop-blur-xs">
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
            <span className="text-[11px] text-muted-foreground font-medium font-sans">
              {wsStatus === "connected"
                ? "Live (WS)"
                : wsStatus === "connecting"
                  ? "Connecting..."
                  : "Offline"}
            </span>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={refetchTransactions}
            disabled={loading}
            className="gap-1.5 text-xs rounded-xl p-3 h-max cursor-pointer"
            title="Refetch data from server"
          >
            <ArrowsClockwiseIcon
              size={14}
              className={cn(loading && "animate-spin")}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsTestDialogOpen(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl p-3 h-max cursor-pointer text-xs"
          >
            <SparkleIcon size={15} weight="bold" />
            <span>Simulate Tip</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <JellyRadio
            items={TRANSACTION_STATUS_TABS}
            value={selectedStatus}
            disabled={false}
            onChange={(value) => {
              setSelectedStatus(value);
              setCurrentPage(1);
            }}
            size="sm"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Input
              type="text"
              placeholder="Search supporter or message..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              startContent={<MagnifyingGlassIcon size={16} className="text-muted-foreground" />}
              endContent={
                searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    <XIcon size={14} />
                  </button>
                ) : null
              }
              fontStyle={{
                fontFamily: "var(--font-sans)",
                fontWeight: "500",
                fontSize: "14px",
              }}
              className="w-full"
              classNames={{ base: "h-9 rounded-xl" }}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-card border border-border/80 text-foreground text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary font-medium"
            >
              <option value="ALL">All Gateways</option>
              <option value="BMAC">Buy Me a Coffee</option>
              <option value="KOFI">Ko-fi</option>
              <option value="STRIPE">Stripe</option>
              <option value="XENDIT">Xendit</option>
              <option value="FFP">PromptPay (FFP)</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as "createdAt" | "amount");
                setCurrentPage(1);
              }}
              className="bg-card border border-border/80 text-foreground text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary font-medium"
            >
              <option value="createdAt">Sort: Date</option>
              <option value="amount">Sort: Amount</option>
            </select>

            <Button
              size="xs"
              variant="outline"
              onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
              className="gap-1 text-xs rounded-xl h-9 px-3 cursor-pointer"
              title={`Sorted by ${sortBy} ${sortOrder}`}
            >
              {sortOrder === "desc" ? (
                <SortDescendingIcon size={15} weight="bold" />
              ) : (
                <SortAscendingIcon size={15} weight="bold" />
              )}
              <span className="hidden xl:inline">
                {sortOrder === "desc" ? "Desc" : "Asc"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm flex flex-col justify-between">
        <AutoHeight
          deps={[loading, transactions.length, currentPage]}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 28,
          }}
        >
          <Table
            containerClassName={cn(
              "w-full",
              isAnimating ? "overflow-hidden" : "overflow-x-auto overflow-y-hidden"
            )}
            className="w-full text-left border-collapse text-xs"
          >
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-muted/20 text-muted-foreground text-[10px] tracking-wider uppercase font-semibold hover:bg-muted/20">
                <TableHead className="py-3.5 px-4 font-semibold text-muted-foreground/70 h-auto">Status & Type</TableHead>
                <TableHead className="py-3.5 px-4 font-semibold text-muted-foreground/70 h-auto">Supporter</TableHead>
                <TableHead className="py-3.5 px-4 font-semibold text-muted-foreground/70 h-auto">Amount</TableHead>
                <TableHead className="py-3.5 px-4 font-semibold text-muted-foreground/70 h-auto">Gateway</TableHead>
                <TableHead className="py-3.5 px-4 font-semibold text-muted-foreground/70 h-auto">Date</TableHead>
                <TableHead className="py-3.5 px-4 text-right font-semibold text-muted-foreground/70 h-auto">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <AnimatePresence
              mode="wait"
              initial={false}
              onExitComplete={() => setIsAnimating(false)}
            >
              {loading ? (
                <motion.tbody
                  key="loading-skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  onAnimationStart={() => setIsAnimating(true)}
                  onAnimationComplete={() => setIsAnimating(false)}
                  className="divide-y divide-border/40 [&_tr:last-child]:border-0"
                >
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <TableRow key={`skeleton-${idx}`} className="hover:bg-transparent">
                      <TableCell className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Skeleton className="size-1.5 rounded-full shrink-0" />
                            <Skeleton className="h-3.5 w-16 rounded" />
                          </div>
                          <Skeleton className="h-2.5 w-10 ml-3.5 rounded" />
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4 min-w-50">
                        <div className="flex items-start gap-2.5">
                          <Skeleton className="size-7 rounded-full shrink-0 mt-0.5" />
                          <div className="grid gap-1.5 w-full max-w-xs">
                            <Skeleton className="h-3.5 w-24 rounded" />
                            <Skeleton className="h-2.5 w-36 rounded" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4 whitespace-nowrap">
                        <Skeleton className="h-3.5 w-16 rounded" />
                      </TableCell>
                      <TableCell className="py-3 px-4 whitespace-nowrap">
                        <Skeleton className="h-3.5 w-14 rounded" />
                      </TableCell>
                      <TableCell className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-3.5 w-20 rounded" />
                          <Skeleton className="h-2.5 w-12 rounded" />
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-right whitespace-nowrap">
                        <Skeleton className="size-6 rounded ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </motion.tbody>
              ) : transactions.length === 0 ? (
                <motion.tbody
                  key="empty-state"
                  initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  onAnimationStart={() => setIsAnimating(true)}
                  onAnimationComplete={() => setIsAnimating(false)}
                  className="divide-y divide-border/40 [&_tr:last-child]:border-0"
                >
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2.5">
                        <MoneyIcon size={36} weight="duotone" className="text-muted-foreground/50" />
                        <span className="font-medium text-foreground text-sm">No transactions recorded yet</span>
                        <span className="text-xs text-muted-foreground max-w-sm">
                          Incoming tips and donations from connected gateways will appear here in real-time.
                        </span>
                        {(searchQuery || selectedStatus !== "ALL" || selectedProvider !== "ALL") && (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => {
                              setSearchQuery("");
                              setSelectedStatus("ALL");
                              setSelectedProvider("ALL");
                              setCurrentPage(1);
                            }}
                            className="mt-2 text-xs rounded-lg cursor-pointer"
                          >
                            Reset filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                </motion.tbody>
              ) : (
                <motion.tbody
                  key={`transactions-page-${currentPage}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  onAnimationStart={() => setIsAnimating(true)}
                  className="divide-y divide-border/60"
                >
                  {transactions.map((tx, idx) => {
                    const isCompleted = tx.status === "COMPLETED";
                    const isFailed = tx.status === "FAILED";
                    const isPending = tx.status === "PENDING";
                    const isRefunded = tx.status === "REFUNDED";

                    return (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: Math.min(idx * 0.03, 0.15),
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className={cn(
                          "group transition-all duration-300 border-b",
                          tx.isDeleted
                            ? "opacity-20 border-dashed bg-muted/5 line-through text-muted-foreground hover:opacity-35"
                            : "hover:bg-muted/30",
                          liveTxId === tx.id && "bg-primary/10 ring-1 ring-inset ring-primary/40",
                        )}
                      >
                        <TableCell className="py-3 px-4 whitespace-nowrap">
                          <div className="flex flex-col leading-tight">
                            <div className="inline-flex items-center gap-2">
                              <span
                                className={cn(
                                  "size-1.5 rounded-full shrink-0",
                                  isCompleted && "bg-emerald-500",
                                  isPending && "bg-amber-500",
                                  isFailed && "bg-rose-500",
                                  isRefunded && "bg-zinc-400",
                                )}
                              />
                              <span className="font-medium text-foreground text-xs">
                                {isCompleted
                                  ? "Succeeded"
                                  : isPending
                                    ? "Pending"
                                    : isFailed
                                      ? "Failed"
                                      : "Refunded"}
                              </span>
                              {tx.isTest && (
                                <span className="text-[10px] text-amber-500/90 font-medium">
                                  (Test)
                                </span>
                              )}
                              {tx.isDeleted && (
                                <span className="text-[10px] text-rose-500/90 font-medium">
                                  (Deleted)
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground/70 pl-3.5 font-sans">
                              {tx.type}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 px-4 min-w-50">
                          <div className="flex items-start gap-2.5">
                            <Avatar className="size-7 rounded-full border border-border/60 shrink-0 mt-0.5">
                              <AvatarFallback className="text-[10px] font-medium bg-muted text-foreground">
                                {getFallbackInitial(tx.senderName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="grid leading-tight">
                              <span className="font-medium text-foreground text-xs truncate">
                                {tx.senderName}
                              </span>
                              {tx.message && (
                                <span
                                  className="text-[11px] text-muted-foreground/70 truncate max-w-xs mt-0.5"
                                  title={tx.message}
                                >
                                  &ldquo;{tx.message}&rdquo;
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-baseline gap-1 font-sans font-medium tabular-nums text-xs text-foreground">
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
                            <span className="text-[10px] text-muted-foreground/70 font-normal">
                              {tx.currency}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 px-4 whitespace-nowrap">
                          <span className="text-xs text-muted-foreground/80 font-medium">
                            {GATEWAY_NAMES[tx.provider.toUpperCase()] || tx.provider}
                          </span>
                        </TableCell>

                        <TableCell className="py-3 px-4 whitespace-nowrap text-xs">
                          <div className="flex flex-col leading-tight">
                            <span className="text-foreground/90 font-sans">
                              {formatTableDate(tx.createdAt)}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60 font-sans">
                              {new Date(tx.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 px-4 text-right whitespace-nowrap">
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
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </motion.tbody>
              )}
            </AnimatePresence>
          </Table>
        </AutoHeight>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Showing</span>
            <span className="relative inline-flex items-center overflow-hidden h-4 font-semibold text-foreground">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={transactions.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="tabular-nums font-sans"
                >
                  {transactions.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}
                </motion.span>
              </AnimatePresence>
            </span>
            <span>to</span>
            <span className="relative inline-flex items-center overflow-hidden h-4 font-semibold text-foreground">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={Math.min(currentPage * PAGE_SIZE, totalCount)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="tabular-nums font-sans"
                >
                  {Math.min(currentPage * PAGE_SIZE, totalCount)}
                </motion.span>
              </AnimatePresence>
            </span>
            <span>of</span>
            <span className="relative inline-flex items-center overflow-hidden h-4 font-semibold text-foreground">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={totalCount}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="tabular-nums font-sans"
                >
                  {totalCount}
                </motion.span>
              </AnimatePresence>
            </span>
            <span>transactions</span>
          </div>

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
            <div className="flex items-center gap-1 px-2 text-xs text-muted-foreground font-sans">
              <span className="relative inline-flex items-center overflow-hidden h-4 font-semibold text-foreground">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={currentPage}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="tabular-nums font-sans"
                  >
                    {currentPage}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span>/</span>
              <span className="relative inline-flex items-center overflow-hidden h-4 font-medium text-foreground/80">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={totalPages}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="tabular-nums font-sans"
                  >
                    {totalPages}
                  </motion.span>
                </AnimatePresence>
              </span>
            </div>
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
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-sans font-semibold tabular-nums text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Currency</label>
                <select
                  value={testCurrency}
                  onChange={(e) => setTestCurrency(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary font-sans font-medium"
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
    </motion.div>
  );
}
