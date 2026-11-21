"use client";

/**
 * @author: @dorianbaffier (enhanced for Alertbox by Antigravity)
 * @description: Interactive Physics Pull Cord Lamp with Theme Binding
 * @version: 1.1.0
 * @license: MIT
 * @website: https://kokonutui.com
 */

import {
  type PointerEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { cn } from "@/lib/utils";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";

const WIDTH = 288;
const HEIGHT = 360;
// Where the cord hangs from, under the lamp shade.
const ANCHOR = { x: WIDTH / 2 + 36, y: 116 };
// The cord is a chain of points joined by fixed-length links.
const LINKS = 12;
const LINK = 8.5;
// Simulation, in px and seconds. Fixed step keeps the chain stable on any refresh rate.
const STEP = 1 / 120;
const GRAVITY = 1400;
const DAMPING = 0.992;
// Fastest a link may move in one step.
const MAX_SPEED = 4;
// A cord has a little stiffness: points never get closer than this to prevent kinking.
const BEND_MIN = LINK * 1.9;
const BEND_STIFFNESS = 0.8;
const ITERATIONS = 14;
// Switch threshold past resting length.
const CLICK_PULL = 22;
const MAX_STRETCH = 34;
// Chain resting epsilon.
const REST_EPSILON = 0.015;
const REST_STEPS = 24;

function damp(distance: number, max: number) {
  return max * (1 - Math.exp(-distance / max));
}

function haptic() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(8);
    } catch {}
  }
}

let sharedAudioCtx: AudioContext | null = null;

function playClickSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
      sharedAudioCtx = new AudioContextClass();
    }
    const ctx = sharedAudioCtx;
    if (ctx.state === "suspended") {
      void ctx.resume().catch(() => {});
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.035);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  } catch {}
}

function relax(
  chain: { xs: Float64Array; ys: Float64Array; held: number },
  a: number,
  b: number,
  length: number,
  bend: boolean
) {
  const { xs, ys, held } = chain;
  const aFixed = a === 0 || a === held;
  const bFixed = b === held;
  if (aFixed && bFixed) return;

  const dx = xs[b] - xs[a];
  const dy = ys[b] - ys[a];
  const dist = Math.hypot(dx, dy) || 0.0001;
  if (bend && dist >= length) return;

  const diff = ((dist - length) / dist) * (bend ? BEND_STIFFNESS : 1);
  let wa = 0.5;
  if (aFixed) {
    wa = 0;
  } else if (bFixed) {
    wa = 1;
  }
  xs[a] += dx * diff * wa;
  ys[a] += dy * diff * wa;
  xs[b] -= dx * diff * (1 - wa);
  ys[b] -= dy * diff * (1 - wa);
}

function cordPath(xs: Float64Array, ys: Float64Array) {
  let d = `M${xs[0].toFixed(2)} ${ys[0].toFixed(2)}`;
  for (let i = 1; i < xs.length - 1; i++) {
    const mx = (xs[i] + xs[i + 1]) / 2;
    const my = (ys[i] + ys[i + 1]) / 2;
    d += ` Q${xs[i].toFixed(2)} ${ys[i].toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)}`;
  }
  const n = xs.length - 1;
  d += ` L${xs[n].toFixed(2)} ${ys[n].toFixed(2)}`;
  return d;
}

function restingChain() {
  const xs = new Float64Array(LINKS + 1);
  const ys = new Float64Array(LINKS + 1);
  for (let i = 0; i <= LINKS; i++) {
    xs[i] = ANCHOR.x;
    ys[i] = ANCHOR.y + i * LINK;
  }
  return { xs, ys };
}

const REST = restingChain();
const REST_PATH = cordPath(REST.xs, REST.ys);
const emptySubscribe = () => () => {};
const getClientTrue = () => true;
const getServerFalse = () => false;

export interface PullCordProps {
  /** Controlled state. If omitted and bindTheme is true, syncs with coreStore. */
  checked?: boolean;
  /** Initial state when uncontrolled and bindTheme is false. */
  defaultChecked?: boolean;
  /** Callback on state change. */
  onCheckedChange?: (checked: boolean) => void;
  /** Automatically sync with and toggle coreStore theme (default: true). */
  bindTheme?: boolean;
  /** Theme mapping: "light-on" means lamp ON in light mode; "dark-on" means lamp ON in dark mode. Default: "light-on". */
  themeMode?: "light-on" | "dark-on";
  /** Optional audio click sound synthesis (default: true). */
  sound?: boolean;
  /** Scaling factor for sizing (default: 1). */
  scale?: number;
  /** Accessible name of the switch. */
  label?: string;
  className?: string;
}

export default function PullCord({
  checked: checkedProp,
  defaultChecked = true,
  onCheckedChange,
  bindTheme = true,
  themeMode = "light-on",
  sound = true,
  scale = 1,
  label = "Desk lamp theme toggle",
  className,
}: PullCordProps) {
  const glowId = `lamp-bulb-glow-${useId().replace(/:/g, "")}`;
  const mounted = useSyncExternalStore(emptySubscribe, getClientTrue, getServerFalse);
  const isDark = useStore(coreStore, (s) => s.isDark);
  const themeChecked = themeMode === "dark-on" ? isDark : !isDark;
  const isControlled = checkedProp !== undefined;
  const [internal, setInternal] = useState(defaultChecked);
  const checked = isControlled
    ? checkedProp
    : bindTheme
      ? (mounted ? themeChecked : (themeMode === "dark-on" ? true : false))
      : internal;

  const [focused, setFocused] = useState(false);
  const [grabbing, setGrabbing] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const cordRef = useRef<SVGPathElement>(null);
  const hitRef = useRef<SVGPathElement>(null);
  const beadRef = useRef<SVGGElement>(null);

  const sim = useRef({
    xs: Float64Array.from(REST.xs),
    ys: Float64Array.from(REST.ys),
    pxs: Float64Array.from(REST.xs),
    pys: Float64Array.from(REST.ys),
    raf: 0,
    last: 0,
    carry: 0,
    still: 0,
    held: -1,
    targetX: 0,
    targetY: 0,
    armed: true,
    reduceMotion: false,
  });

  const toggle = useCallback(
    (next: boolean) => {
      if (!isControlled && !bindTheme) {
        setInternal(next);
      }
      if (bindTheme) {
        coreStore.getState().toggleTheme();
      }
      onCheckedChange?.(next);
    },
    [isControlled, bindTheme, onCheckedChange]
  );

  const latest = useRef<{ checked: boolean; toggle: (next: boolean) => void }>({
    checked,
    toggle,
  });

  useEffect(() => {
    latest.current = { checked, toggle };
  }, [checked, toggle]);

  const draw = useCallback(() => {
    const { xs, ys } = sim.current;
    const d = cordPath(xs, ys);
    cordRef.current?.setAttribute("d", d);
    hitRef.current?.setAttribute("d", d);
    const n = LINKS;
    const angle =
      (Math.atan2(xs[n] - xs[n - 1], ys[n] - ys[n - 1]) * 180) / Math.PI;
    beadRef.current?.setAttribute(
      "transform",
      `translate(${xs[n].toFixed(2)} ${ys[n].toFixed(2)}) rotate(${(-angle).toFixed(2)})`
    );
  }, []);

  const integrate = useCallback(() => {
    const s = sim.current;
    const { xs, ys, pxs, pys } = s;
    let moved = 0;
    for (let i = 1; i <= LINKS; i++) {
      if (i === s.held) continue;
      let vx = (xs[i] - pxs[i]) * DAMPING;
      let vy = (ys[i] - pys[i]) * DAMPING;
      const speed = Math.hypot(vx, vy);
      if (speed > MAX_SPEED) {
        vx *= MAX_SPEED / speed;
        vy *= MAX_SPEED / speed;
      }
      pxs[i] = xs[i];
      pys[i] = ys[i];
      xs[i] += vx;
      ys[i] += vy + GRAVITY * STEP * STEP;
      moved = Math.max(moved, Math.abs(vx) + Math.abs(vy));
    }
    if (s.held > 0) {
      const i = s.held;
      moved = Math.max(
        moved,
        Math.abs(s.targetX - xs[i]) + Math.abs(s.targetY - ys[i])
      );
      pxs[i] = xs[i];
      pys[i] = ys[i];
      xs[i] = s.targetX;
      ys[i] = s.targetY;
    }
    return moved;
  }, []);

  const constrain = useCallback(() => {
    const s = sim.current;
    for (let k = 0; k < ITERATIONS; k++) {
      for (let i = 0; i < LINKS; i++) {
        relax(s, i, i + 1, LINK, false);
      }
      for (let i = 0; i + 2 <= LINKS; i++) {
        relax(s, i, i + 2, BEND_MIN, true);
      }
    }
  }, []);

  const step = useCallback(() => {
    const moved = integrate();
    constrain();
    return moved;
  }, [integrate, constrain]);

  const tickRef = useRef<(now: number) => void>(() => {});
  const tick = useCallback(
    (now: number) => {
      const s = sim.current;
      s.raf = 0;
      const elapsed = s.last ? Math.min((now - s.last) / 1000, 0.05) : STEP;
      s.last = now;
      s.carry += elapsed;
      let moved = 0;
      while (s.carry >= STEP) {
        moved = Math.max(moved, step());
        s.carry -= STEP;
      }
      draw();
      s.still = moved < REST_EPSILON ? s.still + 1 : 0;
      if (s.held > 0 || s.still < REST_STEPS) {
        s.raf = requestAnimationFrame((n) => tickRef.current(n));
      } else {
        s.last = 0;
      }
    },
    [draw, step]
  );

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  const wake = useCallback(() => {
    const s = sim.current;
    s.still = 0;
    if (!s.raf) {
      s.raf = requestAnimationFrame(tick);
    }
  }, [tick]);

  const triggerKeyboardPull = useCallback(() => {
    const s = sim.current;
    if (s.held > 0) return;
    haptic();
    if (sound) playClickSound();
    latest.current.toggle(!latest.current.checked);
    for (let i = 1; i <= LINKS; i++) {
      s.ys[i] += (i / LINKS) * 28;
    }
    wake();
  }, [sound, wake]);

  useEffect(() => {
    const s = sim.current;
    s.reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    return () => cancelAnimationFrame(s.raf);
  }, []);

  const localPoint = (event: PointerEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: ((event.clientX - rect.left) / rect.width) * WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
    };
  };

  const reach = (index: number, x: number, y: number) => {
    const dx = x - ANCHOR.x;
    const dy = y - ANCHOR.y;
    const dist = Math.hypot(dx, dy) || 0.0001;
    const length = index * LINK;
    if (dist <= length) return { x, y, pull: 0 };
    const allowed = length + damp(dist - length, MAX_STRETCH);
    return {
      x: ANCHOR.x + (dx / dist) * allowed,
      y: ANCHOR.y + (dy / dist) * allowed,
      pull: dy > 0 ? (allowed - length) * (dy / dist) : 0,
    };
  };

  const handlePointerDown = (event: PointerEvent<SVGElement>) => {
    const s = sim.current;
    if (s.held > 0) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    const point = localPoint(event);
    let nearest = LINKS;
    let best = Number.POSITIVE_INFINITY;
    for (let i = 1; i <= LINKS; i++) {
      const d = Math.hypot(s.xs[i] - point.x, s.ys[i] - point.y);
      if (d < best) {
        best = d;
        nearest = i;
      }
    }
    svgRef.current?.setPointerCapture(event.pointerId);
    s.held = nearest;
    s.targetX = s.xs[nearest];
    s.targetY = s.ys[nearest];
    s.armed = true;
    setGrabbing(true);
    wake();
  };

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const s = sim.current;
    if (s.held < 0) return;
    const point = localPoint(event);
    const target = reach(s.held, point.x, point.y);
    s.targetX = target.x;
    s.targetY = target.y;
    if (s.armed && target.pull > CLICK_PULL) {
      s.armed = false;
      haptic();
      if (sound) playClickSound();
      latest.current.toggle(!latest.current.checked);
    } else if (!s.armed && target.pull < CLICK_PULL * 0.4) {
      s.armed = true;
    }
    wake();
  };

  const handlePointerUp = () => {
    const s = sim.current;
    if (s.held < 0) return;
    s.held = -1;
    setGrabbing(false);
    if (s.reduceMotion) {
      s.xs.set(REST.xs);
      s.ys.set(REST.ys);
      s.pxs.set(REST.xs);
      s.pys.set(REST.ys);
      draw();
      return;
    }
    wake();
  };

  const width = Math.round(WIDTH * scale);
  const height = Math.round(HEIGHT * scale);

  return (
    <div
      className={cn(
        "relative select-none overflow-hidden transition-colors duration-300 ease-out",
        className
      )}
      style={{ width, height }}
      suppressHydrationWarning
    >
      <svg
        className={cn(
          "w-full h-full touch-none",
          grabbing ? "cursor-grabbing" : "cursor-default"
        )}
        onLostPointerCapture={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        suppressHydrationWarning
      >
        <defs>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle
          aria-hidden="true"
          cx={WIDTH / 2}
          cy={120}
          r={80}
          fill={`url(#${glowId})`}
          className={cn(
            "pointer-events-none transition-opacity duration-300",
            checked ? "opacity-100" : "opacity-0"
          )}
          suppressHydrationWarning
        />

        {/* Ceiling wire */}
        <line
          className={cn(
            "transition-[stroke] duration-300 ease-out",
            checked ? "stroke-zinc-400 dark:stroke-zinc-300" : "stroke-zinc-700 dark:stroke-zinc-800"
          )}
          strokeWidth={1.5}
          x1={WIDTH / 2}
          x2={WIDTH / 2}
          y1={0}
          y2={62}
        />

        {/* Lamp shade */}
        <path
          className={cn(
            "transition-[fill] duration-300 ease-out",
            checked ? "fill-zinc-900 dark:fill-zinc-800" : "fill-zinc-750 dark:fill-zinc-900"
          )}
          d={`M${WIDTH / 2 - 14} 62 h28 l38 50 q2 4 -3 4 h-98 q-5 0 -3 -4 Z`}
        />

        {/* Light bulb with drop-shadow glow */}
        <path
          className={cn(
            "transition-[fill,filter] duration-300 ease-out",
            checked
              ? "fill-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]"
              : "fill-zinc-600 dark:fill-zinc-700"
          )}
          d={`M${WIDTH / 2 - 15} 116 a15 13 0 0 0 30 0 Z`}
        />

        {/* Physical Cord Path */}
        <path
          className={cn(
            "transition-[stroke] duration-300 ease-out",
            checked ? "stroke-zinc-400" : "stroke-zinc-600"
          )}
          d={REST_PATH}
          fill="none"
          ref={cordRef}
          strokeLinecap="round"
          strokeWidth={1.5}
        />

        {/* Wide invisible grab target for cord */}
        <path
          className={cn(!grabbing && "cursor-grab")}
          d={REST_PATH}
          fill="none"
          onPointerDown={handlePointerDown}
          pointerEvents="stroke"
          ref={hitRef}
          stroke="transparent"
          strokeWidth={22}
        />

        {/* Bottom Grab Bead with Keyboard Accessibility */}
        <g
          className={cn(!grabbing && "cursor-grab", "outline-hidden")}
          onPointerDown={handlePointerDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              triggerKeyboardPull();
            }
          }}
          ref={beadRef}
          role="switch"
          aria-checked={checked}
          aria-label={label}
          tabIndex={0}
          transform={`translate(${ANCHOR.x} ${ANCHOR.y + LINKS * LINK})`}
        >
          <circle fill="transparent" r={20} />
          {focused && (
            <rect
              className="fill-none stroke-primary"
              height={30}
              rx={9}
              strokeWidth={2}
              width={20}
              x={-10}
              y={-4}
            />
          )}
          <rect
            className={cn(
              "transition-[fill] duration-300 ease-out",
              checked ? "fill-zinc-800 dark:fill-zinc-200" : "fill-zinc-400 dark:fill-zinc-600"
            )}
            height={20}
            rx={5}
            width={10}
            x={-5}
            y={1}
          />
        </g>
      </svg>
    </div>
  );
}
