import {
  CheckCircleIcon,
  ShieldCheckIcon,
  SparkleIcon,
  HandshakeIcon,
} from "@phosphor-icons/react";
import { ProfileBadges } from "@/consts/profile";
import lang from "@/lib/i18n";
import type { LanguageData } from "@/types";
import { type BadgeInfo } from "@/types/badges.types";

/**
 * Returns the list of active badge details based on the badges bitmask.
 *
 * @param flags - The badges bitmask integer.
 * @param langData - Localized language dictionary.
 * @returns Array of active badge configurations.
 */
export function getActiveBadges(
  flags: number,
  langData: LanguageData = lang("en-US").data,
): BadgeInfo[] {
  const active: BadgeInfo[] = [];
  if (flags & ProfileBadges.VERIFIED) {
    active.push({
      name: "verified",
      label: langData.badges.verified,
      icon: CheckCircleIcon,
      className:
        "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/15",
    });
  }
  if (flags & ProfileBadges.STAFF) {
    active.push({
      name: "staff",
      label: langData.badges.staff,
      icon: ShieldCheckIcon,
      className:
        "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/15",
    });
  }
  if (flags & ProfileBadges.EARLY_USER) {
    active.push({
      name: "early_user",
      label: langData.badges.early_user,
      icon: SparkleIcon,
      className:
        "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/15",
    });
  }
  if (flags & ProfileBadges.PARTNER) {
    active.push({
      name: "partner",
      label: langData.badges.partner,
      icon: HandshakeIcon,
      className:
        "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/15",
    });
  }
  return active;
}
