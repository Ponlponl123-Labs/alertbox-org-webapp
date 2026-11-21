"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useStore } from "zustand";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/custom-ui/toast";
import { getApiUrl } from "@/lib/api";
import { formatMoneyMinorUnits, getCachedDateFormat } from "@/lib/formatters";
import { isSafePathSegment } from "@/lib/security";
import { useAuthenticatedWebSocket } from "@/hooks/use-authenticated-ws";
import {
  ArrowLeftIcon,
  LinkBreakIcon,
  SlidersIcon,
  ClockIcon,
  CheckIcon,
  XIcon,
} from "@phosphor-icons/react";
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
import { Streamlabs } from "@thesvg/react";
import Image from "next/image";
import { canAccessStreamer } from "@/lib/rbac";
import { StreamerPerm, OrgPerm } from "@/consts/permission";

interface RelayLog {
  id: string;
  provider: string;
  type: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  amount: number;
  currency: string;
  senderName: string;
  message: string | null;
  errorMessage: string | null;
  createdAt: string;
}

const MAX_RELAY_LOGS = 200;

const StreamlabsOption = {
  STRIPE_PAYMENT_SUCCESS: 1,
  BMAC_MEMBERSHIP_SUCCESS: 2,
  KOFI_DONATION_SUCCESS: 4,
  KOFI_PURCHASE_SUCCESS: 8,
  BMAC_DONATION_SUCCESS: 16,
  CONFIGURED_FLAG: 128,
};

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

  const backHref =
    targetOrg && targetStreamer
      ? `/app/${encodeURIComponent(targetOrg)}/${encodeURIComponent(targetStreamer)}/connections?t=trigger`
      : "/app/connections?t=trigger";
  const streamlabsEndpoint =
    targetOrg && targetStreamer
      ? getApiUrl(
          `/api/v1/org/${encodeURIComponent(targetOrg)}/streamers/${encodeURIComponent(targetStreamer)}/integration/streamlabs`,
        )
      : "";
  const streamlabsLogsEndpoint =
    targetOrg && targetStreamer
      ? getApiUrl(
          `/api/v1/org/${encodeURIComponent(targetOrg)}/streamers/${encodeURIComponent(targetStreamer)}/integration/streamlabs/logs`,
        )
      : "";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [oauthStatus, setOauthStatus] = useState<"connecting" | "success" | "failed">(
    "connecting",
  );

  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [bmacMembershipEnabled, setBmacMembershipEnabled] = useState(true);
  const [kofiDonationEnabled, setKofiDonationEnabled] = useState(true);
  const [kofiPurchaseEnabled, setKofiPurchaseEnabled] = useState(true);
  const [bmacEnabled, setBmacEnabled] = useState(true);
  const [logs, setLogs] = useState<RelayLog[]>([]);

  const oauthExchangedRef = useRef(false);

  const t = lang.data.app.connections.providers.streamlabs;
  const setupLang = lang.data.app.connections.streamlabs_setup;

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
    if ((code && state) || !userInfo || !streamlabsEndpoint || !streamlabsLogsEndpoint) return;

    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        setIsLoading(true);
        setLogs([]);
      }
    });

    (async () => {
      try {
        const [settingsRes, logsRes] = await Promise.all([
          authFetch(streamlabsEndpoint, { signal: controller.signal }),
          authFetch(streamlabsLogsEndpoint, { signal: controller.signal }),
        ]);

        if (controller.signal.aborted) return;

        if (settingsRes.status === 401 || logsRes.status === 401) {
          logout();
          return;
        }

        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          if (controller.signal.aborted) return;
          setIsConnected(Boolean(settings.isConnected));
          const optionsVal = settings.options;

          if (optionsVal !== null && optionsVal !== undefined) {
            if (optionsVal === 0) {
              setStripeEnabled(true);
              setBmacMembershipEnabled(true);
              setKofiDonationEnabled(true);
              setKofiPurchaseEnabled(true);
              setBmacEnabled(true);
            } else {
              setStripeEnabled((optionsVal & StreamlabsOption.STRIPE_PAYMENT_SUCCESS) !== 0);
              setBmacMembershipEnabled(
                (optionsVal & StreamlabsOption.BMAC_MEMBERSHIP_SUCCESS) !== 0,
              );
              setKofiDonationEnabled((optionsVal & StreamlabsOption.KOFI_DONATION_SUCCESS) !== 0);
              setKofiPurchaseEnabled((optionsVal & StreamlabsOption.KOFI_PURCHASE_SUCCESS) !== 0);
              setBmacEnabled((optionsVal & StreamlabsOption.BMAC_DONATION_SUCCESS) !== 0);
            }
          }
        }

        if (logsRes.ok) {
          const logsData = (await logsRes.json()) as RelayLog[];
          if (!controller.signal.aborted && Array.isArray(logsData)) {
            setLogs(logsData.slice(0, MAX_RELAY_LOGS));
          }
        }
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") {
          toast.error(setupLang.error_load);
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
    authFetch,
    logout,
    setupLang.error_load,
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
      setLogs((prev) => [incoming, ...prev].slice(0, MAX_RELAY_LOGS));
    } else if (data.event === "updated") {
      setLogs((prev) => prev.map((log) => (log.id === incoming.id ? incoming : log)));
    }
  }, []);

  useAuthenticatedWebSocket({
    wsPath,
    enabled: Boolean(wsPath),
    onMessage: handleWsMessage,
  });

  const handleSaveSettings = async () => {
    if (!canManageIntegrations || !streamlabsEndpoint || isSaving) return;
    setIsSaving(true);

    let val = StreamlabsOption.CONFIGURED_FLAG;
    if (stripeEnabled) val |= StreamlabsOption.STRIPE_PAYMENT_SUCCESS;
    if (bmacMembershipEnabled) val |= StreamlabsOption.BMAC_MEMBERSHIP_SUCCESS;
    if (kofiDonationEnabled) val |= StreamlabsOption.KOFI_DONATION_SUCCESS;
    if (kofiPurchaseEnabled) val |= StreamlabsOption.KOFI_PURCHASE_SUCCESS;
    if (bmacEnabled) val |= StreamlabsOption.BMAC_DONATION_SUCCESS;

    try {
      const res = await authFetch(streamlabsEndpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ options: val }),
      });

      if (res.ok) {
        toast.success(setupLang.success_save);
      } else {
        toast.error(setupLang.error_save);
      }
    } catch {
      toast.error(setupLang.error_network);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!canManageIntegrations || !streamlabsEndpoint || isSaving) return;
    setIsSaving(true);

    try {
      const res = await authFetch(streamlabsEndpoint, { method: "DELETE" });
      if (res.ok) {
        toast.success(setupLang.success_disconnect);
        router.push(backHref);
      } else {
        toast.error(setupLang.error_disconnect);
      }
    } catch {
      toast.error(setupLang.error_network);
    } finally {
      setIsSaving(false);
    }
  };

  const logDateFormatter = getCachedDateFormat(lang.key === "th-TH" ? "th-TH" : "en-US", {
    hour12: false,
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (code && state) {
    return (
      <div className="w-full flex flex-col min-h-0 mt-6 flex-1 gap-1.5 font-sans">
        <div className="w-full flex flex-col items-center justify-center min-h-0 py-6 flex-1">
          <div className="flex items-center justify-center gap-4">
            <Image
              src="/favicon.ico"
              width={64}
              height={64}
              alt="Alertbox.org"
              className="-ml-4.25"
            />
            {oauthStatus === "connecting" ? (
              <Spinner className="size-4 text-foreground/40" />
            ) : oauthStatus === "success" ? (
              <div className="text-emerald-500 animate-scale-in">
                <CheckIcon weight="bold" size={16} />
              </div>
            ) : (
              <div className="text-rose-500 animate-scale-in">
                <XIcon weight="bold" size={16} />
              </div>
            )}
            <Streamlabs className="size-10 -mt-0.75 ml-2" />
          </div>
          <h1 className="text-lg font-semibold mt-3">
            {oauthStatus === "connecting"
              ? t.oauth.connecting
              : oauthStatus === "success"
                ? t.oauth.connected
                : t.oauth.failed}
          </h1>
          <p className="text-xs text-foreground/40 mt-3 text-center font-sans leading-relaxed">
            {oauthStatus === "connecting"
              ? t.oauth.connecting_description
              : oauthStatus === "success"
                ? t.oauth.connected_description
                : t.oauth.failed_description}
          </p>
        </div>
      </div>
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
    <div className="w-full mx-auto flex flex-col min-h-0 flex-1 py-4 animate-fade-in duration-300">
      <Link
        href={backHref}
        className="flex items-center gap-1 text-sm font-semibold text-foreground/50 hover:text-foreground/80 w-max mb-6 mt-3 transition-colors font-sans"
      >
        <ArrowLeftIcon size={16} weight="bold" />
        {setupLang.back}
      </Link>

      <div className="flex items-center gap-4 mb-8 font-sans">
        <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 rounded-2xl">
          <Streamlabs className="size-10" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-sans">{t.name}</h1>
          <p className="text-sm text-foreground/50 mt-1">{t.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans">
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-card/40 p-4 md:p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <SlidersIcon size={22} className="text-foreground/75" />
              {setupLang.settings_title}
            </h2>

            <div className="space-y-4">
              {[
                {
                  label: setupLang.relay_bmac_donation,
                  desc: setupLang.relay_bmac_donation_desc,
                  checked: bmacEnabled,
                  onChange: setBmacEnabled,
                },
                {
                  label: setupLang.relay_bmac_membership,
                  desc: setupLang.relay_bmac_membership_desc,
                  checked: bmacMembershipEnabled,
                  onChange: setBmacMembershipEnabled,
                },
                {
                  label: setupLang.relay_kofi_donation,
                  desc: setupLang.relay_kofi_donation_desc,
                  checked: kofiDonationEnabled,
                  onChange: setKofiDonationEnabled,
                },
                {
                  label: setupLang.relay_kofi_purchase,
                  desc: setupLang.relay_kofi_purchase_desc,
                  checked: kofiPurchaseEnabled,
                  onChange: setKofiPurchaseEnabled,
                },
                {
                  label: setupLang.relay_stripe,
                  desc: setupLang.relay_stripe_desc,
                  checked: stripeEnabled,
                  onChange: setStripeEnabled,
                },
              ].map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-foreground/5 transition-colors cursor-pointer select-none group"
                >
                  <div className="flex flex-col gap-0.5 max-w-[80%]">
                    <span className="text-sm font-semibold text-foreground/70 group-hover:text-foreground transition-colors font-sans">
                      {item.label}
                    </span>
                    <span className="text-xs text-foreground/40 leading-normal font-sans">
                      {item.desc}
                    </span>
                  </div>
                  <div className="relative flex items-center shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={item.checked}
                      disabled={!canManageIntegrations}
                      onChange={(e) => item.onChange(e.target.checked)}
                    />
                    <div className="relative w-11 h-6 bg-foreground/15 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 transition-colors peer-disabled:opacity-50" />
                  </div>
                </label>
              ))}

              <div className="pt-4 flex flex-col gap-3">
                {canManageIntegrations ? (
                  <Button
                    variant="secondary"
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="w-full h-12 rounded-xl text-xs font-bold tracking-wider cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {isSaving ? <Spinner className="size-4 text-current" /> : setupLang.btn_save}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    disabled
                    className="w-full h-12 rounded-xl text-xs font-bold tracking-wider opacity-60 cursor-not-allowed"
                  >
                    Read-only (No Permission)
                  </Button>
                )}

                {isConnected && canManageIntegrations && (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isSaving}
                    onClick={() => setIsConfirmOpen(true)}
                    className="w-full h-12 rounded-xl text-xs font-bold tracking-wider cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <LinkBreakIcon size={16} />
                    {setupLang.btn_disconnect}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="bg-card/40 p-4 md:p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ClockIcon size={22} className="text-foreground/75" />
              {setupLang.logs_title}
            </h2>

            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-foreground/30 text-center">
                <ClockIcon size={48} className="mb-2 opacity-55" />
                <p className="text-sm font-semibold text-foreground/70">{setupLang.no_logs}</p>
                <p className="text-xs mt-1 text-foreground/45">{setupLang.no_logs_desc}</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-125 overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-foreground/3 hover:bg-foreground/5 transition-colors text-xs flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            log.status === "COMPLETED"
                              ? "bg-emerald-500"
                              : log.status === "FAILED"
                                ? "bg-rose-500"
                                : "bg-amber-500"
                          }`}
                        />
                        <span className="font-semibold text-foreground/80 truncate">
                          {log.senderName}
                        </span>
                        <span className="text-[10px] text-foreground/40 shrink-0 font-medium font-sans">
                          via{" "}
                          {log.provider === "buymeacoffee"
                            ? "BMAC"
                            : log.provider === "kofi"
                              ? "Ko-fi"
                              : log.provider}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-0.5 shrink-0 font-sans">
                        <span className="font-bold text-foreground/90 tabular-nums">
                          {formatMoneyMinorUnits(log.amount, log.currency, lang.key)}
                        </span>
                      </div>
                    </div>

                    {(log.message || log.errorMessage || log.createdAt) && (
                      <div className="flex items-center justify-between gap-4 text-[11px]">
                        <div className="truncate text-foreground/50 leading-normal flex-1">
                          {log.errorMessage ? (
                            <span className="text-rose-500 font-mono">
                              Error: {log.errorMessage}
                            </span>
                          ) : (
                            log.message || <span className="opacity-0">-</span>
                          )}
                        </div>
                        <span className="text-[10px] text-foreground/35 select-none shrink-0 font-sans">
                          {logDateFormatter.format(new Date(log.createdAt))}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent size="sm" className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 p-2 size-12 rounded-xl text-destructive dark:bg-destructive/20 dark:text-destructive">
              <LinkBreakIcon weight="regular" size={12} />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-lg">
              {setupLang.confirm_disconnect_title}
            </AlertDialogTitle>
            <AlertDialogDescription>{setupLang.confirm_disconnect_desc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              variant="secondary"
              className="rounded-xl cursor-pointer"
              disabled={isSaving}
            >
              {setupLang.btn_cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="rounded-xl cursor-pointer"
              disabled={isSaving}
              onClick={async () => {
                await handleDisconnect();
                setIsConfirmOpen(false);
              }}
            >
              {isSaving ? <Spinner className="size-4" /> : setupLang.btn_confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
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
