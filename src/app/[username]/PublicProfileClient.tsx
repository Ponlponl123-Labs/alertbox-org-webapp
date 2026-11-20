"use client";
import React, { useEffect, useRef, useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { getApiUrl } from "@/lib/api";
import { getActiveBadges } from "@/lib/badges";
import { cn, getFallbackInitial } from "@/lib/utils";
import { numberToHexColor, getAccentForeground, hexToOklch } from "@/lib/color";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  FeelFreePay,
} from "@/components/icons";
import { Stripe, BuyMeACoffee, KoFi, Xendit } from "@thesvg/react";
import {
  SealCheckIcon,
  GhostIcon,
} from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatePresence, motion, useIsomorphicLayoutEffect, useScroll, useTransform, Variants } from "motion/react";
import { SocialLinks } from "@/components/shared";
import PullCord from "@/components/kokonutui/pull-cord";
import DrapeBackground from "@/components/kokonutui/drape-background";
import { PageTransition } from "@/components/animate-ui/components/page-transition";
import { Button } from "@/components/ui/button";
import { ArrowRight01 } from "@/components/animate-ui/icons/hugeicons/arrow-right-01";
import { AnimateIcon } from "@animate-ui/react/icons";
import { ArrowLeft01 } from "@/components/animate-ui/icons/hugeicons/arrow-left-01";
import { AutoHeight } from "@/components/animate-ui/primitives/effects/auto-height";
import Link from "next/link";

type PaymentMethodType =
  | "stripe"
  | "xendit"
  | "omise"
  | "2c2p"
  | "feelfreepay"
  | "kofi"
  | "bmac";

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export interface PublicProfileData {
  name: string;
  displayName: string;
  bio: string | null;
  avatar: string | null;
  banner: string | null;
  accentColor: number;
  badges: number;
  twitch: string | null;
  youtube: string | null;
  twitter: string | null;
  facebook: string | null;
  reddit: string | null;
  discord: string | null;
  defaultDonorName?: string | null;
  defaultDonorAmount?: number | null;
  minTipAmount?: number | null;
  maxTipAmount?: number | null;
  currency?: number | null;
  kofiUsername?: string | null;
  bmacUsername?: string | null;
  integrations?: {
    stripe: boolean;
    xendit: boolean;
    omise: boolean;
    "2c2p": boolean;
    feelfreepay: boolean;
    kofi: boolean;
    bmac: boolean;
  } | null;
}

export default function PublicProfileClient({
  username,
  initialData,
}: {
  username: string;
  initialData: PublicProfileData | null;
}) {
  const lang = useStore(coreStore, (state) => state.lang);
  const decodedUsername = decodeURIComponent(username);

  const uri = decodedUsername.startsWith("@")
    ? decodedUsername.slice(1)
    : decodedUsername;
  const [profileData, setProfileData] = useState<PublicProfileData | null>(
    initialData,
  );
  const bannerUrl = profileData?.banner;
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [isBannerLoaded, setIsBannerLoaded] = React.useState(false);
  const [prevBannerUrl, setPrevBannerUrl] = React.useState(bannerUrl);

  if (prevBannerUrl !== bannerUrl) {
    setPrevBannerUrl(bannerUrl);
    setIsBannerLoaded(false);
  }

  const rootRef = useRef<HTMLDivElement>(null);
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (rootRef.current) {
      setScrollContainer(rootRef.current.closest<HTMLElement>('[data-slot="scroll-area-viewport"]'));
    }
  }, []);

  const { scrollY } = useScroll({
    container: scrollContainer ? { current: scrollContainer } : undefined,
  });
  const bannerY = useTransform(scrollY, [0, 300], [0, 95]);
  const bannerScale = useTransform(scrollY, [-120, 0, 300], [1.12, 1, 1.05]);
  const bannerOpacity = useTransform(scrollY, [0, 260], [1, 0.35]);

  const [prevInitialData, setPrevInitialData] = useState(initialData);
  if (prevInitialData !== initialData) {
    setPrevInitialData(initialData);
    if (initialData) {
      setProfileData(initialData);
      setLoading(false);
      setError(null);
    }
  }

  useEffect(() => {
    if (initialData) return;

    async function fetchProfile() {
      try {
        const res = await fetch(getApiUrl(`/api/v1/profile/${uri}/details`));
        if (res.status === 404) {
          setError("not_found");
          return;
        }
        if (!res.ok) {
          setError("error");
          return;
        }
        const data: PublicProfileData = await res.json();
        setProfileData(data);

        if (data.integrations) {
          const methodsOrder: PaymentMethodType[] = [
            "stripe",
            "xendit",
            "omise",
            "2c2p",
            "feelfreepay",
            "kofi",
            "bmac",
          ];
          const firstActive = methodsOrder.find((m) => data.integrations?.[m]);
          if (firstActive) {
            setSelectedMethod(firstActive);
          }
        }
      } catch {
        setError("error");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [uri, lang.key, initialData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Spinner className="size-8 text-foreground" />
      </div>
    );
  }

  if (!decodedUsername.startsWith("@") || error === "not_found") {
    notFound();
  }

  if (error || !profileData) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center font-sans relative">
        <div className="absolute inset-0 mask-b-from-0">
          <DrapeBackground className="absolute inset-0">
            <></>
          </DrapeBackground>
        </div>
        <div className="flex flex-col items-center gap-4 animate-fade-in-up duration-300 z-10">
          <GhostIcon size={64} weight="fill" />
          <div className="text-center">
            <h2 className="text-3xl font-semibold font-rubik text-foreground mb-1">
              Streamer not ready
            </h2>
            <p className="text-sm text-muted-foreground font-sans">
              This streamer hasn&apos;t quite set up their page yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const allBadges = getActiveBadges(profileData.badges);
  const isVerified = allBadges.some((b) => b.name === "verified");
  const badges = allBadges.filter((b) => b.name !== "verified");
  const accentHex = profileData.accentColor
    ? numberToHexColor(profileData.accentColor)
    : "#6366f1";
  const accentForegroundHex = getAccentForeground(accentHex);
  const primaryOklch = hexToOklch(accentHex);
  const primaryForegroundOklch = hexToOklch(accentForegroundHex);

  const paymentMethodsList = [
    { id: "stripe", label: "Stripe", icon: Stripe },
    { id: "xendit", label: "Xendit", icon: Xendit },
    { id: "omise", label: "Omise", logo: "/omise.webp" },
    { id: "2c2p", label: "2C2P", logo: "/2c2p.webp" },
    { id: "feelfreepay", label: "FeelFreePay", icon: FeelFreePay },
    { id: "kofi", label: "Ko-fi", icon: KoFi },
    { id: "bmac", label: "Buy Me a Coffee", icon: BuyMeACoffee },
  ];

  const integrations = profileData.integrations;
  const activeMethods = paymentMethodsList.filter((item) => {
    return !!integrations?.[item.id as keyof typeof integrations];
  });

  return (
    <div
      className="flex flex-col min-h-screen bg-linear-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black relative font-sans"
      style={
        {
          "--primary": primaryOklch,
          "--primary-foreground": primaryForegroundOklch,
        } as React.CSSProperties
      }
      ref={rootRef}
    >
      <div className="fixed top-0 right-0 z-50 zoom-50">
        <PullCord />
      </div>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={bannerUrl}
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{
            opacity: !bannerUrl || isBannerLoaded ? 1 : 0,
            filter: !bannerUrl || isBannerLoaded ? "blur(0px)" : "blur(6px)",
          }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 1 }}
          className="w-full pointer-events-none bg-primary top-0 left-0 z-0 mask-b-from-0% overflow-hidden -mb-48"
        >
          <motion.div
            style={{ y: bannerY, scale: bannerScale, opacity: bannerOpacity }}
            className="w-full origin-top min-h-96"
          >
            {bannerUrl && (
              <Image
                src={bannerUrl}
                alt="Banner"
                className="w-full min-h-96 object-cover select-none"
                width={720}
                height={288}
                priority
                unoptimized
                onLoad={() => setIsBannerLoaded(true)}
              />
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <motion.main
        initial="hidden"
        animate="show"
        variants={staggerContainer}
        className="max-w-6xl mx-auto px-4 md:px-8 pb-24 w-full -mt-16 md:-mt-24 relative flex flex-col md:grid md:grid-cols-12 gap-8 md:gap-12 flex-1"
      >
        <div className="md:col-span-7 flex flex-col justify-start">
          <div className="flex flex-col items-start">
            <motion.div
              variants={fadeInUp}
              className="relative bg-primary border border-foreground/10 rounded-full shadow-2xl"
            >
              <Avatar className="size-32 md:size-42 shadow-inner">
                {profileData.avatar && <AvatarImage src={profileData.avatar} />}
                <AvatarFallback className="text-3xl md:text-5xl font-bold bg-muted text-foreground/50">
                  {getFallbackInitial(profileData.displayName || "?")}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-extrabold tracking-tight mt-6 text-foreground font-heading flex items-center gap-2 select-none"
            >
              {profileData.displayName || "Display Name"}
              {isVerified && (
                <Tooltip>
                  <TooltipTrigger>
                    <SealCheckIcon
                      className="size-7 md:size-9 text-primary shrink-0 select-none cursor-pointer"
                      weight="fill"
                    />
                  </TooltipTrigger>
                  <TooltipContent className="rounded-2xl">
                    <p>{lang.data.app.profile.preview.official_account}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </motion.h1>

            <motion.span
              variants={fadeInUp}
              className="text-sm md:text-base text-foreground/40 font-medium mt-1 select-none"
            >
              @{profileData.name || "username"}
            </motion.span>

            {badges.length > 0 && (
              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap gap-1 mt-4"
              >
                {badges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <Badge
                      key={badge.name}
                      variant="default"
                      className={cn(
                        "text-xs px-2 py-1 h-auto gap-1 rounded-sm border-0 font-semibold select-none",
                        badge.className,
                        "bg-primary/10 hover:bg-primary/15 text-primary",
                      )}
                    >
                      <Icon className="size-4 shrink-0" weight="fill" />
                      {badge.label}
                    </Badge>
                  );
                })}
              </motion.div>
            )}

            <motion.p
              variants={fadeInUp}
              className="text-sm font-sans text-muted-foreground mt-8 leading-relaxed whitespace-pre-wrap max-w-xl wrap-break-word select-none"
            >
              {profileData.bio || lang.data.app.profile.preview.no_bio}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 4, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex items-center gap-2 mt-3 select-none **:cursor-default"
            >
              <SocialLinks socials={profileData} iconSize={22} colored />
            </motion.div>
          </div>
        </div>
        <motion.div
          variants={fadeInUp}
          className="md:col-span-5 flex flex-col justify-start"
        >
          {activeMethods.length > 0 && (
            <>
              <AutoHeight>
                <PageTransition
                  effect="slide"
                  pageKey={String(selectedMethod)}
                  className={`flex flex-col flex-1 min-w-0 items-center gap-3 bg-background/0 overflow-visible relative`}
                >
                  {
                    activeMethods.length > 0 && selectedMethod &&
                    <AnimateIcon animateOnHover className="group w-full">
                      <Button
                        variant="secondary"
                        className="p-2 backdrop-blur-xl bg-secondary/20 w-max font-semibold h-max rounded-xl flex items-center justify-start gap-3"
                        onClick={() => React.startTransition(() => {
                          React.addTransitionType("nav-back")
                          setSelectedMethod(null)
                        })}
                      >
                        <ArrowLeft01 />
                        Select other tipping method
                      </Button>
                    </AnimateIcon>
                  }
                  {
                    selectedMethod === null ? (<>
                      <h2 className="w-full text-3xl font-medium text-foreground">
                        Continue with
                      </h2>
                      <div className="w-full flex flex-col gap-1">
                        {
                          activeMethods.map((mthd, idx) => {
                            const Icon = mthd.icon;
                            return (
                              <AnimateIcon animateOnHover key={idx} className="group w-full">
                                <Button
                                  variant="outline"
                                  className="p-4 w-full border-2 backdrop-blur-xl group-first:rounded-b-sm group-last:rounded-t-sm font-semibold h-max rounded-xl flex items-center justify-start gap-3"
                                  onClick={() => React.startTransition(() => {
                                    React.addTransitionType("nav-forward")
                                    setSelectedMethod(mthd.id as PaymentMethodType)
                                  })}
                                >
                                  {Icon && <Icon className="size-5 shrink-0" />}
                                  {mthd.logo && (
                                    <Image
                                      src={mthd.logo}
                                      alt={mthd.label}
                                      width={20}
                                      height={20}
                                      className="size-5 object-contain shrink-0"
                                    />
                                  )}
                                  <span>{mthd.label}</span>
                                  <ArrowRight01 className={"ml-auto"} />
                                </Button>
                              </AnimateIcon>
                            );
                          })
                        }
                      </div>
                    </>) : selectedMethod === "kofi" ? <>
                      <iframe
                        className="w-96 h-172 border-0 rounded-sm bg-white"
                        src={`https://ko-fi.com/${profileData.kofiUsername}/?hidefeed=true&widget=true&embed=true&preview=true`}
                        title="Ko-Fi"
                        style={{ colorScheme: "light", scrollbarWidth: "thin" }}
                        loading="lazy"
                      />
                    </> : selectedMethod === "bmac" ? <>
                      <iframe
                        className="w-full h-172 border-0 rounded-sm bg-white"
                        src={`https://www.buymeacoffee.com/widget/page/${profileData.bmacUsername}`}
                        title="Ko-Fi"
                        style={{ colorScheme: "light", scrollbarWidth: "thin" }}
                        loading="lazy"
                      />
                    </> : selectedMethod === "stripe" ? <>
                    </> : <></>
                  }
                </PageTransition>
              </AutoHeight>
              <span className="text-xs text-muted-foreground text-center mt-4 block">By processing to donation means you&apos;re agreeing to both our <Link className="text-blue-500" href="/terms-of-service">terms of service</Link> and the payment provider&apos;s terms</span>
            </>
          )}
        </motion.div>
      </motion.main>
    </div>
  );
}
