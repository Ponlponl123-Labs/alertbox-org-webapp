"use client";

import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { cn } from "@/lib/utils";
import { CircleNotchIcon } from "@phosphor-icons/react";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  const lang = useStore(coreStore, (state) => state.lang);

  return (
    <CircleNotchIcon
      weight="bold"
      role="status"
      aria-label={lang.data.common.aria.loading}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
