"use client";

import { useSyncExternalStore } from "react";
import { CircleIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";

const emptySubscribe = () => () => {};

export default function ThemeSwitcher() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const lang = useStore(coreStore, (state) => state.lang);
  const isDark = useStore(coreStore, (state) => state.isDark);
  const toggleTheme = coreStore.getState().toggleTheme;

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-xl"
        aria-hidden="true"
      >
        <CircleIcon size={20} weight="fill" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-xl"
      onClick={toggleTheme}
      aria-label={lang.data.common.aria.toggle_theme}
    >
      {isDark ? (
        <SunIcon size={20} weight="fill" />
      ) : (
        <MoonIcon size={20} weight="fill" />
      )}
    </Button>
  );
}
