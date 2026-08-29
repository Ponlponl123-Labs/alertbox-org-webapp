"use client";

import clsx from "clsx";
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
        className="text-foreground mx-auto"
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
      className={clsx(
        isAlertBox
          ? "text-sm text-foreground"
          : "text-sm text-muted-foreground",
      )}
    >
      {value}
    </span>
  );
}

export default function ComparisonTable() {
  const t = useStore(
    coreStore,
    (state) => state.lang.data.pages.index.sections.comparison,
  );

  return (
    <section className="w-full py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,var(--foreground)_0%,transparent_20%)] blur-[128px] opacity-40 pointer-events-none" />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-368 mx-auto px-6 z-10 relative"
      >
        <div className="max-w-3xl mb-12 text-left">
          <motion.p
            variants={fadeInUp}
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 font-mono"
          >
            {t.subtitle}
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-foreground mb-4"
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
          <table className="w-full border-collapse **:font-heading **:tracking-wider min-w-[500px]">
            <thead>
              <tr className="bg-background">
                {t.headers.map((header: string, idx: number) => (
                  <th
                    key={idx}
                    className={clsx(
                      "text-center px-5 py-6 text-lg font-medium",
                      idx === 0 && "text-start",
                      idx === 1
                        ? "text-foreground bg-foreground/10"
                        : "text-muted-foreground",
                    )}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-background/60">
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
                    className="border-t border-border hover:bg-foreground/10 transition-colors"
                  >
                    <td className="px-5 py-4 text-sm text-foreground/60 text-left">
                      {row.feature}
                    </td>
                    <td className="px-5 py-4 text-center font-medium bg-foreground/5">
                      <CellValue value={row.alertbox} isAlertBox />
                    </td>
                    <td className="px-5 py-4 text-center font-medium">
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
