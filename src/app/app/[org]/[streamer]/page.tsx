"use client";
import React, { useEffect, useRef, useState } from "react";
import { useUserContext } from "@/contexts/user";
import {
  BroadcastIcon,
  ArrowSquareOutIcon,
} from "@phosphor-icons/react";
import { SocialLinks } from "@/components/shared";
import Link from "next/link";
import Image from "next/image";
import { cn, getFallbackInitial } from "@/lib/utils";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";

export default function StreamerDashboardPage() {
  const { activeOrg, activeStreamer } = useUserContext();
  const bannerUrl = activeStreamer?.banner;
  const [isBannerLoaded, setIsBannerLoaded] = React.useState(false);
  const [prevBannerUrl, setPrevBannerUrl] = React.useState(bannerUrl);

  if (prevBannerUrl !== bannerUrl) {
    setPrevBannerUrl(bannerUrl);
    setIsBannerLoaded(false);
  }

  const rootRef = useRef<HTMLDivElement>(null);
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (rootRef.current) {
      const viewport = rootRef.current.closest<HTMLElement>('[data-slot="scroll-area-viewport"]');
      if (viewport) setScrollContainer(viewport);
    }
  }, []);

  const { scrollY } = useScroll({
    container: scrollContainer ? { current: scrollContainer } : undefined,
  });
  const bannerY = useTransform(scrollY, [0, 300], [0, 95]);
  const bannerScale = useTransform(scrollY, [-120, 0, 300], [1.12, 1, 1.05]);
  const bannerOpacity = useTransform(scrollY, [0, 260], [1, 0.35]);

  if (!activeStreamer) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="flex flex-col items-center justify-center p-6 gap-4 text-center max-w-lg m-auto">
        <BroadcastIcon size={48} className="text-muted-foreground/60" />
        <h2 className="text-2xl font-medium font-sans text-foreground">No Channel Assigned</h2>
        <p className="text-sm text-muted-foreground font-sans">
          You do not have access to this streaming channel in {activeOrg?.name || "this organization"}. Contact an administrator to assign channel permissions to your account.
        </p>
      </motion.div>
    );
  }

  return (
    <div ref={rootRef} className={cn("flex flex-col gap-6 relative")}>
      <AnimatePresence mode="popLayout">
        {bannerUrl && (
          <motion.div
            key={bannerUrl}
            initial={{ opacity: 0, filter: "blur(6px)" }}
            animate={{
              opacity: isBannerLoaded ? 1 : 0,
              filter: isBannerLoaded ? "blur(0px)" : "blur(6px)",
            }}
            exit={{ opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 1 }}
            className="w-full pointer-events-none top-0 left-0 z-0 mask-b-from-0% overflow-hidden -mb-48"
          >
            <motion.div
              style={{ y: bannerY, scale: bannerScale, opacity: bannerOpacity }}
              className="w-full origin-top"
            >
              <Image
                src={bannerUrl}
                alt="Banner"
                className="w-full min-h-80 object-cover select-none"
                width={720}
                height={288}
                priority
                unoptimized
                onLoad={() => setIsBannerLoaded(true)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeStreamer.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: "none" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full mx-auto max-w-7xl px-12 pt-12 flex flex-col gap-1 z-10"
        >
          <div className={cn(
            "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5"
          )}>
            <div className="flex flex-col gap-4">
              <motion.div
                initial={{ opacity: 0, y: 4, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="size-36 rounded-full bg-foreground text-background font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
                {activeStreamer?.avatar ? (
                  <Image
                    src={activeStreamer.avatar}
                    alt={activeStreamer.name}
                    width={128}
                    height={128}
                    className="size-full rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  getFallbackInitial(activeStreamer?.displayName || activeStreamer?.name || "Channel")
                )}
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <motion.h1
                    initial={{ opacity: 0, y: 4, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-2xl lg:text-3xl xl:text-4xl font-semibold font-sans tracking-tight text-foreground">
                    {activeStreamer?.displayName || activeStreamer?.name || "Channel Dashboard"}
                  </motion.h1>
                  {activeStreamer?.uri && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      <Link
                        href={`/@${activeStreamer.uri}`}
                        target="_blank"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono"
                      >
                        <span>@{activeStreamer.uri}</span>
                        <ArrowSquareOutIcon size={12} />
                      </Link>
                    </motion.div>
                  )}
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 4, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-xs text-muted-foreground font-sans mt-0.5">
                  Managed under organization <span className="font-semibold text-foreground">{activeOrg?.name}</span>
                </motion.p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 4, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex items-center gap-2"
            >
              <SocialLinks socials={activeStreamer} iconSize={22} colored />
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
