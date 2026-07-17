"use client";

import Link from "next/link";
import Aurora from "@/components/Aurora";
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
import BorderGlow from "@/components/BorderGlow";
import HowItWorkStreamer from "./index/how-it-work-streamer";
import HowItWorkViewer from "./index/how-it-work-viewer";
import HeroSection from "./index/hero-section";
import SocialProof from "./index/social-proof";
import PrivacyGuard from "./index/privacy-guard";
import Features from "./index/features";
import Testimonials from "./index/testimonials";
import ComparisonTable from "./index/comparison-table";
import PricingHighlight from "./index/pricing-highlight";
import FAQSection from "./index/faq-section";
import CTABanner from "./index/cta-banner";
import CinematicInsights from "./index/cinematic-insights";
import { cn } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as never },
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
      <HeroSection />
      <SocialProof />

      <PrivacyGuard />

      <section
        ref={sectionHIW}
        className="w-full py-24 px-6 bg-background font-sans flex flex-col items-center justify-center border-t border-border relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(244,63,94,0.02)_0%,transparent_50%)] pointer-events-none" />
        <div className="w-full max-w-362 mx-auto flex flex-col items-center z-10">
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

      <Features />

      <Testimonials />

      <ComparisonTable />

      <PricingHighlight />

      <FAQSection />

      <CinematicInsights />

      <CTABanner />
    </>
  );
}
