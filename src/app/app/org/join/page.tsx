"use client";
import { motion, AnimatePresence } from "motion/react";
import { JoinOrgStep } from "../../(onboarding)";

export default function CreateOrgPage() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="bg-background absolute inset-0 pointer-events-none" />
      <motion.div
        className="flex-1 flex flex-col items-center justify-center min-h-dvh w-full gap-8 z-10">
        <AnimatePresence mode="wait">
          <JoinOrgStep />
        </AnimatePresence>
      </motion.div>
    </>
  );
}
