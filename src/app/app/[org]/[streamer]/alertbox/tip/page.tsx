"use client";
import { coreStore } from "@/hooks/store/core";
import { useStore } from "zustand";
import { motion } from "motion/react";
import Soon from "../soon";

export default function Page() {
  const lang = useStore(coreStore, (state) => state.lang);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mx-auto max-w-384 px-12 pt-12 flex flex-col gap-6 z-10 min-h-0 flex-1"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-full">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium tracking-tight text-foreground my-3">
            {lang.data.app.alertbox.donation.title}
          </h1>
          <p className="text-sm font-sans text-muted-foreground mt-3">
            {lang.data.app.alertbox.donation.description}
          </p>
        </div>
      </div>
      <Soon />
    </motion.div>
  );
}
