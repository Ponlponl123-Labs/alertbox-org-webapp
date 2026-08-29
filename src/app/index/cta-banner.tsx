"use client";

import React, { useState } from "react";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { motion } from "motion/react";
import { Input } from "react-smooth-input";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react";

function HorizonGlow() {
  return (
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[250px] pointer-events-none select-none z-1 opacity-60 dark:opacity-100"
      aria-hidden="true"
    >
      <motion.div
        animate={{
          opacity: [0.15, 0.25, 0.15],
          scale: [1, 1.06, 1],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full rounded-full blur-[100px]"
        style={{
          background:
            "radial-gradient(ellipse at bottom, rgba(244, 63, 94, 0.18) 0%, rgba(168, 85, 247, 0.08) 45%, transparent 70%)",
        }}
      />
    </div>
  );
}

function SubtleGrid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                            linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

export default function CTABanner() {
  const t = useStore(
    coreStore,
    (state) => state.lang.data.pages.index.sections.cta_banner,
  );
  const claimText = useStore(
    coreStore,
    (state) => state.lang.data.pages.index.actions.claim,
  );
  const yourNameText = useStore(
    coreStore,
    (state) => state.lang.data.pages.index.actions.yourname,
  );
  const [username, setUsername] = useState("");

  return (
    <section className="w-full py-32 md:py-44 bg-background text-foreground relative flex flex-col items-center justify-center overflow-hidden border-t border-foreground/10">
      <SubtleGrid />
      <HorizonGlow />

      <div
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-rose-500/1 dark:bg-rose-500/1.5 blur-[140px] rounded-full" />
      </div>

      <div className="z-10 relative flex flex-col items-center text-center w-full max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-foreground/10 bg-foreground/3 mb-6"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-foreground"></span>
          </span>
          <span className="text-xs font-mono tracking-widest text-foreground/50 uppercase">
            {t.badge}
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-6xl lg:text-7xl tracking-tight text-foreground mb-5 leading-none"
        >
          {t.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="text-sm md:text-base text-foreground/40 font-medium mb-10 max-w-lg mx-auto"
        >
          {t.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md relative group"
        >
          <div className="absolute -inset-px rounded-full bg-linear-to-r from-rose-500/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 group-hover:opacity-60 blur-md transition-all duration-500 pointer-events-none" />

          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={yourNameText}
            className="relative flex-1 bg-transparent border-none focus:ring-0 text-foreground pl-5 z-10"
            classNames={{
              base: "p-1 rounded-full backdrop-blur-xs border-2",
            }}
            fontStyle={{
              fontFamily: "var(--font-sans)",
              fontWeight: "600",
              fontSize: "14px",
            }}
            startContent={
              <span className="text-sm font-semibold text-foreground/50 ml-3 -mr-2.5 hidden sm:block">
                tip-to.me/@
              </span>
            }
            endContent={
              <Link
                href={
                  username.trim()
                    ? `/app/profile?username=${username}`
                    : "/app/profile"
                }
                className="relative h-full px-5 py-2.5 rounded-full bg-foreground text-background font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-foreground/90 active:scale-95 shadow-md z-10 cursor-pointer"
              >
                <span>{claimText}</span>
                <ArrowRightIcon weight="bold" size={13} />
              </Link>
            }
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-[9px] font-mono tracking-widest text-foreground/25 uppercase mt-10"
        >
          {t.footnote}
        </motion.p>
      </div>
    </section>
  );
}
