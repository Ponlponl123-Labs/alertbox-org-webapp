"use client";

import { useEffect, useRef, useCallback } from "react";
import createGlobe from "cobe";

export interface BarMarker {
  id: string;
  location: [number, number];
  value: number;
  label: string;
}

interface GlobeBarsProps {
  markers?: BarMarker[];
  className?: string;
  speed?: number;
  dark?: boolean;
  focusLocation?: [number, number] | null;
  focusedMarkerId?: string | null;
  zoomScale?: number;
}

const defaultMarkers: BarMarker[] = [
  { id: "bar-1", location: [40.71, -74.01], value: 85, label: "NYC" },
  { id: "bar-2", location: [51.51, -0.13], value: 62, label: "London" },
  { id: "bar-3", location: [35.68, 139.65], value: 94, label: "Tokyo" },
  { id: "bar-4", location: [1.35, 103.82], value: 78, label: "Singapore" },
];

export function GlobeBars({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
  dark,
  focusLocation = null,
  focusedMarkerId = null,
  zoomScale = 1.18,
}: GlobeBarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isHoveredRef = useRef(false);
  const isDarkMode = dark ?? false;

  const focusLocationRef = useRef<[number, number] | null>(focusLocation);
  const zoomScaleRef = useRef(zoomScale);

  useEffect(() => {
    focusLocationRef.current = focusLocation;
    zoomScaleRef.current = zoomScale;
  }, [focusLocation, zoomScale]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
    }
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        };
      }
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerUp]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let globe: ReturnType<typeof createGlobe> | null = null;
    let animationId: number;
    let phi = 0;

    function init() {
      const width = canvas.offsetWidth;
      if (width === 0 || globe) return;

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.2,
        scale: 1,
        dark: isDarkMode ? 1 : 0,
        diffuse: 1.5,
        mapSamples: 16000,
        mapBrightness: isDarkMode ? 6 : 9,
        baseColor: isDarkMode ? [0.22, 0.22, 0.26] : [1, 1, 1],
        markerColor: [0.15, 0.55, 0.55],
        glowColor: isDarkMode ? [0.12, 0.16, 0.25] : [0.94, 0.93, 0.91],
        markerElevation: 0,
        markers: markers.map((m) => ({ location: m.location, size: 0.02, id: m.id })),
        arcs: [],
        arcColor: [0.2, 0.6, 0.6],
        arcWidth: 0.5,
        arcHeight: 0.25,
        opacity: 0.7,
      });

      let currentVelocity = speed;
      let currentScale = 1;
      let theta = 0.2;

      function animate() {
        const isInteracting = pointerInteracting.current !== null;
        const focus = focusLocationRef.current;

        if (isInteracting) {
          currentVelocity = 0;
        } else if (focus) {
          const [lat, lon] = focus;
          const targetPhi = -(lon * Math.PI / 180) - Math.PI / 2;
          const targetTheta = Math.max(-0.4, Math.min(0.5, (lat * Math.PI) / 180));

          let diffPhi = (targetPhi - (phi + phiOffsetRef.current)) % (2 * Math.PI);
          if (diffPhi > Math.PI) diffPhi -= 2 * Math.PI;
          if (diffPhi < -Math.PI) diffPhi += 2 * Math.PI;

          phi += diffPhi * 0.06;
          theta += (targetTheta - theta) * 0.06;
          currentVelocity = 0;
        } else {
          const targetVelocity = isHoveredRef.current ? 0 : speed;
          currentVelocity += (targetVelocity - currentVelocity) * 0.05;
          phi += currentVelocity;
          theta += (0.2 - theta) * 0.05;
        }

        const targetScale = focus ? zoomScaleRef.current : 1;
        currentScale += (targetScale - currentScale) * 0.06;

        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: theta + thetaOffsetRef.current + dragOffset.current.theta,
          scale: currentScale,
        });
        animationId = requestAnimationFrame(animate);
      }
      animate();
      setTimeout(() => {
        if (canvas) canvas.style.opacity = "1";
      });
    }

    if (canvas.offsetWidth > 0) {
      init();
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect();
          init();
        }
      });
      ro.observe(canvas);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (globe) globe.destroy();
    };
  }, [markers, speed, isDarkMode]);

  return (
    <div
      className={`relative aspect-square select-none ${className}`}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
    >
      <style>{`
        @keyframes bar-fill { from { width: 0; } to { width: var(--value, 0%); } }
      `}</style>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />
      {markers.map((m) => {
        const isFocused = focusedMarkerId === m.id;
        return (
          <div
            key={m.id}
            style={{
              position: "absolute",
              positionAnchor: `--cobe-${m.id}`,
              bottom: "anchor(top)",
              left: "anchor(center)",
              translate: "-50% 0",
              marginBottom: 8,
              display: "flex",
              flexDirection: "column" as const,
              alignItems: "center",
              gap: "0.2rem",
              padding: "0.35rem 0.5rem",
              background: "var(--card, #fff)",
              border: isFocused ? "2px solid #0284c7" : "1.5px solid var(--border, #1a1a2e)",
              borderRadius: 6,
              minWidth: 64,
              pointerEvents: "none" as const,
              boxShadow: isFocused ? "0 0 16px rgba(2, 132, 199, 0.45)" : "0 4px 12px rgba(0,0,0,0.15)",
              opacity: `var(--cobe-visible-${m.id}, 0)`,
              filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
              transform: isFocused ? "scale(1.15)" : "scale(1)",
              zIndex: isFocused ? 30 : 10,
              transition: "opacity 0.4s, filter 0.4s, transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
            }}
          >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.55rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              color: "var(--muted-foreground, #888)",
            }}
          >
            {m.label}
          </span>
          <span
            style={{
              width: "100%",
              height: 6,
              background: "var(--muted, #eee)",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <span
              style={{
                display: "block",
                height: "100%",
                width: `${m.value}%`,
                background: "var(--primary, #1a1a2e)",
                borderRadius: 3,
                ["--value" as string]: `${m.value}%`,
              }}
            />
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.65rem",
              fontWeight: 600,
              color: "var(--foreground, #1a1a2e)",
            }}
          >
            {m.value}%
          </span>
        </div>
        );
      })}
    </div>
  );
}
