"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { motion, AnimatePresence } from "motion/react";
import {
  PlusIcon,
  MinusIcon,
} from "@phosphor-icons/react";
import ShinyText from "@/components/ShinyText";
import type { AboutPageData } from "@/types/landing.types";
import CTABanner from "../index/cta-banner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ShapeWaves = dynamic(() => import("@/components/ShapeWaves"), {
  ssr: false,
});

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as never },
  },
};

export default function AboutPage() {
  const isDark = useStore(coreStore, (state) => state.isDark);
  const lang = useStore(coreStore, (state) => state.lang);
  const t: AboutPageData = lang.data.about;

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = useMemo(
    () =>
      t.faqs && t.faqs.length > 0
        ? t.faqs
        : [
          {
            q: t.faq_question,
            a: t.faq_answer,
          },
        ],
    [t.faqs, t.faq_question, t.faq_answer]
  );

  return (
    <div className="w-full min-h-screen bg-background text-foreground font-sans selection:bg-rose-500/20 pt-16 px-2 overflow-hidden">
      <section className="mx-auto flex max-lg:flex-col gap-2 w-full min-h-[calc(100dvh-5rem)]">
        <div className="w-full flex flex-col text-center items-center justify-center gap-5 p-8 sm:p-12 min-h-64 lg:min-h-[calc(100dvh-5rem)] rounded-2xl bg-rose-500/10 border border-foreground/5 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 text-xs md:text-sm font-mono tracking-wider uppercase text-foreground/70">
            <ShinyText
              text="Ponlponl123 Labs"
              color={isDark ? "#888888" : "#666666"}
              shineColor={isDark ? "#ffffff" : "#111111"}
              speed={2.5}
            />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-balance max-w-xl text-foreground">
            {t.hero_title}
          </h1>

          <p className="text-sm sm:text-base text-foreground/70 max-w-md text-pretty leading-relaxed">
            {t.description}
          </p>

          <span className="text-xs sm:text-sm text-foreground/40 mt-3 font-mono">{t.motto}</span>
        </div>
        <div className="w-full flex flex-col items-center justify-center gap-4 min-h-96 lg:min-h-[calc(100dvh-5rem)] rounded-2xl bg-rose-500/10 relative overflow-hidden">
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
              color={isDark ? "#ff1855" : "#300310"}
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
        </div>
      </section>

      <section className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center gap-2 px-6 py-16 sm:py-24 md:py-32 lg:py-42">
        <h2 className="text-sm md:text-base lg:text-xl uppercase font-mono font-medium tracking-wide max-w-xl text-foreground">
          {t.about_us_tag}
        </h2>
        <p className="text-lg md:text-3xl lg:text-4xl font-heading font-medium text-foreground/70 max-w-2xl text-pretty leading-relaxed">
          {t.about_us_desc}
        </p>
        <span className="text-xs font-mono text-foreground/30 max-w-2xl text-pretty leading-relaxed mt-3">
          &quot;{t.quote}&quot;
        </span>
      </section>

      <section className="max-w-7xl mx-auto flex max-lg:flex-col gap-10 px-6 py-16 sm:py-24">
        <div className="flex flex-col">
          <h2 className="text-sm md:text-base lg:text-xl uppercase font-mono font-medium tracking-wide max-w-lg text-foreground">
            {t.journey_tag}
          </h2>
          <p className="text-lg md:text-3xl lg:text-4xl font-heading font-medium text-foreground/70 max-w-lg text-pretty leading-relaxed">
            {t.journey_title}
          </p>
          <span className="text-xs font-mono text-foreground/30 max-w-lg text-pretty leading-relaxed mt-3">
            {t.journey_desc}
          </span>
        </div>
        <div className="min-w-0 flex-1 flex items-center justify-center gap-2 sm:gap-3 p-4">
          {(t.journey_milestones || []).map((item, idx) => (
            <Tooltip key={idx}>
              <TooltipTrigger className="flex-1 group py-4 flex flex-col gap-3 text-left">
                <span className="text-xs md:text-sm font-mono font-medium uppercase tracking-wider text-foreground/70 group-hover:text-foreground whitespace-nowrap transition-colors">
                  {item.time}
                </span>
                <div className="bg-foreground/20 group-hover:bg-rose-500 rounded-full w-full h-2 transition-all group-hover:scale-y-125" />
              </TooltipTrigger>
              <TooltipContent className="rounded-xl max-w-xs p-3">
                <p className="font-sans text-xs sm:text-sm leading-relaxed">{item.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="lg:col-span-4"
          >
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tighter uppercase text-foreground">
              {t.faq_title || "FAQ."}
            </h2>
            <p className="text-sm sm:text-base text-foreground/60 mt-4 max-w-sm">
              {t.faq_desc || "Clear answers regarding privacy, zero-platform fees, and architecture."}
            </p>
          </motion.div>

          <div className="lg:col-span-8 divide-y divide-foreground/8">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ delay: idx * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="py-6"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq((prev) => (prev === idx ? null : idx))}
                    className="w-full flex items-center justify-between text-left gap-6 group py-2 apply-smooth-transition"
                  >
                    <span className="text-lg sm:text-xl md:text-2xl font-medium tracking-tight text-foreground">
                      {faq.q}
                    </span>
                    <div className="shrink-0 size-8 rounded-full border border-foreground/15 flex items-center justify-center text-foreground/60 group-hover:text-foreground group-hover:border-foreground/30 apply-smooth-transition">
                      {isOpen ? (
                        <MinusIcon weight="bold" size={14} />
                      ) : (
                        <PlusIcon weight="bold" size={14} />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pt-3 text-sm sm:text-base text-foreground/70 leading-relaxed pr-8">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <CTABanner />
    </div>
  );
}
