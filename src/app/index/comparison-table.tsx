"use client";

import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { motion } from "motion/react";
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";

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
      staggerChildren: 0.06,
    },
  },
};

function CellValue({
  value,
  isAlertBox,
}: {
  value: boolean | string;
  isAlertBox?: boolean;
}) {
  if (typeof value === "boolean") {
    return value ? (
      <CheckCircleIcon
        size={18}
        weight="fill"
        className="text-emerald-500 mx-auto"
      />
    ) : (
      <XCircleIcon
        size={18}
        weight="fill"
        className="text-foreground/20 dark:text-foreground/10 mx-auto"
      />
    );
  }
  return (
    <span
      className={
        isAlertBox
          ? "text-xs font-bold text-emerald-600 dark:text-emerald-400"
          : "text-xs font-medium text-muted-foreground"
      }
    >
      {value}
    </span>
  );
}

export default function ComparisonTable() {
  const lang = useStore(coreStore, (state) => state.lang);
  const t = lang.data.pages.index.sections.comparison;

  return (
    <section className="w-full py-24 bg-background border-t border-border relative overflow-hidden">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-5xl mx-auto px-6 z-10 relative"
      >
        <div className="max-w-3xl mb-12 text-left">
          <motion.p
            variants={fadeInUp}
            className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-3 font-mono"
          >
            {t.subtitle}
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-4"
          >
            {t.title}
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-sm md:text-base text-foreground/50 leading-relaxed font-medium"
          >
            {t.description}
          </motion.p>
        </div>
        <motion.div
          variants={fadeInUp}
          className="w-full overflow-x-auto rounded-3xl border border-border shadow-lg"
        >
          <table className="w-full border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-foreground/5">
                {t.headers.map((header: string, idx: number) => (
                  <th
                    key={idx}
                    className={`text-left px-5 py-4 text-[10px] font-bold uppercase tracking-wider ${
                      idx === 1
                        ? "text-rose-500 bg-rose-500/[0.04]"
                        : "text-muted-foreground/60"
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.rows.map(
                (
                  row: {
                    feature: string;
                    alertbox: boolean | string;
                    others: boolean | string;
                  },
                  idx: number,
                ) => (
                  <motion.tr
                    key={idx}
                    variants={fadeInUp}
                    className="border-t border-border hover:bg-foreground/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4 text-xs font-semibold text-foreground/80 text-left">
                      {row.feature}
                    </td>
                    <td className="px-5 py-4 text-center bg-rose-500/[0.02]">
                      <CellValue value={row.alertbox} isAlertBox />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <CellValue value={row.others} />
                    </td>
                  </motion.tr>
                ),
              )}
            </tbody>
          </table>
        </motion.div>
      </motion.div>
    </section>
  );
}
