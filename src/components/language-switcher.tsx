"use client";
import { useEffect } from "react";
import { coreStore } from "@/hooks/store/core";
import { useStore } from "zustand";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { langs } from "@/lib/i18n";

function LanguageSwitcher({ showLabel = false }: { showLabel?: boolean }) {
  const lang = useStore(coreStore, (state) => state.lang);
  const setLang = useStore(coreStore, (state) => state.setLang);

  useEffect(() => {
    coreStore.getState().hydrateLang();
  }, []);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            className={cn(
              "rounded-lg text-base border-0",
              !showLabel && "p-1 size-7 not-hover:bg-transparent!",
            )}
            variant="outline"
          />
        }
      >
        <span className="font-country-flag-emoji">{lang.data.flag}</span>
        {showLabel && (
          <span className="text-xs text-foreground/60">{lang.data.label}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className={"w-32 rounded-2xl p-2.5"}>
        <PopoverHeader>
          <PopoverTitle className={"text-foreground/40 text-xs my-1"}>
            Language
          </PopoverTitle>
          {langs.map((l, i) => (
            <Button
              className={cn(
                "rounded-lg text-base border-0 text-start justify-start gap-2.5",
                l.key === lang.key && "bg-primary! text-primary-foreground!",
              )}
              onClick={() => setLang(l.key)}
              variant="outline"
              key={i}
            >
              <span className="font-country-flag-emoji">{l.flag}</span>
              <span
                className={cn(
                  "text-xs text-foreground/60",
                  l.key === lang.key && "text-primary-foreground",
                )}
              >
                {l.label}
              </span>
            </Button>
          ))}
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}

export default LanguageSwitcher;
