"use client";

import { motion, useReducedMotion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

interface WorkspaceSwitchSkeletonProps {
  type?: "org" | "streamer";
  label?: string;
}

function SwitchingPill({ label }: { label?: string }) {
  if (!label) return null;
  return (
    <div className="inline-flex items-center gap-2 rounded-xl bg-card p-3 text-xs font-medium text-muted-foreground select-none">
      <Spinner className="size-3.5 text-primary" />
      <span className="truncate max-w-56">{label}</span>
    </div>
  );
}

export function OrgSwitchSkeleton({ label }: { label?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      role="status"
      aria-busy="true"
      aria-label={label ? `Switching to ${label}` : "Loading organization"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-6 relative w-full"
    >
      <span className="sr-only">{label ? `Switching to ${label}` : "Loading organization"}</span>

      <div className="w-full mx-auto max-w-384 px-6 sm:px-12 pt-12 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
            <Skeleton className="h-10 sm:h-12 w-56 sm:w-80 rounded-xl" />
          </div>
          <SwitchingPill label={label} />
        </div>

        <Skeleton className="w-full h-36 rounded-xl" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-card/50 p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-24 rounded" />
                <Skeleton className="size-5 rounded-md" />
              </div>
              <Skeleton className="h-7 w-28 rounded-lg" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-card/50 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full mx-auto max-w-384 px-6 sm:px-12 pb-12">
        <div className="flex items-center justify-between bg-card/70 rounded-xl p-5">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-28 rounded-md" />
            <Skeleton className="h-4 w-44 rounded" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-1 flex flex-col gap-2">
              <Skeleton className="w-full aspect-square rounded-lg" />
              <Skeleton className="h-5 w-3/4 rounded-md mt-1" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function StreamerSwitchSkeleton({ label }: { label?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      role="status"
      aria-busy="true"
      aria-label={label ? `Switching to ${label}` : "Loading channel"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-6 relative w-full"
    >
      <span className="sr-only">{label ? `Switching to ${label}` : "Loading channel"}</span>

      <div className="w-full h-80 sm:h-96 mask-b-from-0% -mb-48 bg-muted/40 dark:bg-muted/20 shimmer-shiny" />

      <div className="w-full mx-auto max-w-7xl px-6 sm:px-12 pt-12 flex flex-col gap-6 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
          <div className="flex flex-col gap-4">
            <Skeleton className="size-36 rounded-full shrink-0" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <Skeleton className="h-8 sm:h-9 w-48 sm:w-64 rounded-lg" />
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>
              <Skeleton className="h-3.5 w-44 rounded" />
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-3">
            <SwitchingPill label={label} />
            <div className="flex items-center gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="size-9 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-card/50 p-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="size-6 rounded-md" />
              </div>
              <Skeleton className="h-8 w-32 rounded-lg" />
              <Skeleton className="h-3 w-full rounded" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function WorkspaceSwitchSkeleton({ type = "org", label }: WorkspaceSwitchSkeletonProps) {
  return type === "streamer" ? (
    <StreamerSwitchSkeleton label={label} />
  ) : (
    <OrgSwitchSkeleton label={label} />
  );
}
