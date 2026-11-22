"use client";

import {
  FacebookLogoIcon,
  TwitterLogoIcon,
  TwitchLogoIcon,
  YoutubeLogoIcon,
  RedditLogoIcon,
  DiscordLogoIcon,
} from "@phosphor-icons/react";

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
