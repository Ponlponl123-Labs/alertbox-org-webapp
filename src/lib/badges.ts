import {
  CheckCircleIcon,
  ShieldCheckIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import React from "react";

/**
 * Bit flags representing profile badges.
 */
export const ProfileBadges = {
  VERIFIED: 1 << 0, // 1
  STAFF: 1 << 1, // 2
  EARLY_USER: 1 << 2, // 4
} as const;

/**
 * Configuration structure for profile badges.
 */
export interface BadgeInfo {
  name: string;
  label: string;
  icon: React.ComponentType<any>;
  className: string;
}

/**
 * Returns the list of active badge details based on the badges bitmask.
 *
 * @param flags - The badges bitmask integer.
 * @returns Array of active badge configurations.
 */
export function getActiveBadges(flags: number): BadgeInfo[] {
  const active: BadgeInfo[] = [];
  if (flags & ProfileBadges.VERIFIED) {
    active.push({
      name: "verified",
      label: "Verified",
      icon: CheckCircleIcon,
      className:
        "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/15",
    });
  }
  if (flags & ProfileBadges.STAFF) {
    active.push({
      name: "staff",
      label: "Staff",
      icon: ShieldCheckIcon,
      className:
        "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/15",
    });
  }
  if (flags & ProfileBadges.EARLY_USER) {
    active.push({
      name: "early_user",
      label: "Early User",
      icon: SparkleIcon,
      className:
        "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/15",
    });
  }
  return active;
}
