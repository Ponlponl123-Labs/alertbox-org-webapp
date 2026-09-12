"use client";

import { useEffect, useRef } from "react";
import { useStore } from "zustand";
import { coreStore, SystemStatus } from "@/hooks/store/core";
import { getApiUrl } from "@/lib/api";

const STATUS_URLS = [
  "https://status.ponlponl123.com/index.json",
  "https://status.alertbox.org/index.json",
];

interface BetterStackPayload {
  data?: {
    attributes?: {
      company_name?: string;
      aggregate_state?: string;
      announcement?: string | null;
      custom_domain?: string;
    };
  };
  included?: Array<{
    type?: string;
    attributes?: {
      title?: string;
      report_type?: string;
      aggregate_state?: string;
      starts_at?: string;
      ends_at?: string;
      message?: string;
    };
  }>;
}

export default function BackendLivenessChecker() {
  const setBackendAlive = useStore(coreStore, (state) => state.setBackendAlive);
  const setSystemStatuses = useStore(coreStore, (state) => state.setSystemStatuses);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;

    const checkLiveness = async (): Promise<void> => {
      let isAlive = false;
      try {
        const res = await fetch(getApiUrl("/api/health"));
        isAlive = res.ok;
      } catch {
        isAlive = false;
      }

      if (!activeRef.current) return;
      setBackendAlive(isAlive);

      try {
        const results = await Promise.allSettled(
          STATUS_URLS.map(async (url) => {
            const res = await fetch(url);
            if (!res.ok) return null;
            const data: BetterStackPayload = await res.json();
            return { url, data };
          })
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
                item.attributes?.aggregate_state === "degraded")
          );

          const latestUpdate = included.find(
            (item) => item.type === "status_update" && item.attributes?.message
          );

          const reportTitle = activeReport?.attributes?.title?.trim() || null;
          const message = announcement || reportTitle;
          const details = latestUpdate?.attributes?.message || null;
          const startsAt = activeReport?.attributes?.starts_at || null;
          const endsAt = activeReport?.attributes?.ends_at || null;
          const link = attr?.custom_domain
            ? `https://${attr.custom_domain}`
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

        if (activeRef.current) {
          setSystemStatuses(activeStatuses);
        }
      } catch {
        // Silent fallback for external status check errors
      }
    };

    checkLiveness();
    const interval = setInterval(checkLiveness, 15000);

    return () => {
      activeRef.current = false;
      clearInterval(interval);
    };
  }, [setBackendAlive, setSystemStatuses]);

  return null;
}
