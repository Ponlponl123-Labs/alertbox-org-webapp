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
    <section className="w-full py-24 md:py-32 relative border-t border-foreground/10 bg-foreground/1">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-5xl mx-auto px-6 z-10 relative"
      >
        <div className="max-w-2xl mx-auto mb-14 text-center">
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-foreground/10 bg-foreground/3 mb-4"
          >
            <span className="text-xs font-mono font-medium tracking-wider text-foreground/70 uppercase">
              {t.subtitle || "The Difference"}
            </span>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4"
          >
            {t.title.split(/(alertbox(?:\.org)?)/i).map((part, idx) =>
              /alertbox(?:\.org)?/i.test(part) ? (
                <span
                  key={idx}
                  className="bg-linear-to-r from-rose-300 to-foreground bg-clip-text text-transparent"
                >
                  {part}
                </span>
              ) : (
                part
              ),
            )}
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-sm md:text-base text-foreground/60 leading-relaxed font-normal"
          >
            {t.description}
          </motion.p>
        </div>
        <motion.div
          variants={fadeInUp}
          className="w-full overflow-x-auto rounded-3xl border border-foreground/15 bg-card/80 backdrop-blur-md shadow-xl"
        >
          <table className="w-full border-collapse **:font-heading **:tracking-wider min-w-125">
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
