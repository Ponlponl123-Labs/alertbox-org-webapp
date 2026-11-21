"use client";

import {
  useRef,
  useCallback,
  useState,
  useEffect,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from "react";

interface BorderGlowProps {
  children?: ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  fillOpacity?: number;
}

function parseHSL(hslStr: string): { h: number; s: number; l: number } {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return {
    h: parseFloat(match[1]),
    s: parseFloat(match[2]),
    l: parseFloat(match[3]),
  };
}

function buildBoxShadow(glowColor: string, intensity: number): string {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const layers: [number, number, number, number, number, boolean][] = [
    [0, 0, 0, 1, 100, true],
    [0, 0, 1, 0, 60, true],
    [0, 0, 3, 0, 50, true],
    [0, 0, 6, 0, 40, true],
    [0, 0, 15, 0, 30, true],
    [0, 0, 25, 2, 20, true],
    [0, 0, 50, 2, 10, true],
    [0, 0, 1, 0, 60, false],
    [0, 0, 3, 0, 50, false],
    [0, 0, 6, 0, 40, false],
    [0, 0, 15, 0, 30, false],
    [0, 0, 25, 2, 20, false],
    [0, 0, 50, 2, 10, false],
  ];
  return layers
    .map(([x, y, blur, spread, alpha, inset]) => {
      const a = Math.min(alpha * intensity, 100);
      return `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px hsl(${base} / ${a}%)`;
    })
    .join(", ");
}

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}
function easeInCubic(x: number) {
  return x * x * x;
}

interface AnimateOpts {
  start?: number;
  end?: number;
  duration?: number;
  delay?: number;
  ease?: (t: number) => number;
  onUpdate: (v: number) => void;
  onEnd?: () => void;
}

function animateValue({
  start = 0,
  end = 100,
  duration = 1000,
  delay = 0,
  ease = easeOutCubic,
  onUpdate,
  onEnd,
}: AnimateOpts): () => void {
  let rafId = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let isCancelled = false;

  const t0 = performance.now() + delay;
  function tick() {
    if (isCancelled) return;
    const elapsed = performance.now() - t0;
    const t = Math.min(elapsed / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) {
      rafId = requestAnimationFrame(tick);
    } else if (onEnd) {
      onEnd();
    }
  }

  timeoutId = setTimeout(() => {
    if (!isCancelled) rafId = requestAnimationFrame(tick);
  }, delay);

  return () => {
    isCancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
    if (rafId) cancelAnimationFrame(rafId);
  };
}

const GRADIENT_POSITIONS = [
  "80% 55%",
  "69% 34%",
  "8% 6%",
  "41% 38%",
  "86% 85%",
  "82% 18%",
  "51% 4%",
];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildMeshGradients(colors: string[]): string[] {
  const gradients: string[] = [];
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    gradients.push(
      `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`,
    );
  }
  gradients.push(`linear-gradient(${colors[0]} 0 100%)`);
  return gradients;
}

const BorderGlow: React.FC<BorderGlowProps> = ({
  children,
  className = "",
  edgeSensitivity = 30,
  glowColor = "40 80 80",
  backgroundColor = "#120F17",
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1.0,
  coneSpread = 25,
  animated = false,
  colors = ["#c084fc", "#f472b6", "#38bdf8"],
  fillOpacity = 0.5,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef({
    angle: animated ? 110 : 45,
    proximity: 0,
    visible: animated,
  });
  const [isVisible, setIsVisible] = useState(animated);

  const colorSensitivity = edgeSensitivity + 20;

  const flushStyles = useCallback(() => {
    rafRef.current = 0;
    const card = cardRef.current;
    if (!card) return;
    const { angle, proximity, visible } = stateRef.current;
    const borderOp = visible
      ? Math.max(0, (proximity * 100 - colorSensitivity) / Math.max(1, 100 - colorSensitivity))
      : 0;
    const glowOp = visible
      ? Math.max(0, (proximity * 100 - edgeSensitivity) / Math.max(1, 100 - edgeSensitivity))
      : 0;
    card.style.setProperty("--bg-angle", `${angle.toFixed(2)}deg`);
    card.style.setProperty("--bg-border-op", borderOp.toFixed(4));
    card.style.setProperty("--bg-fill-op", (borderOp * fillOpacity).toFixed(4));
    card.style.setProperty("--bg-glow-op", glowOp.toFixed(4));
  }, [colorSensitivity, edgeSensitivity, fillOpacity]);

  const scheduleFlush = useCallback(() => {
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(flushStyles);
    }
  }, [flushStyles]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    flushStyles();
    const invalidateRect = () => {
      rectRef.current = null;
    };
    const ro = new ResizeObserver(invalidateRect);
    ro.observe(card);
    window.addEventListener("scroll", invalidateRect, { passive: true, capture: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", invalidateRect, { capture: true });
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [flushStyles]);

  const handlePointerEnter = useCallback(() => {
    const card = cardRef.current;
    if (card) rectRef.current = card.getBoundingClientRect();
    stateRef.current.visible = true;
    setIsVisible(true);
    scheduleFlush();
  }, [scheduleFlush]);

  const handlePointerLeave = useCallback(() => {
    stateRef.current.visible = false;
    stateRef.current.proximity = 0;
    rectRef.current = null;
    setIsVisible(false);
    scheduleFlush();
  }, [scheduleFlush]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = rectRef.current ?? card.getBoundingClientRect();
      rectRef.current = rect;
      const cx = rect.width * 0.5;
      const cy = rect.height * 0.5;
      const dx = e.clientX - rect.left - cx;
      const dy = e.clientY - rect.top - cy;
      let kx = Infinity;
      let ky = Infinity;
      if (dx !== 0) kx = cx / Math.abs(dx);
      if (dy !== 0) ky = cy / Math.abs(dy);
      stateRef.current.proximity = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
      stateRef.current.angle =
        dx === 0 && dy === 0
          ? 0
          : (Math.atan2(dy, dx) * (180 / Math.PI) + 90 + 360) % 360;
      scheduleFlush();
    },
    [scheduleFlush],
  );

  useEffect(() => {
    if (!animated) return;
    const angleStart = 110;
    const angleEnd = 465;
    stateRef.current.visible = true;

    const c1 = animateValue({
      duration: 500,
      onUpdate: (v) => {
        stateRef.current.proximity = v / 100;
        scheduleFlush();
      },
    });
    const c2 = animateValue({
      ease: easeInCubic,
      duration: 1500,
      end: 50,
      onUpdate: (v) => {
        stateRef.current.angle = (angleEnd - angleStart) * (v / 100) + angleStart;
        scheduleFlush();
      },
    });
    const c3 = animateValue({
      ease: easeOutCubic,
      delay: 1500,
      duration: 2250,
      start: 50,
      end: 100,
      onUpdate: (v) => {
        stateRef.current.angle = (angleEnd - angleStart) * (v / 100) + angleStart;
        scheduleFlush();
      },
    });
    const c4 = animateValue({
      ease: easeInCubic,
      delay: 2500,
      duration: 1500,
      start: 100,
      end: 0,
      onUpdate: (v) => {
        stateRef.current.proximity = v / 100;
        scheduleFlush();
      },
      onEnd: () => {
        stateRef.current.visible = false;
        setIsVisible(false);
        scheduleFlush();
      },
    });

    return () => {
      c1();
      c2();
      c3();
      c4();
    };
  }, [animated, scheduleFlush]);

  const colorsKey = colors.join("|");
  const { borderBg, fillBg } = useMemo(() => {
    const meshGradients = buildMeshGradients(colors);
    return {
      borderBg: meshGradients.map((g) => `${g} border-box`),
      fillBg: meshGradients.map((g) => `${g} padding-box`),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorsKey]);

  const boxShadow = useMemo(
    () => buildBoxShadow(glowColor, glowIntensity),
    [glowColor, glowIntensity],
  );

  const transition = isVisible
    ? "opacity 0.25s ease-out"
    : "opacity 0.75s ease-in-out";

  const borderMask = `conic-gradient(from var(--bg-angle, 45deg) at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`;
  const fillMask = [
    "linear-gradient(to bottom, black, black)",
    "radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)",
    "radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%)",
    "radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%)",
    "radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%)",
    "radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%)",
    "conic-gradient(from var(--bg-angle, 45deg) at center, transparent 5%, black 15%, black 85%, transparent 95%)",
  ].join(", ");
  const glowMask =
    "conic-gradient(from var(--bg-angle, 45deg) at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)";

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`relative isolate border border-white/15 flex ${className}`}
      style={
        {
          background: backgroundColor,
          borderRadius: `${borderRadius}px`,
          transform: "translate3d(0, 0, 0.01px)",
          boxShadow:
            "rgba(0,0,0,0.1) 0 1px 2px, rgba(0,0,0,0.1) 0 2px 4px, rgba(0,0,0,0.1) 0 4px 8px, rgba(0,0,0,0.1) 0 8px 16px, rgba(0,0,0,0.1) 0 16px 32px, rgba(0,0,0,0.1) 0 32px 64px",
        } as CSSProperties
      }
    >
      <div
        className="absolute inset-0 rounded-[inherit] -z-[1]"
        style={{
          border: "1px solid transparent",
          background: [
            `linear-gradient(${backgroundColor} 0 100%) padding-box`,
            "linear-gradient(rgb(255 255 255 / 0%) 0% 100%) border-box",
            ...borderBg,
          ].join(", "),
          opacity: "var(--bg-border-op, 0)",
          maskImage: borderMask,
          WebkitMaskImage: borderMask,
          transition,
        }}
      />

      <div
        className="absolute inset-0 rounded-[inherit] -z-[1]"
        style={
          {
            border: "1px solid transparent",
            background: fillBg.join(", "),
            maskImage: fillMask,
            WebkitMaskImage: fillMask,
            maskComposite: "subtract, add, add, add, add, add",
            WebkitMaskComposite:
              "source-out, source-over, source-over, source-over, source-over, source-over",
            opacity: "var(--bg-fill-op, 0)",
            mixBlendMode: "soft-light",
            transition,
          } as CSSProperties
        }
      />

      <span
        className="absolute pointer-events-none z-[1] rounded-[inherit]"
        style={
          {
            inset: `${-glowRadius}px`,
            maskImage: glowMask,
            WebkitMaskImage: glowMask,
            opacity: "var(--bg-glow-op, 0)",
            mixBlendMode: "plus-lighter",
            transition,
          } as CSSProperties
        }
      >
        <span
          className="absolute rounded-[inherit]"
          style={{
            inset: `${glowRadius}px`,
            boxShadow,
          }}
        />
      </span>

      <div className="flex flex-col relative w-full min-w-0 flex-1 z-1">
        {children}
      </div>
    </div>
  );
};

export default BorderGlow;
