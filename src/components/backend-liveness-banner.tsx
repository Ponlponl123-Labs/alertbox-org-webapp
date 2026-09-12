"use client";

import { useRef, useEffect, useState } from "react";
import { useStore } from "zustand";
import { coreStore, SystemStatusLevel } from "@/hooks/store/core";
import { WarningIcon, WrenchIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AutoHeight } from "./animate-ui/primitives/effects/auto-height";
import { ScrollArea } from "./ui/scroll-area";

const CONFIG: Record<
  Exclude<SystemStatusLevel, "operational">,
  {
    bg: string;
    ping: string;
    dot: string;
    iconColor: string;
    textColor: string;
    linkColor: string;
    badgeBg: string;
    badgeText: string;
    Icon: typeof WarningIcon;
  }
> = {
  down: {
    bg: "bg-rose-950 supports-backdrop-filter:bg-linear-to-r supports-backdrop-filter:from-rose-950/70 supports-backdrop-filter:via-rose-900/60 supports-backdrop-filter:to-rose-950/70 border-rose-500/20",
    ping: "bg-rose-400",
    dot: "bg-rose-500",
    iconColor: "text-rose-400",
    textColor: "text-rose-200/90",
    linkColor: "text-rose-300 hover:text-rose-100",
    badgeBg: "bg-rose-500/10 border-rose-500/30",
    badgeText: "text-rose-400",
    Icon: WarningIcon,
  },
  degraded: {
    bg: "bg-amber-950 supports-backdrop-filter:bg-linear-to-r supports-backdrop-filter:from-amber-950/70 supports-backdrop-filter:via-amber-900/60 supports-backdrop-filter:to-amber-950/70 border-amber-500/20",
    ping: "bg-amber-400",
    dot: "bg-amber-500",
    iconColor: "text-amber-400",
    textColor: "text-amber-200/90",
    linkColor: "text-amber-300 hover:text-amber-100",
    badgeBg: "bg-amber-500/10 border-amber-500/30",
    badgeText: "text-amber-400",
    Icon: WarningIcon,
  },
  maintenance: {
    bg: "bg-sky-950 supports-backdrop-filter:bg-linear-to-r supports-backdrop-filter:from-sky-950/70 supports-backdrop-filter:via-sky-900/60 supports-backdrop-filter:to-sky-950/70 border-sky-500/20",
    ping: "bg-sky-400",
    dot: "bg-sky-500",
    iconColor: "text-sky-400",
    textColor: "text-sky-200/90",
    linkColor: "text-sky-300 hover:text-sky-100",
    badgeBg: "bg-sky-500/10 border-sky-500/30",
    badgeText: "text-sky-400",
    Icon: WrenchIcon,
  },
};

interface BannerItem {
  id: string;
  level: Exclude<SystemStatusLevel, "operational">;
  title?: string | null;
  message: string;
  details?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  link?: string | null;
}

export default function BackendLivenessBanner() {
  const isBackendAlive = useStore(coreStore, (state) => state.isBackendAlive);
  const systemStatuses = useStore(coreStore, (state) => state.systemStatuses);
  const lang = useStore(coreStore, (state) => state.lang);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBanner, setSelectedBanner] = useState<BannerItem | null>(null);

  const defaultMsgMap: Record<Exclude<SystemStatusLevel, "operational">, string> = {
    down: lang.data.common.backend_offline,
    degraded: lang.data.common.backend_degraded,
    maintenance: lang.data.common.backend_maintenance,
  };

  const banners: BannerItem[] = [];

  if (isBackendAlive === false) {
    banners.push({
      id: "backend-offline",
      level: "down",
      title: "API Backend Offline",
      message: lang.data.common.backend_offline,
    });
  }

  const seenMessages = new Set<string>();
  if (isBackendAlive === false) {
    seenMessages.add(lang.data.common.backend_offline);
  }

  for (const s of systemStatuses) {
    if (s.level === "operational") continue;
    const msg = s.message || defaultMsgMap[s.level];
    if (seenMessages.has(msg)) continue;
    seenMessages.add(msg);
    banners.push({
      id: s.id || `status-${s.level}-${banners.length}`,
      level: s.level,
      title: s.title || msg,
      message: msg,
      details: s.details,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      link: s.link,
    });
  }

  useEffect(() => {
    const el = containerRef.current;
    const updateHeight = () => {
      const h = el && banners.length > 0 ? el.offsetHeight : 0;
      document.documentElement.style.setProperty(
        "--status-banner-height",
        `${h}px`,
      );
      document.body.style.marginTop = `${h}px`;
    };

    if (!el || banners.length === 0) {
      updateHeight();
      return;
    }

    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    updateHeight();

    return () => {
      observer.disconnect();
      document.documentElement.style.setProperty(
        "--status-banner-height",
        "0px",
      );
      document.body.style.marginTop = "0px";
    };
  }, [banners.length]);

  const selectedConf = selectedBanner ? CONFIG[selectedBanner.level] : null;

  return (
    <>
      <div
        ref={containerRef}
        className="fixed top-0 left-0 right-0 z-999 flex flex-col pointer-events-none select-none"
      >
        <AnimatePresence>
          {banners.map((banner) => {
            const conf = CONFIG[banner.level];
            const Icon = conf.Icon;
            const hasDetails = !!banner.details || banner.level === "maintenance";

            return (
              <motion.div
                key={banner.id}
                layout
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`w-full ${conf.bg} border-b supports-backdrop-filter:backdrop-blur-xl pointer-events-auto py-2 px-4 flex items-center justify-center gap-3 shadow-md`}
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${conf.ping} opacity-75`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${conf.dot}`}
                  />
                </span>
                <Icon className={`${conf.iconColor} size-4 shrink-0 animate-pulse`} weight="fill" />
                <span
                  className={`text-xs font-semibold tracking-wider ${conf.textColor} font-sans truncate max-w-xl`}
                >
                  {banner.message}
                </span>

                {hasDetails && (
                  <button
                    type="button"
                    onClick={() => setSelectedBanner(banner)}
                    className={`text-xs font-semibold underline underline-offset-2 shrink-0 cursor-pointer ${conf.linkColor}`}
                  >
                    <span>{lang.data.common.read_more}</span>
                  </button>
                )}

                {banner.link && (
                  <a
                    href={banner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs font-semibold underline underline-offset-2 flex items-center gap-1 shrink-0 ${conf.linkColor}`}
                  >
                    <span>{lang.data.common.status_page}</span>
                    <ArrowUpRightIcon className="size-3" weight="bold" />
                  </a>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <Dialog
        open={!!selectedBanner}
        onOpenChange={(open) => !open && setSelectedBanner(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-lg! rounded-2xl p-6 bg-popover/95 supports-backdrop-filter:backdrop-blur-xl border border-border shadow-2xl"
        >
          <DialogHeader className="gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${selectedConf?.ping || ""
                    } opacity-75`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${selectedConf?.dot || ""
                    }`}
                />
              </span>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${selectedConf?.badgeBg || ""
                  } ${selectedConf?.badgeText || ""}`}
              >
                {selectedBanner?.level}
              </span>
            </div>
            <DialogTitle className="text-base font-bold text-foreground leading-snug">
              {selectedBanner?.title || selectedBanner?.message}
            </DialogTitle>
            {(selectedBanner?.startsAt || selectedBanner?.endsAt) && (
              <p className="text-xs text-muted-foreground font-mono">
                {selectedBanner.startsAt &&
                  new Date(selectedBanner.startsAt).toLocaleString()}
                {selectedBanner.endsAt &&
                  ` — ${new Date(selectedBanner.endsAt).toLocaleString()}`}
              </p>
            )}
          </DialogHeader>

          <AutoHeight>
            <div className="text-xs text-foreground/85 whitespace-pre-line leading-relaxed pr-1 bg-muted/40 p-3.5 rounded-xl border border-border/40 font-sans select-text">
              <ScrollArea className="h-64 pr-1">
                {selectedBanner?.details}
              </ScrollArea>
            </div>
          </AutoHeight>

          <DialogFooter className="mt-4 flex sm:flex-row items-center justify-between gap-2">
            {selectedBanner?.link ? (
              <a
                href={selectedBanner.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <span>{lang.data.common.status_page}</span>
                <ArrowUpRightIcon className="size-3.5" weight="bold" />
              </a>
            ) : (
              <div />
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedBanner(null)}
              className="rounded-lg"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
