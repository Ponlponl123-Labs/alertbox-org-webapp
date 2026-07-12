"use client";

import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { motion } from "motion/react";
import { PAYMENT_METHODS } from "@/consts/payment";
import Link from "next/link";

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

export default function SocialProof() {
  const lang = useStore(coreStore, (state) => state.lang);
  const t = lang.data.pages.index.sections.social_proof;

  return (
    <section className="w-full py-16 bg-background border-t border-border relative overflow-hidden">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-5xl mx-auto px-6 flex flex-col items-center gap-8"
      >
        <motion.p
          variants={fadeInUp}
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
        >
          {t.badge}
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-12"
        >
          {PAYMENT_METHODS.map((method) => (
            <Link
              key={method.id}
              href={method.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 opacity-40 hover:opacity-80 transition-opacity"
            >
              <method.icon className="size-5 grayscale group-hover:grayscale-0 transition-all" />
              <span className="text-xs font-semibold text-muted-foreground/80 tracking-wide">
                {method.name}
              </span>
            </Link>
          ))}
        </motion.div>

        <motion.p
          variants={fadeInUp}
          className="text-xs text-muted-foreground font-medium"
        >
          {t.description}
        </motion.p>
      </motion.div>
    </section>
  );
}
