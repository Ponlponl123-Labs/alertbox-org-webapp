"use client";

import { useEffect, useRef, useState } from "react";
import { getCookie } from "cookies-next/client";
import { getApiUrl } from "@/lib/api";
import { safeDecodeBase64 } from "@/lib/security";

export type WsStatus = "connected" | "connecting" | "disconnected";

interface UseAuthenticatedWsOptions {
  wsPath: string | null;
  enabled?: boolean;
  onMessage: (data: unknown) => void;
  heartbeatMs?: number;
  maxRetries?: number;
}

const AUTH_CLOSE_CODES = new Set([1008, 4001, 4003, 4401, 4403]);

function buildWsBaseUrl(): { protocol: string; host: string } {
  const apiEndpoint = getApiUrl("/");
  if (apiEndpoint.includes("://")) {
    try {
      const parsed = new URL(apiEndpoint);
      return {
        protocol: parsed.protocol === "https:" ? "wss:" : "ws:",
        host: parsed.host,
      };
    } catch {}
  }
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? `${window.location.hostname}:3001`
      : window.location.host;
  return { protocol, host };
}

export function useAuthenticatedWebSocket({
  wsPath,
  enabled = true,
  onMessage,
  heartbeatMs = 25000,
  maxRetries = 8,
}: UseAuthenticatedWsOptions): WsStatus {
  const [status, setStatus] = useState<WsStatus>("disconnected");
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled || !wsPath) {
      return;
    }

    const rawCookie = getCookie("USRSS");
    const decodedToken = safeDecodeBase64(rawCookie ? String(rawCookie) : null);

    let ws: WebSocket | null = null;
    let pingInterval: ReturnType<typeof setInterval> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;
    let attempts = 0;

    const clearTimers = () => {
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const connect = () => {
      if (disposed) return;
      if (typeof document !== "undefined" && document.hidden) return;
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setStatus("disconnected");
        return;
      }

      setStatus("connecting");
      const { protocol, host } = buildWsBaseUrl();
      const query = decodedToken ? `?token=${encodeURIComponent(decodedToken)}` : "";
      const wsUrl = `${protocol}//${host}${wsPath}${query}`;

      try {
        ws = new WebSocket(wsUrl);
      } catch {
        setStatus("disconnected");
        return;
      }

      ws.onopen = () => {
        if (disposed) {
          ws?.close();
          return;
        }
        attempts = 0;
        setStatus("connected");
        clearTimers();
        if (heartbeatMs > 0) {
          pingInterval = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "ping" }));
            }
          }, heartbeatMs);
        }
      };

      ws.onmessage = (event) => {
        try {
          const parsed: unknown = JSON.parse(String(event.data));
          onMessageRef.current(parsed);
        } catch {}
      };

      ws.onerror = () => {
        ws?.close();
      };

      ws.onclose = (event) => {
        clearTimers();
        if (disposed) return;
        setStatus("disconnected");
        if (AUTH_CLOSE_CODES.has(event.code)) return;
        if (attempts >= maxRetries) return;
        const baseDelay = Math.min(30000, 1000 * 2 ** attempts);
        const jitter = Math.random() * 500;
        attempts += 1;
        reconnectTimer = setTimeout(connect, baseDelay + jitter);
      };
    };

    const onVisibility = () => {
      if (disposed) return;
      if (document.hidden) {
        clearTimers();
        if (ws) {
          ws.onclose = null;
          ws.close();
          ws = null;
        }
        setStatus("disconnected");
      } else if (!ws || ws.readyState === WebSocket.CLOSED) {
        attempts = 0;
        connect();
      }
    };

    const onOnline = () => {
      if (disposed || document.hidden) return;
      if (!ws || ws.readyState === WebSocket.CLOSED) {
        attempts = 0;
        connect();
      }
    };

    connect();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);

    return () => {
      disposed = true;
      clearTimers();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        ws.close();
      }
    };
  }, [wsPath, enabled, heartbeatMs, maxRetries]);

  return enabled && wsPath ? status : "disconnected";
}
