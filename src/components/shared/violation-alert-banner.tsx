"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "zustand";
import { WarningIcon, ShieldWarningIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useUserContext } from "@/contexts/user";
import { orgStore, isInvalidOrgId } from "@/hooks/store/org";
import { violationStore } from "@/hooks/store/violation";
import { VIOLATION_BLOCK_LEVEL } from "@/consts/violation";
import { cn } from "@/lib/utils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ScopedViolationEntry } from "@/types";

const SCOPE_LABELS: Record<ScopedViolationEntry["scope"], string> = {
  user: "Account",
  org: "Organization",
  streamer: "Streamer",
};

export function ViolationAlertBanner() {
  const { userInfo, authFetch } = useUserContext();
  const activeOrgId = useStore(orgStore, (s) => s.activeOrgId);
  const activeStreamerId = useStore(orgStore, (s) => s.activeStreamerId);
  const isOrgMode = useStore(orgStore, (s) => s.isOrgMode);
  const organizations = useStore(orgStore, (s) => s.organizations);
  const cache = useStore(violationStore, (s) => s.cache);

  const [open, setOpen] = useState(false);
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const [bannerMountCount, setBannerMountCount] = useState(0);

  const bannerCallbackRef = useCallback((node: HTMLDivElement | null) => {
    bannerRef.current = node;
    if (node) setBannerMountCount((c) => c + 1);
  }, []);

  const activeOrg = useMemo(
    () => organizations.find((o) => String(o.id) === String(activeOrgId)),
    [organizations, activeOrgId],
  );
  const activeStreamer = useMemo(
    () => activeOrg?.streamers?.find((s) => String(s.id) === String(activeStreamerId)),
    [activeOrg, activeStreamerId],
  );

  const hasValidOrg = Boolean(activeOrgId && !isInvalidOrgId(activeOrgId));

  useEffect(() => {
    if (!userInfo) {
      violationStore.getState().clear();
      return;
    }

    const store = violationStore.getState();
    void store.fetchUserViolations(authFetch);

    if (hasValidOrg && activeOrgId) {
      void store.fetchOrgViolations(activeOrgId, authFetch);
      if (!isOrgMode && activeStreamerId) {
        void store.fetchStreamerViolations(activeOrgId, activeStreamerId, authFetch);
      }
    }
  }, [userInfo, authFetch, hasValidOrg, activeOrgId, activeStreamerId, isOrgMode]);

  const entries = useMemo(() => {
    const list: ScopedViolationEntry[] = [];
    const userData = cache["user"]?.data;
    if (userData && (userData.level > 0 || userData.violate.length > 0)) {
      list.push({ scope: "user", label: SCOPE_LABELS.user, data: userData });
    }

    if (hasValidOrg && activeOrgId) {
      const orgData = cache[`org:${activeOrgId}`]?.data;
      if (orgData && (orgData.level > 0 || orgData.violate.length > 0)) {
        list.push({
          scope: "org",
          label: activeOrg?.name ? `${SCOPE_LABELS.org} (${activeOrg.name})` : SCOPE_LABELS.org,
          data: orgData,
        });
      }

      if (!isOrgMode && activeStreamerId) {
        const streamerData = cache[`streamer:${activeOrgId}:${activeStreamerId}`]?.data;
        if (streamerData && (streamerData.level > 0 || streamerData.violate.length > 0)) {
          list.push({
            scope: "streamer",
            label: activeStreamer?.displayName
              ? `${SCOPE_LABELS.streamer} (${activeStreamer.displayName})`
              : SCOPE_LABELS.streamer,
            data: streamerData,
          });
        }
      }
    }

    return list;
  }, [
    cache,
    hasValidOrg,
    activeOrgId,
    activeStreamerId,
    isOrgMode,
    activeOrg,
    activeStreamer,
  ]);

  const isVisible = Boolean(userInfo) && entries.length > 0;

  useEffect(() => {
    if (!isVisible) {
      document.documentElement.style.setProperty("--violation-banner-height", "0px");
      return;
    }

    const el = bannerRef.current;
    if (!el) return;

    const updateHeight = () => {
      const h = bannerRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty("--violation-banner-height", `${h}px`);
    };

    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    const id = setTimeout(updateHeight, 50);

    return () => {
      clearTimeout(id);
      observer.disconnect();
      document.documentElement.style.setProperty("--violation-banner-height", "0px");
    };
  }, [bannerMountCount, isVisible]);

  if (!isVisible) return null;

  const highestLevel = entries.reduce((max, e) => Math.max(max, e.data.level), 0);
  const totalCount = entries.reduce((sum, e) => sum + e.data.violate.length, 0);
  const isBlocked = highestLevel >= VIOLATION_BLOCK_LEVEL;
  const primary = entries.reduce((best, cur) =>
    cur.data.level > best.data.level ? cur : best,
  );
  const latestViolation = primary.data.violate[0];

  return (
    <>
      <div ref={bannerCallbackRef} className="px-1 pt-1 shrink-0">
        <Alert
          variant={isBlocked ? "destructive" : "default"}
          className={cn(
            "rounded-sm flex items-center justify-between border-0 gap-3 py-2 px-3",
            isBlocked
              ? "bg-rose-950/50 text-rose-100"
              : "bg-amber-950/40 text-amber-100",
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {isBlocked ? (
              <ShieldWarningIcon size={22} weight="fill" className="text-rose-400 shrink-0" />
            ) : (
              <WarningIcon size={22} weight="fill" className="text-amber-400 shrink-0" />
            )}
            <div className="min-w-0 flex flex-col gap-0.5">
              <AlertTitle className="flex items-center gap-1.5 flex-wrap text-xs font-semibold">
                <span>
                  {isBlocked ? "Actions Restricted" : "Policy Violation Notice"}
                </span>
                <Badge
                  variant={isBlocked ? "destructive" : "secondary"}
                  className="text-[10px] px-1.5 py-0 h-4 rounded-sm"
                >
                  Level {highestLevel}
                </Badge>
                {entries.map((entry) => (
                  <Badge
                    key={entry.scope}
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-4 text-current rounded-sm"
                  >
                    {entry.label}
                  </Badge>
                ))}
              </AlertTitle>
              <AlertDescription className="text-xs text-current/80 truncate">
                {latestViolation?.message || `${totalCount} violation(s) recorded.`}
                {totalCount > 1 ? ` (+${totalCount - 1} more)` : ""}
              </AlertDescription>
            </div>
          </div>

          <Button
            size="xs"
            variant="outline"
            onClick={() => setOpen(true)}
            className="shrink-0 gap-1 border-current/30 bg-transparent hover:bg-white/10 text-current rounded-sm h-max p-2"
          >
            <span>View ({totalCount})</span>
            <CaretRightIcon size={12} />
          </Button>
        </Alert>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldWarningIcon
                size={20}
                weight="fill"
                className={isBlocked ? "text-rose-500" : "text-amber-500"}
              />
              <span>Violations (Highest Level: {highestLevel})</span>
            </DialogTitle>
            <DialogDescription>
              {isBlocked
                ? "Actions are restricted because the violation level reached the limit."
                : "Review active policy violation notices for your account or workspace."}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-80 pr-2">
            <div className="flex flex-col gap-4">
              {entries.map((entry) => (
                <div key={entry.scope} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <span>{entry.label}</span>
                    <span>Max Level {entry.data.level}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {entry.data.violate.map((v, idx) => (
                      <div
                        key={`${entry.scope}-${v.timestamp}-${idx}`}
                        className="rounded-sm border border-border bg-muted/30 px-3 py-2 text-xs flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Badge
                            variant={v.level >= VIOLATION_BLOCK_LEVEL ? "destructive" : "secondary"}
                            className="text-[10px] px-1.5 py-0 h-4 rounded-sm"
                          >
                            Level {v.level}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(v.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap wrap-break-word font-sans">
                          {v.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
