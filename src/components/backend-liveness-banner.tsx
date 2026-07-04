"use client";

import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { WarningIcon } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";

/**
 * BackendLivenessBanner is a client-side component that displays a gorgeous,
 * premium warning banner at the top of the screen if the backend API is offline.
 *
 * @returns {React.ReactElement|null} The animated banner or null.
 */
export default function BackendLivenessBanner() {
  const isBackendAlive = useStore(coreStore, (state) => state.isBackendAlive);
  const lang = useStore(coreStore, (state) => state.lang);

  return (
    <AnimatePresence>
      {isBackendAlive === false && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 w-full bg-rose-950 supports-backdrop-filter:bg-linear-to-r supports-backdrop-filter:from-rose-950/40 supports-backdrop-filter:via-amber-950/40 supports-backdrop-filter:to-rose-950/40 border-b border-rose-500/20 supports-backdrop-filter:backdrop-blur-xl z-999 py-2.5 px-4 flex items-center justify-center gap-3 shadow-lg select-none"
        >
          {/* Blinking status dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <WarningIcon
            className="text-rose-400 size-4 animate-pulse"
            weight="fill"
          />
          <span className="text-xs font-semibold tracking-wider text-rose-200/90 font-sans">
            {lang.data.common.backend_offline}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
