"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Streamlabs } from "@thesvg/react";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import dynamic from "next/dynamic";
import { Input } from "react-smooth-input";
import { motion, AnimatePresence } from "motion/react";

const ShapeWaves = dynamic(() => import("@/components/ShapeWaves"), {
  ssr: false,
});

export default function HeroStudio() {
  const isDark = useStore(coreStore, (state) => state.isDark);
  const lang = useStore(coreStore, (state) => state.lang);

  const [username, setUsername] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsExpanded(true), 3200);
    return () => clearTimeout(timer);
  }, []);

  const hero = lang.data.pages.index.hero;

  return (
    <section className="relative bg-linear-to-t from-foreground/10 to-foreground/5 m-2 h-[calc(100dvh-4.5rem-var(--status-banner-height,0))] md:h-[calc(100dvh-1rem-var(--status-banner-height,0))] w-[calc(100%-1rem)] rounded-xl pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="w-full flex justify-center items-center select-none pb-20 md:pb-16 lg:pb-42 -z-10 pointer-events-none">
        <h1 className="text-[13dvw] md:text-[12dvw] font-medium tracking-tight leading-none text-foreground text-center uppercase font-sans">
          ALERTBOX<span className="text-[6dvw] font-light text-foreground/60">.org</span>
        </h1>
      </div>
      <div className="absolute inset-0 pointer-events-none">
        <ShapeWaves
          className="*:mask-b-from-0 dark:bg-[#101010] bg-[#ededed]"
          text="❤️ Alertbox.org"
          fontFamily='Geist, "Geist Sans", system-ui, sans-serif'
          fontWeight={500}
          textSize={0.1}
          shapes="mixed"
          cellSize={4}
          dotSize={0.64}
          color={isDark ? "#bfffdf" : "#029062"}
          hoverColor="#ffffff"
          backgroundColor={isDark ? "#101010" : "#ededed"}
          speed={1}
          scale={1}
          contrast={1}
          brightness={0.4}
          flow={0}
          direction={0}
          fade={16}
          interactive
          splashRadius={40}
          splashStrength={0.4}
          glow={0.35}
          intro
          introDuration={1.6}
          paused={false}
        />
      </div>

      <motion.div
        layout
        initial={{ y: -90, x: "-50%", opacity: 0, scale: 0.65 }}
        animate={{ y: 0, x: "-50%", opacity: 1, scale: 1 }}
        transition={{
          y: { type: "spring", stiffness: 300, damping: 24, mass: 0.8, delay: 2.6 },
          scale: { type: "spring", stiffness: 300, damping: 24, mass: 0.8, delay: 2.6 },
          opacity: { duration: 0.25, delay: 2.6 },
          layout: { type: "spring", stiffness: 220, damping: 22 },
        }}
        className="absolute left-1/2 top-24 inline-flex items-center p-2 text-foreground/80 text-xs font-medium rounded-full backdrop-blur-lg bg-muted/30 shadow-2xl shadow-emerald-400/60 select-none overflow-hidden"
      >
        <div className="shrink-0 flex items-center justify-center size-5">
          <Streamlabs className="size-4 not-dark:fill-black" />
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, filter: "blur(4px)", x: -8 }}
              animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
              transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
              className="whitespace-nowrap pl-2 pr-1.5 inline-block"
            >
              {hero.studio?.connected ?? "Now we're connected with Streamlabs!"}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="max-w-7xl lg:mt-auto mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-44 lg:mt-10">
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <motion.h2
              initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.75,
                delay: 1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-xl max-w-sm sm:text-2xl font-medium text-foreground/80 leading-snug mb-6"
            >
              {hero.studio?.headline ?? "Centralize your stream stack. Connect platforms, route live alerts, and control every overlay."}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.75,
                delay: 1.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-full max-w-md mb-4 backdrop-blur-xs"
            >
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={lang.data.pages.index.actions.yourname}
                className="relative flex-1 bg-transparent border-none focus:ring-0 text-foreground z-10"
                classNames={{
                  base: "p-1 rounded-full apply-smooth-transition",
                }}
                fontStyle={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: "600",
                  fontSize: "12px",
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
                startContent={
                  <span className="text-xs font-heading font-semibold text-foreground/50 ml-3 -mr-2.5 translate-y-0.125 hidden sm:block">
                    tip-to.me/@
                  </span>
                }
                endContent={
                  <Link
                    href={"/app"}
                    className="group transition-interactive relative flex items-center gap-3 px-5 py-2.5 rounded-full bg-emerald-300 text-black font-semibold text-xs hover:bg-emerald-400"
                  >
                    <Streamlabs className="size-4 fill-black" />
                    <span>{hero.studio?.continue_streamlabs ?? "Continue with Streamlabs"}</span>
                  </Link>
                }
              />
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: 0.75,
              delay: 1.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="lg:col-span-6 flex justify-end max-lg:hidden"
          >
            <div className="w-full max-w-xs">
              <div className="w-full max-w-88 relative group mt-6 text-sm cursor-default group/main-container flex flex-col">
                {hero.features.map((section, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 12, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{
                      duration: 0.5,
                      delay: 1.35 + i * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
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
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
