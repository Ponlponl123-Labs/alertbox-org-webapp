"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import {
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyholeIcon,
  ArrowCircleRightIcon,
  ChartBarIcon,
} from "@phosphor-icons/react";

function MaskingReceipt({ t }: { t: any }) {
  const [isProtected, setIsProtected] = useState(true);

  const receiptData = [
    {
      label: t.simulator.fields.name,
      protected: "•••••••• ••••",
      exposed: t.simulator.values.name,
    },
    {
      label: t.simulator.fields.account,
      protected: "•••• •••• 9840",
      exposed: t.simulator.values.account,
    },
    {
      label: t.simulator.fields.email,
      protected: "••••@••••.com",
      exposed: t.simulator.values.email,
    },
    {
      label: t.simulator.fields.routing,
      protected: "•••• ••••",
      exposed: t.simulator.values.routing,
    },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between bg-foreground/2 p-5 md:p-6">
      <div className="border border-foreground/10 bg-background/50 p-5 rounded-2xl relative flex-1 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-foreground/5 pb-3.5">
            <div className="flex items-center gap-2">
              <KeyholeIcon size={14} className="text-rose-500" />
              <span className="text-[10px] font-mono text-foreground/40 tracking-widest uppercase">
                {t.simulator.routing}
              </span>
            </div>
            <span
              className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold transition-colors ${
                isProtected
                  ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
              }`}
            >
              {isProtected ? t.simulator.encrypted : t.simulator.exposed}
            </span>
          </div>

          <div className="flex flex-col gap-3.5 text-left">
            {receiptData.map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center text-xs gap-4"
              >
                <span className="text-foreground/45 font-medium">
                  {item.label}
                </span>
                <div className="relative overflow-hidden min-w-[120px] text-right">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isProtected ? "protected" : "exposed"}
                      initial={{ opacity: 0, y: 3, filter: "blur(2px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -3, filter: "blur(2px)" }}
                      transition={{ duration: 0.15 }}
                      className={`font-mono text-xs block truncate ${
                        isProtected
                          ? "text-foreground/30 select-none blur-[2px]"
                          : "text-foreground font-semibold"
                      }`}
                    >
                      {isProtected ? item.protected : item.exposed}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-foreground/5">
          <div className="flex items-center gap-2 text-left">
            {isProtected ? (
              <EyeSlashIcon size={15} weight="bold" className="text-rose-500" />
            ) : (
              <EyeIcon size={15} weight="bold" className="text-amber-500" />
            )}
            <span className="text-[10px] font-bold text-foreground/50 tracking-wider">
              {isProtected
                ? t.simulator.shield_active
                : t.simulator.shield_disabled}
            </span>
          </div>
          <button
            onClick={() => setIsProtected(!isProtected)}
            className={`h-8 px-4 rounded-full text-[10px] font-bold transition-all border cursor-pointer ${
              isProtected
                ? "bg-foreground text-background border-foreground hover:bg-foreground/90"
                : "bg-transparent text-foreground border-foreground/20 hover:bg-foreground/5"
            }`}
          >
            {isProtected
              ? t.simulator.disable_shield
              : t.simulator.enable_shield}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PrivacyGuard() {
  const lang = useStore(coreStore, (state) => state.lang);
  const t = lang.data.pages.index.sections.privacy_guard;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (!t) return null;

  return (
    <section
      ref={ref}
      className="w-full py-24 md:py-32 relative overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none select-none opacity-40 dark:opacity-100"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-rose-500/1 dark:bg-rose-500/2.5 blur-[130px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-left mb-16"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-500 mb-2 block font-mono">
            {t.subtitle}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-4">
            {t.title}
          </h2>
          <p className="text-sm md:text-base text-foreground/50 max-w-2xl font-medium">
            {t.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 rounded-3xl border border-foreground/10 bg-foreground/2 backdrop-blur-xl flex flex-col justify-between overflow-hidden relative min-h-[360px]">
            <MaskingReceipt t={t} />
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="p-6 rounded-3xl border border-foreground/10 bg-foreground/2 hover:border-foreground/20 transition-all duration-300 backdrop-blur-xl flex-1 flex gap-4 text-left"
            >
              <div className="size-10 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0 text-rose-500 border border-rose-500/20">
                <ShieldCheckIcon size={20} weight="fill" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">
                  {t.items.account.title}
                </h3>
                <p className="text-xs text-foreground/50 leading-relaxed font-medium">
                  {t.items.account.desc}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="p-6 rounded-3xl border border-foreground/10 bg-foreground/2 hover:border-foreground/20 transition-all duration-300 backdrop-blur-xl flex-1 flex gap-4 text-left"
            >
              <div className="size-10 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0 text-purple-500 border border-purple-500/20">
                <ArrowCircleRightIcon size={20} weight="fill" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">
                  {t.items.webhook.title}
                </h3>
                <p className="text-xs text-foreground/50 leading-relaxed font-medium">
                  {t.items.webhook.desc}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="p-6 rounded-3xl border border-foreground/10 bg-foreground/2 hover:border-foreground/20 transition-all duration-300 backdrop-blur-xl flex-1 flex gap-4 text-left"
            >
              <div className="size-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0 text-cyan-500 border border-cyan-500/20">
                <ChartBarIcon size={20} weight="fill" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">
                  {t.items.tracking.title}
                </h3>
                <p className="text-xs text-foreground/50 leading-relaxed font-medium">
                  {t.items.tracking.desc}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
