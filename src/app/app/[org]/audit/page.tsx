"use client";
import React, { useEffect, useState, useCallback } from "react";
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
  ShieldCheckIcon,
  XIcon,
} from "@phosphor-icons/react";
import { toast } from "@/components/custom-ui/toast";
import { cn, getFallbackInitial } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { AUDIT_CATEGORY_TABS, DEFAULT_AUDIT_PAGE_SIZE, type AuditCategory } from "@/consts/audit";
import { motion, AnimatePresence } from "motion/react";
import JellyRadio from "@/components/JellyRadio";
import { Input } from "react-smooth-input";
import { useTinyUser, useTinyStreamer } from "@/lib/tiny-user-cache";
import { AutoHeight } from "@/components/animate-ui/primitives/effects/auto-height";
import type { AuditLogItem } from "@/types";

const CATEGORY_TABS = AUDIT_CATEGORY_TABS;
const PAGE_SIZE = DEFAULT_AUDIT_PAGE_SIZE;
const CLIENT_CACHE_TTL = 3 * 60 * 1000;
const auditPageCache = new Map<string, { logs: AuditLogItem[]; total: number; timestamp: number }>();

function AuditRow({
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
  const rawTargetUserId =
    p.targetUserId ??
    p.newOwnerUserId ??
    p.newOwnerId ??
    p.removedUserId ??
    (isUserTarget ? log.targetId : null);
  const targetUserId = rawTargetUserId ? String(rawTargetUserId) : null;

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

export default function OrgAuditPage() {
  const routeParams = useParams();
  const { activeOrg, authFetch } = useUserContext();
  const orgTarget = activeOrg?.id || activeOrg?.slug || (routeParams?.org as string);

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<AuditCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchLogs = useCallback(
    (
      page: number = currentPage,
      category: AuditCategory = categoryFilter,
      search: string = debouncedSearch,
      force: boolean = false,
    ) => {
      if (!orgTarget) return;
      const cleanSearch = search.trim();
      const cacheKey = `${orgTarget}:p${page}:sz${PAGE_SIZE}:cat${category}:q${encodeURIComponent(cleanSearch)}`;

      if (!force) {
        const cached = auditPageCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL) {
          setLogs(cached.logs);
          setTotalCount(cached.total);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      const offset = (page - 1) * PAGE_SIZE;
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });
      if (category !== "ALL") {
        params.set("category", category);
      }
      if (cleanSearch) {
        params.set("search", cleanSearch);
      }

      const startTime = Date.now();
      const MIN_SKELETON_MS = 280;

      authFetch(getApiUrl(`/api/v1/org/${orgTarget}/audit?${params.toString()}`))
        .then((r) => (r.ok ? r.json() : null))
        .then(async (data) => {
          if (data && Array.isArray(data.logs)) {
            const elapsed = Date.now() - startTime;
            if (elapsed < MIN_SKELETON_MS) {
              await new Promise((resolve) => setTimeout(resolve, MIN_SKELETON_MS - elapsed));
            }
            const total = typeof data.total === "number" ? data.total : data.logs.length;
            setLogs(data.logs);
            setTotalCount(total);
            auditPageCache.set(cacheKey, {
              logs: data.logs,
              total,
              timestamp: Date.now(),
            });
          }
        })
        .catch(() => toast.error("Failed to load audit logs"))
        .finally(() => setLoading(false));
    },
    [orgTarget, authFetch, currentPage, categoryFilter, debouncedSearch],
  );

  useEffect(() => {
    let ignore = false;
    queueMicrotask(() => {
      if (!ignore) {
        fetchLogs(currentPage, categoryFilter, debouncedSearch);
      }
    });
    return () => {
      ignore = true;
    };
  }, [fetchLogs, currentPage, categoryFilter, debouncedSearch]);

  const handleCategoryChange = (cat: AuditCategory) => {
    setCategoryFilter(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val) {
      setDebouncedSearch("");
      setCurrentPage(1);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setCategoryFilter("ALL");
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const paginatedLogs = logs;

  const toggleRow = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, totalCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mx-auto max-w-384 px-12 pt-12 flex flex-col gap-6 z-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <ShieldCheckIcon size={16} weight="bold" />
            <span>Audit & Compliance</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-foreground my-3">
            Audit Activity Log
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Transparent security audit trail of staff delegations, roles, channels, and organization settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (orgTarget) {
                for (const key of auditPageCache.keys()) {
                  if (key.startsWith(`${orgTarget}:`)) {
                    auditPageCache.delete(key);
                  }
                }
              }
              fetchLogs(currentPage, categoryFilter, debouncedSearch, true);
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
            items={CATEGORY_TABS.map((tab) => ({ value: tab.id, label: tab.label }))}
            value={categoryFilter}
            disabled={false}
            onChange={(value) => handleCategoryChange(value as AuditCategory)}
            size="sm"
          />
        </div>

        <div className="relative w-full sm:w-96">
          <Input
            type="text"
            placeholder="Search by name, email, or role..."
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
          deps={[loading, paginatedLogs.length, expandedId]}
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
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-8 rounded-full shrink-0" />
                        <div className="flex flex-col gap-1.5">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-2.5 w-32" />
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
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-2.5 w-12" />
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 pr-6 pl-4 text-right">
                      <Skeleton className="h-5 w-24 ml-auto rounded-md" />
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
                  <TableCell colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center gap-2">
                      <MagnifyingGlassIcon className="size-8 text-muted mb-4" />
                      <span className="font-semibold text-foreground text-sm">No activity records found</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {searchQuery || categoryFilter !== "ALL"
                          ? "No audit events match your active filters or search query."
                          : "There are no security or audit events recorded for this organization yet."}
                      </p>
                      {(searchQuery || categoryFilter !== "ALL") && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleResetFilters}
                          className="mt-2 text-xs rounded-lg p-3 h-max"
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
                key={`page-${currentPage}-${categoryFilter}-${debouncedSearch}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                onAnimationStart={() => setIsAnimating(true)}
                onAnimationComplete={() => setIsAnimating(false)}
                className="divide-y divide-border/40 [&_tr:last-child]:border-0"
              >
                {paginatedLogs.map((log, idx) => (
                  <AuditRow
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

        <div className="flex items-center justify-between px-6 py-3 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground select-none">
          <div className="flex items-center gap-1.5">
            <span className="relative inline-flex items-center overflow-hidden h-4 font-medium text-foreground/80">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={`${startIndex}–${endIndex}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="tabular-nums"
                >
                  {totalCount > 0 ? `${startIndex}–${endIndex}` : "0"}
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
                  className="tabular-nums"
                >
                  {totalCount}
                </motion.span>
              </AnimatePresence>
            </span>
            <span>records</span>
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
                    className="tabular-nums"
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
                    className="tabular-nums"
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
                className="size-7 flex items-center justify-center rounded-lg border border-border/60 bg-card hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
              >
                <CaretLeftIcon size={13} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
                className="size-7 flex items-center justify-center rounded-lg border border-border/60 bg-card hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
              >
                <CaretRightIcon size={13} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
