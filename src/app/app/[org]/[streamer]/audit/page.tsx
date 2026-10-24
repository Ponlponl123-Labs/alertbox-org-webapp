"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  ArrowsClockwiseIcon,
  MagnifyingGlassIcon,
  CaretRightIcon,
  CaretDownIcon,
  CaretLeftIcon,
  BroadcastIcon,
  XIcon,
} from "@phosphor-icons/react";
import { toast } from "@/components/custom-ui/toast";
import { cn, getFallbackInitial } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "motion/react";
import { AutoHeight } from "@/components/animate-ui/primitives/effects/auto-height";
import JellyRadio from "@/components/JellyRadio";
import { Input } from "react-smooth-input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  humanizeAuditAction,
  formatTableDate,
  AuditExpandedRowContent,
} from "@/lib/audit-format";
import { DEFAULT_AUDIT_PAGE_SIZE } from "@/consts/audit";
import { useTinyUser, useTinyStreamer } from "@/lib/tiny-user-cache";
import type { AuditLogItem } from "@/types";

const PAGE_SIZE = DEFAULT_AUDIT_PAGE_SIZE;
const CLIENT_CACHE_TTL = 3 * 60 * 1000;
const streamerAuditCache = new Map<string, { logs: AuditLogItem[]; timestamp: number }>();

const STREAMER_CATEGORY_ACTIONS: Record<string, string[]> = {
  CHANNELS: ["TOKEN_ROTATED", "WIDGET_UPDATED", "STREAMER_UPDATED", "STREAMER_CREATED"],
  GATEWAYS: ["INTEGRATION_CONNECTED", "INTEGRATION_DISCONNECTED", "INTEGRATION_UPDATED"],
  TRANSACTIONS: ["TRANSACTION_DELETED", "TRANSACTION_RESTORED", "TRANSACTION_RESENT"],
};

const STREAMER_AUDIT_TABS = [
  { value: "ALL", label: "All Activities" },
  { value: "CHANNELS", label: "Overlays & Profile" },
  { value: "GATEWAYS", label: "Gateways" },
  { value: "TRANSACTIONS", label: "Transactions" },
];

function StreamerAuditRow({
  log,
  index = 0,
  isExpanded,
  onToggle,
  orgTarget,
}: {
  log: AuditLogItem;
  index?: number;
  isExpanded: boolean;
  onToggle: () => void;
  orgTarget: string;
}) {
  const { authFetch } = useUserContext();
  const info = humanizeAuditAction(log.action, log.payload);
  const userName = log.user.name || log.user.email.split("@")[0];
  const p = (log.payload && typeof log.payload === "object" ? log.payload : {}) as Record<string, unknown>;

  const isUserTarget = log.targetType === "MEMBER" || log.targetType === "USER";
  const targetUserId = isUserTarget
    ? (p.targetUserId
      ? String(p.targetUserId)
      : p.removedUserId
        ? String(p.removedUserId)
        : p.newOwnerUserId
          ? String(p.newOwnerUserId)
          : log.targetId
            ? String(log.targetId)
            : null)
    : p.targetUserId
      ? String(p.targetUserId)
      : p.removedUserId
        ? String(p.removedUserId)
        : p.newOwnerUserId
          ? String(p.newOwnerUserId)
          : null;

  const isStreamerTarget = log.targetType === "STREAMER";
  const targetStreamerId = isStreamerTarget
    ? (log.targetId ? String(log.targetId) : p.streamerId ? String(p.streamerId) : null)
    : null;

  const { user: targetUser, loading: targetUserLoading } = useTinyUser(
    authFetch,
    getApiUrl(""),
    orgTarget,
    targetUserId,
    isExpanded,
  );

  const { streamer: targetStreamer, loading: targetStreamerLoading } = useTinyStreamer(
    authFetch,
    getApiUrl(""),
    orgTarget,
    targetStreamerId,
    isExpanded,
  );

  return (
    <React.Fragment>
      <motion.tr
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{
          duration: 0.28,
          delay: Math.min(index * 0.03, 0.2),
          ease: [0.22, 1, 0.36, 1],
        }}
        onClick={onToggle}
        className={cn(
          "group transition-colors duration-100 cursor-pointer select-none",
          isExpanded ? "bg-muted/15" : "hover:bg-muted/10",
        )}
      >
        <TableCell className="py-3 pl-4 pr-1 text-center w-8">
          <CaretRightIcon
            size={11}
            weight="bold"
            className={cn(
              "text-muted-foreground/50 group-hover:text-foreground transition-transform duration-150 inline-block",
              isExpanded && "rotate-90 text-foreground",
            )}
          />
        </TableCell>

        <TableCell className="py-3 px-4 whitespace-nowrap">
          <div className="flex items-center gap-2.5">
            <Avatar className="size-7 rounded-full border border-border/60 shrink-0">
              {log.user.avatar ? (
                <AvatarImage src={log.user.avatar} alt={userName} />
              ) : null}
              <AvatarFallback className="text-[10px] font-medium bg-muted text-foreground">
                {getFallbackInitial(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-tight">
              <span className="font-medium text-foreground text-xs">
                {userName}
              </span>
              <span className="text-[11px] text-muted-foreground/70 font-sans">
                {log.user.email}
              </span>
            </div>
          </div>
        </TableCell>

        <TableCell className="py-3 px-4 whitespace-nowrap">
          <div className="inline-flex items-center gap-2">
            <span className={cn("size-1.5 rounded-full shrink-0", info.dotClass)} />
            <span className="font-medium text-foreground text-xs">{info.title}</span>
          </div>
        </TableCell>

        <TableCell className="py-3 px-4 text-muted-foreground/80 text-xs hidden md:table-cell max-w-xs truncate">
          {info.description}
        </TableCell>

        <TableCell className="py-3 px-4 whitespace-nowrap text-xs">
          <div className="flex flex-col leading-tight">
            <span className="text-foreground/90 font-sans">{formatTableDate(log.createdAt)}</span>
            <span className="text-[10px] text-muted-foreground/60 font-sans">
              {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </TableCell>

        <TableCell className="py-3 pr-6 pl-4 text-right whitespace-nowrap">
          <span
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(log.ipAddress);
              toast.success("IP copied");
            }}
            title="Click to copy IP"
            className="font-sans tabular-nums text-[11px] text-muted-foreground/70 hover:text-foreground cursor-pointer select-text transition-colors"
          >
            {log.ipAddress}
          </span>
        </TableCell>
      </motion.tr>

      {isExpanded && (
        <TableRow className="bg-muted/15 hover:bg-muted/15 border-b border-border/40">
          <TableCell colSpan={6} className="py-3 px-6 pl-12">
            <AuditExpandedRowContent
              actor={log.user}
              action={log.action}
              targetType={log.targetType}
              targetId={log.targetId}
              payload={log.payload}
              createdAt={log.createdAt}
              ipAddress={log.ipAddress}
              targetUser={targetUser}
              targetUserLoading={targetUserLoading}
              targetStreamer={targetStreamer}
              targetStreamerLoading={targetStreamerLoading}
              orgTarget={orgTarget}
            />
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}

export default function StreamerAuditPage() {
  const routeParams = useParams();
  const { activeOrg, activeStreamer, authFetch } = useUserContext();
  const orgTarget = activeOrg?.id || activeOrg?.slug || (routeParams?.org as string);
  const streamerTarget = activeStreamer?.id || activeStreamer?.name || (routeParams?.streamer as string);

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLogs = useCallback(
    (forceRefresh = false) => {
      if (!orgTarget || !streamerTarget) return;

      const cacheKey = `${orgTarget}:${streamerTarget}`;
      if (!forceRefresh) {
        const cached = streamerAuditCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL) {
          setLogs(cached.logs);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      const startTime = Date.now();
      const MIN_SKELETON_MS = 280;

      authFetch(getApiUrl(`/api/v1/org/${orgTarget}/streamers/${streamerTarget}/audit`))
        .then((r) => (r.ok ? r.json() : null))
        .then(async (data) => {
          if (data && Array.isArray(data.logs)) {
            const elapsed = Date.now() - startTime;
            if (elapsed < MIN_SKELETON_MS) {
              await new Promise((resolve) => setTimeout(resolve, MIN_SKELETON_MS - elapsed));
            }
            setLogs(data.logs);
            streamerAuditCache.set(cacheKey, { logs: data.logs, timestamp: Date.now() });
          }
        })
        .catch((err) => {
          if (err?.name === "AbortError") return;
          toast.error("Failed to load channel audit logs");
        })
        .finally(() => setLoading(false));
    },
    [orgTarget, streamerTarget, authFetch],
  );

  useEffect(() => {
    let ignore = false;
    queueMicrotask(() => {
      if (!ignore) fetchLogs();
    });
    return () => {
      ignore = true;
    };
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    let result = logs;
    if (categoryFilter !== "ALL") {
      const allowed = STREAMER_CATEGORY_ACTIONS[categoryFilter];
      if (allowed) {
        result = result.filter((log) => allowed.includes(log.action));
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((log) => {
        const info = humanizeAuditAction(log.action, log.payload);
        return (
          info.title.toLowerCase().includes(q) ||
          info.description.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.user.email.toLowerCase().includes(q) ||
          (log.user.name && log.user.name.toLowerCase().includes(q)) ||
          log.ipAddress.includes(q)
        );
      });
    }
    return result;
  }, [logs, categoryFilter, searchQuery]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, currentPage]);


  const toggleRow = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const startIndex = filteredLogs.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, filteredLogs.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mx-auto max-w-384 px-12 pt-12 flex flex-col gap-6 z-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <BroadcastIcon size={16} weight="bold" />
            <span>Channel Security Trail</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-foreground my-3">
            Channel Audit Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Security audit trail of OBS overlay regenerations, gateway modifications, and profile edits for @{streamerTarget}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const cacheKey = `${orgTarget}:${streamerTarget}`;
              streamerAuditCache.delete(cacheKey);
              fetchLogs(true);
            }}
            disabled={loading}
            className="gap-1.5 text-xs rounded-xl p-3 h-max cursor-pointer"
          >
            <ArrowsClockwiseIcon size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <JellyRadio
            items={STREAMER_AUDIT_TABS}
            value={categoryFilter}
            disabled={false}
            onChange={(value) => {
              setCategoryFilter(value);
              setCurrentPage(1);
            }}
            size="sm"
          />
        </div>

        <div className="relative w-full sm:w-96">
          <Input
            type="text"
            placeholder="Search action, email, or IP..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            startContent={<MagnifyingGlassIcon size={16} className="text-muted-foreground" />}
            endContent={
              searchQuery ? (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
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
      </div>

      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm flex flex-col justify-between">
        <AutoHeight
          deps={[loading, filteredLogs.length, expandedId]}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 28,
          }}
        >
          <Table containerClassName={cn(isAnimating ? "overflow-hidden" : "overflow-x-auto overflow-y-hidden")} className="w-full text-left text-xs border-collapse">
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-muted/20 text-muted-foreground text-[10px] tracking-wider uppercase font-semibold hover:bg-muted/20">
                <TableHead className="py-3.5 pl-4 pr-1 w-9 text-center h-auto"></TableHead>
                <TableHead className="py-3.5 px-4 font-semibold text-muted-foreground/70 h-auto">Actor</TableHead>
                <TableHead className="py-3.5 px-4 font-semibold text-muted-foreground/70 h-auto">Event</TableHead>
                <TableHead className="py-3.5 px-4 font-semibold text-muted-foreground/70 hidden md:table-cell h-auto">Summary</TableHead>
                <TableHead className="py-3.5 px-4 font-semibold text-muted-foreground/70 h-auto">
                  <span className="flex items-center gap-1">
                    <span>Timestamp</span>
                    <CaretDownIcon size={11} className="text-muted-foreground/60" />
                  </span>
                </TableHead>
                <TableHead className="py-3.5 pr-6 pl-4 text-right font-semibold text-muted-foreground/70 h-auto">Origin IP</TableHead>
              </TableRow>
            </TableHeader>

            <AnimatePresence mode="wait" initial={false}>
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
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: i * 0.025 }}
                      className="hover:bg-transparent"
                    >
                      <TableCell className="py-3.5 pl-4 pr-1 text-center">
                        <Skeleton className="size-5 rounded mx-auto" />
                      </TableCell>
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <Skeleton className="size-7 rounded-full shrink-0" />
                          <div className="flex flex-col gap-1 w-28">
                            <Skeleton className="h-3.5 w-full" />
                            <Skeleton className="h-2.5 w-3/4" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-2">
                          <Skeleton className="size-1.5 rounded-full shrink-0" />
                          <Skeleton className="h-3.5 w-24 rounded" />
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 px-4 hidden md:table-cell">
                        <Skeleton className="h-3 w-48" />
                      </TableCell>
                      <TableCell className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-3.5 w-20 rounded" />
                          <Skeleton className="h-2.5 w-12 rounded" />
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 pr-6 pl-4 text-right">
                        <Skeleton className="h-4 w-20 ml-auto rounded" />
                      </TableCell>
                    </motion.tr>
                  ))}
                </motion.tbody>
              ) : paginatedLogs.length === 0 ? (
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
                        <BroadcastIcon size={36} weight="duotone" className="text-muted-foreground/50" />
                        <span className="font-medium text-foreground text-sm">No activity recorded yet</span>
                        <span className="text-xs text-muted-foreground max-w-sm">
                          Channel settings, OBS token rotations, and payment gateway updates will appear here in real-time.
                        </span>
                        {(searchQuery || categoryFilter !== "ALL") && (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => {
                              setSearchQuery("");
                              setCategoryFilter("ALL");
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
                  key={`page-${currentPage}-${searchQuery}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  onAnimationStart={() => setIsAnimating(true)}
                  onAnimationComplete={() => setIsAnimating(false)}
                  className="divide-y divide-border/40 [&_tr:last-child]:border-0"
                >
                  {paginatedLogs.map((log, idx) => (
                    <StreamerAuditRow
                      key={log.id}
                      log={log}
                      index={idx}
                      isExpanded={expandedId === log.id}
                      onToggle={() => toggleRow(log.id)}
                      orgTarget={orgTarget}
                    />
                  ))}
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
                  {filteredLogs.length > 0 ? `${startIndex}–${endIndex}` : "0"}
                </motion.span>
              </AnimatePresence>
            </span>
            <span>of</span>
            <span className="relative inline-flex items-center overflow-hidden h-4 font-semibold text-foreground">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={filteredLogs.length}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="tabular-nums font-sans"
                >
                  {filteredLogs.length}
                </motion.span>
              </AnimatePresence>
            </span>
            <span>events</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground/80 font-sans">
              <span>Page</span>
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
              <span>of</span>
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
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage <= 1}
                aria-label="Previous page"
                className="p-1 rounded-md border border-border/60 bg-card hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <CaretLeftIcon size={13} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
                className="p-1 rounded-md border border-border/60 bg-card hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <CaretRightIcon size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
