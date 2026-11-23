"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import { formatMoneyMinorUnits, getCachedDateFormat } from "@/lib/formatters";
import { canAccessStreamer } from "@/lib/rbac";
import { isSafePathSegment } from "@/lib/security";
import { OrgPerm, StreamerPerm } from "@/consts/permission";
import { useAuthenticatedWebSocket } from "@/hooks/use-authenticated-ws";
import { Button } from "@/components/ui/button";
import {
  MagnifyingGlassIcon,
  DotsThreeVerticalIcon,
  PaperPlaneTiltIcon,
  TrashIcon,
  ArrowCounterClockwiseIcon,
  CopyIcon,
  CheckIcon,
  SparkleIcon,
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
import { Input as UiInput } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { DEFAULT_TRANSACTION_PAGE_SIZE, GATEWAY_NAMES } from "@/consts/payment";
import type { StreamerConnections, TransactionItem } from "@/types/transaction.types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/custom-ui/select";
import { Route } from "@/components/animate-ui/icons/hugeicons/route";
import { ArrowUpDown } from "@/components/animate-ui/icons/hugeicons/arrow-up-down";
import { AnimateIcon } from "@animate-ui/react/icons";
import { RefreshCcw } from "@/components/animate-ui/icons/hugeicons/refresh-ccw";
import { Sparkles } from "@/components/animate-ui/icons/hugeicons/sparkles";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { formatI18n } from "@/lib/i18n";

const PAGE_SIZE = DEFAULT_TRANSACTION_PAGE_SIZE;

export default function StreamerTransactionsPage() {
  const lang = useStore(coreStore, (s) => s.lang);
  const st = lang.data.app.streamer.transactions;
  const statusTabs = useMemo(
    () => [
      { value: "ALL", label: st.tabs.all },
      { value: "COMPLETED", label: st.tabs.completed },
      { value: "PENDING", label: st.tabs.pending },
      { value: "FAILED", label: st.tabs.failed },
      { value: "REFUNDED", label: st.tabs.refunded },
    ],
    [st.tabs],
  );
  const gatewayOptions = useMemo(
    () => [
      { label: st.all_gateways, value: "ALL" },
      { label: lang.data.app.connections.providers.bmac.name, value: "BMAC" },
      { label: lang.data.app.connections.providers.kofi.name, value: "KOFI" },
      { label: lang.data.app.connections.providers.stripe.name, value: "STRIPE" },
      { label: lang.data.app.connections.providers.xendit.name, value: "XENDIT" },
      { label: st.promptpay_ffp, value: "FFP" },
    ],
    [st.all_gateways, st.promptpay_ffp, lang.data.app.connections.providers],
  );
  const sortOptions = useMemo(
    () => [
      { label: st.sort_date, value: "createdAt" },
      { label: st.sort_amount, value: "amount" },
    ],
    [st.sort_date, st.sort_amount],
  );

  const routeParams = useParams();
  const { activeOrg, activeStreamer, authFetch } = useUserContext();
  const rawOrg = String((routeParams?.org as string) || activeOrg?.id || activeOrg?.slug || "");
  const rawStreamer = String((routeParams?.streamer as string) || activeStreamer?.id || activeStreamer?.name || "");
  const orgTarget = isSafePathSegment(rawOrg) ? rawOrg : "";
  const streamerTarget = isSafePathSegment(rawStreamer) ? rawStreamer : "";

  const canManageTransactions = canAccessStreamer(
    activeOrg,
    activeStreamer,
    StreamerPerm.STREAMER_MANAGE,
    OrgPerm.STREAMER_MANAGE,
  );
  const canManageWidgets = canAccessStreamer(
    activeOrg,
    activeStreamer,
    StreamerPerm.STREAMER_WIDGET_MANAGE,
    OrgPerm.WIDGET_MANAGE,
  );

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [liveTxId, setLiveTxId] = useState<string | null>(null);
  const [busyTxIds, setBusyTxIds] = useState<Record<string, boolean>>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState<"createdAt" | "amount">("createdAt");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const abortRef = useRef<AbortController | null>(null);
  const liveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (liveTimerRef.current) clearTimeout(liveTimerRef.current);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const filtersRef = useRef({
    provider: selectedProvider,
    status: selectedStatus,
    search: debouncedSearch,
    sortBy,
    sortOrder,
  });

  useEffect(() => {
    filtersRef.current = {
      provider: selectedProvider,
      status: selectedStatus,
      search: debouncedSearch,
      sortBy,
      sortOrder,
    };
  }, [selectedProvider, selectedStatus, debouncedSearch, sortBy, sortOrder]);

  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testProvider, setTestProvider] = useState("BMAC");
  const [testAmount, setTestAmount] = useState("100");
  const [testCurrency, setTestCurrency] = useState("THB");
  const [testDonorName, setTestDonorName] = useState(
    () => coreStore.getState().lang.data.app.streamer.transactions.simulate_dialog.donor_default_name,
  );
  const [testMessage, setTestMessage] = useState(
    () => coreStore.getState().lang.data.app.streamer.transactions.simulate_dialog.message_default,
  );
  const lastDefaultDonorRef = useRef(
    coreStore.getState().lang.data.app.streamer.transactions.simulate_dialog.donor_default_name,
  );
  const lastDefaultMsgRef = useRef(
    coreStore.getState().lang.data.app.streamer.transactions.simulate_dialog.message_default,
  );
  const openTestDialog = () => {
    if (!testDonorName || testDonorName === lastDefaultDonorRef.current) {
      setTestDonorName(st.simulate_dialog.donor_default_name);
    }
    if (!testMessage || testMessage === lastDefaultMsgRef.current) {
      setTestMessage(st.simulate_dialog.message_default);
    }
    lastDefaultDonorRef.current = st.simulate_dialog.donor_default_name;
    lastDefaultMsgRef.current = st.simulate_dialog.message_default;
    setIsTestDialogOpen(true);
  };
  const [sendingTest, setSendingTest] = useState(false);

  const [availableProviders, setAvailableProviders] = useState<string[]>([]);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTransactions = useCallback(() => {
    if (!orgTarget || !streamerTarget) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    const queryParams = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String((currentPage - 1) * PAGE_SIZE),
      sortBy,
      sortOrder,
    });

    if (selectedProvider !== "ALL") queryParams.set("provider", selectedProvider);
    if (selectedStatus !== "ALL") queryParams.set("status", selectedStatus);
    if (debouncedSearch) queryParams.set("search", debouncedSearch);

    authFetch(
      getApiUrl(
        `/api/v1/org/${encodeURIComponent(orgTarget)}/streamers/${encodeURIComponent(streamerTarget)}/transactions?${queryParams.toString()}`,
      ),
      { signal: controller.signal },
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (controller.signal.aborted) return;
        if (data && Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
          setTotalCount(typeof data.total === "number" ? data.total : data.transactions.length);
        }
      })
      .catch((err) => {
        if ((err as Error)?.name === "AbortError") return;
        toast.error(coreStore.getState().lang.data.app.streamer.transactions.toasts.load_failed);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
  }, [
    orgTarget,
    streamerTarget,
    currentPage,
    sortBy,
    sortOrder,
    selectedProvider,
    selectedStatus,
    debouncedSearch,
    authFetch,
  ]);

  const refetchTransactions = fetchTransactions;

  useEffect(() => {
    let ignore = false;
    queueMicrotask(() => {
      if (!ignore) fetchTransactions();
    });
    return () => {
      ignore = true;
      abortRef.current?.abort();
    };
  }, [fetchTransactions]);

  const wsPath =
    orgTarget && streamerTarget
      ? `/v1/org/${encodeURIComponent(orgTarget)}/streamers/${encodeURIComponent(streamerTarget)}/transactions/live`
      : null;

  const handleWsMessage = useCallback((raw: unknown) => {
    if (!raw || typeof raw !== "object") return;
    const data = raw as {
      type?: string;
      transaction?: TransactionItem;
      transactionId?: string;
      isDeleted?: boolean;
    };

    if (data.type === "transaction:new" && data.transaction) {
      const incoming = data.transaction;
      const {
        provider: curProvider,
        status: curStatus,
        search: curSearch,
        sortBy: curSortBy,
        sortOrder: curSortOrder,
      } = filtersRef.current;

      const matchProvider =
        curProvider === "ALL" || incoming.provider.toUpperCase() === curProvider.toUpperCase();
      const matchStatus =
        curStatus === "ALL" || incoming.status.toUpperCase() === curStatus.toUpperCase();
      const q = curSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        incoming.senderName?.toLowerCase().includes(q) ||
        incoming.message?.toLowerCase().includes(q) ||
        incoming.id.toLowerCase().includes(q);

      if (matchProvider && matchStatus && matchSearch) {
        setTransactions((prev) => {
          if (prev.some((t) => t.id === incoming.id)) return prev;
          if (curSortBy === "createdAt" && curSortOrder === "desc") {
            return [incoming, ...prev.slice(0, PAGE_SIZE - 1)];
          }
          return [incoming, ...prev];
        });
        setTotalCount((c) => c + 1);

        setLiveTxId(incoming.id);
        if (liveTimerRef.current) clearTimeout(liveTimerRef.current);
        liveTimerRef.current = setTimeout(
          () => setLiveTxId((id) => (id === incoming.id ? null : id)),
          3000,
        );

        const currentLang = coreStore.getState().lang;
        toast.info(
          formatI18n(currentLang.data.app.streamer.transactions.toasts.live_tip, {
            sender: incoming.senderName,
            amount: formatMoneyMinorUnits(incoming.amount, incoming.currency, currentLang.key),
          }),
          { description: incoming.message || undefined },
        );
      } else {
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
      const txId = data.transactionId;
      setLiveTxId(txId);
      if (liveTimerRef.current) clearTimeout(liveTimerRef.current);
      liveTimerRef.current = setTimeout(
        () => setLiveTxId((id) => (id === txId ? null : id)),
        2500,
      );
    }
  }, []);

  const wsStatus = useAuthenticatedWebSocket({
    wsPath,
    enabled: Boolean(wsPath),
    onMessage: handleWsMessage,
  });

  useEffect(() => {
    if (!isTestDialogOpen || !orgTarget || !streamerTarget) return;
    const controller = new AbortController();

    authFetch(
      getApiUrl(
        `/api/v1/org/${encodeURIComponent(orgTarget)}/streamers/${encodeURIComponent(streamerTarget)}/integration`,
      ),
      { signal: controller.signal },
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((conns: StreamerConnections | null) => {
        if (controller.signal.aborted) return;
        const list: string[] = [];
        if (conns?.bmac) list.push("BMAC");
        if (conns?.kofi) list.push("KOFI");
        if (conns?.stripe) list.push("STRIPE");
        if (conns?.xendit) list.push("XENDIT");
        if (conns?.ffp) list.push("FFP");
        if (list.length === 0) list.push("BMAC", "KOFI", "STRIPE");
        setAvailableProviders(list);
        setTestProvider((prev) => (list.includes(prev) ? prev : list[0]));
      })
      .catch(() => {
        if (!controller.signal.aborted) setAvailableProviders(["BMAC", "KOFI", "STRIPE"]);
      });

    return () => controller.abort();
  }, [isTestDialogOpen, orgTarget, streamerTarget, authFetch]);

  const handleSendTest = async () => {
    if (!orgTarget || !streamerTarget || sendingTest || !canManageWidgets) return;
    const parsedAmount = Number(testAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 1 || parsedAmount > 1_000_000) {
      toast.error(st.toasts.test_amount_range);
      return;
    }
    setSendingTest(true);

    try {
      const res = await authFetch(
        getApiUrl(
          `/api/v1/org/${encodeURIComponent(orgTarget)}/streamers/${encodeURIComponent(streamerTarget)}/transactions/test`,
        ),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: testProvider,
            amount: parsedAmount,
            currency: testCurrency,
            senderName: testDonorName.trim().slice(0, 64) || st.simulate_dialog.donor_default_name,
            message: testMessage.trim().slice(0, 280),
          }),
        },
      );

      if (!res.ok) throw new Error("Failed to send test alert");

      toast.success(formatI18n(st.toasts.test_dispatched, { provider: testProvider }));
      setIsTestDialogOpen(false);
    } catch {
      toast.error(st.toasts.test_failed);
    } finally {
      setSendingTest(false);
    }
  };

  const handleToggleSoftDelete = async (txId: string) => {
    if (!orgTarget || !streamerTarget || !canManageTransactions || busyTxIds[txId]) return;
    setBusyTxIds((prev) => ({ ...prev, [txId]: true }));

    try {
      const res = await authFetch(
        getApiUrl(
          `/api/v1/org/${encodeURIComponent(orgTarget)}/streamers/${encodeURIComponent(streamerTarget)}/transactions/${encodeURIComponent(txId)}/soft-delete`,
        ),
        { method: "PATCH" },
      );

      if (!res.ok) throw new Error("Soft delete failed");
      const data = await res.json();

      setTransactions((prev) =>
        prev.map((t) => (t.id === txId ? { ...t, isDeleted: data.isDeleted } : t)),
      );

      toast.success(
        data.isDeleted ? st.toasts.hidden : st.toasts.restored,
      );
    } catch {
      toast.error(st.toasts.status_update_failed);
    } finally {
      setBusyTxIds((prev) => {
        const next = { ...prev };
        delete next[txId];
        return next;
      });
    }
  };

  const handleResendAlert = async (tx: TransactionItem) => {
    if (!orgTarget || !streamerTarget || !canManageWidgets || busyTxIds[tx.id]) return;
    setBusyTxIds((prev) => ({ ...prev, [tx.id]: true }));

    try {
      const res = await authFetch(
        getApiUrl(
          `/api/v1/org/${encodeURIComponent(orgTarget)}/streamers/${encodeURIComponent(streamerTarget)}/transactions/${encodeURIComponent(tx.id)}/resend`,
        ),
        { method: "POST" },
      );

      if (!res.ok) throw new Error("Replay failed");

      toast.success(
        formatI18n(st.toasts.replayed, {
          sender: tx.senderName,
          amount: formatMoneyMinorUnits(tx.amount, tx.currency, lang.key),
        }),
      );
    } catch {
      toast.error(st.toasts.resend_failed);
    } finally {
      setBusyTxIds((prev) => {
        const next = { ...prev };
        delete next[tx.id];
        return next;
      });
    }
  };

  const effectiveTotal = Math.max(totalCount, transactions.length);
  const totalPages = Math.ceil(effectiveTotal / PAGE_SIZE) || 1;
  const startIndex = effectiveTotal === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, effectiveTotal);
  const timeFormatter = getCachedDateFormat(lang.key, { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mx-auto max-w-384 px-12 pt-12 flex flex-col gap-6 z-10 min-h-0 flex-1"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-full">
          <div className="flex gap-4 items-center my-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium tracking-tight text-foreground">
              {st.title}
            </h1>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl select-none text-xs font-medium bg-muted/80 opacity-60">
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
              <span className="text-xs text-muted-foreground font-medium font-sans">
                {wsStatus === "connected"
                  ? st.ws.connected
                  : wsStatus === "connecting"
                    ? st.ws.connecting
                    : st.ws.lost}
              </span>
            </div>
          </div>
          <div className="flex justify-between w-full items-center">
            <div className="flex flex-col">
              <span className="tracking-wider text-sm text-foreground/40">
                {st.subtitle}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <AnimateIcon animateOnHover>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={refetchTransactions}
                  disabled={loading}
                  className="gap-1.5 text-xs rounded-xl p-3 h-max"
                >
                  <RefreshCcw
                    size={14}
                    className={cn(loading && "animate-spin")}
                  />
                  <span className="hidden sm:inline">{lang.data.common.refresh}</span>
                </Button>
              </AnimateIcon>

              {canManageWidgets && (
                <AnimateIcon animateOnHover>
                  <Button
                    size="sm"
                    onClick={openTestDialog}
                    className="gap-2 rounded-xl p-3 h-max text-xs"
                  >
                    <Sparkles size={15} />
                    <span>{st.simulate_tip}</span>
                  </Button>
                </AnimateIcon>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <JellyRadio
            items={statusTabs}
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
              placeholder={st.search_placeholder}
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
                    aria-label={lang.data.common.aria.clear_search}
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
              classNames={{ base: "h-10 rounded-xl" }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              items={gatewayOptions}
              defaultValue="ALL"
              onValueChange={(e) => {
                setSelectedProvider(e as string);
                setCurrentPage(1);
              }}>
              <AnimateIcon animateOnHover>
                <SelectTrigger className="w-48 p-2.5 bg-secondary! border-0 rounded-xl h-max!">
                  <Route className="text-muted-foreground size-3.5" />
                  <SelectValue />
                </SelectTrigger>
              </AnimateIcon>
              <SelectContent className="-translate-x-4 -translate-y-1">
                <SelectGroup>
                  {gatewayOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              items={sortOptions}
              defaultValue="createdAt"
              onValueChange={(e) => {
                setSortBy(e as "createdAt" | "amount");
                setCurrentPage(1);
              }}>
              <AnimateIcon animateOnHover>
                <SelectTrigger className="w-32 p-2.5 bg-secondary! border-0 rounded-xl h-max!">
                  <ArrowUpDown className="text-muted-foreground size-3.5" />
                  <SelectValue />
                </SelectTrigger>
              </AnimateIcon>
              <SelectContent className="-translate-x-5 -translate-y-1">
                <SelectGroup>
                  {sortOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <AnimateIcon animateOnHover>
              <Button
                size="xs"
                variant="secondary"
                onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                className="gap-1.5 text-xs rounded-xl p-3 w-max h-max"
              >
                <ArrowUpDown className="text-muted-foreground size-3.5" />
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={sortOrder}
                    initial={{ opacity: 0, x: 5, filter: "blur(2px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: -5, filter: "blur(2px)" }}
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 28,
                    }}
                    className="hidden xl:inline"
                  >
                    {sortOrder === "desc" ? st.sort_desc : st.sort_asc}
                  </motion.span>
                </AnimatePresence>
              </Button>
            </AnimateIcon>
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
                <TableHead className="py-3.5 px-4 font-semibold text-muted-foreground/70 h-auto">{st.table.status_type}</TableHead>
                <TableHead className="py-3.5 px-4 font-semibold text-muted-foreground/70 h-auto">{st.table.supporter}</TableHead>
                <TableHead className="py-3.5 px-4 font-semibold text-muted-foreground/70 h-auto">{st.table.amount}</TableHead>
                <TableHead className="py-3.5 px-4 font-semibold text-muted-foreground/70 h-auto">{st.table.gateway}</TableHead>
                <TableHead className="py-3.5 px-4 font-semibold text-muted-foreground/70 h-auto">{st.table.date}</TableHead>
                <TableHead className="py-3.5 px-4 text-right font-semibold text-muted-foreground/70 h-auto">{st.table.actions}</TableHead>
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
                        <MoneyIcon size={36} weight="duotone" className="text-foreground/60" />
                        <span className="font-medium text-foreground text-sm">{st.empty.title}</span>
                        <span className="text-xs text-muted-foreground max-w-sm">
                          {st.empty.desc}
                        </span>
                        {(searchQuery || selectedStatus !== "ALL" || selectedProvider !== "ALL") && (
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => {
                              setSearchQuery("");
                              setSelectedStatus("ALL");
                              setSelectedProvider("ALL");
                              setCurrentPage(1);
                            }}
                            className="mt-2 text-xs rounded-xl p-3 h-max"
                          >
                            {lang.data.common.reset_filters}
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
                                  ? st.status_badges.succeeded
                                  : isPending
                                    ? st.status_badges.pending
                                    : isFailed
                                      ? st.status_badges.failed
                                      : st.status_badges.refunded}
                              </span>
                              {tx.isTest && (
                                <span className="text-[10px] text-amber-500/90 font-medium">
                                  {st.status_badges.test_suffix}
                                </span>
                              )}
                              {tx.isDeleted && (
                                <span className="text-[10px] text-rose-500/90 font-medium">
                                  {st.status_badges.deleted_suffix}
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
                              {formatMoneyMinorUnits(tx.amount, tx.currency, lang.key)}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 px-4 whitespace-nowrap">
                          <span className="text-xs text-muted-foreground/80 font-medium">
                            {tx.provider.toUpperCase() === "FFP"
                              ? st.promptpay_ffp
                              : (GATEWAY_NAMES[tx.provider.toUpperCase()] || tx.provider)}
                          </span>
                        </TableCell>

                        <TableCell className="py-3 px-4 whitespace-nowrap text-xs">
                          <div className="flex flex-col leading-tight">
                            <span className="text-foreground/90 font-sans">
                              {formatTableDate(tx.createdAt, lang.key)}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60 font-sans">
                              {timeFormatter.format(new Date(tx.createdAt))}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 px-4 text-right whitespace-nowrap">
                          <Popover>
                            <PopoverTrigger
                              render={
                                <Button
                                  aria-label={st.table.actions_aria}
                                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground bg-transparent"
                                >
                                  <DotsThreeVerticalIcon size={16} weight="bold" />
                                </Button>
                              }
                            />
                            <PopoverContent
                              align="end"
                              className="w-48 p-1.5 flex flex-col gap-0 rounded-xl bg-card border border-border shadow-xl text-xs"
                            >
                              {canManageWidgets && (
                                <Button
                                  disabled={Boolean(busyTxIds[tx.id])}
                                  onClick={() => handleResendAlert(tx)}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-transparent justify-start hover:bg-muted text-foreground text-left font-medium disabled:opacity-50"
                                >
                                  <PaperPlaneTiltIcon size={14} weight="bold" className="text-primary" />
                                  <span>{st.table.resend_alert}</span>
                                </Button>
                              )}

                              <Button
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(tx.id);
                                    setCopiedId(tx.id);
                                    toast.success(st.toasts.id_copied);
                                    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
                                    copiedTimerRef.current = setTimeout(() => setCopiedId(null), 2000);
                                  } catch {
                                    toast.error(st.toasts.id_copy_failed);
                                  }
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-transparent justify-start hover:bg-muted text-foreground text-left"
                              >
                                {copiedId === tx.id ? (
                                  <CheckIcon size={14} weight="bold" className="text-emerald-500" />
                                ) : (
                                  <CopyIcon size={14} weight="bold" />
                                )}
                                <span>{st.table.copy_id}</span>
                              </Button>

                              {canManageTransactions && (
                                <>
                                  <div className="h-px bg-border mx-3 my-0.5" />

                                  <Button
                                    disabled={Boolean(busyTxIds[tx.id])}
                                    onClick={() => handleToggleSoftDelete(tx.id)}
                                    className={cn(
                                      "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-transparent justify-start text-left font-medium disabled:opacity-50",
                                      tx.isDeleted
                                        ? "hover:bg-emerald-500/10 text-emerald-500"
                                        : "hover:bg-rose-500/10 text-rose-500",
                                    )}
                                  >
                                    {tx.isDeleted ? (
                                      <>
                                        <ArrowCounterClockwiseIcon size={14} weight="bold" />
                                        <span>{st.table.restore_row}</span>
                                      </>
                                    ) : (
                                      <>
                                        <TrashIcon size={14} weight="bold" />
                                        <span>{st.table.soft_delete}</span>
                                      </>
                                    )}
                                  </Button>
                                </>
                              )}
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

        <div className="flex items-center justify-between px-6 py-3.5 border-t border-border/60 bg-secondary/20 text-xs text-muted-foreground select-none">
          <div className="flex items-center gap-1.5">
            <span className="relative inline-flex items-center overflow-hidden h-4 font-medium text-foreground/80">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={`${startIndex}–${endIndex}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="tabular-nums font-sans"
                >
                  {effectiveTotal > 0 ? `${startIndex}–${endIndex}` : "0"}
                </motion.span>
              </AnimatePresence>
            </span>
            <span>{lang.data.common.of}</span>
            <span className="relative inline-flex items-center overflow-hidden h-4 font-semibold text-foreground">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={effectiveTotal}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="tabular-nums font-sans"
                >
                  {effectiveTotal}
                </motion.span>
              </AnimatePresence>
            </span>
            <span>{lang.data.common.events}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground/80 font-sans">
              <span>{lang.data.common.page}</span>
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
              <span>{lang.data.common.of}</span>
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
            <Pagination className="mx-0 w-auto">
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((p) => Math.max(p - 1, 1));
                    }}
                    aria-disabled={currentPage <= 1}
                    tabIndex={currentPage <= 1 ? -1 : undefined}
                    className={cn(
                      "cursor-pointer",
                      currentPage <= 1 && "pointer-events-none opacity-40 cursor-not-allowed"
                    )}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((p) => Math.min(p + 1, totalPages));
                    }}
                    aria-disabled={currentPage >= totalPages}
                    tabIndex={currentPage >= totalPages ? -1 : undefined}
                    className={cn(
                      "cursor-pointer",
                      currentPage >= totalPages && "pointer-events-none opacity-40 cursor-not-allowed"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>

      <Dialog
        open={isTestDialogOpen}
        onOpenChange={(next) => {
          if (!sendingTest) setIsTestDialogOpen(next);
        }}
      >
        <DialogContent className="max-w-sm!" showCloseButton={false}>
          <DialogHeader className="items-center text-center gap-1.5">
            <div className="mb-1 inline-flex size-12 items-center justify-center text-primary">
              <SparkleIcon className="size-9" weight="regular" />
            </div>
            <DialogTitle>
              {st.simulate_dialog.title}
            </DialogTitle>
            <DialogDescription className="text-balance">
              {st.simulate_dialog.desc}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendTest();
            }}
            className="flex flex-col gap-3.5 mt-1"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground/80">
                {st.simulate_dialog.provider_label}
              </label>
              <Select
                items={availableProviders.map((p) => ({
                  value: p,
                  label:
                    p === "BMAC"
                      ? st.simulate_dialog.provider_bmac
                      : p === "KOFI"
                        ? lang.data.app.connections.providers.kofi.name
                        : p === "STRIPE"
                          ? st.simulate_dialog.provider_stripe
                          : p === "XENDIT"
                            ? lang.data.app.connections.providers.xendit.name
                            : p === "FFP"
                              ? st.simulate_dialog.provider_promptpay
                              : p,
                }))}
                value={testProvider}
                onValueChange={(v) => {
                  if (v) setTestProvider(v as string);
                }}
              >
                <SelectTrigger className="w-full h-10! border-2 rounded-md text-xs font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-full -translate-x-5 -translate-y-2">
                  <SelectGroup>
                    {availableProviders.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p === "BMAC"
                          ? st.simulate_dialog.provider_bmac
                          : p === "KOFI"
                            ? lang.data.app.connections.providers.kofi.name
                            : p === "STRIPE"
                              ? st.simulate_dialog.provider_stripe
                              : p === "XENDIT"
                                ? lang.data.app.connections.providers.xendit.name
                                : p === "FFP"
                                  ? st.simulate_dialog.provider_promptpay
                                  : p}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <span className="text-[11px] text-muted-foreground">
                {formatI18n(st.simulate_dialog.providers_hint, { streamer: streamerTarget })}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/80">
                  {st.simulate_dialog.amount_label}
                </label>
                <UiInput
                  type="number"
                  min="1"
                  max="1000000"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  placeholder="100"
                  className="h-10 rounded-md border-2 text-xs font-sans font-semibold tabular-nums"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/80">
                  {st.simulate_dialog.currency_label}
                </label>
                <Select
                  items={[
                    { value: "THB", label: "THB (฿)" },
                    { value: "USD", label: "USD ($)" },
                    { value: "EUR", label: "EUR (€)" },
                    { value: "GBP", label: "GBP (£)" },
                    { value: "JPY", label: "JPY (¥)" },
                  ]}
                  value={testCurrency}
                  onValueChange={(v) => {
                    if (v) setTestCurrency(v as string);
                  }}
                >
                  <SelectTrigger className="w-full h-10! border-2 rounded-md text-xs font-sans font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-full -translate-x-5 -translate-y-2">
                    <SelectGroup>
                      <SelectItem value="THB">THB (฿)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground/80">
                {st.simulate_dialog.donor_name_label}
              </label>
              <UiInput
                type="text"
                maxLength={64}
                value={testDonorName}
                onChange={(e) => setTestDonorName(e.target.value)}
                placeholder={st.simulate_dialog.donor_name_placeholder}
                className="h-10 rounded-md border-2 text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground/80">
                {st.simulate_dialog.message_label}
              </label>
              <Textarea
                rows={3}
                maxLength={280}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder={st.simulate_dialog.message_placeholder}
                className="rounded-md border-2 text-xs resize-none"
              />
            </div>

            <DialogFooter className="mt-1 grid! grid-cols-2 gap-2">
              <DialogClose
                render={
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-max p-3 rounded-xl w-full cursor-pointer"
                    disabled={sendingTest}
                  >
                    {lang.data.common.cancel}
                  </Button>
                }
              />
              <Button
                type="submit"
                disabled={sendingTest}
                className="gap-2 font-sans h-max p-3 rounded-xl w-full bg-primary text-primary-foreground cursor-pointer"
              >
                {sendingTest ? (
                  <Spinner className="size-4" />
                ) : (
                  <PaperPlaneTiltIcon size={14} weight="bold" />
                )}
                <span>{st.simulate_dialog.dispatch_btn}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
