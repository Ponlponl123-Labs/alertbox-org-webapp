import { SOCIAL_PLATFORMS } from "@/consts/social";
import type { SocialItem, SocialsInput } from "@/types/social.types";
import { getSocialUrl } from "@/lib/utils";

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
