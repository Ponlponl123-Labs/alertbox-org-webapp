"use client";
import { useUserContext } from "@/contexts/user";
import {
  BuildingsIcon,
  SmileyIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn, getFallbackInitial } from "@/lib/utils";
import ContributionSkyline from "@/components/ui/contribution-skyline";
import OrgAnalytics from "@/components/features/org/org-analytics";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { Input } from "react-smooth-input";

export default function OrgOverviewPage({ demo, setName }: { demo?: boolean, setName?: (name: string) => void }) {
  const { activeOrg } = useUserContext();

  const streamers = demo ? [] : activeOrg?.streamers || [];
  const orgSlug = demo ? "" : activeOrg?.slug || activeOrg?.id || "org";

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

  const bannerUrl = demo ? "" : activeOrg?.banner;
  const [isBannerLoaded, setIsBannerLoaded] = useState(false);
  const [prevBannerUrl, setPrevBannerUrl] = useState(bannerUrl);

  if (prevBannerUrl !== bannerUrl) {
    setPrevBannerUrl(bannerUrl);
    setIsBannerLoaded(false);
  }

  return (
    <div ref={rootRef} className={cn("flex flex-col gap-6 relative", demo && "overflow-hidden")}>
      <AnimatePresence>
        {bannerUrl && (
          <motion.div
            key={bannerUrl}
            initial={{ opacity: 0, filter: "blur(6px)" }}
            animate={{
              opacity: isBannerLoaded ? 1 : 0,
              filter: isBannerLoaded ? "blur(0px)" : "blur(6px)",
            }}
            exit={{ opacity: 0, filter: "blur(6px)" }}
            className="w-full pointer-events-none top-0 left-0 z-0 absolute mask-b-from-0% overflow-hidden"
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
                onLoad={() => setIsBannerLoaded(true)}
                unoptimized
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        initial={false}
        animate={{ marginTop: bannerUrl ? 104 : 0 }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full mx-auto max-w-384 px-12 pt-12 flex flex-col gap-1 z-10"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between **:font-heading gap-4">
            <div className="w-full">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
                <BuildingsIcon size={16} weight="bold" />
                <span>Organization Management</span>
              </div>
              {
                demo ? (
                  <Input
                    type="text"
                    placeholder="e.g. Acme Studio, Team Vitality"
                    onChange={(e) => setName?.(e.target.value)}
                    fontStyle={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: "500",
                      fontSize: "36px"
                    }}
                    customMotion={{
                      char: {
                        initial: {
                          x: 3,
                          opacity: 0,
                          filter: "blur(6px)"
                        },
                        animate: {
                          x: 0,
                          opacity: 1,
                          filter: "blur(0px)"
                        }
                      }
                    }}
                    className="mt-2"
                    classNames={{
                      inputWrapper: "h-[stretch]",
                      base: "h-max min-h-14 p-0 bg-transparent! data-[focused=true]:bg-transparent! data-[focused=true]:dark:bg-transparent! border-0! rounded-none",
                    }}
                  />
                ) : (
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-foreground mt-3">
                    {activeOrg?.name}
                  </h1>
                )
              }
            </div>
          </div>

          <ContributionSkyline
            orgId={demo ? "" : activeOrg?.id || activeOrg?.slug}
            unit="transaction"
          />

          <OrgAnalytics orgId={demo ? "" : activeOrg?.id || activeOrg?.slug} />
        </motion.div>

        <div className="flex flex-col gap-3 w-full mx-auto max-w-384 px-12 pb-12 mt-6">
          <div className="flex items-center justify-between bg-card rounded-xl p-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-medium">Members</h2>
              <div className="flex font-medium items-center gap-2">
                <p className="text-sm text-muted-foreground font-baijamjuree">Team Avengers</p>
                <p className="text-sm text-muted-foreground font-baijamjuree">•</p>
                <p className="text-sm text-muted-foreground font-baijamjuree">{streamers.length} Members</p>
              </div>
            </div>
            <Link
              href={`/app/${orgSlug}/streamers`}
            >
              <Button className={"rounded-lg p-3 h-max"}>
                <SmileyIcon weight="bold" />
                <span>Manage All</span>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {streamers.map((s) => {
              const streamerKey = s.name || s.id;
              return (
                <Link
                  key={s.id}
                  href={`/app/${orgSlug}/${streamerKey}`}
                >
                  <Button
                    className="p-1 w-full h-max rounded-xl not-hover:grayscale transition-all duration-250 ease-in-out"
                    variant="ghost"
                  >
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="w-full aspect-square rounded-lg bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                        {s.avatar ? (
                          <Image
                            src={s.avatar}
                            alt={s.name}
                            width={128}
                            height={128}
                            className="w-full aspect-square rounded-lg object-cover pointer-events-none select-none"
                            unoptimized
                          />
                        ) : (
                          getFallbackInitial(s.displayName || s.name)
                        )}
                      </div>
                      <div className="grid leading-tight min-w-0 text-start">
                        <span className="truncate font-medium text-foreground mt-1 text-lg font-heading">
                          {s.displayName || s.name}
                        </span>
                        <span className="truncate my-1 text-xs text-muted-foreground">
                          @{s.name}
                        </span>
                      </div>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
