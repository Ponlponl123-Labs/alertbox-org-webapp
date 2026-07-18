"use client";

import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { motion } from "motion/react";
import BorderGlow from "@/components/BorderGlow";
import {
  HandCoinsIcon,
  ShieldCheckIcon,
  CodeBlockIcon,
} from "@phosphor-icons/react";

export default function CinematicInsights() {
  const lang = useStore(coreStore, (state) => state.lang);
  const t = lang.data.pages.index.sections.good_to_know;

  const icons = [ShieldCheckIcon, HandCoinsIcon, CodeBlockIcon];
  const glowColors = ["40 80 80", "60 90 90", "80 80 80"];
  const gradientColors = [
    ["#F43F5E", "#38bdf8"],
    ["#ec4899", "#38bdf8"],
    ["#22c55e", "#c084fc"],
  ];

  return (
    <section className="w-full font-sans py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,var(--foreground)_0%,transparent_20%)] blur-[128px] opacity-40 pointer-events-none" />

      <div className="max-w-368 mx-auto px-6 relative z-10">
        <div className="max-w-3xl mb-16 md:mb-24">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 block font-mono"
          >
            {t.title}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight mb-6 text-foreground"
          >
            {t.subtitle}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-foreground/50 leading-relaxed font-medium"
          >
            {t.description}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.insights.map(
            (insight: { title: string; desc: string }, idx: number) => {
              const Icon = icons[idx];
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                >
                  <BorderGlow
                    edgeSensitivity={30}
                    glowColor={glowColors[idx]}
                    borderRadius={24}
                    glowRadius={35}
                    glowIntensity={0.8}
                    colors={gradientColors[idx]}
                    backgroundColor="var(--card)"
                    className="flex flex-col h-full gap-5 p-8 rounded-3xl bg-card border-0 shadow-xl"
                  >
                    <div className="size-12 rounded-xl bg-foreground flex items-center justify-center text-background mb-6">
                      <Icon size={24} weight="fill" />
                    </div>
                    <div>
                      <h3 className="text-xl lg:text-2xl text-foreground mb-3">
                        {insight.title}
                      </h3>
                      <p className="text-sm text-foreground/50 leading-relaxed font-medium">
                        {insight.desc}
                      </p>
                    </div>
                  </BorderGlow>
                </motion.div>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}
