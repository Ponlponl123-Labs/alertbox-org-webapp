"use client";
import React, { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { getActiveBadges } from "@/lib/badges";
import { cn, getFallbackInitial, getSocialUrl } from "@/lib/utils";
import { numberToHexColor, getAccentForeground } from "@/lib/color";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  TwitchTv,
  Youtube as YoutubeIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Reddit as RedditIcon,
  Discord as DiscordIcon,
  FeelFreePay,
} from "@/components/icons";
import { Stripe, BuyMeACoffee, KoFi, Xendit } from "@thesvg/react";
import {
  SealCheckIcon,
  CheckCircleIcon,
  HeartIcon,
  CreditCardIcon,
  GhostIcon,
} from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "react-smooth-input";
import LanguageSwitcher from "@/components/language-switcher";
import ThemeSwitcher from "@/components/theme-switcher";
import { motion, Variants } from "motion/react";

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

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const lang = useStore(coreStore, (state) => state.lang);
  const { username } = use(params);
  const decodedUsername = decodeURIComponent(username);

  if (!decodedUsername.startsWith("@")) {
    notFound();
  }

  const uri = decodedUsername.slice(1);
  const [profileData, setProfileData] = useState<PublicProfileData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tipAmount, setTipAmount] = useState<string>("");
  const [donorName, setDonorName] = useState<string>("");
  const [donorMessage, setDonorMessage] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<
    "stripe" | "xendit" | "omise" | "2c2p" | "feelfreepay" | "kofi" | "bmac"
  >("stripe");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/v1/profile/${uri}/details`);
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
        const isThai = lang.key === "th-TH";
        setTipAmount(isThai ? "100" : "10");

        if (data.integrations) {
          const methodsOrder: (typeof paymentMethod)[] = [
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
            setPaymentMethod(firstActive);
          }
        }
      } catch (err) {
        setError("error");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [uri, lang.key]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Spinner className="size-8 text-foreground" />
      </div>
    );
  }

  if (error === "not_found") {
    notFound();
  }

  if (error || !profileData) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 font-sans">
        <div className="flex flex-col items-center gap-4 animate-fade-in-up duration-300">
          <div className="p-5 rounded-full bg-foreground/5 text-foreground/40 shadow-sm border border-foreground/5">
            <GhostIcon size={48} weight="duotone" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-1">
              Streamer not ready
            </h2>
            <p className="text-sm text-foreground/50">
              This streamer hasn't quite set up their page yet.
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

  const isThai = lang.key === "th-TH";
  const currencySymbol = isThai ? "฿" : "$";
  const presets = isThai
    ? ["50", "100", "300", "500"]
    : ["5", "10", "25", "50"];

  const isCustomizable = (method: string) => {
    return ["stripe", "xendit", "omise", "2c2p", "feelfreepay"].includes(
      method,
    );
  };

  const paymentMethodsList = [
    { id: "stripe", label: "Stripe", icon: Stripe },
    { id: "xendit", label: "Xendit", icon: Xendit },
    { id: "omise", label: "Omise", logo: "/omise.webp" },
    { id: "2c2p", label: "2C2P", logo: "/2c2p.webp" },
    { id: "feelfreepay", label: "FeelFreePay", icon: FeelFreePay },
    { id: "kofi", label: "Ko-fi", icon: KoFi },
    { id: "bmac", label: "BMAC", icon: BuyMeACoffee },
  ];

  const integrations = profileData.integrations;
  const activeMethods = paymentMethodsList.filter((item) => {
    return !!integrations?.[item.id as keyof typeof integrations];
  });

  const socialList = [
    {
      value: profileData.twitch,
      icon: TwitchTv,
      label: "Twitch",
      color: "hover:text-[#9146FF] hover:bg-[#9146FF]/10",
    },
    {
      value: profileData.youtube,
      icon: YoutubeIcon,
      label: "YouTube",
      color: "hover:text-[#FF0000] hover:bg-[#FF0000]/10",
    },
    {
      value: profileData.twitter,
      icon: TwitterIcon,
      label: "Twitter",
      color:
        "hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 dark:hover:text-white dark:hover:bg-white/10",
    },
    {
      value: profileData.facebook,
      icon: FacebookIcon,
      label: "Facebook",
      color: "hover:text-[#1877F2] hover:bg-[#1877F2]/10",
    },
    {
      value: profileData.reddit,
      icon: RedditIcon,
      label: "Reddit",
      color: "hover:text-[#FF4500] hover:bg-[#FF4500]/10",
    },
    {
      value: profileData.discord,
      icon: DiscordIcon,
      label: "Discord",
      color: "hover:text-[#5865F2] hover:bg-[#5865F2]/10",
    },
  ];

  const handleTipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipAmount) return;
    const amount = parseFloat(tipAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (profileData) {
      const min = profileData.minTipAmount ?? 1;
      const max = profileData.maxTipAmount ?? 10000;
      if (amount < min || amount > max) return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  const handleReset = () => {
    setDonorName("");
    setDonorMessage("");
    setIsSuccess(false);
    setTipAmount(isThai ? "100" : "10");
  };

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black relative overflow-x-hidden font-sans">
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-10 dark:opacity-20 pointer-events-none -top-40 -right-40"
        style={{ backgroundColor: accentHex }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-5 dark:opacity-10 pointer-events-none top-[60vh] -left-60"
        style={{ backgroundColor: accentHex }}
      />

      <div className="absolute top-4 right-4 z-50 flex items-center gap-1.5 bg-background/60 backdrop-blur-md border border-foreground/10 px-2.5 py-1.5 rounded-2xl shadow-lg">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
      {profileData.banner && (
        <Image
          src={profileData.banner}
          alt="Banner Backdrop"
          className="w-full h-128 blur-2xl absolute pointer-events-none select-none object-cover opacity-30 dark:opacity-20"
          width={1600}
          height={400}
          priority
        />
      )}
      {profileData.avatar && (
        <Image
          src={profileData.avatar}
          alt="Avatar Backdrop"
          className="size-full blur-3xl fixed pointer-events-none select-none object-cover opacity-30 saturate-200 dark:opacity-10"
          width={400}
          height={400}
          priority
        />
      )}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full h-48 md:h-96 relative overflow-hidden shrink-0 border-b border-foreground/5 shadow-inner mask-b-from-60%"
      >
        {profileData.banner ? (
          <Image
            src={profileData.banner}
            alt="Banner"
            className="size-full object-cover pointer-events-none select-none"
            width={1600}
            height={400}
            priority
          />
        ) : (
          <div
            className="size-full opacity-80"
            style={{
              background: `linear-gradient(135deg, ${accentHex} 0%, #1e1b4b 100%)`,
            }}
          />
        )}
      </motion.div>

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
              className="relative p-1 bg-background border border-foreground/10 rounded-full shadow-2xl"
            >
              <Avatar className="size-28 md:size-40 shadow-inner">
                {profileData.avatar && <AvatarImage src={profileData.avatar} />}
                <AvatarFallback className="text-3xl md:text-5xl font-bold bg-muted text-foreground/50">
                  {getFallbackInitial(profileData.displayName || "?")}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-extrabold tracking-tight mt-6 text-foreground flex items-center gap-2"
            >
              {profileData.displayName || "Display Name"}
              {isVerified && (
                <Tooltip>
                  <TooltipTrigger>
                    <SealCheckIcon
                      className="size-7 md:size-9 text-blue-500 shrink-0 select-none cursor-pointer"
                      style={{ color: accentHex }}
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
              className="text-sm md:text-base text-foreground/40 font-medium mt-1"
            >
              @{profileData.name || "username"}
            </motion.span>

            {badges.length > 0 && (
              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap gap-1.5 mt-4"
              >
                {badges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <Badge
                      key={badge.name}
                      variant="default"
                      className={cn(
                        "text-sm px-3 py-1 h-auto gap-1 rounded-md border-0 font-semibold shadow-xs select-none",
                        badge.className,
                      )}
                    >
                      <Icon className="size-3 shrink-0" weight="fill" />
                      {badge.label}
                    </Badge>
                  );
                })}
              </motion.div>
            )}

            <motion.p
              variants={fadeInUp}
              className="text-sm md:text-base text-foreground/75 mt-8 leading-relaxed whitespace-pre-wrap max-w-xl wrap-break-word"
            >
              {profileData.bio || lang.data.app.profile.preview.no_bio}
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap gap-2.5 mt-10"
            >
              {socialList.map((soc, i) => {
                if (!soc.value) return null;
                const Icon = soc.icon;
                return (
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={i}
                    href={getSocialUrl(soc.label, soc.value)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "p-3 rounded-2xl bg-card border border-foreground/10 text-foreground/45 transition-all duration-300 flex items-center justify-center shadow-xs",
                      soc.color,
                    )}
                    title={`${soc.label}: ${soc.value}`}
                  >
                    <Icon className="size-5 md:size-6" />
                  </motion.a>
                );
              })}
            </motion.div>
          </div>
        </div>
        <motion.div
          variants={fadeInUp}
          className="md:col-span-5 flex flex-col justify-start"
        >
          <div className="w-full max-w-md mx-auto md:mx-0 bg-background/40 backdrop-saturate-200 backdrop-blur-lg border-2 border-foreground/10 p-6 md:p-8 rounded-[2rem] shadow-2xl flex flex-col relative md:sticky md:top-8 gap-6">
            {activeMethods.length === 0 ? (
              <div className="flex flex-col items-center text-center py-10 animate-fade-in-up duration-300">
                <div className="p-4 rounded-full bg-foreground/5 text-foreground/40 mb-4">
                  <CreditCardIcon className="size-8 text-foreground/60" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  {lang.data.app.profile.preview.no_gateways}
                </h3>
                <p className="text-xs text-foreground/50 mt-2 leading-relaxed px-4">
                  {lang.data.app.profile.preview.no_gateways_desc.replace(
                    "{name}",
                    profileData.displayName || "",
                  )}
                </p>
              </div>
            ) : isSuccess ? (
              <div className="flex flex-col items-center text-center py-6 animate-fade-in-up duration-300">
                <div
                  className="size-16 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-500/20"
                  style={{ backgroundColor: accentHex }}
                >
                  <CheckCircleIcon size={36} weight="bold" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {lang.data.app.profile.preview.tip_success_title}
                </h2>
                <p className="text-xs text-foreground/60 mt-3 leading-relaxed px-4">
                  {lang.data.app.profile.preview.tip_success_desc
                    .replace("{name}", profileData.displayName || "")
                    .replace("{amount}", `${currencySymbol}${tipAmount}`)}
                </p>
                {donorMessage && (
                  <div className="w-full bg-foreground/3 border border-foreground/5 rounded-2xl p-4 mt-6 text-left text-xs leading-relaxed text-foreground/75 italic">
                    &ldquo;{donorMessage}&rdquo;
                  </div>
                )}
                <button
                  onClick={handleReset}
                  style={{
                    backgroundColor: accentHex,
                    color: accentForegroundHex,
                  }}
                  className="w-full mt-8 py-3 rounded-2xl text-xs font-bold tracking-wider hover:opacity-90 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-md"
                >
                  {lang.data.app.profile.preview.send_another_tip}
                </button>
              </div>
            ) : (
              <form onSubmit={handleTipSubmit} className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-1.5 leading-snug">
                    <HeartIcon
                      className="size-5 shrink-0"
                      style={{ color: accentHex }}
                      weight="fill"
                    />
                    {lang.data.app.profile.preview.support_title}
                  </h2>
                  <p className="text-[11px] text-foreground/50 mt-1 leading-snug">
                    {lang.data.app.profile.preview.support_desc}
                  </p>
                </div>

                {isCustomizable(paymentMethod) && (
                  <>
                    <div className="flex flex-col gap-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">
                        {lang.data.app.profile.preview.select_amount}
                      </span>
                      <div className="grid grid-cols-4 gap-2">
                        {presets.map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setTipAmount(val)}
                            className={cn(
                              "py-2 rounded-xl text-xs font-bold transition-all border duration-200 cursor-pointer",
                              tipAmount === val
                                ? "bg-foreground text-background border-transparent"
                                : "bg-foreground/3 hover:bg-foreground/5 border-foreground/5 text-foreground",
                            )}
                          >
                            {currencySymbol}
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Input
                        type="text"
                        inputMode="decimal"
                        required
                        value={tipAmount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || /^\d*\.?\d*$/.test(val)) {
                            setTipAmount(val);
                          }
                        }}
                        placeholder={
                          lang.data.app.profile.preview.custom_amount
                        }
                        startContent={
                          <span className="text-sm font-bold text-foreground/40 translate-y-0.5 ml-1.5 mr-0.5">
                            {currencySymbol}
                          </span>
                        }
                        fontStyle={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "14px",
                          fontWeight: "700",
                        }}
                        classNames={{
                          base: "h-11 rounded-2xl px-3 border-2 border-transparent dark:bg-white/10 bg-black/10 hover:bg-black/5 hover:border-black/10 dark:hover:bg-white/5 dark:hover:border-white/10 focus-within:bg-black/5! focus-within:border-black/10! focus-within:dark:bg-white/5! focus-within:dark:border-white/10!",
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-3.5">
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">
                          {lang.data.app.profile.preview.name}
                        </span>
                        <Input
                          type="text"
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          placeholder={
                            profileData.defaultDonorName || "Anonymous"
                          }
                          maxLength={48}
                          fontStyle={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                          classNames={{
                            base: "h-11 rounded-2xl px-3 border-2 border-transparent dark:bg-white/10 bg-black/10 hover:bg-black/5 hover:border-black/10 dark:hover:bg-white/5 dark:hover:border-white/10 focus-within:bg-black/5! focus-within:border-black/10! focus-within:dark:bg-white/5! focus-within:dark:border-white/10!",
                          }}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">
                          {lang.data.app.profile.preview.support_message}
                        </span>
                        <textarea
                          value={donorMessage}
                          onChange={(e) => setDonorMessage(e.target.value)}
                          placeholder={
                            lang.data.app.profile.preview.message_placeholder
                          }
                          maxLength={200}
                          rows={3}
                          className={cn(
                            "w-full rounded-2xl border-2 border-transparent dark:bg-white/10 bg-black/10 px-4 py-3 outline-none text-xs text-foreground transition-all duration-200 resize-none",
                            "hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/10 dark:hover:border-white/10",
                            "focus:bg-black/5! focus:dark:bg-white/5! focus:border-black/10! focus:dark:bg-white/10!",
                          )}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">
                    {lang.data.app.profile.preview.payment_gateway}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {activeMethods.map((item) => {
                      const ProviderIcon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPaymentMethod(item.id as any)}
                          className={cn(
                            "py-2.5 px-1 rounded-xl flex flex-col items-center justify-center border transition-all duration-200 cursor-pointer gap-1",
                            paymentMethod === item.id
                              ? "bg-foreground/5 border-foreground/10 shadow-xs"
                              : "bg-transparent border-transparent opacity-40 hover:opacity-75",
                          )}
                        >
                          {ProviderIcon ? (
                            <ProviderIcon className="h-4.5 max-w-[80%] shrink-0 text-foreground" />
                          ) : item.logo ? (
                            <img
                              src={item.logo}
                              alt={item.label}
                              className="h-4.5 max-w-[80%] object-contain shrink-0 dark:invert"
                            />
                          ) : null}
                          <span className="text-[8px] font-bold tracking-wide uppercase mt-0.5 text-foreground">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isCustomizable(paymentMethod) ? (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: accentHex,
                      color: accentForegroundHex,
                    }}
                    className="w-full py-3 rounded-2xl text-xs font-bold tracking-wider hover:opacity-90 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner className="size-4 shrink-0 text-current" />
                        <span>
                          {lang.data.app.profile.preview.initializing_checkout}
                        </span>
                      </>
                    ) : (
                      <span>
                        {lang.data.app.profile.preview.tip_action
                          .replace("{symbol}", currencySymbol)
                          .replace("{amount}", tipAmount || "0")
                          .replace(
                            "{name}",
                            (profileData.displayName || "").toUpperCase(),
                          )}
                      </span>
                    )}
                  </button>
                ) : (
                  <a
                    href={
                      paymentMethod === "kofi"
                        ? `https://ko-fi.com/${profileData.kofiUsername || profileData.name}`
                        : `https://buymeacoffee.com/${profileData.bmacUsername || profileData.name}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: accentHex,
                      color: accentForegroundHex,
                    }}
                    className="w-full py-3 rounded-2xl text-xs font-bold tracking-wider hover:opacity-90 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-md text-center"
                  >
                    <span>
                      {lang.data.app.profile.preview.support_on
                        .replace(
                          "{name}",
                          (profileData.displayName || "").toUpperCase(),
                        )
                        .replace(
                          "{method}",
                          paymentMethod === "kofi"
                            ? "KO-FI"
                            : "BUY ME A COFFEE",
                        )}
                    </span>
                  </a>
                )}
              </form>
            )}
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}
