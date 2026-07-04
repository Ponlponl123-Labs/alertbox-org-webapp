"use client";
import React, { useState } from "react";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { useUserContext } from "@/contexts/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getActiveBadges } from "@/lib/badges";
import { cn, getFallbackInitial, getSocialUrl } from "@/lib/utils";
import {
  TwitchTv,
  Youtube,
  Twitter,
  Facebook,
  Reddit,
  Discord,
} from "@/components/icons";
import Image from "next/image";
import {
  SealCheckIcon,
  DeviceMobileIcon,
  MonitorIcon,
} from "@phosphor-icons/react";
import { numberToHexColor, getAccentForeground } from "@/lib/color";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface LiveProfileData {
  displayName?: string;
  bio?: string | null;
  twitch?: string | null;
  youtube?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  reddit?: string | null;
  discord?: string | null;
  accentColor?: number;
}

export default function ProfilePreview({
  liveData,
  publicProfile,
  defaultViewMode = "mobile",
}: {
  liveData?: LiveProfileData;
  publicProfile?: any;
  defaultViewMode?: "mobile" | "desktop" | "responsive";
}) {
  const { userInfo } = useUserContext();
  const lang = useStore(coreStore, (state) => state.lang);
  const [viewMode, setViewMode] = useState<"mobile" | "desktop" | "responsive">(
    defaultViewMode,
  );

  if (!publicProfile && (!userInfo || !userInfo.profile)) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-foreground/40 text-sm">
        Loading preview...
      </div>
    );
  }

  const profile = {
    ...(publicProfile || userInfo?.profile),
    ...liveData,
  };
  const isDashboardPreview = !publicProfile;
  const allBadges = getActiveBadges(profile.badges);
  const isVerified = allBadges.some((b) => b.name === "verified");
  const badges = allBadges.filter((b) => b.name !== "verified");
  const accentHex = profile.accentColor
    ? numberToHexColor(profile.accentColor)
    : "#6366f1";
  const accentForegroundHex = getAccentForeground(accentHex);

  // Define social links and their corresponding icons/colors
  const socialList = [
    {
      value: profile.twitch,
      icon: TwitchTv,
      label: "Twitch",
      color: "hover:text-[#9146FF]",
    },
    {
      value: profile.youtube,
      icon: Youtube,
      label: "YouTube",
      color: "hover:text-[#FF0000]",
    },
    {
      value: profile.twitter,
      icon: Twitter,
      label: "Twitter",
      color: "hover:text-[#1DA1F2] dark:hover:text-white",
    },
    {
      value: profile.facebook,
      icon: Facebook,
      label: "Facebook",
      color: "hover:text-[#1877F2]",
    },
    {
      value: profile.reddit,
      icon: Reddit,
      label: "Reddit",
      color: "hover:text-[#FF4500]",
    },
    {
      value: profile.discord,
      icon: Discord,
      label: "Discord",
      color: "hover:text-[#5865F2]",
    },
  ];

  const renderMobileCard = () => (
    <div
      className={cn(
        "bg-background border border-foreground/10 shadow-2xl overflow-hidden flex flex-col relative",
        isDashboardPreview
          ? "w-full max-w-[280px] rounded-[2rem] aspect-9/16 max-h-[500px]"
          : "w-full max-w-[360px] rounded-3xl min-h-[520px]",
      )}
    >
      {isDashboardPreview && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 flex items-center justify-between px-3">
          <div className="size-1.5 rounded-full bg-zinc-800" />
          <div className="w-8 h-1 bg-zinc-800 rounded-full" />
        </div>
      )}

      {profile.avatar && (
        <Image
          src={profile.avatar}
          alt="Avatar Backdrop"
          className="size-full blur-md absolute top-0 saturate-200 left-0 opacity-10 pointer-events-none object-cover"
          width={500}
          height={160}
        />
      )}
      {profile.banner && (
        <Image
          src={profile.banner}
          alt="Banner Backdrop"
          className="w-full h-20 blur-3xl absolute top-10 saturate-200 left-0 object-cover"
          width={500}
          height={160}
        />
      )}
      <div className="relative w-full mask-b-from-60% mask-t-from-80% bg-linear-to-r from-violet-600/80 to-indigo-600/80 shrink-0 overflow-hidden">
        {profile.banner ? (
          <Image
            src={profile.banner}
            alt="Banner"
            className="size-full object-cover h-32"
            width={500}
            height={160}
          />
        ) : (
          <div
            className="size-full opacity-60 min-h-20"
            style={{ backgroundColor: accentHex }}
          />
        )}
      </div>

      <div className="relative px-3 -mt-8 z-10 flex w-full">
        <Avatar className="size-16 shadow-md">
          {profile.avatar && <AvatarImage src={profile.avatar} />}
          <AvatarFallback className="text-xl">
            {getFallbackInitial(profile.name || "?")}
          </AvatarFallback>
        </Avatar>
        <div className="mt-8 flex flex-wrap p-2">
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {badges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <Badge
                    key={badge.name}
                    variant="default"
                    className={cn(
                      "text-[8px] px-1 h-4 gap-0.5 rounded border-0 font-semibold",
                      badge.className,
                    )}
                  >
                    <Icon className="size-2 shrink-0" weight="fill" />
                    {badge.label}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 px-4 pb-4 flex flex-col flex-1 min-h-0 overflow-y-auto scrollbar-none">
        <div className="flex flex-col">
          <h2 className="font-bold text-base text-foreground flex items-center gap-1 leading-tight">
            {profile.displayName || "Display Name"}
            {isVerified && (
              <Tooltip>
                <TooltipTrigger>
                  <SealCheckIcon
                    className="size-4 text-blue-500 shrink-0"
                    style={{ color: accentHex }}
                    weight="fill"
                  />
                </TooltipTrigger>
                <TooltipContent className="rounded-lg">
                  <p>{lang.data.app.profile.preview.official_account}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </h2>
          <span className="text-[10px] text-foreground/40 leading-none">
            @{profile.name || "username"}
          </span>
        </div>

        <p className="text-[10px] text-foreground/70 mt-3 line-clamp-3 leading-normal whitespace-break-spaces wrap-break-word w-full">
          {profile.bio || lang.data.app.profile.preview.no_bio}
        </p>

        <div className="mt-auto pt-4 flex flex-col gap-2 shrink-0">
          <div className="flex flex-wrap gap-1.5 justify-center">
            {socialList.map((soc, i) => {
              if (!soc.value) return null;
              const Icon = soc.icon;
              return (
                <a
                  key={i}
                  href={getSocialUrl(soc.label, soc.value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "p-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground/50 transition-colors duration-200",
                    soc.color,
                  )}
                  title={`${soc.label}: ${soc.value}`}
                >
                  <Icon className="size-3.5" />
                </a>
              );
            })}
          </div>

          <button
            disabled
            style={{ backgroundColor: accentHex, color: accentForegroundHex }}
            className="w-full py-1.5 rounded-xl text-[10px] font-bold tracking-wider hover:opacity-90 active:scale-[0.98] transition-all cursor-not-allowed"
          >
            {lang.data.app.profile.preview.tip_button}
          </button>
        </div>
      </div>
    </div>
  );

  const renderDesktopCard = () => (
    <div className="w-full max-w-[560px] bg-background border border-foreground/10 rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col relative min-h-[350px]">
      {profile.avatar && (
        <Image
          src={profile.avatar}
          alt="Avatar Backdrop"
          className="size-full blur-md absolute top-0 saturate-200 left-0 opacity-10 pointer-events-none object-cover"
          width={500}
          height={160}
        />
      )}
      {profile.banner && (
        <Image
          src={profile.banner}
          alt="Banner Backdrop"
          className="w-full h-20 blur-3xl absolute top-10 saturate-200 left-0 object-cover"
          width={500}
          height={160}
        />
      )}
      <div className="relative w-full mask-b-from-60% mask-t-from-80% bg-linear-to-r from-violet-600/80 to-indigo-600/80 shrink-0 overflow-hidden">
        {profile.banner ? (
          <Image
            src={profile.banner}
            alt="Banner"
            className="size-full object-cover h-28"
            width={500}
            height={160}
          />
        ) : (
          <div
            className="size-full opacity-60 min-h-16"
            style={{ backgroundColor: accentHex }}
          />
        )}
      </div>

      <div className="relative px-5 -mt-8 z-10 flex w-full justify-between items-end">
        <Avatar className="size-20 shadow-md border-4 border-background">
          {profile.avatar && <AvatarImage src={profile.avatar} />}
          <AvatarFallback className="text-2xl">
            {getFallbackInitial(profile.name || "?")}
          </AvatarFallback>
        </Avatar>
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <Badge
                  key={badge.name}
                  variant="default"
                  className={cn(
                    "text-[8px] px-1.5 h-4.5 gap-0.5 rounded border-0 font-semibold",
                    badge.className,
                  )}
                >
                  <Icon className="size-2.5 shrink-0" weight="fill" />
                  {badge.label}
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-5 flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-y-auto scrollbar-none">
        <div className="col-span-7 flex flex-col justify-between h-full min-h-0">
          <div className="flex flex-col">
            <h2 className="font-bold text-lg text-foreground flex items-center gap-1.5 leading-tight">
              {profile.displayName || "Display Name"}
              {isVerified && (
                <Tooltip>
                  <TooltipTrigger>
                    <SealCheckIcon
                      className="size-4.5 text-blue-500 shrink-0"
                      style={{ color: accentHex }}
                      weight="fill"
                    />
                  </TooltipTrigger>
                  <TooltipContent className="rounded-lg">
                    <p>{lang.data.app.profile.preview.official_account}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </h2>
            <span className="text-[10px] text-foreground/40 leading-none mt-0.5">
              @{profile.name || "username"}
            </span>
            <p className="text-[10px] text-foreground/70 mt-3 leading-normal whitespace-break-spaces wrap-break-word">
              {profile.bio || lang.data.app.profile.preview.no_bio}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {socialList.map((soc, i) => {
              if (!soc.value) return null;
              const Icon = soc.icon;
              return (
                <a
                  key={i}
                  href={getSocialUrl(soc.label, soc.value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "p-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground/50 transition-colors duration-200",
                    soc.color,
                  )}
                  title={`${soc.label}: ${soc.value}`}
                >
                  <Icon className="size-3.5" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="col-span-5 flex flex-col justify-center items-center bg-foreground/3 border border-foreground/5 p-4 rounded-2xl h-fit my-auto">
          <div className="text-center mb-3">
            <span className="text-[9px] uppercase font-bold tracking-wider opacity-45">
              {lang.data.app.profile.preview.support_title}
            </span>
            <p className="text-[10px] text-foreground/60 mt-1 leading-snug">
              {lang.data.app.profile.preview.support_desc}
            </p>
          </div>
          <button
            disabled
            style={{ backgroundColor: accentHex, color: accentForegroundHex }}
            className="w-full py-2 rounded-xl text-[10px] font-bold tracking-wider hover:opacity-90 active:scale-[0.98] transition-all cursor-not-allowed"
          >
            {lang.data.app.profile.preview.tip_button}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 size-full bg-linear-to-br from-zinc-50/50 to-zinc-100/50 dark:from-zinc-950/20 dark:to-zinc-900/20 relative",
        isDashboardPreview ? "min-h-[450px]" : "min-h-screen",
      )}
    >
      {/* View Toggle */}
      {viewMode !== "responsive" && (
        <div className="absolute top-4 right-4 z-20 flex bg-foreground/5 p-1 rounded-xl border border-foreground/10 gap-0.5">
          <button
            onClick={() => setViewMode("mobile")}
            className={cn(
              "px-2.5 py-1 rounded-lg flex items-center justify-center text-[10px] font-semibold gap-1 transition-all duration-200 cursor-pointer",
              viewMode === "mobile"
                ? "bg-background text-foreground shadow-sm"
                : "text-foreground/45 hover:text-foreground/80 hover:bg-foreground/5",
            )}
          >
            <DeviceMobileIcon className="size-3.5" />
            Mobile
          </button>
          <button
            onClick={() => setViewMode("desktop")}
            className={cn(
              "px-2.5 py-1 rounded-lg flex items-center justify-center text-[10px] font-semibold gap-1 transition-all duration-200 cursor-pointer",
              viewMode === "desktop"
                ? "bg-background text-foreground shadow-sm"
                : "text-foreground/45 hover:text-foreground/80 hover:bg-foreground/5",
            )}
          >
            <MonitorIcon className="size-3.5" />
            Desktop
          </button>
        </div>
      )}

      {viewMode === "responsive" ? (
        <>
          <div className="md:hidden w-full flex justify-center">
            {renderMobileCard()}
          </div>
          <div className="hidden md:flex w-full justify-center">
            {renderDesktopCard()}
          </div>
        </>
      ) : viewMode === "mobile" ? (
        renderMobileCard()
      ) : (
        renderDesktopCard()
      )}
    </div>
  );
}
