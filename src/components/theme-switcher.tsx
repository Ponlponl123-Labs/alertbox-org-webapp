"use client";

import { useEffect, useState, startTransition } from "react";
import { CircleIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { Button } from "./ui/button";

export default function ThemeSwitcher() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    // Use transition to avoid synchronous setState warning and signal non-urgent update
    startTransition(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // Render a placeholder skeleton during hydration
  if (isDark === null) {
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
