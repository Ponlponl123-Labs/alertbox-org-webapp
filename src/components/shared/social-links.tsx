"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getActiveSocials } from "@/lib/social";
import type { SocialLinksProps } from "@/types/social.types";

export { SOCIAL_PLATFORMS } from "@/consts/social";
export { getActiveSocials } from "@/lib/social";
export type {
  SocialPlatformKey,
  SocialItem,
  SocialsInput,
  SocialLinksProps,
} from "@/types/social.types";

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
