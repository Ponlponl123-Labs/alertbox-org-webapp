"use client";
import React from "react";
import { coreStore } from "@/hooks/store/core";
import { useStore } from "zustand/react";
import { ShieldCheckIcon } from "@phosphor-icons/react";
import { Button } from "./ui/button";
import { AnimatePresence, motion } from "motion/react";

function StreamerModeProtection() {
  const lang = useStore(coreStore, (state) => state.lang);
  const [isUnderstood, setIsUnderstood] = React.useState(false);
  return (
    <AnimatePresence>
      {!isUnderstood && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          id="streamer-mode-protection"
          className="absolute h-full w-full overflow-hidden min-w-0 flex-1 bg-white/95 dark:bg-black/95 supports-backdrop-filter:backdrop-blur-sm supports-backdrop-filter:bg-white/60 supports-backdrop-filter:dark:bg-black/60 flex items-center justify-center p-4 z-40"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            id="streamer-mode-protection-backdrop"
            className="absolute size-1/2 bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 rounded-full bg-linear-to-t from-indigo-800/60 to-transparent hidden supports-[filter:blur(1px)]:block blur-[96px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            id="streamer-mode-protection-content"
            className="bg-card px-4 py-6 rounded-3xl text-center"
          >
            <div className="bg-indigo/10 flex items-center justify-center size-12 mx-auto mb-4 rounded-xl text-indigo-500 bg-indigo-500/10">
              <ShieldCheckIcon weight="fill" className="m-auto" size={24} />
            </div>
            <h2 className="text-xl font-bold mb-2">
              {lang.data.app.streamer_mode_protection.title}
            </h2>
            <p className="mb-4 text-xs text-foreground/40 max-w-sm">
              {lang.data.app.streamer_mode_protection.description}
            </p>
            <Button
              onClick={() => setIsUnderstood(true)}
              variant="default"
              className="rounded-xl p-4"
            >
              {lang.data.app.streamer_mode_protection.button}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default StreamerModeProtection;
