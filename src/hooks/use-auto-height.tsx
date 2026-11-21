'use client';

import * as React from 'react';

type AutoHeightOptions = {
  includeParentBox?: boolean;
  includeSelfBox?: boolean;
};

export function useAutoHeight<T extends HTMLElement = HTMLDivElement>(
  deps: React.DependencyList = [],
  options: AutoHeightOptions = {
    includeParentBox: true,
    includeSelfBox: false,
  },
) {
  const elRef = React.useRef<T | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const [mountCount, setMountCount] = React.useState(0);
  const [height, setHeight] = React.useState(0);

  const includeParentBox = options.includeParentBox;
  const includeSelfBox = options.includeSelfBox;

  const ref = React.useCallback((node: T | null) => {
    elRef.current = node;
    if (node) setMountCount((c) => c + 1);
  }, []);

  const measure = React.useCallback(() => {
    const el = elRef.current;
    if (!el) return 0;

    const base = el.getBoundingClientRect().height || 0;

    let extra = 0;

    if (includeParentBox && el.parentElement) {
      const cs = getComputedStyle(el.parentElement);
      const paddingY =
        (parseFloat(cs.paddingTop || '0') || 0) +
        (parseFloat(cs.paddingBottom || '0') || 0);
      const borderY =
        (parseFloat(cs.borderTopWidth || '0') || 0) +
        (parseFloat(cs.borderBottomWidth || '0') || 0);
      if (cs.boxSizing === 'border-box') {
        extra += paddingY + borderY;
      }
    }

    if (includeSelfBox) {
      const cs = getComputedStyle(el);
      const paddingY =
        (parseFloat(cs.paddingTop || '0') || 0) +
        (parseFloat(cs.paddingBottom || '0') || 0);
      const borderY =
        (parseFloat(cs.borderTopWidth || '0') || 0) +
        (parseFloat(cs.borderBottomWidth || '0') || 0);
      if (cs.boxSizing === 'border-box') {
        extra += paddingY + borderY;
      }
    }

    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    return Math.ceil((base + extra) * dpr) / dpr;
  }, [includeParentBox, includeSelfBox]);

  React.useEffect(() => {
    let ro: ResizeObserver | null = null;

    const scheduleMeasure = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const next = measure();
        setHeight((prev) => (prev === next ? prev : next));
      });
    };

    const timer = window.setTimeout(() => {
      const el = elRef.current;
      if (!el) return;
      scheduleMeasure();

      ro = new ResizeObserver(scheduleMeasure);
      ro.observe(el);
      if (includeParentBox && el.parentElement) {
        ro.observe(el.parentElement);
      }
    }, 50);

    return () => {
      window.clearTimeout(timer);
      ro?.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mountCount, measure, includeParentBox, ...deps]);

  return { ref, height } as const;
}
