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
import Link from "next/link";

const CONFIG: Record<
  Exclude<SystemStatusLevel, "operational">,
  {
    gradient: string;
    glowLine: string;
    liquidBlob: string;
    border: string;
    ping: string;
    dot: string;
    iconColor: string;
    textColor: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    actionBg: string;
    Icon: typeof WarningIcon;
  }
> = {
  down: {
    gradient: "from-rose-950/80 via-rose-900/40 to-rose-950/80",
    glowLine: "from-transparent via-rose-500/50 to-transparent",
    liquidBlob: "bg-rose-500/30",
    border: "border-rose-500/20",
    ping: "bg-rose-400",
    dot: "bg-rose-500",
    iconColor: "text-rose-400",
    textColor: "text-rose-100/90",
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-300",
    badgeBorder: "border-rose-500/30",
    actionBg: "bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 hover:text-white border-rose-500/30",
    Icon: WarningIcon,
  },
  degraded: {
    gradient: "from-amber-950/80 via-amber-900/40 to-amber-950/80",
    glowLine: "from-transparent via-amber-500/50 to-transparent",
    liquidBlob: "bg-amber-500/30",
    border: "border-amber-500/20",
    ping: "bg-amber-400",
    dot: "bg-amber-500",
    iconColor: "text-amber-400",
    textColor: "text-amber-100/90",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-300",
    badgeBorder: "border-amber-500/30",
    actionBg: "bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 hover:text-white border-amber-500/30",
    Icon: WarningIcon,
  },
  maintenance: {
    gradient: "from-sky-950/80 via-sky-900/40 to-sky-950/80",
    glowLine: "from-transparent via-sky-500/50 to-transparent",
    liquidBlob: "bg-sky-500/30",
    border: "border-sky-500/20",
    ping: "bg-sky-400",
    dot: "bg-sky-500",
    iconColor: "text-sky-400",
    textColor: "text-sky-100/90",
    badgeBg: "bg-sky-500/15",
    badgeText: "text-sky-300",
    badgeBorder: "border-sky-500/30",
    actionBg: "bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 hover:text-white border-sky-500/30",
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
      coreStore.getState().setStatusBannerHeight(h);
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
      coreStore.getState().setStatusBannerHeight(0);
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
        className="fixed top-0 left-0 right-0 z-20999 flex flex-col pointer-events-none select-none"
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
                initial={{ y: -48, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -48, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className={`pointer-events-auto relative w-full overflow-hidden bg-zinc-950/80 supports-backdrop-filter:bg-zinc-950/50 supports-backdrop-filter:backdrop-blur-2xl bg-linear-to-r ${conf.gradient} border-b ${conf.border} shadow-[0_8px_32px_rgba(0,0,0,0.36)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-white/20 before:to-transparent after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-linear-to-r ${conf.glowLine}`}
              >
                <div
                  className={`absolute -top-10 left-1/4 -translate-x-1/2 w-80 h-20 rounded-full blur-3xl pointer-events-none opacity-40 ${conf.liquidBlob}`}
                />
                <div
                  className={`absolute -bottom-8 right-1/4 translate-x-1/2 w-80 h-16 rounded-full blur-3xl pointer-events-none opacity-30 ${conf.liquidBlob}`}
                />
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                  className="absolute inset-0 w-1/2 bg-linear-to-r from-transparent via-white/8 to-transparent pointer-events-none"
                />

                <div className="relative max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3 sm:gap-6">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className="relative flex items-center justify-center size-2.5 shrink-0">
                      <span
                        className={`animate-ping absolute inline-flex size-full rounded-full ${conf.ping} opacity-75`}
                      />
                      <span
                        className={`relative inline-flex rounded-full size-2 ${conf.dot} shadow-[0_0_8px_currentColor]`}
                      />
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${conf.badgeBg} ${conf.badgeText} border ${conf.badgeBorder} shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] shrink-0`}
                    >
                      <Icon className="size-3 shrink-0 animate-pulse" weight="fill" />
                      <span>{banner.level}</span>
                    </span>

                    <span
                      className={`text-xs font-medium tracking-wide ${conf.textColor} font-sans truncate`}
                    >
                      {banner.message}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {hasDetails && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedBanner(banner)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${conf.actionBg} backdrop-blur-md transition-interactive shadow-xs`}
                      >
                        <span>{lang.data.common.read_more}</span>
                      </Button>
                    )}

                    {banner.link && (
                      <Link
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${conf.actionBg} backdrop-blur-md transition-interactive shadow-xs`}
                      >
                        <span>{lang.data.common.status_page}</span>
                        <ArrowUpRightIcon className="size-3" weight="bold" />
                      </Link>
                    )}
                  </div>
                </div>
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
