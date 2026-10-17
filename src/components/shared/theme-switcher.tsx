"use client";

import { useSyncExternalStore } from "react";
import { CircleIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { Button } from "./ui/button";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";

const emptySubscribe = () => () => {};

export default function ThemeSwitcher() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
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
      aria-label="Toggle theme"
    >
      {isDark ? (
        <SunIcon size={20} weight="fill" />
      ) : (
        <MoonIcon size={20} weight="fill" />
      )}
    </Button>
  );
}
