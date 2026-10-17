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
  CodeIcon,
  CopyIcon,
  CheckIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn, getFallbackInitial } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  humanizeAuditAction,
  formatTableDate,
  formatRelativeTime,
  formatPayloadSummary,
  AuditCategory,
} from "@/lib/audit-format";

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

const CATEGORY_TABS: Array<{ id: AuditCategory; label: string }> = [
  { id: "ALL", label: "All Activities" },
  { id: "MEMBERS", label: "Members & Roles" },
  { id: "CHANNELS", label: "Channels" },
  { id: "SETTINGS", label: "Settings" },
  { id: "SECURITY", label: "Security & Ownership" },
];

const PAGE_SIZE = 10;

export default function OrgAuditPage() {
  const routeParams = useParams();
  const { activeOrg, authFetch } = useUserContext();
  const orgTarget = activeOrg?.id || activeOrg?.slug || (routeParams?.org as string);

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<AuditCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showJsonId, setShowJsonId] = useState<string | null>(null);
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
      if (categoryFilter !== "ALL" && info.filterCategory !== categoryFilter) {
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

  const handleCopyJson = (logId: string, payload: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedId(logId);
    toast.success("JSON copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleRow = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const startIndex = filteredLogs.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, filteredLogs.length);

  return (
    <div className="flex flex-col gap-6 max-w-6xl w-full py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <ShieldCheckIcon size={16} weight="bold" />
            <span>Audit & Compliance</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Audit Activity Log
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Transparent security audit trail of staff delegations, roles, channels, and organization settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
            className="gap-1.5 text-xs rounded-xl cursor-pointer bg-card hover:bg-secondary/60"
          >
            <ArrowsClockwiseIcon size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleCategoryChange(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap",
                categoryFilter === tab.id
                  ? "bg-secondary text-foreground font-semibold shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <MagnifyingGlassIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search customer, action, IP..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground text-[11px] font-semibold">
                <th className="py-3.5 pl-4 pr-1 w-9 text-center"></th>
                <th className="py-3.5 px-4 font-medium text-muted-foreground/80">Actor</th>
                <th className="py-3.5 px-4 font-medium text-muted-foreground/80">Event</th>
                <th className="py-3.5 px-4 font-medium text-muted-foreground/80 hidden md:table-cell">Summary</th>
                <th className="py-3.5 px-4 font-medium text-muted-foreground/80">
                  <span className="flex items-center gap-1">
                    <span>Date</span>
                    <CaretDownIcon size={11} className="text-muted-foreground/60" />
                  </span>
                </th>
                <th className="py-3.5 pr-6 pl-4 text-right font-medium text-muted-foreground/80">Origin IP</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <Spinner className="size-6 text-primary" />
                      <p className="text-xs text-muted-foreground">Loading audit records...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted-foreground text-xs">
                    No activity records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const info = humanizeAuditAction(log.action, log.payload);
                  const isExpanded = expandedId === log.id;
                  const userName = log.user.name || log.user.email.split("@")[0];
                  const summaryParams = formatPayloadSummary(log.action, log.payload);

                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => toggleRow(log.id)}
                        className={cn(
                          "group hover:bg-secondary/35 transition-colors cursor-pointer select-none",
                          isExpanded && "bg-secondary/25",
                        )}
                      >
                        <td className="py-3 pl-4 pr-1 text-center">
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
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
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
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-secondary/80 border border-border/60 text-foreground">
                            <span className={cn("size-1.5 rounded-full shrink-0", info.dotClass)} />
                            <span>{info.title}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-muted-foreground text-xs hidden md:table-cell max-w-xs truncate">
                          {info.description}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-foreground/90 font-medium text-xs">
                          <span title={new Date(log.createdAt).toLocaleString()}>
                            {formatTableDate(log.createdAt)}
                          </span>
                        </td>

                        <td className="py-3 pr-6 pl-4 text-right whitespace-nowrap font-mono text-xs text-muted-foreground">
                          {log.ipAddress}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-secondary/15 border-b border-border/60">
                          <td colSpan={6} className="py-4 px-6">
                            <div className="flex flex-col gap-3 rounded-xl p-4 bg-card border border-border/70 shadow-xs">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                                <div className="flex items-center gap-2">
                                  <div className={cn("size-6 rounded-lg border flex items-center justify-center shrink-0", info.badgeClass)}>
                                    {info.icon}
                                  </div>
                                  <span className="font-semibold text-xs text-foreground">
                                    {info.description}
                                  </span>
                                </div>
                                <span className="text-[11px] text-muted-foreground font-mono">
                                  {new Date(log.createdAt).toLocaleString()} ({formatRelativeTime(log.createdAt)})
                                </span>
                              </div>

                              {summaryParams.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
                                  {summaryParams.map((p, idx) => (
                                    <div key={idx} className="flex flex-col p-2.5 rounded-lg bg-secondary/30 border border-border/40">
                                      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                                        {p.label}
                                      </span>
                                      <span className="text-xs font-semibold text-foreground font-mono mt-0.5">
                                        {p.value}
                                      </span>
                                    </div>
                                  ))}
                                  <div className="flex flex-col p-2.5 rounded-lg bg-secondary/30 border border-border/40">
                                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                                      Target Entity
                                    </span>
                                    <span className="text-xs font-semibold text-foreground font-mono mt-0.5">
                                      {log.targetType} {log.targetId ? `#${log.targetId}` : ""}
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div className="pt-2 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <button
                                    type="button"
                                    onClick={() => setShowJsonId(showJsonId === log.id ? null : log.id)}
                                    className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                                  >
                                    <CodeIcon size={13} />
                                    <span>{showJsonId === log.id ? "Hide Developer Payload" : "View Developer Payload"}</span>
                                  </button>

                                  {Boolean(log.payload) && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleCopyJson(log.id, log.payload)}
                                      className="h-6 px-2 text-[11px] gap-1 cursor-pointer"
                                    >
                                      {copiedId === log.id ? <CheckIcon size={12} className="text-emerald-500" /> : <CopyIcon size={12} />}
                                      <span>{copiedId === log.id ? "Copied" : "Copy Payload"}</span>
                                    </Button>
                                  )}
                                </div>

                                {showJsonId === log.id && (
                                  <pre className="p-3 rounded-lg bg-secondary/60 border border-border text-[11px] font-mono text-foreground leading-relaxed overflow-x-auto max-h-48">
                                    {JSON.stringify(log.payload || {}, null, 2)}
                                  </pre>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

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
    </div>
  );
}
