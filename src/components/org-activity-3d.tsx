"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";

export interface ActivityDay {
  date: Date;
  dateStr: string;
  count: number;
  testCount?: number;
  realCount?: number;
  weekIndex: number;
  dayIndex: number;
}

export interface OrgActivityResponse {
  days: Array<{ date: string; count: number; testCount?: number; realCount?: number }>;
  totalCount: number;
  totalRealCount?: number;
  totalTestCount?: number;
  maxCount: number;
  busiestDay: { date: string; count: number; testCount?: number; realCount?: number } | null;
  longestStreak: number;
  longestStreakRange: { start: string; end: string } | null;
  currentStreak: number;
  currentStreakRange: { start: string; end: string } | null;
  startDate: string;
  endDate: string;
}

interface OrgActivity3DProps {
  orgId?: string;
  orgName?: string;
  streamerCount?: number;
}

export function OrgActivity3D({ orgId }: OrgActivity3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { authFetch } = useUserContext();
  const [apiData, setApiData] = useState<OrgActivityResponse | null>(null);

  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    count: number;
    testCount?: number;
    realCount?: number;
    dateStr: string;
    visible: boolean;
  }>({ x: 0, y: 0, count: 0, dateStr: "", visible: false });

  // Fetch real transaction activity from API
  useEffect(() => {
    if (!orgId) return;
    let active = true;

    authFetch(getApiUrl(`/api/v1/org/${orgId}/transactions/activity`))
      .then((r) => (r.ok ? r.json() : null))
      .then((res: OrgActivityResponse | null) => {
        if (active && res && Array.isArray(res.days)) {
          setApiData(res);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [orgId, authFetch]);

  // Compute 52 weeks x 7 days grid from real API data
  const { data, stats, monthPositions } = useMemo(() => {
    const days: ActivityDay[] = [];
    const totalDays = 52 * 7;
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const monthsMap = new Map<string, number>();

    if (apiData && apiData.days && apiData.days.length === totalDays) {
      // Use real API response
      apiData.days.forEach((item, i) => {
        const d = new Date(item.date);
        const weekIndex = Math.floor(i / 7);
        const dayIndex = i % 7;

        const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
        if (!monthsMap.has(monthKey) && d.getDate() <= 7) {
          monthsMap.set(monthKey, weekIndex);
        }

        days.push({
          date: d,
          dateStr: d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          count: item.count,
          testCount: item.testCount || 0,
          realCount: item.realCount || 0,
          weekIndex,
          dayIndex,
        });
      });

      const monthsArr: { name: string; week: number }[] = [];
      monthsMap.forEach((wIdx, key) => {
        const monthNum = parseInt(key.split("-")[1], 10);
        monthsArr.push({ name: monthNames[monthNum], week: wIdx });
      });

      const busiestDateObj = apiData.busiestDay
        ? new Date(apiData.busiestDay.date)
        : null;

      const longestStartObj = apiData.longestStreakRange?.start
        ? new Date(apiData.longestStreakRange.start)
        : null;
      const longestEndObj = apiData.longestStreakRange?.end
        ? new Date(apiData.longestStreakRange.end)
        : null;
      const longestStreakStr =
        longestStartObj && longestEndObj
          ? `${longestStartObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${longestEndObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
          : "None";

      const currStartObj = apiData.currentStreakRange?.start
        ? new Date(apiData.currentStreakRange.start)
        : null;
      const currEndObj = apiData.currentStreakRange?.end
        ? new Date(apiData.currentStreakRange.end)
        : null;
      const currentStreakStr =
        currStartObj && currEndObj
          ? `${currStartObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${currEndObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
          : "0 days";

      const startDateObj = new Date(apiData.startDate);
      const endDateObj = new Date(apiData.endDate);

      return {
        data: days,
        stats: {
          totalCount: apiData.totalCount,
          maxCount: apiData.maxCount,
          busiestDay: apiData.busiestDay
            ? {
                count: apiData.busiestDay.count,
                testCount: apiData.busiestDay.testCount ?? 0,
                realCount: apiData.busiestDay.realCount ?? 0,
                dateStr: busiestDateObj
                  ? busiestDateObj.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "",
              }
            : null,
          startDateStr: startDateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          endDateStr: endDateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          longestStreak: apiData.longestStreak,
          longestStreakStr,
          currentStreak: apiData.currentStreak,
          currentStreakStr,
        },
        monthPositions: monthsArr,
      };
    }

    // Default 0-count baseline while loading
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const weekIndex = Math.floor(i / 7);
      const dayIndex = i % 7;

      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthsMap.has(monthKey) && d.getDate() <= 7) {
        monthsMap.set(monthKey, weekIndex);
      }

      days.push({
        date: d,
        dateStr: d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        count: 0,
        weekIndex,
        dayIndex,
      });
    }

    const monthsArr: { name: string; week: number }[] = [];
    monthsMap.forEach((wIdx, key) => {
      const monthNum = parseInt(key.split("-")[1], 10);
      monthsArr.push({ name: monthNames[monthNum], week: wIdx });
    });

    return {
      data: days,
      stats: {
        totalCount: 0,
        maxCount: 0,
        busiestDay: null,
        startDateStr: days[0].date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        endDateStr: days[totalDays - 1].date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        longestStreak: 0,
        longestStreakStr: "None",
        currentStreak: 0,
        currentStreakStr: "0 days",
      },
      monthPositions: monthsArr,
    };
  }, [apiData]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 460;

    const scene = new THREE.Scene();

    // Optimized isometric framing: elevated high-angle perspective for easy readability
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 26, 52);
    camera.lookAt(0, -1, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // Dynamic isometric lighting (accentuates vertical cube faces)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight1.position.set(30, 45, 30);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38ef7d, 0.35);
    dirLight2.position.set(-35, 20, -25);
    scene.add(dirLight2);

    // Balanced isometric tilt: elevated ~22° pitch and gentle -16° yaw diagonal
    const pivot = new THREE.Group();
    const DEFAULT_ROT_X = 0.38;
    const DEFAULT_ROT_Y = -0.28;
    pivot.rotation.x = DEFAULT_ROT_X;
    pivot.rotation.y = DEFAULT_ROT_Y;
    scene.add(pivot);

    // Colors mapping: Real = Emerald/Green, Test = Cyan/Sky/Blue, Mixed = Teal
    const COLOR_ZERO = new THREE.Color("#161b22");

    const COLOR_REAL_TIER1 = new THREE.Color("#0e4429");
    const COLOR_REAL_TIER2 = new THREE.Color("#006d32");
    const COLOR_REAL_TIER3 = new THREE.Color("#26a641");
    const COLOR_REAL_TIER4 = new THREE.Color("#39d353");

    const COLOR_TEST_TIER1 = new THREE.Color("#0284c7"); // vibrant sky 600
    const COLOR_TEST_TIER2 = new THREE.Color("#0ea5e9"); // electric sky 500
    const COLOR_TEST_TIER3 = new THREE.Color("#38bdf8"); // glowing sky 400
    const COLOR_TEST_TIER4 = new THREE.Color("#7dd3fc"); // radiant sky 300

    const COLOR_MIXED = new THREE.Color("#2dd4bf"); // luminous teal 400

    // Grid config
    const WEEKS = 52;
    const DAYS = 7;
    const SPACING = 1.15;
    const TILE_SIZE = 0.98;

    const offsetX = ((WEEKS - 1) * SPACING) / 2;
    const offsetZ = ((DAYS - 1) * SPACING) / 2;

    const baseBoxGeom = new THREE.BoxGeometry(TILE_SIZE, 1, TILE_SIZE);
    baseBoxGeom.translate(0, 0.5, 0);

    const interactiveMeshes: THREE.Mesh[] = [];
    const meshDayMap = new Map<number, ActivityDay>();

    // Create Bars with prominent 3D extruded geometry
    data.forEach((day) => {
      const posX = day.weekIndex * SPACING - offsetX;
      const posZ = day.dayIndex * SPACING - offsetZ;

      // Noticeable 3D base height even on 0-activity days
      let barHeight = 0.28;
      let barColor = COLOR_ZERO;

      if (day.count > 0) {
        const isTestOnly = (day.testCount ?? 0) > 0 && (day.realCount ?? 0) === 0;
        const isMixed = (day.testCount ?? 0) > 0 && (day.realCount ?? 0) > 0;

        if (day.count <= 3) {
          barHeight = isTestOnly ? 1.4 : 0.9;
          barColor = isTestOnly ? COLOR_TEST_TIER1 : isMixed ? COLOR_MIXED : COLOR_REAL_TIER1;
        } else if (day.count <= 8) {
          barHeight = isTestOnly ? 2.2 : 1.8;
          barColor = isTestOnly ? COLOR_TEST_TIER2 : isMixed ? COLOR_MIXED : COLOR_REAL_TIER2;
        } else if (day.count <= 18) {
          barHeight = isTestOnly ? 3.4 : 3.0;
          barColor = isTestOnly ? COLOR_TEST_TIER3 : isMixed ? COLOR_MIXED : COLOR_REAL_TIER3;
        } else {
          const ratio = Math.min(1, day.count / (stats.maxCount || 20));
          barHeight = 4.2 + ratio * 3.6;
          barColor = isTestOnly ? COLOR_TEST_TIER4 : isMixed ? COLOR_MIXED : COLOR_REAL_TIER4;
        }
      }

      const mat = new THREE.MeshStandardMaterial({
        color: barColor,
        roughness: 0.3,
        metalness: 0.15,
      });

      const mesh = new THREE.Mesh(baseBoxGeom, mat);
      mesh.scale.set(1, barHeight, 1);
      mesh.position.set(posX, 0, posZ);

      pivot.add(mesh);
      interactiveMeshes.push(mesh);
      meshDayMap.set(mesh.id, day);
    });

    // Hover Highlight Wireframe
    const highlightGeom = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(TILE_SIZE * 1.05, 0.08, TILE_SIZE * 1.05),
    );
    const highlightMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2,
    });
    const highlightMesh = new THREE.LineSegments(highlightGeom, highlightMat);
    highlightMesh.visible = false;
    pivot.add(highlightMesh);

    // Month text sprites along the edge
    monthPositions.forEach(({ name, week }) => {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
        ctx.font = "bold 26px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(name, 64, 32);
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8,
      });
      const sprite = new THREE.Sprite(spriteMat);

      const posX = week * SPACING - offsetX;
      const posZ = offsetZ + 1.6;
      sprite.position.set(posX, 0.2, posZ);
      sprite.scale.set(2.4, 1.2, 1);
      pivot.add(sprite);
    });

    // Orbit Drag Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotX = DEFAULT_ROT_X;
    let targetRotY = DEFAULT_ROT_Y;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const raycaster = new THREE.Raycaster();
    const mouseNorm = new THREE.Vector2();

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        targetRotY += deltaX * 0.006;
        targetRotX = Math.max(0.1, Math.min(0.9, targetRotX + deltaY * 0.006));
        return;
      }

      mouseNorm.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNorm.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseNorm, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const day = meshDayMap.get(hit.object.id);
        if (day) {
          const hitMesh = hit.object as THREE.Mesh;
          const topY = hitMesh.scale.y;

          highlightMesh.position.set(hitMesh.position.x, topY, hitMesh.position.z);
          highlightMesh.visible = true;

          const worldPos = new THREE.Vector3(
            hitMesh.position.x,
            topY,
            hitMesh.position.z,
          );
          worldPos.applyMatrix4(pivot.matrixWorld);
          worldPos.project(camera);

          const screenX = (worldPos.x * 0.5 + 0.5) * rect.width;
          const screenY = (-(worldPos.y * 0.5) + 0.5) * rect.height;

          setTooltip({
            x: screenX,
            y: screenY,
            count: day.count,
            testCount: day.testCount,
            realCount: day.realCount,
            dateStr: day.dateStr,
            visible: true,
          });
          container.style.cursor = "pointer";
          return;
        }
      }

      highlightMesh.visible = false;
      setTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      container.style.cursor = "grab";
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.03;
      const targetZ = Math.max(30, Math.min(75, camera.position.z + zoomDelta));
      const ratio = targetZ / 52;
      camera.position.z = targetZ;
      camera.position.y = 26 * ratio;
    };

    const onDoubleClick = () => {
      targetRotX = DEFAULT_ROT_X;
      targetRotY = DEFAULT_ROT_Y;
      camera.position.set(0, 26, 52);
      camera.lookAt(0, -1, 0);
    };

    const onPointerLeave = () => {
      isDragging = false;
      highlightMesh.visible = false;
      setTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    container.addEventListener("dblclick", onDoubleClick);
    container.addEventListener("wheel", onWheel, { passive: false });

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    ro.observe(container);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      pivot.rotation.x += (targetRotX - pivot.rotation.x) * 0.1;
      pivot.rotation.y += (targetRotY - pivot.rotation.y) * 0.1;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("dblclick", onDoubleClick);
      container.removeEventListener("wheel", onWheel);

      interactiveMeshes.forEach((m) => {
        m.geometry.dispose();
        if (Array.isArray(m.material)) {
          m.material.forEach((mat) => mat.dispose());
        } else {
          m.material.dispose();
        }
      });
      highlightGeom.dispose();
      highlightMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [data, stats, monthPositions]);

  return (
    <div className="relative w-full rounded-2xl border border-border/80 bg-[#0a0c10] overflow-hidden select-none shadow-xl">
      {/* Top Header Stats */}
      <div className="absolute top-4 right-5 z-10 flex flex-col items-end pointer-events-none text-right">
        <div className="flex flex-col items-end">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            1 year total
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#39d353] tracking-tight">
              {stats.totalCount.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-foreground/80">transactions</span>
          </div>
          {apiData && (apiData.totalTestCount ?? 0) > 0 && (
            <span className="text-[11px] text-sky-400 font-semibold tracking-wide mt-0.5">
              ({apiData.totalRealCount ?? 0} real, {apiData.totalTestCount} test)
            </span>
          )}
          <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {stats.startDateStr} — {stats.endDateStr}
          </span>
        </div>

        {stats.busiestDay && (
          <div className="flex flex-col items-end mt-3">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Busiest day
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-extrabold text-[#39d353] tracking-tight">
                {stats.busiestDay.count}
              </span>
              <span className="text-xs font-semibold text-foreground/80">transactions</span>
            </div>
            {Boolean(stats.busiestDay.testCount && stats.busiestDay.testCount > 0) && (
              <span className="text-[10px] text-sky-400 font-medium">
                ({stats.busiestDay.realCount ?? 0} real, {stats.busiestDay.testCount} test)
              </span>
            )}
            <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
              {stats.busiestDay.dateStr}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Left Streaks */}
      <div className="absolute bottom-10 left-5 z-10 flex flex-col gap-3 pointer-events-none">
        <div>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Longest streak
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-extrabold text-[#39d353] tracking-tight">
              {stats.longestStreak}
            </span>
            <span className="text-xs font-semibold text-foreground/80">days</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {stats.longestStreakStr}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Current streak
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-extrabold text-[#39d353] tracking-tight">
              {stats.currentStreak}
            </span>
            <span className="text-xs font-semibold text-foreground/80">days</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {stats.currentStreakStr}
          </span>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full h-115 sm:h-125 touch-none cursor-grab active:cursor-grabbing"
      />

      {/* Floating 3D Hover Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute z-20 pointer-events-none transition-all duration-75 ease-out -translate-x-1/2 -translate-y-full mb-3"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          <div className="relative bg-white text-zinc-950 font-medium px-3 py-1.5 rounded-lg text-xs shadow-2xl flex items-center gap-1.5 border border-zinc-200">
            <span className="font-bold text-zinc-950">
              {tooltip.count} {tooltip.count === 1 ? "transaction" : "transactions"}
            </span>
            {Boolean(tooltip.testCount && tooltip.testCount > 0) && (
              <span className="text-sky-600 font-semibold text-[11px]">
                ({tooltip.realCount ?? 0} real, {tooltip.testCount} test)
              </span>
            )}
            <span className="text-zinc-600">on {tooltip.dateStr}</span>
            <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-zinc-200 rotate-45" />
          </div>
        </div>
      )}

      {/* Footer info & Color Legend */}
      <div className="absolute bottom-3 inset-x-5 flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pointer-events-none gap-2">
        <span className="opacity-75">Drag to orbit · scroll to zoom · double-click to reset</span>

        <div className="flex items-center gap-4 pointer-events-auto">
          {/* Real Palette */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-semibold text-zinc-400">Real</span>
            <span className="inline-block size-2 rounded-xs bg-[#161b22] border border-white/5" />
            <span className="inline-block size-2 rounded-xs bg-[#0e4429]" />
            <span className="inline-block size-2 rounded-xs bg-[#006d32]" />
            <span className="inline-block size-2 rounded-xs bg-[#26a641]" />
            <span className="inline-block size-2 rounded-xs bg-[#39d353]" />
          </div>

          {/* Test Palette */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-semibold text-sky-400">Test</span>
            <span className="inline-block size-2 rounded-xs bg-[#0284c7]" />
            <span className="inline-block size-2 rounded-xs bg-[#0ea5e9]" />
            <span className="inline-block size-2 rounded-xs bg-[#38bdf8]" />
            <span className="inline-block size-2 rounded-xs bg-[#7dd3fc]" />
          </div>
        </div>
      </div>
    </div>
  );
}
