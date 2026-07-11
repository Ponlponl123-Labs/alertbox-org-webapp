"use client";

import Link from "next/link";
import DotField from "@/components/DotField";
import { coreStore } from "@/hooks/store/core";
import { AnimatePresence, motion } from "motion/react";
import { useStore } from "zustand";
import {
  BellRingingIcon,
  HandCoinsIcon,
  ShieldCheckIcon,
  CodeBlockIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import { Input } from "react-smooth-input";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import LightRays from "@/components/LightRays";
import MagicRings from "@/components/MagicRings";
import BorderGlow from "@/components/BorderGlow";
import HowItWorkStreamer from "./index/how-it-work-streamer";
import HowItWorkViewer from "./index/how-it-work-viewer";
import StreamerWorkspaceMockup from "@/components/StreamerWorkspaceMockup";
import { cn } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function Home() {
  const lang = useStore(coreStore, (state) => state.lang);
  const [username, setUsername] = useState("");
  const [isHIWStreamer, setIsHIWStreamer] = useState(true);
  const sectionHIW = useRef<HTMLDivElement>(null);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black relative overflow-hidden pt-28 pb-16"
      >
        <div className="absolute w-full h-full top-0 left-0 opacity-10 dark:opacity-15 dark:invert pointer-events-none z-0">
          <DotField
            dotRadius={2.4}
            dotSpacing={14}
            bulgeStrength={16}
            glowRadius={160}
            sparkle={false}
            waveAmplitude={0.1}
            cursorRadius={120}
            cursorForce={0.1}
            bulgeOnly
            gradientFrom="#000000A0"
            gradientTo="#000000A0"
            glowColor="#00000010"
          />
        </div>

        <main className="w-full max-w-5xl mx-auto px-6 md:px-12 z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="lg:col-span-6 flex flex-col gap-6 text-center lg:text-left items-center lg:items-start"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/65 dark:border-zinc-800/65 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-600 dark:text-zinc-300">
                {lang.key === "th-TH"
                  ? "บริการฟรี 100% ไม่มีค่าธรรมเนียม"
                  : "100% Free • No Platform Fees"}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-tight text-black dark:text-zinc-50"
            >
              {lang.data.pages.index.title[0]}
              <br />
              <span className="bg-linear-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-transparent">
                {lang.data.pages.index.title[1]}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 font-normal font-read"
            >
              {lang.data.pages.index.description}
            </motion.p>

            <motion.div variants={fadeInUp} className="w-full max-w-md mt-2">
              <BorderGlow
                edgeSensitivity={40}
                glowColor="60 90 90"
                borderRadius={9999}
                glowRadius={45}
                glowIntensity={0.8}
                colors={["#F43F5E", "#38bdf8", "#ec4899"]}
                backgroundColor="var(--bg-card)"
                className="w-full p-px rounded-full bg-zinc-100 dark:bg-zinc-900 supports-backdrop-filter:bg-zinc-100/50 supports-backdrop-filter:dark:bg-zinc-900/50 supports-backdrop-filter:backdrop-blur-sm shadow-md"
              >
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  startContent={
                    <span className="text-xs font-baijamjuree translate-y-0.5 ml-3.5 relative flex -mr-2 text-foreground/45">
                      tip-to.me/@
                    </span>
                  }
                  endContent={
                    <Link
                      className="text-xs flex w-max -mr-1 h-8 items-center justify-center gap-1.5 rounded-full bg-foreground px-4 text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-bold shadow-sm transition-transform active:scale-[0.98]"
                      href={
                        username.trim()
                          ? `/app/profile?username=${username}`
                          : "/app/profile"
                      }
                    >
                      <BellRingingIcon
                        weight="fill"
                        className="max-sm:hidden size-3.5"
                      />
                      {lang.data.pages.index.actions.primary}
                    </Link>
                  }
                  fontStyle={{
                    fontFamily: "var(--font-bai-jamjuree)",
                    fontSize: "12px",
                  }}
                  placeholder={lang.data.pages.index.actions.yourname}
                  classNames={{
                    base: "h-11 rounded-full bg-transparent border-0 ring-0 focus-visible:ring-0 focus:ring-0 px-4",
                    container: "w-full bg-transparent",
                  }}
                />
              </BorderGlow>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex items-center gap-4">
              <Button
                variant="outline"
                className="text-xs font-bold flex h-10 items-center justify-center gap-1.5 rounded-full border border-zinc-300 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 px-5 shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                onClick={() =>
                  sectionHIW.current &&
                  sectionHIW.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
              >
                {lang.data.pages.index.actions.secondary}
                <CaretRightIcon size={12} weight="bold" />
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 w-full flex justify-center z-10"
          >
            <StreamerWorkspaceMockup username={username} lang={lang} />
          </motion.div>
        </main>
      </motion.div>

      <section
        ref={sectionHIW}
        className="w-full py-24 px-6 bg-zinc-50 dark:bg-black font-sans flex flex-col items-center justify-center border-t border-zinc-100 dark:border-zinc-900/60 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(244,63,94,0.02)_0%,transparent_50%)] pointer-events-none" />

        <div className="w-full max-w-5xl mx-auto flex flex-col items-center z-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col items-center text-center mb-10"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-black mb-3 tracking-tight text-black dark:text-zinc-50"
            >
              {lang.data.pages.index.sections.howitworks.title}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider mb-6"
            >
              {lang.data.pages.index.sections.howitworks.description}
            </motion.p>

            <motion.div variants={fadeInUp}>
              <BorderGlow
                edgeSensitivity={20}
                glowColor="40 80 80"
                borderRadius={9999}
                glowRadius={25}
                glowIntensity={0.6}
                colors={["#F43F5E", "#38bdf8", "#ec4899"]}
                className="bg-foreground/5 p-px rounded-full"
              >
                <div className="flex bg-white dark:bg-zinc-950 rounded-full p-0.75 shadow-inner">
                  <Button
                    className="rounded-full relative text-xs font-semibold px-5 h-8"
                    variant={"ghost"}
                    onClick={() => setIsHIWStreamer(true)}
                  >
                    <AnimatePresence>
                      {isHIWStreamer && (
                        <motion.div
                          id="HIW-Selector-Active"
                          layoutId="HIW-Selector-Active"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="size-full top-0 left-0 rounded-full absolute bg-foreground pointer-events-none"
                          data-default-transition="false"
                        />
                      )}
                    </AnimatePresence>
                    <span
                      className={cn(
                        "z-10 transition-colors",
                        isHIWStreamer
                          ? "text-background"
                          : "text-foreground/60",
                      )}
                    >
                      {
                        lang.data.pages.index.sections.howitworks.selectors
                          .streamer
                      }
                    </span>
                  </Button>
                  <Button
                    className="rounded-full relative text-xs font-semibold px-5 h-8"
                    variant={"ghost"}
                    onClick={() => setIsHIWStreamer(false)}
                  >
                    <AnimatePresence>
                      {!isHIWStreamer && (
                        <motion.div
                          id="HIW-Selector-Active"
                          layoutId="HIW-Selector-Active"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="size-full top-0 left-0 rounded-full absolute bg-foreground pointer-events-none"
                          data-default-transition="false"
                        />
                      )}
                    </AnimatePresence>
                    <span
                      className={cn(
                        "z-10 transition-colors",
                        !isHIWStreamer
                          ? "text-background"
                          : "text-foreground/60",
                      )}
                    >
                      {
                        lang.data.pages.index.sections.howitworks.selectors
                          .viewer
                      }
                    </span>
                  </Button>
                </div>
              </BorderGlow>
            </motion.div>
          </motion.div>

          <div className="w-full z-10 bg-transparent relative flex justify-center">
            <AnimatePresence mode="wait">
              {isHIWStreamer ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="w-full"
                  key="HIW-Streamer"
                >
                  <HowItWorkStreamer />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="w-full"
                  key="HIW-Viewer"
                >
                  <HowItWorkViewer />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="w-full bg-zinc-50 dark:bg-black font-sans py-24 border-t border-zinc-100 dark:border-zinc-900/60 relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-80 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.015)_0%,transparent_60%)] pointer-events-none" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-5xl mx-auto px-6 lg:px-8 z-10 relative"
        >
          <div className="max-w-3xl mb-16">
            <motion.p
              variants={fadeInUp}
              className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3"
            >
              {lang.data.pages.index.sections.good_to_know.title}
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-5 text-black dark:text-zinc-50"
            >
              {lang.data.pages.index.sections.good_to_know.subtitle}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium"
            >
              {lang.data.pages.index.sections.good_to_know.description}
            </motion.p>
          </div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                title:
                  lang.data.pages.index.sections.good_to_know.insights[0].title,
                desc: lang.data.pages.index.sections.good_to_know.insights[0]
                  .desc,
                glowColor: "40 80 80",
                colors: ["#F43F5E", "#38bdf8"],
                icon: HandCoinsIcon,
              },
              {
                title:
                  lang.data.pages.index.sections.good_to_know.insights[1].title,
                desc: lang.data.pages.index.sections.good_to_know.insights[1]
                  .desc,
                glowColor: "60 90 90",
                colors: ["#ec4899", "#38bdf8"],
                icon: ShieldCheckIcon,
              },
              {
                title:
                  lang.data.pages.index.sections.good_to_know.insights[2].title,
                desc: lang.data.pages.index.sections.good_to_know.insights[2]
                  .desc,
                glowColor: "80 80 80",
                colors: ["#22c55e", "#c084fc"],
                icon: CodeBlockIcon,
              },
            ].map((insight, idx) => {
              const Icon = insight.icon;
              return (
                <motion.div key={idx} variants={fadeInUp}>
                  <BorderGlow
                    edgeSensitivity={30}
                    glowColor={insight.glowColor}
                    borderRadius={20}
                    glowRadius={35}
                    glowIntensity={0.8}
                    colors={insight.colors}
                    backgroundColor="var(--bg-card)"
                    className="flex flex-col gap-4 p-6 rounded-2xl bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-900/60 shadow-lg"
                  >
                    <div className="size-10 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                      <Icon size={22} weight="fill" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {insight.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                      {insight.desc}
                    </p>
                  </BorderGlow>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
