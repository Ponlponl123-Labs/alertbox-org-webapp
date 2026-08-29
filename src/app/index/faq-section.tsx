"use client";

import { useState } from "react";
import clsx from "clsx";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { motion, AnimatePresence } from "motion/react";
import { PlusIcon, MinusIcon } from "@phosphor-icons/react";

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-6 md:py-8 text-left gap-6 group cursor-pointer"
      >
        <h3
          className={clsx(
            "text-xl md:text-2xl lg:text-3xl font-medium tracking-tight transition-colors duration-350",
            isOpen
              ? "text-primary"
              : "text-foreground group-hover:text-foreground/80",
          )}
        >
          {question}
        </h3>
        <div
          className={clsx(
            "shrink-0 flex items-center justify-center size-8 rounded-full border transition-colors duration-350",
            isOpen
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-foreground group-hover:bg-foreground/5",
          )}
        >
          {isOpen ? <MinusIcon weight="bold" /> : <PlusIcon weight="bold" />}
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
            <p className="pb-8 text-base md:text-lg text-muted-foreground leading-relaxed font-medium pr-12">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const t = useStore(
    coreStore,
    (state) => state.lang.data.pages.index.sections.faq,
  );
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section className="w-full py-24 md:py-40 relative">
      <div className="max-w-368 mx-auto px-6 relative z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,var(--foreground)_0%,transparent_20%)] blur-[128px] opacity-40 pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          <div className="lg:col-span-4 flex flex-col text-left">
            <div className="lg:sticky lg:top-32">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 block font-mono">
                {t.subtitle}
              </span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter text-foreground mb-6">
                {t.title}
              </h2>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                {t.description}
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="flex flex-col border-t border-border">
              {t.items.map((item: { q: string; a: string }, idx: number) => (
                <FAQItem
                  key={idx}
                  question={item.q}
                  answer={item.a}
                  isOpen={openIndex === idx}
                  onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
