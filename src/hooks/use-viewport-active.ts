"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export function useViewportActive<T extends HTMLElement = HTMLDivElement>(
  options: { rootMargin?: string; threshold?: number; respectReducedMotion?: boolean } = {},
) {
  const { rootMargin = "80px", threshold = 0, respectReducedMotion = true } = options;
  const nodeRef = useRef<T | null>(null);
  const [mountCount, setMountCount] = useState(0);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(
    typeof document !== "undefined" ? !document.hidden : true,
  );
  const [reducedMotion, setReducedMotion] = useState(false);

  const callbackRef = useCallback((node: T | null) => {
    nodeRef.current = node;
    if (node) setMountCount((c) => c + 1);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReducedMotion(mq.matches);
    onMotion();
    mq.addEventListener("change", onMotion);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      mq.removeEventListener("change", onMotion);
    };
  }, []);

  useEffect(() => {
    const el = nodeRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setInView(entry.isIntersecting);
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mountCount, rootMargin, threshold]);

  const isActive = inView && tabVisible && (!respectReducedMotion || !reducedMotion);
  return { ref: callbackRef, nodeRef, isActive, inView, tabVisible, reducedMotion };
}
