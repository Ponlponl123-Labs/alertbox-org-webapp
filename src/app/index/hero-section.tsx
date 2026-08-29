"use client";

import React, { useState } from "react";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { motion } from "motion/react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { Input } from "react-smooth-input";
import Prism from "@/components/Prism";
import clsx from "clsx";

export default function HeroSection() {
  const lang = useStore(coreStore, (state) => state.lang);
  const [username, setUsername] = useState("");
  const [isHoveringInput, setIsHoveringInput] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const hero = lang.data.pages.index.hero;
  const title1 = lang.data.pages.index.title[0];
  const title2 = lang.data.pages.index.title[1];

  return (
    <section className="relative w-full min-h-[92vh] pt-32 pb-20 md:pt-40 md:pb-24 flex flex-col items-center justify-between">
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
