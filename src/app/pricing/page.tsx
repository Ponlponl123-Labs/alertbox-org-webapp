"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckIcon,
  ArrowUpRightIcon,
  PlusIcon,
  MinusIcon,
  RocketLaunchIcon,
  StarIcon,
  FireIcon,
} from "@phosphor-icons/react";
import { Stripe, BuyMeACoffee, KoFi } from "@thesvg/react";
import type { PricingPageData } from "@/types/landing.types";
import CTABanner from "../index/cta-banner";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as never },
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

const planIcons: Record<
  string,
  React.ComponentType<{ size: number; weight: "fill" | "bold" | "regular"; className?: string }>
> = {
  rocket: RocketLaunchIcon,
  star: StarIcon,
  fire: FireIcon,
};

export default function PricingPage() {
  const lang = useStore(coreStore, (state) => state.lang);
  const t: PricingPageData = lang.data.pricing;
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="w-full min-h-screen bg-background font-sans pt-48 text-foreground relative overflow-hidden select-none">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.header
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto pb-12"
        >
          <motion.span variants={fadeInUp} className="text-xs sm:text-sm md:text-base tracking-wide font-medium font-mono mb-12">
            {t.kicker}
          </motion.span>

          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-medium tracking-tight text-foreground leading-[1.08] mb-5 text-balance"
          >
            {t.title}
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-sm sm:text-base md:text-lg text-foreground/60 font-normal font-sans leading-relaxed max-w-2xl mx-auto mb-8 text-pretty"
          >
            {t.description}
          </motion.p>
        </motion.header>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mb-24"
        >
          {t.plans.map((plan) => {
            const Icon = planIcons[plan.icon] || RocketLaunchIcon;
            const isHighlighted = plan.highlighted;

            if (isHighlighted) {
              return (
                <motion.div
                  key={plan.id}
                  variants={fadeInUp}
                  className="rounded-3xl bg-rose-900 text-white p-8 sm:p-9 flex flex-col justify-between relative overflow-hidden apply-smooth-transition hover:scale-[1.01]"
                >
                  <div>
                    <div className="inline-flex items-center gap-2.5 mb-5">
                      <div className="size-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
                        <Icon size={16} weight="fill" />
                      </div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                        {plan.badge}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-white/80 font-medium leading-relaxed mb-6">
                      {plan.desc}
                    </p>

                    <div className="flex items-baseline gap-1.5 mb-8 pb-6 border-b border-white/15">
                      <span className="text-4xl sm:text-5xl font-sans font-bold tracking-tight text-white">
                        {plan.price}
                      </span>
                      <span className="text-xs font-mono text-white/75 font-semibold">
                        {plan.period}
                      </span>
                    </div>

                    <ul className="space-y-3.5 mb-8">
                      {plan.features.map((feature, fIdx) => (
                        <li
                          key={fIdx}
                          className="flex items-start gap-3 text-xs sm:text-[13px] text-white/95 font-medium leading-snug"
                        >
                          <div className="size-4 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 mt-0.5">
                            <CheckIcon size={10} weight="bold" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={plan.href}
                    className="w-full mt-auto block"
                    target={plan.href.startsWith("http") ? "_blank" : undefined}
                    rel={plan.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    <Button
                      type="button"
                      variant={"default"}
                      size={"lg"}
                      className="w-full p-6 rounded-full text-xs font-mono font-bold uppercase tracking-wider"
                    >
                      {plan.button}
                    </Button>
                  </Link>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={plan.id}
                variants={fadeInUp}
                className="rounded-3xl bg-foreground/5 backdrop-blur-xl p-8 sm:p-9 flex flex-col justify-between transition-all duration-300 hover:border-foreground/20 hover:bg-card/80"
              >
                <div>
                  <div className="inline-flex items-center gap-2.5 mb-5">
                    <div className="size-8 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
                      <Icon size={16} weight="fill" />
                    </div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                      {plan.badge}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-foreground/60 leading-relaxed mb-6">
                    {plan.desc}
                  </p>

                  <div className="flex items-baseline gap-1.5 mb-8 pb-6 border-b border-foreground/8">
                    <span className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-xs font-mono text-foreground/50">
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map((feature, fIdx) => (
                      <li
                        key={fIdx}
                        className="flex items-start gap-3 text-xs sm:text-[13px] text-foreground/80 leading-snug"
                      >
                        <div className="size-4 rounded-full bg-foreground/10 text-foreground flex items-center justify-center shrink-0 mt-0.5">
                          <CheckIcon size={10} weight="bold" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={plan.href}
                  className="w-full mt-auto block"
                  target={plan.href.startsWith("http") ? "_blank" : undefined}
                  rel={plan.href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  <Button
                    type="button"
                    variant={"outline"}
                    size={"lg"}
                    className="w-full p-6 rounded-full text-xs font-mono font-bold uppercase tracking-wider"
                  >
                    {plan.button}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.section
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="mb-24 rounded-3xl bg-foreground/5 p-8 sm:p-12"
        >
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-500 block mb-2 font-semibold">
              {t.gateway_fees.kicker}
            </span>
            <h2 className="text-2xl sm:text-3xl font-sans font-medium tracking-tight text-foreground mb-3">
              {t.gateway_fees.title}
            </h2>
            <p className="text-sm text-foreground/60 leading-relaxed">
              {t.gateway_fees.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {t.gateway_fees.providers.map((provider, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-foreground">
                      {provider.name}
                    </span>
                    {provider.name === "Stripe" && <Stripe className="h-5 w-auto" />}
                    {provider.name === "Buy Me a Coffee" && <BuyMeACoffee className="size-5" />}
                    {provider.name === "Ko-fi" && <KoFi className="size-5" />}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground mb-2">
                    {provider.fee}
                  </div>
                  <p className="text-xs text-foreground/60 leading-relaxed">
                    {provider.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeInUp}
              className="lg:col-span-5 lg:sticky lg:top-36"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-rose-500 block mb-2 font-semibold">
                {t.faq.kicker}
              </span>
              <h2 className="text-3xl sm:text-4xl font-sans font-medium tracking-tight text-foreground mb-4">
                {t.faq.title}
              </h2>
              <p className="text-sm text-foreground/60 leading-relaxed font-normal mb-6">
                {t.faq.subtitle}
              </p>
              <Link
                href="/docs"
                className="font-mono text-xs uppercase tracking-widest text-foreground/80 hover:text-foreground inline-flex items-center gap-1.5 transition-colors group"
              >
                <span>{t.faq.docs_link}</span>
                <ArrowUpRightIcon
                  size={14}
                  weight="bold"
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </Link>
            </motion.div>

            <div className="lg:col-span-7 divide-y divide-border border-y border-border">
              {t.faq.items.map((item, idx: number) => {
                const isOpen = openFaq === idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{
                      delay: idx * 0.05,
                      duration: 0.45,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full py-5 flex items-start justify-between text-left gap-4 cursor-pointer group"
                    >
                      <span className="text-sm sm:text-base font-normal text-foreground/85 group-hover:text-foreground transition-colors">
                        {item.q}
                      </span>
                      <div className="shrink-0 mt-0.5 text-foreground/40 group-hover:text-foreground transition-colors">
                        {isOpen ? (
                          <MinusIcon size={16} weight="bold" />
                        ) : (
                          <PlusIcon size={16} weight="bold" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="faq-content"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{
                            duration: 0.3,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs sm:text-sm text-foreground/60 leading-relaxed pb-6 font-normal">
                            {item.a}
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

      </div>
      <CTABanner />
    </div>
  );
}
