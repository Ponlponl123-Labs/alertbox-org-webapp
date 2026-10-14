"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  ClockCounterClockwiseIcon,
  ArrowsClockwiseIcon,
  MagnifyingGlassIcon,
  CodeIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn, getFallbackInitial } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

const ACTION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ORG_SETTINGS_UPDATED: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  MEMBER_INVITED: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  MEMBER_ROLE_UPDATED: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  MEMBER_REMOVED: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" },
  STREAMER_UPDATED: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  PRESET_CREATED: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
};

export default function OrgAuditPage() {
  const routeParams = useParams();
  const { activeOrg, authFetch } = useUserContext();
  const orgTarget = activeOrg?.id || activeOrg?.slug || (routeParams?.org as string);

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayload, setSelectedPayload] = useState<{ action: string; payload: any } | null>(null);

  const fetchLogs = useCallback(() => {
    if (!orgTarget) return;
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
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (actionFilter !== "ALL" && log.action !== actionFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.user.email.toLowerCase().includes(q) ||
        (log.user.name && log.user.name.toLowerCase().includes(q)) ||
        log.ipAddress.includes(q)
      );
    });
  }, [logs, actionFilter, searchQuery]);

  return (
    <div className="flex flex-col gap-6 max-w-5xl w-full py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <ClockCounterClockwiseIcon size={16} weight="bold" />
            <span>Security & Compliance</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Organization Audit Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Immutable activity trail of member invitations, role reassignments, channel configurations, and org updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
            className="gap-1.5 text-xs rounded-xl cursor-pointer"
          >
            <ArrowsClockwiseIcon size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "ORG_SETTINGS_UPDATED", "MEMBER_INVITED", "MEMBER_ROLE_UPDATED", "MEMBER_REMOVED", "STREAMER_UPDATED"].map((act) => (
            <button
              key={act}
              type="button"
              onClick={() => setActionFilter(act)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                actionFilter === act
                  ? "bg-secondary text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              )}
            >
              {act === "ALL" ? "All Events" : act.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <MagnifyingGlassIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search email, action, IP..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* Main Logs Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner className="size-7 text-primary" />
          <p className="text-xs text-muted-foreground">Loading audit activity trail...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-12 border border-dashed border-border rounded-2xl bg-card/40 flex flex-col items-center justify-center text-center gap-3">
          <div className="size-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
            <ClockCounterClockwiseIcon size={24} />
          </div>
          <p className="text-sm font-semibold text-foreground">No Audit Events Found</p>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
            Administrative actions, staff role changes, and channel updates will automatically populate here in real-time.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/50 border-b border-border text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5">Actor / User</th>
                  <th className="py-3 px-5">Event Action</th>
                  <th className="py-3 px-5">Target</th>
                  <th className="py-3 px-5">IP Address</th>
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredLogs.map((log) => {
                  const style = ACTION_COLORS[log.action] || {
                    bg: "bg-secondary",
                    text: "text-foreground",
                    border: "border-border",
                  };

                  return (
                    <tr key={log.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-7 border border-border">
                            {log.user.avatar ? (
                              <AvatarImage src={log.user.avatar} alt={log.user.name || log.user.email} />
                            ) : (
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                {getFallbackInitial(log.user.name || log.user.email)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">
                              {log.user.name || log.user.email.split("@")[0]}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{log.user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-md text-[10px] font-bold border font-mono tracking-tight",
                            style.bg,
                            style.text,
                            style.border
                          )}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                        {log.targetType} {log.targetId ? `#${log.targetId}` : ""}
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                        {log.ipAddress}
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap text-right">
                        {log.payload ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPayload({ action: log.action, payload: log.payload })}
                            className="gap-1 text-xs text-primary hover:text-primary cursor-pointer h-7 px-2"
                          >
                            <CodeIcon size={13} weight="bold" />
                            <span>Payload</span>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground/40 text-[10px] italic">None</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payload Modal */}
      <Dialog open={!!selectedPayload} onOpenChange={(open) => !open && setSelectedPayload(null)}>
        <DialogContent className="max-w-lg p-6 rounded-3xl" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold font-mono">
              <CodeIcon size={18} weight="bold" className="text-primary" />
              <span>Event Payload: {selectedPayload?.action}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Raw JSON metadata recorded with this audit transaction.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 p-3.5 rounded-2xl bg-secondary/80 border border-border overflow-x-auto max-h-80">
            <pre className="text-[11px] font-mono text-foreground leading-relaxed">
              {JSON.stringify(selectedPayload?.payload, null, 2)}
            </pre>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedPayload(null)}
              className="text-xs rounded-xl cursor-pointer"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
