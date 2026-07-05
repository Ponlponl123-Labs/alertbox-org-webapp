"use client";
import Link from "next/link";
import DotField from "@/components/DotField";
import { coreStore } from "@/hooks/store/core";
import { AnimatePresence, motion } from "motion/react";
import { useStore } from "zustand";
import { ArrowUpRightIcon, BellRingingIcon } from "@phosphor-icons/react";
import { Input } from "react-smooth-input";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import LightRays from "@/components/LightRays";
import BorderGlow from "@/components/BorderGlow";
import HowItWorkStreamer from "./index/how-it-work-streamer";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from "@/components/animate-ui/components/headless/accordion";
import HowItWorkViewer from "./index/how-it-work-viewer";

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
  const [isHIWStreamer, setIsHIWStreamer] = useState(true);
  const sectionHIW = useRef<HTMLDivElement>(null);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col flex-1 min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black relative"
      >
        {/* Backdrop Light Rays */}
        <div className="w-full absolute top-0 left-0 h-[600px] pointer-events-none overflow-hidden z-0">
          <div className="w-full absolute top-0 left-0 h-[600px] mask-b-from-60%">
            <LightRays
              raysOrigin="top-right"
              raysColor="#EAB308"
              raysSpeed={1.5}
              lightSpread={0.6}
              rayLength={2.5}
              followMouse={true}
              mouseInfluence={0.05}
              className="opacity-40 dark:opacity-20"
              pulsating={true}
              fadeDistance={0.8}
              saturation={1.2}
            />
          </div>
        </div>

        <div className="absolute w-full h-full top-0 left-0 opacity-15 dark:invert">
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
        <main className="flex flex-1 w-full max-w-5xl flex-col items-center justify-between py-32 px-16 sm:items-start z-10">
          <div />
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex gap-6"
          >
            <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/65 dark:border-zinc-800/65 mb-4 self-center sm:self-start"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                </span>
                <span className="text-xs font-semibold tracking-wider uppercase text-zinc-600 dark:text-zinc-400">
                  {lang.key === "th-TH"
                    ? "บริการฟรี 100% ไม่มีค่าธรรมเนียม"
                    : "100% Free • No Platform Fees"}
                </span>
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                className="max-w-md text-4xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50"
              >
                {lang.data.pages.index.title[0]}
                <br />
                {lang.data.pages.index.title[1]}
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="max-w-md text-lg max-md:text-sm leading-8 text-zinc-600 dark:text-zinc-400"
              >
                {lang.data.pages.index.description}
              </motion.p>
            </div>
            <div className="max-md:hidden"></div>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-4 text-base font-medium sm:flex-row w-full items-center"
          >
            <motion.div
              variants={fadeInUp}
              className="min-w-0 max-w-106 max-md:min-w-88 flex-1 rounded-full"
            >
              <BorderGlow
                edgeSensitivity={40}
                glowColor="60 90 90"
                borderRadius={9999}
                glowRadius={40}
                glowIntensity={0.8}
                colors={["#EAB308", "#38bdf8", "#ec4899"]}
                backgroundColor="var(--bg-card)"
                className="min-w-0 max-w-106 max-md:min-w-88 flex-1 rounded-full p-px bg-zinc-100 dark:bg-zinc-900 supports-backdrop-filter:bg-zinc-100/50 supports-backdrop-filter:dark:bg-zinc-900/50 supports-backdrop-filter:backdrop-blur-sm"
              >
                <Input
                  type="text"
                  startContent={
                    <span className="text-xs font-baijamjuree translate-y-0.5 ml-2 relative flex -mr-2.75 text-foreground/40">
                      tip-to.me/@
                    </span>
                  }
                  endContent={
                    <Link
                      className="text-xs flex w-max -mr-0.5 h-8 items-center justify-center gap-2 rounded-full bg-foreground px-3 text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
                      href="/app/profile"
                    >
                      <BellRingingIcon
                        weight="fill"
                        className="max-sm:hidden"
                        size={16}
                      />
                      {lang.data.pages.index.actions.primary}
                    </Link>
                  }
                  fontStyle={{
                    fontFamily: "var(--font-baijamjuree)",
                    fontSize: "12px",
                  }}
                  placeholder={lang.data.pages.index.actions.yourname}
                  classNames={{
                    base: "h-11 rounded-full bg-transparent border-0 ring-0 focus-visible:ring-0 focus:ring-0",
                    container: "w-full bg-transparent",
                  }}
                />
              </BorderGlow>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Button
                variant={"outline"}
                className="text-sm flex h-11 items-center justify-center rounded-full border-2 border-solid border-black/8 px-5 hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
                onClick={() =>
                  sectionHIW.current &&
                  sectionHIW.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
              >
                {lang.data.pages.index.actions.secondary}
              </Button>
            </motion.div>
          </motion.div>
        </main>
      </motion.div>
      <section
        ref={sectionHIW}
        className="p-6 py-16 min-h-screen w-full flex flex-col items-center bg-zinc-50 font-sans dark:bg-black"
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="sticky top-12 bottom-12 mt-16 -mb-16 flex flex-col items-center"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-4xl font-semibold mb-3"
          >
            {lang.data.pages.index.sections.howitworks.title}
          </motion.h1>
          <motion.p variants={fadeInUp}>
            {lang.data.pages.index.sections.howitworks.description}
          </motion.p>
          <motion.div variants={fadeInUp}>
            <BorderGlow
              edgeSensitivity={20}
              glowColor="40 80 80"
              borderRadius={9999}
              glowRadius={25}
              glowIntensity={0.6}
              colors={["#EAB308", "#38bdf8", "#ec4899"]}
              className="mt-6 bg-foreground/5 p-px rounded-full"
            >
              <div className="flex bg-zinc-50 dark:bg-zinc-950 rounded-full p-0.5">
                <Button
                  className="rounded-full relative"
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
                    className={cn("z-10", isHIWStreamer && "text-background")}
                  >
                    {
                      lang.data.pages.index.sections.howitworks.selectors
                        .streamer
                    }
                  </span>
                </Button>
                <Button
                  className="rounded-full relative"
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
                    className={cn("z-10", !isHIWStreamer && "text-background")}
                  >
                    {lang.data.pages.index.sections.howitworks.selectors.viewer}
                  </span>
                </Button>
              </div>
            </BorderGlow>
          </motion.div>
        </motion.div>
        <div className="flex gap-8 w-full min-h-screen z-10 -mb-16 bg-zinc-50 dark:bg-black relative mt-64">
          <div className="absolute w-full pointer-events-none h-64 bg-linear-180 to-zinc-50 dark:to-black from-transparent top-0 left-0 -translate-y-full" />
          <AnimatePresence mode="wait">
            {isHIWStreamer ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mx-auto"
                key="HIW-Streamer"
                layoutId="HIW-Streamer"
              >
                <HowItWorkStreamer />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mx-auto"
                key="HIW-Viewer"
                layoutId="HIW-Viewer"
              >
                <HowItWorkViewer />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="w-full bg-zinc-50 dark:bg-black font-sans py-24 border-t border-zinc-100 dark:border-zinc-900 relative overflow-hidden">
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
              className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4"
            >
              {lang.data.pages.index.sections.good_to_know.title}
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-6"
            >
              {lang.data.pages.index.sections.good_to_know.subtitle}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal"
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
                colors: ["#EAB308", "#38bdf8"],
              },
              {
                title:
                  lang.data.pages.index.sections.good_to_know.insights[1].title,
                desc: lang.data.pages.index.sections.good_to_know.insights[1]
                  .desc,
                glowColor: "60 90 90",
                colors: ["#ec4899", "#38bdf8"],
              },
              {
                title:
                  lang.data.pages.index.sections.good_to_know.insights[2].title,
                desc: lang.data.pages.index.sections.good_to_know.insights[2]
                  .desc,
                glowColor: "80 80 80",
                colors: ["#22c55e", "#c084fc"],
              },
            ].map((insight, idx) => (
              <motion.div key={idx} variants={fadeInUp}>
                <BorderGlow
                  edgeSensitivity={30}
                  glowColor={insight.glowColor}
                  borderRadius={12}
                  glowRadius={30}
                  glowIntensity={0.8}
                  colors={insight.colors}
                  backgroundColor="var(--bg-card)"
                  className="flex flex-col gap-4 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 shadow-none!"
                >
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {insight.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                    {insight.desc}
                  </p>
                </BorderGlow>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
