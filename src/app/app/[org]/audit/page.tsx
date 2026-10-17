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
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn, getFallbackInitial } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  humanizeAuditAction,
  formatTableDate,
  AuditExpandedRowContent,
  isAuditActionInCategory,
} from "@/lib/audit-format";
import { AUDIT_CATEGORY_TABS, DEFAULT_AUDIT_PAGE_SIZE, type AuditCategory } from "@/consts/audit";
import { motion } from "motion/react";
import JellyRadio from "@/components/JellyRadio";
import { Input } from "react-smooth-input";
import { useTinyUser, useTinyStreamer } from "@/lib/tiny-user-cache";

interface AuditLogItem {
  id: string;
  orgId: string;
  action: string;
  targetType: string;
  targetId: string | null;
  payload: unknown;
  ipAddress: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
}

const CATEGORY_TABS = AUDIT_CATEGORY_TABS;
const PAGE_SIZE = DEFAULT_AUDIT_PAGE_SIZE;

function AuditRow({
  log,
  isExpanded,
  onToggle,
  orgTarget,
}: {
  log: AuditLogItem;
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
      <TableRow
        onClick={onToggle}
        className={cn(
          "group hover:bg-secondary/35 transition-colors cursor-pointer select-none",
          isExpanded && "bg-secondary/25",
        )}
      >
        <TableCell className="py-3 pl-4 pr-1 text-center">
          <button
            type="button"
            aria-label="Expand row"
            className="size-5 rounded flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <CaretDownIcon size={12} weight="bold" />
            ) : (
              <CaretRightIcon size={12} weight="bold" />
            )}
          </button>
        </TableCell>

        <TableCell className="py-3 px-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <Avatar className="size-8 rounded-full border border-border/80 shrink-0">
              {log.user.avatar ? (
                <AvatarImage src={log.user.avatar} alt={userName} />
              ) : null}
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                {getFallbackInitial(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-foreground text-xs">
                {userName}
              </span>
              <span className="text-[11px] text-muted-foreground/80 font-mono">
                {log.user.email}
              </span>
            </div>
          </div>
        </TableCell>

        <TableCell className="py-3 px-4 whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-secondary/80 border border-border/60 text-foreground">
            <span className={cn("size-1.5 rounded-full shrink-0", info.dotClass)} />
            <span>{info.title}</span>
          </span>
        </TableCell>

        <TableCell className="py-3 px-4 text-muted-foreground text-xs hidden md:table-cell max-w-xs truncate">
          {info.description}
        </TableCell>

        <TableCell className="py-3 px-4 whitespace-nowrap text-foreground/90 font-medium text-xs">
          <span title={new Date(log.createdAt).toLocaleString()}>
            {formatTableDate(log.createdAt)}
          </span>
        </TableCell>

        <TableCell className="py-3 pr-6 pl-4 text-right whitespace-nowrap font-mono text-xs text-muted-foreground">
          {log.ipAddress}
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow className="bg-secondary/15 hover:bg-secondary/15">
          <TableCell colSpan={6} className="py-3 px-6">
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
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<AuditCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLogs = useCallback(() => {
    if (!orgTarget) return;
    setLoading(true);
    authFetch(getApiUrl(`/api/v1/org/${orgTarget}/audit`))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
      })
      .catch(() => toast.error("Failed to load audit logs"))
      .finally(() => setLoading(false));
  }, [orgTarget, authFetch]);

  useEffect(() => {
    let active = true;
    if (!orgTarget) return;

    authFetch(getApiUrl(`/api/v1/org/${orgTarget}/audit`))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active) return;
        if (data && Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
      })
      .catch(() => {
        if (active) toast.error("Failed to load audit logs");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orgTarget, authFetch]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const info = humanizeAuditAction(log.action, log.payload);
      if (categoryFilter !== "ALL" && !isAuditActionInCategory(log.action, categoryFilter)) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        info.title.toLowerCase().includes(q) ||
        info.description.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.user.email.toLowerCase().includes(q) ||
        (log.user.name && log.user.name.toLowerCase().includes(q)) ||
        log.ipAddress.includes(q)
      );
    });
  }, [logs, categoryFilter, searchQuery]);

  const handleCategoryChange = (cat: AuditCategory) => {
    setCategoryFilter(cat);
    setCurrentPage(1);
  };

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
            onClick={fetchLogs}
            disabled={loading}
            className="gap-1.5 text-xs rounded-xl p-3 h-max"
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
            defaultValue={categoryFilter}
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

      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <Table className="w-full text-left text-xs border-collapse">
          <TableHeader>
            <TableRow className="border-b border-border/60 text-muted-foreground text-[11px] font-semibold hover:bg-transparent">
              <TableHead className="py-3.5 pl-4 pr-1 w-9 text-center h-auto"></TableHead>
              <TableHead className="py-3.5 px-4 font-medium text-muted-foreground/80 h-auto">Actor</TableHead>
              <TableHead className="py-3.5 px-4 font-medium text-muted-foreground/80 h-auto">Event</TableHead>
              <TableHead className="py-3.5 px-4 font-medium text-muted-foreground/80 hidden md:table-cell h-auto">Summary</TableHead>
              <TableHead className="py-3.5 px-4 font-medium text-muted-foreground/80 h-auto">
                <span className="flex items-center gap-1">
                  <span>Date</span>
                  <CaretDownIcon size={11} className="text-muted-foreground/60" />
                </span>
              </TableHead>
              <TableHead className="py-3.5 pr-6 pl-4 text-right font-medium text-muted-foreground/80 h-auto">Origin IP</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-border/40">
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <Spinner className="size-6 text-primary" />
                    <p className="text-xs text-muted-foreground">Loading audit records...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center text-muted-foreground text-xs">
                  No activity records found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log) => (
                <AuditRow
                  key={log.id}
                  log={log}
                  isExpanded={expandedId === log.id}
                  onToggle={() => toggleRow(log.id)}
                  orgTarget={orgTarget}
                />
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-6 py-3.5 border-t border-border/60 bg-secondary/20 text-xs text-muted-foreground">
          <span>
            {filteredLogs.length > 0 ? `${startIndex}–${endIndex} of ${filteredLogs.length}` : "0 records"}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              aria-label="Previous page"
              className="p-1 rounded-md border border-border/60 bg-card hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <CaretLeftIcon size={13} />
            </button>
            <span className="text-[11px] px-1 font-mono">
              {currentPage} / {totalPages}
            </span>
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
    </motion.div>
  );
}
