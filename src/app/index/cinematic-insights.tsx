"use client";

import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { motion } from "motion/react";
import {
  ShieldCheckIcon,
  HandCoinsIcon,
  CodeBlockIcon,
} from "@phosphor-icons/react";

const LEDGER_META = [
  {
    kicker: "Anonymity",
    principle: "Zero Intermediary",
    detail: "Billing statement settles directly between donor and your gateway.",
    icon: ShieldCheckIcon,
  },
  {
    kicker: "Chargeback Risk",
    principle: "Native Radar Rules",
    detail: "Stripe Radar blocks high-risk cards; alert buffer intercepts trolls.",
    icon: HandCoinsIcon,
  },
  {
    kicker: "Sovereignty",
    principle: "Client-Side Code",
    detail: "Deploy anywhere. Zero telemetry, zero tracking, zero vendor lock-in.",
    icon: CodeBlockIcon,
  },
];

export default function CinematicInsights() {
  const t = useStore(
    coreStore,
    (state) => state.lang.data.pages.index.sections.good_to_know,
  );

  return (
    <section className="w-full font-sans py-24 md:py-36 relative border-t border-border/40 overflow-hidden">
      <div className="mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-20 pb-8 border-b border-border/40">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-foreground/40 mb-3 block">
              {t.title}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tighter leading-[1.05] text-foreground">
              {t.subtitle}
            </h2>
          </div>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-md font-normal md:text-right">
            {t.description}
          </p>
        </div>

        <div className="divide-y divide-border/60 border-b border-border/60">
          {t.insights.map(
            (insight: { title: string; desc: string }, idx: number) => {
              const cleanTitle = insight.title.replace(/^\d+\.\s*/, "");
              const indexStr = `0${idx + 1}`;
              const meta = LEDGER_META[idx] || LEDGER_META[0];
              const Icon = meta.icon;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * idx, duration: 0.4 }}
                  className="group py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start duration-300 hover:bg-foreground hover:text-background px-2 md:px-4 -mx-2 md:-mx-4"
                >
                  <div className="md:col-span-3 flex md:flex-col justify-between items-baseline md:items-start gap-3">
                    <span className="font-mono text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-foreground/25 group-hover:text-background transition-colors">
                      {indexStr}
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <Icon
                          size={14}
                          className="text-foreground/50 group-hover:text-background transition-colors"
                        />
                        <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-foreground/70 group-hover:text-background">
                          {meta.kicker}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground/60 group-hover:text-background">
                        {meta.principle}
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-4 lg:col-span-4">
                    <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-foreground leading-snug group-hover:text-background transition-colors">
                      {cleanTitle}
                    </h3>
                  </div>

                  <div className="md:col-span-5 lg:col-span-5 flex flex-col justify-between gap-5">
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-normal group-hover:text-background transition-colors">
                      {insight.desc}
                    </p>
                    <div className="flex items-center gap-2 pt-3 border-t border-border/30 text-xs font-mono text-foreground/70 group-hover:text-background">
                      <span className="size-1.5 rounded-full bg-foreground/40 group-hover:bg-background shrink-0" />
                      <span>{meta.detail}</span>
                    </div>
                  </div>
                </motion.div>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}

