import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";

export interface BadgeInfo {
  name: string;
  label: string;
  icon: ComponentType<IconProps>;
  className: string;
}
