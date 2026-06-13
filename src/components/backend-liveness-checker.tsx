"use client";

import { useEffect, useRef } from "react";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";

/**
 * BackendLivenessChecker is a client-side component that periodically
 * checks the liveness of the API backend server.
 * It polls the `/api/health` endpoint and updates the global `coreStore` state.
 *
 * @returns {null} This component does not render any visual UI elements.
 */
export default function BackendLivenessChecker() {
  const setBackendAlive = useStore(coreStore, (state) => state.setBackendAlive);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;

    /**
     * Performs a fetch request to the backend health endpoint and updates the status.
     *
     * @returns {Promise<void>}
     */
    const checkLiveness = async (): Promise<void> => {
      try {
        const res = await fetch("/api/health");
        if (activeRef.current) {
          setBackendAlive(res.ok);
        }
      } catch (error) {
        if (activeRef.current) {
          setBackendAlive(false);
        }
      }
    };

    // Run health check immediately on mount
    checkLiveness();

    // Set up a periodic check every 15 seconds
    const interval = setInterval(checkLiveness, 15000);

    return () => {
      activeRef.current = false;
      clearInterval(interval);
    };
  }, [setBackendAlive]);

  return null;
}
