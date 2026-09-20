"use client";

import { useState } from "react";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { motion } from "motion/react";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  GithubLogoIcon,
} from "@phosphor-icons/react";
import { Input } from "react-smooth-input";
import { HandCoinsIcon } from "@phosphor-icons/react/dist/ssr";

function HorizonArc() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-linear-to-r from-transparent via-rose-500/40 dark:via-rose-400/30 to-transparent" />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 sm:w-250 h-80 bg-[radial-gradient(ellipse_at_top,rgba(244,63,94,0.12),rgba(168,85,247,0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(244,63,94,0.18),rgba(168,85,247,0.08),transparent_70%)] blur-[70px]" />

      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black 15%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black 15%, transparent 85%)",
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

  const trustPoints = t?.footnote
    ? t.footnote
      .split("•")
      .map((s) => s.trim())
      .filter(Boolean)
    : ["Free forever", "No credit card", "Open source"];

  return (
    <section className="relative w-full py-28 md:py-36 bg-background text-foreground flex flex-col items-center justify-center overflow-hidden border-t border-foreground/8">
      <HorizonArc />

      <div className="z-10 relative flex flex-col items-center text-center w-full max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-foreground/10 bg-foreground/3 dark:bg-white/4 backdrop-blur-md mb-6"
        >
          <HandCoinsIcon weight="bold" />
          <span className="text-xs text-foreground/80 font-semibold tracking-wider">
            {t.badge}
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-foreground leading-[1.06] mb-4 max-w-2xl"
        >
          {t.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08, duration: 0.45, ease: "easeOut" }}
          className="text-sm sm:text-base md:text-lg text-foreground/50 max-w-lg mx-auto font-normal leading-relaxed mb-9"
        >
          {t.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.16, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md relative group"
        >
          <div className="absolute -inset-1 rounded-full bg-linear-to-r from-rose-500/25 via-purple-500/20 to-rose-500/25 opacity-0 group-focus-within:opacity-100 group-hover:opacity-60 blur-md transition-opacity duration-300 pointer-events-none" />

          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={yourNameText}
            className="relative flex-1 bg-transparent border-none focus:ring-0 text-foreground z-10"
            classNames={{
              base: "p-1 rounded-full backdrop-blur-xs apply-smooth-transition",
            }}
            customMotion={{
              char: {
                initial: { opacity: 0, filter: "blur(6px)", x: 8 },
                animate: { opacity: 1, filter: "blur(0px)", x: 0 },
                transition: {
                  duration: 0.75,
                  ease: [0.16, 1, 0.3, 1],
                }
              }
            }}
            fontStyle={{
              fontFamily: "var(--font-heading)",
              fontWeight: "600",
              fontSize: "12px",
            }}
            startContent={
              <span className="text-xs font-heading font-semibold text-foreground/50 ml-3 -mr-2.5 translate-y-0.125 hidden sm:block">
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
                className="relative h-full px-4 py-2 rounded-full bg-foreground text-background font-black text-xs flex items-center justify-center gap-1.5 hover:bg-foreground/90 active:scale-95 ml-2 shadow-md z-10 cursor-pointer"
              >
                <span>{claimText}</span>
                <ArrowRightIcon weight="bold" size={13} />
              </Link>
            }
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.24, duration: 0.4 }}
          className="flex items-center justify-center mt-5"
        >
          <Link
            href="https://github.com/ponlponl123-labs/alertbox-org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-foreground/50 hover:text-foreground bg-foreground/3 hover:bg-foreground/6 border border-foreground/8 transition-all duration-200 cursor-pointer"
          >
            <GithubLogoIcon weight="fill" size={14} />
            <span>{t.secondary || "View on GitHub"}</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.32, duration: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-9 text-xs text-foreground/45 font-medium"
        >
          {trustPoints.map((item, idx) => (
            <div key={idx} className="inline-flex items-center gap-1.5">
              <CheckCircleIcon
                weight="fill"
                size={13}
                className="text-emerald-500/80 shrink-0"
              />
              <span className="font-read text-xs tracking-wide">{item}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
