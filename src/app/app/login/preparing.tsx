"use client";
import { coreStore } from "@/hooks/store/core";
import { CircleNotchIcon, FireIcon } from "@phosphor-icons/react";
import { useStore } from "zustand";

function PreParing() {
  const lang = useStore(coreStore, (state) => state.lang);

  return (
    <div className="min-h-screen relative flex flex-col p-6 pb-24 items-center">
      <div className="m-auto flex flex-col gap-3 max-w-92">
        <div className="p-8 bg-background supports-backdrop-filter:bg-background/60 text-center supports-backdrop-filter:bg-linear-150 supports-backdrop-filter:from-amber-950/10 supports-backdrop-filter:to-amber-600/10 flex flex-col items-center justify-center z-10 supports-backdrop-filter:backdrop-blur-2xl rounded-3xl w-full">
          <FireIcon weight="fill" className="mb-6 text-amber-600" size={32} />
          <h1 className="text-lg tracking-wider font-semibold">
            {lang.data.app.preparing.title}
          </h1>
          <p className="text-xs text-foreground/60 mt-1.5">
            {lang.data.app.preparing.description}
          </p>
          <CircleNotchIcon
            weight="bold"
            className="mt-6 text-foreground/40 animate-spin"
            size={24}
          />
        </div>
      </div>
    </div>
  );
}

export default PreParing;
