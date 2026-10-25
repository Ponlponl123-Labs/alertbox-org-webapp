"use client";
import React from "react";
import Link from "next/link";
import {
  FacebookLogoIcon,
  TwitterLogoIcon,
  TwitchLogoIcon,
  YoutubeLogoIcon,
  RedditLogoIcon,
  DiscordLogoIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn, getSocialUrl } from "@/lib/utils";

export const SOCIAL_PLATFORMS = [
  {
    key: "twitch",
    label: "Twitch",
    icon: TwitchLogoIcon,
    hoverClass: "hover:text-[#9146FF] hover:bg-[#9146FF]/10",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: YoutubeLogoIcon,
    hoverClass: "hover:text-[#FF0000] hover:bg-[#FF0000]/10",
  },
  {
    key: "twitter",
    label: "Twitter / X",
    icon: TwitterLogoIcon,
    hoverClass: "hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 dark:hover:text-white dark:hover:bg-white/10",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: FacebookLogoIcon,
    hoverClass: "hover:text-[#1877F2] hover:bg-[#1877F2]/10",
  },
  {
    key: "reddit",
    label: "Reddit",
    icon: RedditLogoIcon,
    hoverClass: "hover:text-[#FF4500] hover:bg-[#FF4500]/10",
  },
  {
    key: "discord",
    label: "Discord",
    icon: DiscordLogoIcon,
    hoverClass: "hover:text-[#5865F2] hover:bg-[#5865F2]/10",
  },
] as const;

export type SocialPlatformKey = (typeof SOCIAL_PLATFORMS)[number]["key"];

export interface SocialItem {
  key: SocialPlatformKey;
  label: string;
  value: string;
  url: string;
  icon: (typeof SOCIAL_PLATFORMS)[number]["icon"];
  hoverClass: string;
}

export type SocialsInput =
  | { [key in SocialPlatformKey]?: string | null | undefined }
  | { [key: string]: unknown }
  | null
  | undefined;

export function getActiveSocials(socials?: SocialsInput): SocialItem[] {
  if (!socials) return [];

  const items: SocialItem[] = [];

  for (const platform of SOCIAL_PLATFORMS) {
    const rawVal = (socials as Record<string, unknown>)[platform.key];
    if (!rawVal || typeof rawVal !== "string" || !rawVal.trim()) continue;
    const url = getSocialUrl(platform.key, rawVal);
    if (!url) continue;

    items.push({
      key: platform.key,
      label: platform.label,
      value: rawVal,
      url,
      icon: platform.icon,
      hoverClass: platform.hoverClass,
    });
  }

  return items;
}

export interface SocialLinksProps {
  socials?: SocialsInput;
  className?: string;
  buttonClassName?: string;
  iconSize?: number;
  colored?: boolean;
}

export function SocialLinks({
  socials,
  className,
  buttonClassName,
  iconSize = 20,
  colored = false,
}: SocialLinksProps) {
  const items = getActiveSocials(socials);
  if (!items.length) return null;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${item.label}: ${item.value}`}
            aria-label={`${item.label}: ${item.value}`}
          >
            <Button
              variant="ghost"
              size="icon-lg"
              className={cn(
                "rounded-full transition-colors",
                colored && item.hoverClass,
                buttonClassName,
              )}
            >
              <Icon size={iconSize} weight="fill" />
            </Button>
          </Link>
        );
      })}
    </div>
  );
}

export default SocialLinks;
