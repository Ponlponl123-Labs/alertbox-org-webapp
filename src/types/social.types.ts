import type { SOCIAL_PLATFORMS } from "@/consts/social";

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

export interface SocialLinksProps {
  socials?: SocialsInput;
  className?: string;
  buttonClassName?: string;
  iconSize?: number;
  colored?: boolean;
}
