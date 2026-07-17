"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRightIcon,
  BellIcon,
  StarIcon,
  TrophyIcon,
  ShieldIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { Input } from "react-smooth-input";
import Prism from "@/components/Prism";
import clsx from "clsx";

function GridBackground() {
  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-30"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, var(--color-border) 1px, transparent 1px),
                               linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute inset-0 bg-radial-to-c from-transparent via-background/50 to-background" />
    </div>
  );
}

function LiveAlertStack({ hero }: { hero: any }) {
  const [activeAlert, setActiveAlert] = useState<"donation" | "sub" | "cheer">(
    "donation",
  );
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAlert((prev) => {
        if (prev === "donation") return "sub";
        if (prev === "sub") return "cheer";
        return "donation";
      });
      setTick((t) => t + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const alerts = {
    donation: {
      title: hero.simulator.donation.title,
      msg: hero.simulator.donation.message,
      icon: <BellIcon weight="fill" size={16} />,
      gradient: "from-rose-500 to-orange-500",
      glow: "shadow-rose-500/10",
      tag: hero.simulator.donation.tag,
    },
    sub: {
      title: hero.simulator.sub.title,
      msg: hero.simulator.sub.message,
      icon: <StarIcon weight="fill" size={16} />,
      gradient: "from-purple-500 to-indigo-500",
      glow: "shadow-purple-500/10",
      tag: hero.simulator.sub.tag,
    },
    cheer: {
      title: hero.simulator.cheer.title,
      msg: hero.simulator.cheer.message,
      icon: <TrophyIcon weight="fill" size={16} />,
      gradient: "from-cyan-500 to-emerald-500",
      glow: "shadow-cyan-500/10",
      tag: hero.simulator.cheer.tag,
    },
  };

  const current = alerts[activeAlert];

  return (
    <div className="relative w-full max-w-md mx-auto aspect-16/10 min-h-[260px] flex items-center justify-center z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/5 blur-[60px] rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/5 blur-[60px] rounded-full" />

      <motion.div
        animate={{ y: [0, -3, 0], rotate: [-2, -2.5, -2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[85%] h-36 bg-card/40 border border-border rounded-2xl p-4 shadow-lg -translate-y-10 -translate-x-6 -rotate-2 select-none text-left"
      >
        <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
          <span className="text-[8px] font-bold text-muted-foreground uppercase font-mono tracking-wider">
            Live Event Stream
          </span>
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="space-y-2 opacity-60 text-[9px]">
          <div className="flex justify-between font-semibold">
            <span className="text-foreground/80">Anonymous Donor</span>
            <span className="text-rose-500 font-bold font-mono">+$50.00</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className="text-foreground/80">Starlight_99</span>
            <span className="text-purple-500 font-bold font-mono">
              Subscribed
            </span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className="text-foreground/80">StreamViewer</span>
            <span className="text-cyan-500 font-bold font-mono">+500 Bits</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 3, 0], rotate: [3, 2.5, 3] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute w-[80%] h-28 bg-card/30 border border-border rounded-2xl p-4 shadow-lg translate-y-12 translate-x-8 rotate-3 select-none text-left"
      >
        <span className="text-[8px] font-bold text-muted-foreground uppercase font-mono tracking-wider block mb-2.5">
          Overlay Settings
        </span>
        <div className="space-y-2 text-[9px] text-foreground/50">
          <div className="flex justify-between">
            <span>Alert Volume</span>
            <span className="font-mono">80%</span>
          </div>
          <div className="h-1 bg-foreground/10 rounded-full overflow-hidden">
            <div className="w-[80%] h-full bg-rose-500" />
          </div>
          <div className="flex justify-between">
            <span>Overlay Scaling</span>
            <span className="font-mono">1.0x</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative z-10 w-[90%] bg-card border border-border rounded-3xl p-5 shadow-2xl backdrop-blur-md"
      >
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[8px] font-bold font-mono">
          <span className="size-1 rounded-full bg-emerald-500 animate-ping" />
          <span>{hero.simulator.live}</span>
        </div>

        <div className="flex items-center gap-4 text-left mt-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeAlert}-${tick}`}
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className={`size-12 rounded-2xl bg-linear-to-br ${current.gradient} flex items-center justify-center text-white shrink-0 shadow-lg ${current.glow}`}
            >
              {current.icon}
            </motion.div>
          </AnimatePresence>

          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeAlert}-${tick}`}
                initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                transition={{ duration: 0.25 }}
              >
                <span className="text-[8px] font-extrabold tracking-widest text-rose-500 font-mono">
                  {current.tag}
                </span>
                <h4 className="text-[13px] font-black text-foreground mt-0.5 truncate">
                  {current.title}
                </h4>
                <p className="text-[10px] text-muted-foreground mt-0.5 italic truncate">
                  "{current.msg}"
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[8px] text-muted-foreground/80 font-mono">
          <span className="flex items-center gap-1">
            <ShieldIcon size={10} className="text-rose-500" />{" "}
            {hero.simulator.privacy_tag}
          </span>
          <span>{hero.simulator.latency}</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function HeroSection() {
  const lang = useStore(coreStore, (state) => state.lang);
  const [username, setUsername] = useState("");
  const [isHoveringInput, setIsHoveringInput] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const hero = lang.data.pages.index.hero;
  const title1 = lang.data.pages.index.title[0];
  const title2 = lang.data.pages.index.title[1];
  const description = lang.data.pages.index.description;
  const primaryAction = lang.data.pages.index.actions.primary;

  return (
    <section className="relative w-full min-h-[92vh] pt-32 pb-20 md:pt-40 md:pb-24 bg-background flex flex-col items-center justify-between">
      <motion.div
        initial={{
          opacity: 0,
          y: -8,
          filter: "blur(2px)",
        }}
        animate={{
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
        }}
        className={clsx(
          "lg:absolute w-full h-[110vh] max-lg:h-96 top-0 left-0 mask-t-from-86% mask-b-from-80% overflow-x-hidden delay-100 transition-all duration-1000 ease-out",
        )}
      >
        <div
          className={clsx(
            "absolute top-0 left-0 size-full transition-all duration-600 delay-100 ease-out",
            !isHoveringInput && !isInputFocused
              ? "scale-100 grayscale"
              : "scale-90",
          )}
        >
          <Prism
            animationType="3drotate"
            timeScale={0.14}
            height={6.4}
            baseWidth={6.4}
            scale={0.64}
            hueShift={0}
            colorFrequency={1.5}
            noise={0.06}
            glow={1}
          />
        </div>
      </motion.div>
      <div className="max-w-362 mx-auto px-6 z-10 relative w-full flex items-center flex-1 max-lg:justify-center lg:justify-between gap-12">
        <div className="flex flex-col gap-3 items-start max-lg:items-center">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl max-lg:text-center lg:text-6xl **:font-heading font-normal tracking-tight leading-[0.95] text-foreground max-w-102">
              <motion.span
                initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.7,
                  delay: 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="block"
              >
                {title1}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.7,
                  delay: 0.25,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="block"
              >
                {title2}
              </motion.span>
            </h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xs relative group mt-6"
          >
            <div className="absolute -inset-px rounded-full bg-linear-to-r from-rose-500/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 group-hover:opacity-60 blur-md transition-all duration-500 pointer-events-none" />

            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={lang.data.pages.index.actions.yourname}
              className="relative flex-1 bg-transparent border-none focus:ring-0 text-foreground z-10"
              classNames={{
                base: "p-1 rounded-full backdrop-blur-xs",
              }}
              onMouseEnter={() => setIsHoveringInput(true)}
              onMouseLeave={() => setIsHoveringInput(false)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
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
                  <span>{lang.data.pages.index.actions.claim}</span>
                  <ArrowRightIcon weight="bold" size={13} />
                </Link>
              }
            />
          </motion.div>
        </div>
        <div className="w-full max-w-88 relative group mt-6 text-sm cursor-default group/main-container flex flex-col max-xl:hidden">
          {hero.features.map((section, i) => (
            <div
              key={i}
              className="pb-2 h-8 hover:h-16 group/para group-hover/main-container:opacity-60 hover:opacity-100 overflow-hidden inline-flex transition-all duration-300 ease-out"
            >
              <p className="leading-relaxed">
                <strong className="uppercase font-mono tracking-wider mr-2 font-bold text-foreground">
                  {section.title}
                </strong>
                <span className="text-muted-foreground opacity-0 group-hover/para:opacity-100 transition-opacity duration-300">
                  {section.description}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
