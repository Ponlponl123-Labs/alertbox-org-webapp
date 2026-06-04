"use client";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";

export default () => {
  const lang = useStore(coreStore, (state) => state.lang);

  return (
    <main>
      <div className="text-4xl font-bold text-foreground/25 dark:text-foreground/25">
        test
      </div>
    </main>
  );
};
