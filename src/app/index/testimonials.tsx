"use client";

import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { motion } from "motion/react";

interface TestimonialItem {
  name: string;
  handle: string;
  role: string;
  quote: string;
}

function TestimonialCard({
  item,
  itemKey,
}: {
  item: TestimonialItem;
  itemKey: string | number;
}) {
  return (
    <div
      key={itemKey}
      className="w-[350px] shrink-0 p-6 rounded-3xl bg-card/60 backdrop-blur-xl border border-border/50 shadow-xl flex flex-col gap-4 relative group"
    >
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
      <p className="text-sm text-foreground/80 leading-relaxed font-read font-medium">
        &ldquo;{item.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3 mt-2">
        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary shrink-0 border border-primary/20">
          {item.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>
        <div className="min-w-0">
          <h4 className="text-[13px] font-bold text-foreground truncate">
            {item.name}
          </h4>
          <p className="text-[11px] text-muted-foreground font-medium truncate">
            {item.handle} · {item.role}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const lang = useStore(coreStore, (state) => state.lang);
  const t = lang.data.pages.index.sections.testimonials;

  const items: TestimonialItem[] = t.items;
  const halfLength = Math.ceil(items.length / 2);
  const row1Items = items.slice(0, halfLength);
  const row2Items = items.slice(halfLength);

  const duplicatedRow1 = [
    ...row1Items,
    ...row1Items,
    ...row1Items,
    ...row1Items,
    ...row1Items,
    ...row1Items,
    ...row1Items,
    ...row1Items,
  ];
  const duplicatedRow2 = [
    ...row2Items,
    ...row2Items,
    ...row2Items,
    ...row2Items,
    ...row2Items,
    ...row2Items,
    ...row2Items,
    ...row2Items,
  ];

  return (
    <section className="w-full py-32 relative flex flex-col items-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,var(--foreground)_0%,transparent_20%)] blur-[148px] opacity-40 pointer-events-none" />

      <div className="text-center mb-16 z-10">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 font-mono"
        >
          {t.subtitle}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter text-foreground"
        >
          {t.title}
        </motion.h2>
      </div>

      <div className="relative w-full max-w-[100vw] overflow-hidden flex flex-col gap-6 items-start z-10">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-background to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-background to-transparent z-20 pointer-events-none" />

        <motion.div
          className="flex gap-6 items-center w-max"
          data-default-transition="false"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 40,
          }}
        >
          {duplicatedRow1.map((item: TestimonialItem, idx: number) => (
            <TestimonialCard
              key={`r1-${idx}`}
              itemKey={`r1-${idx}`}
              item={item}
            />
          ))}
        </motion.div>

        <motion.div
          className="flex gap-6 items-center w-max"
          data-default-transition="false"
          animate={{ x: ["-50%", "0%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 45,
          }}
        >
          {duplicatedRow2.map((item: TestimonialItem, idx: number) => (
            <TestimonialCard
              key={`r2-${idx}`}
              itemKey={`r2-${idx}`}
              item={item}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
