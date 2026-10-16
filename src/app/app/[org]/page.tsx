"use client";
import { useUserContext } from "@/contexts/user";
import {
  BuildingsIcon,
  SmileyIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getFallbackInitial } from "@/lib/utils";
import ContributionSkyline from "@/components/ui/contribution-skyline";
import OrgAnalytics from "@/components/org-analytics";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export default function OrgOverviewPage() {
  const { activeOrg } = useUserContext();

  const streamers = activeOrg?.streamers || [];
  const orgSlug = activeOrg?.slug || activeOrg?.id || "org";

  const bannerUrl = activeOrg?.banner;
  const [isBannerLoaded, setIsBannerLoaded] = useState(false);
  const [prevBannerUrl, setPrevBannerUrl] = useState(bannerUrl);

  if (prevBannerUrl !== bannerUrl) {
    setPrevBannerUrl(bannerUrl);
    setIsBannerLoaded(false);
  }

  return (
    <div className="flex flex-col gap-6 relative">
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
            className="w-full pointer-events-none top-0 left-0 z-0 absolute mask-b-from-0%"
          >
            <Image
              src={bannerUrl}
              alt="Banner"
              className="w-full select-none"
              width={720}
              height={288}
              onLoad={() => setIsBannerLoaded(true)}
              unoptimized
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        initial={false}
        animate={{ marginTop: bannerUrl ? 104 : 0 }}
        className="w-full mx-auto max-w-384 px-12 pt-12 flex flex-col gap-1 z-10"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between **:font-heading gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
              <BuildingsIcon size={16} weight="bold" />
              <span>Organization Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-foreground mt-3">
              {activeOrg?.name || "Organization Overview"}
            </h1>
          </div>
        </div>

        <ContributionSkyline
          orgId={activeOrg?.id || activeOrg?.slug}
          unit="transaction"
        />

        <OrgAnalytics orgId={activeOrg?.id || activeOrg?.slug} />
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
    </div>
  );
}
