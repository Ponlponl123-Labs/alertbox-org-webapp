"use client";

import { useEffect, useRef } from "react";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { getApiUrl } from "@/lib/api";

export default function BackendLivenessChecker() {
  const setBackendAlive = useStore(coreStore, (state) => state.setBackendAlive);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;

    const checkLiveness = async (): Promise<void> => {
      try {
        const res = await fetch(getApiUrl("/api/health"));
        if (activeRef.current) {
          setBackendAlive(res.ok);
        }
      } catch {
        if (activeRef.current) {
          setBackendAlive(false);
        }
      }
    };

    checkLiveness();

    const interval = setInterval(checkLiveness, 15000);

    return () => {
      activeRef.current = false;
      clearInterval(interval);
    };
  }, [setBackendAlive]);

  return null;
}
