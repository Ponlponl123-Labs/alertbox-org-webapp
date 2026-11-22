"use client";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useStore } from "zustand";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  ClockIcon,
  EyeIcon,
  LinkBreakIcon,
  SlidersIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { BuyMeACoffee, KoFi, Streamlabs, Stripe } from "@thesvg/react";
import { AnimateIcon } from "@animate-ui/react/icons";
import { RefreshCcw } from "@/components/animate-ui/icons/hugeicons/refresh-ccw";
import { AutoHeight } from "@/components/animate-ui/primitives/effects/auto-height";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { useAuthenticatedWebSocket } from "@/hooks/use-authenticated-ws";
import { getApiUrl } from "@/lib/api";
import { formatMoneyMinorUnits, getCachedDateFormat } from "@/lib/formatters";
import { formatI18n } from "@/lib/i18n";
import { canAccessStreamer } from "@/lib/rbac";
import { isSafePathSegment, validateOAuthRedirectUrl } from "@/lib/security";
import { cn } from "@/lib/utils";
import { OrgPerm, StreamerPerm } from "@/consts/permission";
import {
  ALL_RELAY_BITS,
  MAX_RELAY_LOGS,
  SAMPLE_RELAY_LOGS,
  StreamlabsOption,
  TOTAL_RULES,
} from "@/consts/streamlabs";
import { countEnabledBits, renderProviderIcon } from "@/lib/streamlabs";
import type { LogStatusFilter, RelayLog } from "@/types/connections.types";
import type { Connections } from "@/types/user.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import JellyRadio from "@/components/JellyRadio";
import { toast } from "@/components/custom-ui/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import HoldButton from "@/components/HoldButton";

function StreamlabsPageContent() {
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo, logout, authFetch, activeOrg, activeStreamer } = useUserContext();
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code");
  const state = params.get("state");

  const canManageIntegrations = canAccessStreamer(
    activeOrg,
    activeStreamer,
    StreamerPerm.STREAMER_INTEGRATION_MANAGE,
    OrgPerm.INTEGRATION_MANAGE,
  );

  const routeParams = useParams();
  const routeOrg = routeParams?.org as string | undefined;
  const routeStreamer = routeParams?.streamer as string | undefined;
  const rawOrg = String(routeOrg || activeOrg?.id || activeOrg?.slug || "");
  const rawStreamer = String(routeStreamer || activeStreamer?.id || activeStreamer?.name || "");
  const targetOrg = isSafePathSegment(rawOrg) ? rawOrg : null;
  const targetStreamer = isSafePathSegment(rawStreamer) ? rawStreamer : null;

  const baseConnectionsHref =
    targetOrg && targetStreamer
      ? `/app/${encodeURIComponent(targetOrg)}/${encodeURIComponent(targetStreamer)}/connections`
      : "/app/connections";
  const backHref = `${baseConnectionsHref}?t=trigger`;

  const integrationBaseEndpoint =
    targetOrg && targetStreamer
      ? getApiUrl(
        `/api/v1/org/${encodeURIComponent(targetOrg)}/streamers/${encodeURIComponent(targetStreamer)}/integration`,
      )
      : "";
  const streamlabsEndpoint = integrationBaseEndpoint
    ? `${integrationBaseEndpoint}/streamlabs`
    : "";
  const streamlabsLogsEndpoint = streamlabsEndpoint ? `${streamlabsEndpoint}/logs` : "";

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);
  const [isConnectingOAuth, setIsConnectingOAuth] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connections, setConnections] = useState<Connections | null>(null);
  const [oauthStatus, setOauthStatus] = useState<"connecting" | "success" | "failed">(
    "connecting",
  );

  const [optionsMask, setOptionsMask] = useState<number>(ALL_RELAY_BITS);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [logs, setLogs] = useState<RelayLog[]>([]);
  const [statusFilter, setStatusFilter] = useState<LogStatusFilter>("ALL");
  const [showSampleLogs, setShowSampleLogs] = useState(false);
  const [liveLogId, setLiveLogId] = useState<string | null>(null);

  const oauthExchangedRef = useRef(false);
  const saveSeqRef = useRef(0);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = lang.data.app.connections.providers.streamlabs;
  const setupLang = lang.data.app.connections.streamlabs_setup;
  const commonSetup = lang.data.app.connections.setup_common;
  const wsLang = lang.data.app.streamer.transactions.ws;

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      if (liveTimerRef.current) clearTimeout(liveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!code || !state || !userInfo || oauthExchangedRef.current) return;
    oauthExchangedRef.current = true;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const parts = state.split(".");
    const parsedOrg = parts.length >= 2 ? parts[1] : activeOrg?.id || targetOrg;
    const parsedStreamer = parts.length >= 2 ? parts[0] : activeStreamer?.id || targetStreamer;

    if (!isSafePathSegment(parsedOrg) || !isSafePathSegment(parsedStreamer)) {
      queueMicrotask(() => setOauthStatus("failed"));
      timer = setTimeout(() => router.push(backHref), 2400);
      return () => {
        if (timer) clearTimeout(timer);
      };
    }

    const targetEndpoint = `/api/v1/org/${encodeURIComponent(parsedOrg)}/streamers/${encodeURIComponent(parsedStreamer)}/integration/streamlabs`;

    authFetch(getApiUrl(targetEndpoint), {
      method: "POST",
      body: code,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to connect");
        setOauthStatus("success");
        timer = setTimeout(() => router.push(backHref), 2400);
      })
      .catch(() => {
        setOauthStatus("failed");
        timer = setTimeout(() => router.push(backHref), 2400);
      });

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [
    code,
    state,
    router,
    userInfo,
    authFetch,
    backHref,
    activeOrg?.id,
    activeStreamer?.id,
    targetOrg,
    targetStreamer,
  ]);

  useEffect(() => {
    if (
      (code && state) ||
      !userInfo ||
      !streamlabsEndpoint ||
      !streamlabsLogsEndpoint ||
      !integrationBaseEndpoint
    ) {
      return;
    }

    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        setIsLoading(true);
        setLogs([]);
      }
    });

    (async () => {
      try {
        const [settingsRes, logsRes, integrationsRes] = await Promise.all([
          authFetch(streamlabsEndpoint, { signal: controller.signal }),
          authFetch(streamlabsLogsEndpoint, { signal: controller.signal }),
          authFetch(integrationBaseEndpoint, { signal: controller.signal }),
        ]);

        if (controller.signal.aborted) return;

        if (
          settingsRes.status === 401 ||
          logsRes.status === 401 ||
          integrationsRes.status === 401
        ) {
          logout();
          return;
        }

        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          if (controller.signal.aborted) return;
          setIsConnected(Boolean(settings.isConnected));
          const optionsVal = settings.options;
          if (optionsVal === null || optionsVal === undefined || optionsVal === 0) {
            setOptionsMask(ALL_RELAY_BITS);
          } else {
            setOptionsMask(optionsVal & ALL_RELAY_BITS);
          }
        }

        if (logsRes.ok) {
          const logsData = (await logsRes.json()) as RelayLog[];
          if (!controller.signal.aborted && Array.isArray(logsData)) {
            setLogs(logsData.slice(0, MAX_RELAY_LOGS));
          }
        }

        if (integrationsRes.ok) {
          const connData = (await integrationsRes.json()) as Connections;
          if (!controller.signal.aborted && connData) {
            setConnections(connData);
          }
        }
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") {
          toast.error(coreStore.getState().lang.data.app.connections.streamlabs_setup.error_load);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [
    code,
    state,
    userInfo,
    streamlabsEndpoint,
    streamlabsLogsEndpoint,
    integrationBaseEndpoint,
    authFetch,
    logout,
  ]);

  const wsPath =
    !(code && state) && isConnected && targetOrg && targetStreamer
      ? `/v1/org/${encodeURIComponent(targetOrg)}/streamers/${encodeURIComponent(targetStreamer)}/integration/streamlabs/ws`
      : null;

  const handleWsMessage = useCallback((raw: unknown) => {
    if (!raw || typeof raw !== "object") return;
    const data = raw as { event?: string; log?: RelayLog };
    if (!data.log) return;
    const incoming = data.log;
    if (data.event === "created") {
      setLogs((prev) => {
        if (prev.some((l) => l.id === incoming.id)) return prev;
        return [incoming, ...prev].slice(0, MAX_RELAY_LOGS);
      });
      setLiveLogId(incoming.id);
      if (liveTimerRef.current) clearTimeout(liveTimerRef.current);
      liveTimerRef.current = setTimeout(
        () => setLiveLogId((id) => (id === incoming.id ? null : id)),
        3000,
      );
    } else if (data.event === "updated") {
      setLogs((prev) => prev.map((log) => (log.id === incoming.id ? incoming : log)));
    }
  }, []);

  const wsStatus = useAuthenticatedWebSocket({
    wsPath,
    enabled: Boolean(wsPath),
    onMessage: handleWsMessage,
  });

  const persistOptionsMask = useCallback(
    async (nextMask: number, previousMask: number) => {
      if (!canManageIntegrations || !streamlabsEndpoint) return;
      const seq = ++saveSeqRef.current;
      setOptionsMask(nextMask);
      setSaveState("saving");
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);

      try {
        const res = await authFetch(streamlabsEndpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            options: nextMask | StreamlabsOption.CONFIGURED_FLAG,
          }),
        });

        if (seq !== saveSeqRef.current) return;

        if (res.ok) {
          setSaveState("saved");
          savedTimerRef.current = setTimeout(() => setSaveState("idle"), 2000);
        } else {
          setOptionsMask(previousMask);
          setSaveState("idle");
          toast.error(coreStore.getState().lang.data.app.connections.streamlabs_setup.error_save);
        }
      } catch {
        if (seq !== saveSeqRef.current) return;
        setOptionsMask(previousMask);
        setSaveState("idle");
        toast.error(coreStore.getState().lang.data.app.connections.streamlabs_setup.error_network);
      }
    },
    [canManageIntegrations, streamlabsEndpoint, authFetch],
  );

  const handleToggleBit = (bit: number) => {
    if (!canManageIntegrations) return;
    const nextMask = optionsMask ^ bit;
    void persistOptionsMask(nextMask, optionsMask);
  };

  const handleToggleAll = () => {
    if (!canManageIntegrations) return;
    const allEnabled = (optionsMask & ALL_RELAY_BITS) === ALL_RELAY_BITS;
    const nextMask = allEnabled ? 0 : ALL_RELAY_BITS;
    void persistOptionsMask(nextMask, optionsMask);
  };

  const handleRefreshLogs = async () => {
    if (!streamlabsLogsEndpoint || isRefreshingLogs) return;
    setIsRefreshingLogs(true);
    try {
      const res = await authFetch(streamlabsLogsEndpoint);
      if (res.status === 401) {
        logout();
        return;
      }
      if (res.ok) {
        const logsData = (await res.json()) as RelayLog[];
        if (Array.isArray(logsData)) {
          setLogs(logsData.slice(0, MAX_RELAY_LOGS));
        }
      }
    } catch {
      toast.error(setupLang.error_load);
    } finally {
      setIsRefreshingLogs(false);
    }
  };

  const handleConnectOAuth = async () => {
    if (!canManageIntegrations || !streamlabsEndpoint || isConnectingOAuth) return;
    setIsConnectingOAuth(true);
    try {
      const res = await authFetch(`${streamlabsEndpoint}/oauth2`, { method: "GET" });
      if (!res.ok) {
        toast.error(lang.data.app.connections.toasts.oauth_init_failed);
        setIsConnectingOAuth(false);
        return;
      }
      const oauth2Link = await res.text();
      const safeUrl = validateOAuthRedirectUrl(oauth2Link);
      if (!safeUrl) {
        toast.error(lang.data.app.connections.toasts.oauth_untrusted_url);
        setIsConnectingOAuth(false);
        return;
      }
      window.location.assign(safeUrl);
    } catch {
      toast.error(lang.data.app.connections.toasts.oauth_network);
      setIsConnectingOAuth(false);
    }
  };

  const handleDisconnect = async () => {
    if (!canManageIntegrations || !streamlabsEndpoint || isDisconnecting) return;
    setIsDisconnecting(true);
    try {
      const res = await authFetch(streamlabsEndpoint, { method: "DELETE" });
      if (res.ok) {
        toast.success(setupLang.success_disconnect);
        setIsConnected(false);
        setLogs([]);
        setIsConfirmOpen(false);
      } else {
        toast.error(setupLang.error_disconnect);
      }
    } catch {
      toast.error(setupLang.error_network);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const logDateFormatter = getCachedDateFormat(lang.key, {
    hour12: false,
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const activeCount = countEnabledBits(optionsMask);
  const allEnabled = activeCount === TOTAL_RULES;

  const isUsingSample = process.env.NODE_ENV === "development" && logs.length === 0 && showSampleLogs;
  const displayLogs = useMemo(
    () => (logs.length > 0 ? logs : isUsingSample ? SAMPLE_RELAY_LOGS : []),
    [logs, isUsingSample],
  );

  const logStats = useMemo(() => {
    let delivered = 0;
    let failed = 0;
    for (const log of displayLogs) {
      if (log.status === "COMPLETED") delivered++;
      else if (log.status === "FAILED") failed++;
    }
    return { total: displayLogs.length, delivered, failed };
  }, [displayLogs]);

  const filteredLogs = useMemo(() => {
    if (statusFilter === "ALL") return displayLogs;
    return displayLogs.filter((l) => l.status === statusFilter);
  }, [displayLogs, statusFilter]);

  const filterTabs = useMemo(
    () => [
      { value: "ALL", label: setupLang.filter_all },
      { value: "COMPLETED", label: setupLang.filter_completed },
      { value: "FAILED", label: setupLang.filter_failed },
      { value: "PENDING", label: setupLang.filter_pending },
    ],
    [
      setupLang.filter_all,
      setupLang.filter_completed,
      setupLang.filter_failed,
      setupLang.filter_pending,
    ],
  );

  const providerGroups = useMemo(
    () => [
      {
        key: "bmac",
        name: lang.data.app.connections.providers.bmac.name,
        icon: <BuyMeACoffee className="size-5 *:fill-amber-400" />,
        gatewayConnected: Boolean(connections?.bmac),
        href: `${baseConnectionsHref}/bmac`,
        rules: [
          {
            bit: StreamlabsOption.BMAC_DONATION_SUCCESS,
            label: setupLang.relay_bmac_donation,
            desc: setupLang.relay_bmac_donation_desc,
          },
          {
            bit: StreamlabsOption.BMAC_MEMBERSHIP_SUCCESS,
            label: setupLang.relay_bmac_membership,
            desc: setupLang.relay_bmac_membership_desc,
          },
        ],
      },
      {
        key: "kofi",
        name: lang.data.app.connections.providers.kofi.name,
        icon: <KoFi className="size-5" />,
        gatewayConnected: Boolean(connections?.kofi),
        href: `${baseConnectionsHref}/kofi`,
        rules: [
          {
            bit: StreamlabsOption.KOFI_DONATION_SUCCESS,
            label: setupLang.relay_kofi_donation,
            desc: setupLang.relay_kofi_donation_desc,
          },
          {
            bit: StreamlabsOption.KOFI_PURCHASE_SUCCESS,
            label: setupLang.relay_kofi_purchase,
            desc: setupLang.relay_kofi_purchase_desc,
          },
        ],
      },
      {
        key: "stripe",
        name: lang.data.app.connections.providers.stripe.name,
        icon: <Stripe className="size-5" />,
        gatewayConnected: Boolean(connections?.stripe),
        href: `${baseConnectionsHref}/stripe`,
        rules: [
          {
            bit: StreamlabsOption.STRIPE_PAYMENT_SUCCESS,
            label: setupLang.relay_stripe,
            desc: setupLang.relay_stripe_desc,
          },
        ],
      },
    ],
    [
      lang.data.app.connections.providers,
      connections?.bmac,
      connections?.kofi,
      connections?.stripe,
      baseConnectionsHref,
      setupLang,
    ],
  );

  if (code && state) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mx-auto max-w-384 px-12 pt-12 flex flex-col items-center justify-center min-h-[70vh] flex-1 font-sans select-none"
      >
        <div className="w-full max-w-md p-8 flex flex-col items-center text-center gap-5">
          <div className="flex items-center justify-center gap-4">
            <div className="size-14 flex items-center justify-center">
              <Image src="/favicon.ico" width={36} height={36} alt="Alertbox.org" />
            </div>

            <AnimatePresence mode="wait">
              {oauthStatus === "connecting" ? (
                <motion.div
                  key="connecting"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="size-8 flex items-center justify-center"
                >
                  <Spinner className="size-4 text-foreground/60" />
                </motion.div>
              ) : oauthStatus === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="size-8 text-emerald-500 flex items-center justify-center"
                >
                  <CheckIcon weight="bold" size={16} />
                </motion.div>
              ) : (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="size-8 text-rose-500 flex items-center justify-center"
                >
                  <XIcon weight="bold" size={16} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="size-14 flex items-center justify-center">
              <Streamlabs className="size-8" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={oauthStatus}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-1.5"
            >
              <h1 className="text-lg font-semibold text-foreground">
                {oauthStatus === "connecting"
                  ? t.oauth.connecting
                  : oauthStatus === "success"
                    ? t.oauth.connected
                    : t.oauth.failed}
              </h1>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                {oauthStatus === "connecting"
                  ? t.oauth.connecting_description
                  : oauthStatus === "success"
                    ? t.oauth.connected_description
                    : t.oauth.failed_description}
              </p>
            </motion.div>
          </AnimatePresence>

          {oauthStatus !== "connecting" && (
            <Link href={backHref} className="w-full pt-1">
              <Button variant="secondary" className="w-full rounded-xl h-max p-3 text-xs font-semibold gap-2">
                <span>{lang.data.common.continue}</span>
                <ArrowRightIcon size={14} weight="bold" />
              </Button>
            </Link>
          )}
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-100">
        <Spinner className="size-8 text-foreground/40" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mx-auto max-w-384 px-12 pt-12 pb-12 flex flex-col gap-6 z-10 min-h-0 flex-1 font-sans"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 my-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium tracking-tight text-foreground">
              {t.name}
            </h1>
            {isConnected ? (
              <Badge
                variant="outline"
                className="gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border-0 bg-emerald-500/10 text-emerald-500 select-none"
              >
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {lang.data.app.connections.status.connected}
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border-0 text-muted-foreground select-none"
              >
                <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                {lang.data.app.connections.status.notconnected}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed font-sans">
            {t.description}
          </p>
        </div>

        <div className="p-3 shrink-0">
          <Streamlabs className="size-12 not-dark:fill-black" />
        </div>
      </div>

      {!isConnected ? (
        <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center gap-6 flex-1 min-h-0 select-none">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <BuyMeACoffee className="size-5 *:fill-amber-400" />
              <KoFi className="size-5" />
              <Stripe className="size-6" />
            </div>
            <ArrowRightIcon size={18} weight="bold" className="text-muted-foreground/60" />
            <Streamlabs className="size-8" />
          </div>

          <div className="max-w-lg space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              {setupLang.disconnected_title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
              {setupLang.disconnected_desc}
            </p>
          </div>

          {canManageIntegrations ? (
            <Button
              type="button"
              onClick={handleConnectOAuth}
              disabled={isConnectingOAuth}
              className="rounded-xl h-max px-5 py-3 text-xs font-semibold gap-2"
            >
              {isConnectingOAuth ? (
                <Spinner className="size-4" />
              ) : (
                <Streamlabs className="size-4 fill-black" />
              )}
              <span>{setupLang.connect_cta}</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              disabled
              className="rounded-xl h-max px-5 py-3 text-xs font-semibold opacity-60 cursor-not-allowed"
            >
              {lang.data.common.read_only_no_permission}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="rounded-xl bg-card overflow-hidden">
              <div className="p-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <SlidersIcon size={18} weight="bold" className="text-foreground/75 shrink-0" />
                  <h2 className="text-base font-medium text-foreground truncate">
                    {setupLang.settings_title}
                  </h2>
                  <span className="text-xs select-none font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground tabular-nums">
                    {formatI18n(setupLang.active_rules_count, {
                      active: activeCount,
                      total: TOTAL_RULES,
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <AnimatePresence mode="wait">
                    {saveState === "saving" && (
                      <motion.span
                        key="saving"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"
                      >
                        <Spinner className="size-3" />
                        <span>{setupLang.saving}</span>
                      </motion.span>
                    )}
                    {saveState === "saved" && (
                      <motion.span
                        key="saved"
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-medium"
                      >
                        <CheckIcon size={12} weight="bold" />
                        <span>{setupLang.saved}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {canManageIntegrations && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={handleToggleAll}
                      className="rounded-lg text-[11px] font-semibold px-2.5 py-1.5 h-max text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {allEnabled ? setupLang.pause_all : setupLang.enable_all}
                    </Button>
                  )}
                </div>
              </div>

              {!canManageIntegrations && (
                <div className="p-3 bg-muted mx-1 rounded-md flex items-center gap-2 text-xs text-muted-foreground">
                  <EyeIcon size={15} weight="bold" className="shrink-0" />
                  <span>{lang.data.common.read_only_no_permission}</span>
                </div>
              )}

              <div className="p-2 flex flex-col gap-2">
                {providerGroups.map((group) => (
                  <div
                    key={group.key}
                    className="rounded-lg"
                  >
                    <div className="p-2.5 flex items-center justify-between gap-2 bg-card/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-6 flex items-center justify-center shrink-0">
                          {group.icon}
                        </div>
                        <span className="text-xs font-semibold text-foreground truncate">
                          {group.name}
                        </span>
                      </div>

                      {group.gatewayConnected ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 shrink-0 select-none">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          {lang.data.app.connections.status.connected}
                        </span>
                      ) : (
                        <Link
                          href={group.href}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors shrink-0"
                        >
                          <span>{setupLang.setup_gateway}</span>
                          <ArrowUpRightIcon size={10} weight="bold" />
                        </Link>
                      )}
                    </div>

                    <div>
                      {group.rules.map((rule) => {
                        const checked = (optionsMask & rule.bit) !== 0;
                        return (
                          <div
                            key={rule.bit}
                            onClick={() => canManageIntegrations && handleToggleBit(rule.bit)}
                            className={cn(
                              "px-3.5 py-3 flex items-center justify-between gap-3 rounded-lg select-none transition-interactive",
                              canManageIntegrations
                                ? "cursor-pointer hover:bg-foreground/3"
                                : "opacity-70",
                            )}
                          >
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-xs font-medium text-foreground leading-snug">
                                {rule.label}
                              </span>
                              <span className="text-[11px] text-muted-foreground leading-snug">
                                {rule.desc}
                              </span>
                            </div>
                            <div
                              className="shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Switch
                                checked={checked}
                                disabled={!canManageIntegrations}
                                onCheckedChange={() => handleToggleBit(rule.bit)}
                                aria-label={rule.label}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {canManageIntegrations && (
              <div className="rounded-xl bg-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-medium text-foreground">
                    {setupLang.danger_zone_title}
                  </h3>
                  <p className="text-xs font-sans text-muted-foreground mt-0.5 leading-relaxed">
                    {setupLang.danger_zone_desc}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isDisconnecting}
                  onClick={() => setIsConfirmOpen(true)}
                  className="rounded-xl h-max px-3.5 py-2 text-xs font-semibold gap-1.5 shrink-0 cursor-pointer"
                >
                  <LinkBreakIcon size={14} weight="bold" />
                  <span>{lang.data.app.connections.status.disconnect}</span>
                </Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 rounded-xl bg-card overflow-hidden flex flex-col">
            <div className="p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <ClockIcon size={18} weight="bold" className="text-foreground/75 shrink-0" />
                <h2 className="text-sm font-semibold text-foreground truncate">
                  {setupLang.logs_title}
                </h2>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl select-none text-[11px] font-medium bg-muted/80">
                  <span
                    className={cn(
                      "relative flex size-1.5 rounded-full",
                      wsStatus === "connected"
                        ? "bg-emerald-500"
                        : wsStatus === "connecting"
                          ? "bg-amber-500"
                          : "bg-zinc-400",
                    )}
                  >
                    {wsStatus === "connected" && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    )}
                  </span>
                  <span className="text-muted-foreground">
                    {wsStatus === "connected"
                      ? wsLang.connected
                      : wsStatus === "connecting"
                        ? wsLang.connecting
                        : wsLang.lost}
                  </span>
                </div>
              </div>

              <AnimateIcon animateOnHover>
                <Button
                  type="button"
                  size="xs"
                  variant="secondary"
                  onClick={handleRefreshLogs}
                  disabled={isRefreshingLogs}
                  className="gap-1.5 text-xs rounded-xl px-3 py-2 h-max cursor-pointer"
                >
                  <RefreshCcw size={13} className={cn(isRefreshingLogs && "animate-spin")} />
                  <span className="hidden sm:inline">{lang.data.common.refresh}</span>
                </Button>
              </AnimateIcon>
            </div>

            <div className="grid grid-cols-3 mx-1 space-x-0.5">
              <div className="px-4 py-3 flex flex-col gap-0.5 select-none hover:bg-muted/60 duration-200 rounded-md">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {setupLang.stat_total}
                </span>
                <span className="text-lg font-semibold tabular-nums text-foreground">
                  {logStats.total}
                </span>
              </div>
              <div className="px-4 py-3 flex flex-col gap-0.5 select-none hover:bg-muted/60 duration-200 rounded-md">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500/80">
                  {setupLang.stat_delivered}
                </span>
                <span className="text-lg font-semibold tabular-nums text-emerald-500">
                  {logStats.delivered}
                </span>
              </div>
              <div className="px-4 py-3 flex flex-col gap-0.5 select-none hover:bg-muted/60 duration-200 rounded-md">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-500/80">
                  {setupLang.stat_failed}
                </span>
                <span className="text-lg font-semibold tabular-nums text-rose-500">
                  {logStats.failed}
                </span>
              </div>
            </div>

            <div className="p-2 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
              <JellyRadio
                items={filterTabs}
                value={statusFilter}
                disabled={false}
                onChange={(val) => setStatusFilter(val as LogStatusFilter)}
                size="sm"
              />
              {process.env.NODE_ENV === "development" && logs.length === 0 && (
                <Button
                  type="button"
                  size="xs"
                  variant={showSampleLogs ? "default" : "secondary"}
                  onClick={() => setShowSampleLogs((prev) => !prev)}
                  className="gap-1.5 text-xs rounded-xl px-2.5 py-1.5 h-max shrink-0 cursor-pointer"
                >
                  <EyeIcon size={13} weight="bold" />
                  <span>{showSampleLogs ? "Hide sample" : "Preview sample"}</span>
                </Button>
              )}
            </div>

            <AutoHeight
              deps={[filteredLogs.length, statusFilter]}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="mb-1"
            >
              {filteredLogs.length === 0 ? (
                <div className="py-16 px-6 flex flex-col items-center justify-center text-center gap-2.5 text-muted-foreground">
                  <ClockIcon size={36} weight="duotone" className="text-foreground/50" />
                  <p className="text-sm font-medium text-foreground font-sans">
                    {displayLogs.length === 0 ? setupLang.no_logs : setupLang.no_filtered_logs}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-xs font-sans">
                    {displayLogs.length === 0 ? setupLang.no_logs_desc : setupLang.no_filtered_logs_desc}
                  </p>
                  {statusFilter !== "ALL" && displayLogs.length > 0 && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="xs"
                      onClick={() => setStatusFilter("ALL")}
                      className="my-2 text-xs rounded-xl px-3 py-2 h-max cursor-pointer"
                    >
                      {lang.data.common.reset_filters}
                    </Button>
                  )}
                </div>
              ) : (
                <ScrollArea className="max-h-135 gap-1">
                  {filteredLogs.map((log) => {
                    const isCompleted = log.status === "COMPLETED";
                    const isFailed = log.status === "FAILED";
                    const providerDisplay =
                      log.provider === "buymeacoffee"
                        ? "BMAC"
                        : log.provider === "kofi"
                          ? "Ko-fi"
                          : log.provider === "stripe"
                            ? "Stripe"
                            : log.provider;

                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className={cn(
                          "p-2 mx-1 hover:bg-muted/30 apply-smooth-transition flex flex-col gap-2 rounded-lg",
                          liveLogId === log.id && "bg-primary/10 ring-1 ring-inset ring-primary/40",
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="size-8 rounded-md flex items-center justify-center shrink-0">
                              {renderProviderIcon(log.provider, "size-4")}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs font-semibold text-foreground truncate">
                                  {log.senderName}
                                </span>
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold shrink-0",
                                    isCompleted
                                      ? "bg-emerald-500/10 text-emerald-500"
                                      : isFailed
                                        ? "bg-rose-500/10 text-rose-500"
                                        : "bg-amber-500/10 text-amber-500",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "size-1 rounded-full",
                                      isCompleted
                                        ? "bg-emerald-500"
                                        : isFailed
                                          ? "bg-rose-500"
                                          : "bg-amber-500",
                                    )}
                                  />
                                  {isCompleted
                                    ? setupLang.status_completed
                                    : isFailed
                                      ? setupLang.status_failed
                                      : setupLang.status_pending}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground truncate">
                                {commonSetup.via}
                                {providerDisplay}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0">
                            <span className="text-xs font-semibold tabular-nums text-foreground">
                              {formatMoneyMinorUnits(log.amount, log.currency, lang.key)}
                            </span>
                            <span className="text-[10px] text-muted-foreground tabular-nums">
                              {logDateFormatter.format(new Date(log.createdAt))}
                            </span>
                          </div>
                        </div>

                        {log.errorMessage ? (
                          <div className="rounded-md bg-rose-500/10 p-2 mt-2 flex items-start gap-2 text-[10px] text-rose-500">
                            <WarningCircleIcon size={14} weight="bold" className="shrink-0 mt-0.5" />
                            <span className="font-mono break-all">
                              {commonSetup.error_prefix}
                              {log.errorMessage}
                            </span>
                          </div>
                        ) : log.message ? (
                          <p className="text-xs text-muted-foreground pl-10.5 leading-relaxed line-clamp-2 font-baijamjuree">
                            &ldquo;{log.message}&rdquo;
                          </p>
                        ) : null}
                      </motion.div>
                    );
                  })}
                </ScrollArea>
              )}
            </AutoHeight>
          </div>
        </div>
      )}

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="text-destructive">
              <LinkBreakIcon weight="regular" className="size-9" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {setupLang.confirm_disconnect_title}
            </AlertDialogTitle>
            <AlertDialogDescription>{setupLang.confirm_disconnect_desc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDisconnecting}>
              {setupLang.btn_cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="rounded-xl p-3.25"
              render={
                <HoldButton
                  doneLabel={lang.data.common.deleted}
                  backgroundColor="var(--muted)"
                  fillColor="#f43f5e"
                  textColor="var(--muted-foreground)"
                  fillTextColor="#ffffff"
                  size="sm"
                  radius={14}
                  fillDirection="right"
                  className="h-max p-3.25 text-xs"
                  holdTime={2000}
                  releaseTime={200}
                  pressScale={1}
                  wave
                  waveAmplitude={6}
                  glow={false}
                  resetAfter={1200}
                  disabled={isDisconnecting}
                  onHold={handleDisconnect}
                />
              }
            >
              {isDisconnecting ? <Spinner className="size-4" /> : setupLang.btn_confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

export default function StreamlabsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center min-h-100">
          <Spinner className="size-8 text-foreground/40" />
        </div>
      }
    >
      <StreamlabsPageContent />
    </Suspense>
  );
}
