"use client";

import { useEffect, useRef, useState } from "react";

const SHAPE_MODES = { mixed: 0, squares: 1, circles: 2, triangles: 3 } as const;
export type ShapeWavesShapes = keyof typeof SHAPE_MODES;

export interface ShapeWavesProps {
  text?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  textSize?: number;
  shapes?: ShapeWavesShapes;
  cellSize?: number;
  dotSize?: number;
  color?: string;
  hoverColor?: string;
  backgroundColor?: string;
  speed?: number;
  scale?: number;
  contrast?: number;
  brightness?: number;
  flow?: number;
  direction?: number;
  fade?: number;
  interactive?: boolean;
  splashRadius?: number;
  splashStrength?: number;
  glow?: number;
  intro?: boolean;
  introDuration?: number;
  introKey?: string | number;
  paused?: boolean;
  onError?: (error: Error) => void;
  className?: string;
}

const VERT_SRC = `#version 300 es
precision highp float;
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = vec2(p.x, 1.0 - p.y);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG_SRC = `#version 300 es
precision highp float;
precision highp int;
in vec2 vUv;
out vec4 fragColor;

uniform vec4 uResCell;   // x: width, y: height, z: cellPx, w: dotSize
uniform vec4 uField;     // x: noiseScale, y: brightOffset, z: contrast, w: time
uniform vec4 uMotion;    // x: driftX, y: driftY, z: fade, w: introProgress
uniform vec4 uColor;     // rgb: base color, w: mode (0..3)
uniform vec4 uHoverBg;   // rgb: hover color, w: glow
uniform vec4 uBg;        // rgb: background color, w: hasMask
uniform vec4 uPointer;   // x: px, y: py, z: radiusPx, w: strength
uniform sampler2D uMask;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float sdTriangle(vec2 p, float c) {
  p.y += c * 0.15;
  const float k = 1.7320508;
  p.x = abs(p.x) - c;
  p.y = p.y + c / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) * 0.5;
  p.x -= clamp(p.x, -2.0 * c, 0.0);
  return -length(p) * sign(p.y);
}

float shapeDist(vec2 p, int shape, float c) {
  if (shape == 0) return max(abs(p.x), abs(p.y)) - c;
  if (shape == 1) return length(p) - c;
  return sdTriangle(p, c);
}

void main() {
  vec2 res = uResCell.xy;
  float cellPx = uResCell.z;
  float dotSize = uResCell.w;
  vec3 bg = uBg.rgb;

  vec2 pixel = vUv * res;
  vec2 cell = floor(pixel / cellPx);
  vec2 center = (cell + 0.5) * cellPx;
  vec2 local = (pixel - center) / (cellPx * 0.5);
  vec2 cellUv = center / res;

  if (uBg.w > 0.5 && texture(uMask, cellUv).r > 0.5) {
    fragColor = vec4(bg, 1.0);
    return;
  }

  float aa = 2.0 / cellPx;
  if (max(abs(local.x), abs(local.y)) > min(1.0, dotSize * 1.2 + aa * 2.0)) {
    fragColor = vec4(bg, 1.0);
    return;
  }

  float level = 1.0;
  float fade = uMotion.z;
  if (fade > 0.0) {
    vec2 q = abs(vUv * 2.0 - 1.0);
    float rad = length(q) * 0.70710678;
    level = 1.0 - smoothstep(max(0.0, 1.0 - fade * 2.2), 1.0, rad);
    if (level <= 0.002) {
      fragColor = vec4(bg, 1.0);
      return;
    }
  }

  vec3 nPos = vec3((center + uMotion.xy) / max(1.0, uField.x) + vec2(12.9898, 78.233), uField.w);
  float n = snoise(nPos) * 0.67 + snoise(nPos * 2.0) * 0.33;
  float tone = clamp((n * 0.5 + 0.5 - uField.y) * uField.z + 0.5, 0.0, 1.0);
  int band = int(min(tone, 0.999) * 3.0);

  float charge = 0.0;
  if (uPointer.w > 0.001) {
    float d = distance(center, uPointer.xy);
    float ring = exp(-pow(d / max(8.0, uPointer.z), 2.0));
    charge = clamp(ring * uPointer.w, 0.0, 1.0);
  }

  int stepped = (band + int(charge * 2.99)) % 3;
  int mode = int(uColor.w + 0.5);
  int shape = 2 - stepped;
  float size = dotSize;
  if (mode != 0) {
    shape = mode - 1;
    size = dotSize * mix(0.45, 1.0, float(stepped) * 0.5);
  }

  float intro = uMotion.w;
  if (intro < 1.0) {
    float radial = length((center - res * 0.5) / (res * 0.5)) * 0.70710678;
    float t = clamp((intro * 1.4 - radial) / 0.35, 0.0, 1.0);
    if (t <= 0.0) {
      fragColor = vec4(bg, 1.0);
      return;
    }
    size *= t;
  }

  float cov = smoothstep(aa, -aa, shapeDist(local, shape, size));
  vec3 tint = mix(uColor.rgb, uHoverBg.rgb, smoothstep(0.15, 0.85, charge));
  vec3 rgb = mix(bg, tint, cov * level);
  if (uHoverBg.w > 0.0) {
    float glowAmt = cov * level * uHoverBg.w * 0.25 * (0.4 + 0.6 * tone);
    rgb = min(vec3(1.0), rgb + tint * glowAmt);
  }
  fragColor = vec4(rgb, 1.0);
}`;

function parseHexColor(value: string | undefined, fallback: string): [number, number, number] {
  const src = typeof value === "string" ? value.trim() : "";
  const match = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(src) || /^#?([\da-f]{6})$/i.exec(fallback);
  let hex = match ? match[1] : "929292";
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ];
}

function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[ShapeWaves] shader compile error:", gl.getShaderInfoLog(shader));
    }
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function ShapeWaves({
  text = "",
  fontFamily = 'Geist, "Geist Sans", system-ui, sans-serif',
  fontWeight = 500,
  textSize = 0.6,
  shapes = "mixed",
  cellSize = 10,
  dotSize = 0.75,
  color = "#929292",
  hoverColor = "#ffffff",
  backgroundColor = "#000000",
  speed = 1,
  scale = 1,
  contrast = 1,
  brightness = 0.4,
  flow = 0,
  direction = 0,
  fade = 0.25,
  interactive = true,
  splashRadius = 40,
  splashStrength = 0.4,
  glow = 0.35,
  intro = true,
  introDuration = 1.6,
  introKey = 0,
  paused = false,
  onError,
  className = "",
}: ShapeWavesProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  const cfgRef = useRef({
    text: String(text ?? ""),
    fontFamily,
    fontWeight,
    textSize,
    mode: SHAPE_MODES[shapes] ?? 0,
    cellSize: Math.max(3, cellSize),
    dotSize,
    colorRgb: parseHexColor(color, "#929292"),
    hoverRgb: parseHexColor(hoverColor, "#ffffff"),
    bgRgb: parseHexColor(backgroundColor, "#000000"),
    speed,
    scale: Math.max(0.05, scale),
    contrast,
    brightness,
    flow,
    direction,
    fade: Math.max(0, fade),
    interactive,
    splashRadius,
    splashStrength,
    glow,
    intro,
    introDuration: Math.max(0.1, introDuration),
    paused,
  });
  const onErrorRef = useRef(onError);
  const updateMaskRef = useRef<() => void>(() => {});
  const replayIntroRef = useRef<() => void>(() => {});
  const wakeRef = useRef<() => void>(() => {});

  useEffect(() => {
    cfgRef.current = {
      text: String(text ?? ""),
      fontFamily,
      fontWeight,
      textSize,
      mode: SHAPE_MODES[shapes] ?? 0,
      cellSize: Math.max(3, cellSize),
      dotSize,
      colorRgb: parseHexColor(color, "#929292"),
      hoverRgb: parseHexColor(hoverColor, "#ffffff"),
      bgRgb: parseHexColor(backgroundColor, "#000000"),
      speed,
      scale: Math.max(0.05, scale),
      contrast,
      brightness,
      flow,
      direction,
      fade: Math.max(0, fade),
      interactive,
      splashRadius,
      splashStrength,
      glow,
      intro,
      introDuration: Math.max(0.1, introDuration),
      paused,
    };
    onErrorRef.current = onError;
    wakeRef.current();
  }, [
    text,
    fontFamily,
    fontWeight,
    textSize,
    shapes,
    cellSize,
    dotSize,
    color,
    hoverColor,
    backgroundColor,
    speed,
    scale,
    contrast,
    brightness,
    flow,
    direction,
    fade,
    interactive,
    splashRadius,
    splashStrength,
    glow,
    intro,
    introDuration,
    paused,
    onError,
  ]);

  useEffect(() => {
    updateMaskRef.current();
  }, [text, fontFamily, fontWeight, textSize]);

  useEffect(() => {
    if (introKey) replayIntroRef.current();
  }, [introKey]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      onErrorRef.current?.(new Error("WebGL2 unavailable"));
      return;
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      if (program) gl.deleteProgram(program);
      return;
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[ShapeWaves] program link error:", gl.getProgramInfoLog(program));
      }
      gl.deleteProgram(program);
      onErrorRef.current?.(new Error("ShapeWaves shader link failed"));
      return;
    }

    const vao = gl.createVertexArray();
    const maskTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, maskTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255]),
    );

    const locResCell = gl.getUniformLocation(program, "uResCell");
    const locField = gl.getUniformLocation(program, "uField");
    const locMotion = gl.getUniformLocation(program, "uMotion");
    const locColor = gl.getUniformLocation(program, "uColor");
    const locHoverBg = gl.getUniformLocation(program, "uHoverBg");
    const locBg = gl.getUniformLocation(program, "uBg");
    const locPointer = gl.getUniformLocation(program, "uPointer");
    const locMask = gl.getUniformLocation(program, "uMask");

    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d");

    let disposed = false;
    let frameId = 0;
    let lastTime = 0;
    let simTime = 0;
    let driftX = 0;
    let driftY = 0;
    let dpr = 1;
    let width = 1;
    let height = 1;
    let visible = true;
    let tabVisible = !document.hidden;
    let presented = false;
    let introStart = performance.now();
    let introProgress = cfgRef.current.intro ? 0 : 1;
    let pointerX = 0;
    let pointerY = 0;
    let pointerStrength = 0;
    let cachedRect: DOMRect | null = null;

    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const uploadMask = () => {
      if (disposed || !maskCtx || !maskTex) return;
      const cfg = cfgRef.current;
      const label = cfg.text.trim();
      if (!label) {
        gl.bindTexture(gl.TEXTURE_2D, maskTex);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          1,
          1,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          new Uint8Array([0, 0, 0, 255]),
        );
        return;
      }
      const mw = Math.min(512, Math.max(64, Math.round(width * 0.5)));
      const mh = Math.min(512, Math.max(64, Math.round(height * 0.5)));
      maskCanvas.width = mw;
      maskCanvas.height = mh;
      maskCtx.fillStyle = "#000000";
      maskCtx.fillRect(0, 0, mw, mh);
      let px = Math.max(12, Math.round(Math.min(mw, mh) * cfg.textSize));
      maskCtx.fillStyle = "#ffffff";
      maskCtx.textAlign = "center";
      maskCtx.textBaseline = "middle";
      maskCtx.font = `${cfg.fontWeight} ${px}px ${cfg.fontFamily}`;
      const measured = maskCtx.measureText(label).width;
      const maxWidth = mw * 0.9;
      if (measured > maxWidth && measured > 0) {
        px = Math.max(8, Math.floor((px * maxWidth) / measured));
        maskCtx.font = `${cfg.fontWeight} ${px}px ${cfg.fontFamily}`;
      }
      maskCtx.fillText(label, mw / 2, mh / 2);

      gl.bindTexture(gl.TEXTURE_2D, maskTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, maskCanvas);
    };

    const resize = (force = false) => {
      if (disposed) return;
      cachedRect = null;
      const cw = root.clientWidth || canvas.clientWidth;
      const ch = root.clientHeight || canvas.clientHeight;
      if (cw <= 0 || ch <= 0) return;
      const maxDpr = window.innerWidth < 768 ? 1 : 1.5;
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      width = Math.max(1, Math.round(cw * dpr));
      height = Math.max(1, Math.round(ch * dpr));
      if (force || canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
        uploadMask();
      }
    };

    const shouldAnimate = () => {
      const cfg = cfgRef.current;
      return visible && tabVisible && !cfg.paused && cfg.speed > 0 && !reduceMq.matches;
    };

    const renderFrame = (now: number) => {
      frameId = 0;
      if (disposed) return;

      const cfg = cfgRef.current;
      const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0;
      lastTime = now;

      const animating = shouldAnimate();
      if (animating) {
        simTime += dt * 0.1 * cfg.speed;
        const rad = (cfg.direction * Math.PI) / 180;
        const dist = cfg.flow * cfg.cellSize * dpr * dt;
        driftX += Math.cos(rad) * dist;
        driftY += Math.sin(rad) * dist;
      }

      if (introProgress < 1) {
        introProgress = cfg.intro
          ? Math.min(1, (now - introStart) / (cfg.introDuration * 1000))
          : 1;
      }

      if (pointerStrength > 0.001) {
        pointerStrength *= Math.pow(0.08, dt || 0.016);
        if (pointerStrength < 0.001) pointerStrength = 0;
      }

      const cellPx = Math.max(3, cfg.cellSize) * dpr;
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, maskTex);
      gl.uniform1i(locMask, 0);
      gl.uniform4f(locResCell, width, height, cellPx, cfg.dotSize);
      gl.uniform4f(
        locField,
        32 * cellPx * cfg.scale,
        0.5 - (cfg.brightness - 0.5) * 0.4,
        2.8 * cfg.contrast,
        simTime,
      );
      gl.uniform4f(locMotion, driftX, driftY, cfg.fade, introProgress);
      gl.uniform4f(locColor, cfg.colorRgb[0], cfg.colorRgb[1], cfg.colorRgb[2], cfg.mode);
      gl.uniform4f(locHoverBg, cfg.hoverRgb[0], cfg.hoverRgb[1], cfg.hoverRgb[2], cfg.glow);
      gl.uniform4f(
        locBg,
        cfg.bgRgb[0],
        cfg.bgRgb[1],
        cfg.bgRgb[2],
        cfg.text.trim() ? 1 : 0,
      );
      gl.uniform4f(locPointer, pointerX, pointerY, cfg.splashRadius * dpr, pointerStrength);

      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!presented) {
        presented = true;
        setReady(true);
      }

      if (animating || introProgress < 1 || pointerStrength > 0.001) {
        frameId = requestAnimationFrame(renderFrame);
      } else {
        lastTime = 0;
      }
    };

    const wake = () => {
      if (disposed || frameId) return;
      lastTime = 0;
      frameId = requestAnimationFrame(renderFrame);
    };
    wakeRef.current = wake;

    updateMaskRef.current = () => {
      uploadMask();
      wake();
    };
    replayIntroRef.current = () => {
      introStart = performance.now();
      introProgress = 0;
      wake();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!cfgRef.current.interactive || !visible || !tabVisible) return;
      if (!cachedRect) cachedRect = root.getBoundingClientRect();
      const x = event.clientX - cachedRect.left;
      const y = event.clientY - cachedRect.top;
      if (x >= 0 && y >= 0 && x <= cachedRect.width && y <= cachedRect.height) {
        pointerX = x * dpr;
        pointerY = y * dpr;
        pointerStrength = Math.min(1, cfgRef.current.splashStrength * 1.4);
        wake();
      }
    };

    const invalidateRect = () => {
      cachedRect = null;
    };

    const onVisibility = () => {
      tabVisible = !document.hidden;
      if (tabVisible) {
        wake();
      } else if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const ro = new ResizeObserver(() => {
      resize();
      wake();
    });
    ro.observe(root);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
        if (visible) {
          wake();
        } else if (frameId) {
          cancelAnimationFrame(frameId);
          frameId = 0;
        }
      },
      { threshold: 0.01 },
    );
    io.observe(root);

    resize(true);
    wake();
    const rafInit = requestAnimationFrame(() => resize(false));

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", invalidateRect, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reduceMq.addEventListener("change", wake);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafInit);
      if (frameId) cancelAnimationFrame(frameId);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", invalidateRect);
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMq.removeEventListener("change", wake);
      wakeRef.current = () => {};
      updateMaskRef.current = () => {};
      replayIntroRef.current = () => {};
      maskCanvas.width = 0;
      maskCanvas.height = 0;
      if (maskTex) gl.deleteTexture(maskTex);
      if (vao) gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`pointer-events-none relative isolate h-full w-full overflow-hidden ${className}`}
      data-ready={ready}
      style={{ backgroundColor }}
      suppressHydrationWarning
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className={`pointer-events-none absolute inset-0 block h-full w-full transition-opacity duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${ready ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
