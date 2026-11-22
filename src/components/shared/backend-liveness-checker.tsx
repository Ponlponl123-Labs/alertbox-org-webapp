"use client";

import { useEffect, useRef } from "react";
import { coreStore, SystemStatus } from "@/hooks/store/core";
import { getApiUrl } from "@/lib/api";
import { isSelfHosted } from "@/lib/instance";
import { isSafeHostname } from "@/lib/security";
import {
  BASE_INTERVAL_MS,
  MAX_BACKOFF_MS,
  REQUEST_TIMEOUT_MS,
  STATUS_URLS,
  VISIBILITY_COOLDOWN_MS,
} from "@/consts/status";
import type { BetterStackPayload } from "@/types/status.types";

export default function BackendLivenessChecker() {
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;
    const { setBackendAlive, setSystemStatuses } = coreStore.getState();

    let timer: number | null = null;
    let inFlight = false;
    let lastCheckedAt = 0;
    let failureCount = 0;
    let activeController: AbortController | null = null;

    const scheduleNext = () => {
      if (!activeRef.current) return;
      if (timer !== null) window.clearTimeout(timer);
      const delay = Math.min(
        BASE_INTERVAL_MS * Math.pow(2, Math.min(failureCount, 3)),
        MAX_BACKOFF_MS,
      );
      timer = window.setTimeout(() => {
        timer = null;
        void checkLiveness(false);
      }, delay);
    };

    const checkLiveness = async (fromVisibility: boolean): Promise<void> => {
      if (!activeRef.current) return;
      if (typeof document !== "undefined" && document.hidden) return;
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        setBackendAlive(false);
        scheduleNext();
        return;
      }
      if (inFlight) return;
      const now = Date.now();
      if (fromVisibility && now - lastCheckedAt < VISIBILITY_COOLDOWN_MS) return;

      inFlight = true;
      lastCheckedAt = now;
      activeController?.abort();
      const controller = new AbortController();
      activeController = controller;

      const signal =
        typeof AbortSignal !== "undefined" && typeof AbortSignal.any === "function" && typeof AbortSignal.timeout === "function"
          ? AbortSignal.any([controller.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)])
          : controller.signal;

      let isAlive = false;
      try {
        const res = await fetch(getApiUrl("/api/health"), { signal });
        isAlive = res.ok;
      } catch {
        isAlive = false;
      }

      if (!activeRef.current || controller.signal.aborted) {
        inFlight = false;
        return;
      }

      setBackendAlive(isAlive);
      failureCount = isAlive ? 0 : Math.min(failureCount + 1, 3);

      try {
        const selfHosted = await isSelfHosted();
        if (selfHosted || !activeRef.current || controller.signal.aborted) {
          if (selfHosted && activeRef.current) setSystemStatuses([]);
          return;
        }

        const results = await Promise.allSettled(
          STATUS_URLS.map(async (url) => {
            const res = await fetch(url, { signal });
            if (!res.ok) return null;
            const data: BetterStackPayload = await res.json();
            return { url, data };
          }),
        );

        const activeStatuses: SystemStatus[] = [];

        for (const res of results) {
          if (res.status !== "fulfilled" || !res.value?.data) continue;
          const { url, data } = res.value;
          const attr = data.data?.attributes;
          const included = data.included || [];

          const aggregateState = (attr?.aggregate_state || "").toLowerCase();
          const announcement = attr?.announcement?.trim() || null;

          const activeReport = included.find(
            (item) =>
              item.type === "status_report" &&
              item.attributes?.aggregate_state !== "resolved" &&
              (item.attributes?.report_type === "maintenance" ||
                item.attributes?.aggregate_state === "maintenance" ||
                item.attributes?.aggregate_state === "downtime" ||
                item.attributes?.aggregate_state === "degraded"),
          );

          const latestUpdate = included.find(
            (item) => item.type === "status_update" && item.attributes?.message,
          );

          const reportTitle = activeReport?.attributes?.title?.trim() || null;
          const message = announcement || reportTitle;
          const details = latestUpdate?.attributes?.message || null;
          const startsAt = activeReport?.attributes?.starts_at || null;
          const endsAt = activeReport?.attributes?.ends_at || null;
          const link = isSafeHostname(attr?.custom_domain)
            ? `https://${attr!.custom_domain!.trim()}`
            : url.replace(/\/index\.json$/, "");

          const isDown =
            aggregateState === "downtime" ||
            activeReport?.attributes?.aggregate_state === "downtime";
          const isDegraded =
            aggregateState === "degraded" ||
            activeReport?.attributes?.aggregate_state === "degraded";
          const isMaintenance =
            aggregateState === "maintenance" || !!activeReport;

          if (isDown) {
            activeStatuses.push({
              id: `down-${url}`,
              level: "down",
              title: reportTitle || announcement,
              message,
              details,
              startsAt,
              endsAt,
              link,
            });
          } else if (isDegraded) {
            activeStatuses.push({
              id: `degraded-${url}`,
              level: "degraded",
              title: reportTitle || announcement,
              message,
              details,
              startsAt,
              endsAt,
              link,
            });
          } else if (isMaintenance) {
            activeStatuses.push({
              id: `maintenance-${url}`,
              level: "maintenance",
              title: reportTitle || announcement,
              message,
              details,
              startsAt,
              endsAt,
              link,
            });
          }
        }

        if (activeRef.current && !controller.signal.aborted) {
          setSystemStatuses(activeStatuses);
        }
      } catch {
      } finally {
        inFlight = false;
        scheduleNext();
      }
    };

    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        void checkLiveness(true);
      }
    };

    const handleOnline = () => {
      void checkLiveness(false);
    };

    void checkLiveness(false);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);

    return () => {
      activeRef.current = false;
      activeController?.abort();
      if (timer !== null) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return null;
}
