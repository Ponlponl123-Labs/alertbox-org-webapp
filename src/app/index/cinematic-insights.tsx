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
    <section className="w-full bg-background font-sans py-24 md:py-32 border-t border-border relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-[500px] bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.03)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] -translate-y-1/2 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl mb-16 md:mb-24">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-4 block font-mono"
          >
            {t.title}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight mb-6 text-foreground"
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
                    className="flex flex-col h-full gap-5 p-8 rounded-3xl bg-card border border-border shadow-xl"
                  >
                    <div className="size-12 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground border border-foreground/10 mb-3">
                      <Icon size={24} weight="fill" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-3">
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
