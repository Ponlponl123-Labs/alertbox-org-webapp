"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "zustand";
import { getCookie } from "cookies-next/client";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  LinkBreakIcon,
  SlidersIcon,
  ClockIcon,
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

const StreamlabsOption = {
  STRIPE_PAYMENT_SUCCESS: 1,      // 0b00000001
  BMAC_MEMBERSHIP_SUCCESS: 2,     // 0b00000010
  KOFI_DONATION_SUCCESS: 4,       // 0b00000100
  KOFI_PURCHASE_SUCCESS: 8,       // 0b00001000
  BMAC_DONATION_SUCCESS: 16,      // 0b00010000
  CONFIGURED_FLAG: 128,           // 0b10000000 (indicates configured status to avoid 0-fallback in backend)
};

function StreamlabsPage() {
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo, logout } = useUserContext();
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code");
  const state = params.get("state");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Toggle state
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [bmacMembershipEnabled, setBmacMembershipEnabled] = useState(true);
  const [kofiDonationEnabled, setKofiDonationEnabled] = useState(true);
  const [kofiPurchaseEnabled, setKofiPurchaseEnabled] = useState(true);
  const [bmacEnabled, setBmacEnabled] = useState(true);

  // Logs state
  const [logs, setLogs] = useState<RelayLog[]>([]);

  const isFetched = useRef(false);

  const t = lang.data.app.connections.providers.streamlabs;
  const setupLang = lang.data.app.connections.streamlabs_setup;

  // Handle OAuth code exchange flow if code & state exist in URL
  useEffect(() => {
    if (code && state) {
      setIsLoading(true);
      const token = getCookie("USRSS");
      fetch("/api/v1/me/connection/integration/streamlabs", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + atob(token || ""),
        },
        body: code,
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to connect");
          }
          toast.success(setupLang.success_connected);
          setTimeout(() => {
            router.push("/app/connections?t=trigger");
          }, 2400);
        })
        .catch(() => {
          toast.error(setupLang.error_connected);
          setTimeout(() => {
            router.push("/app/connections?t=trigger");
          }, 2400);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // Configuration mode: load connection status and logs
      if (isFetched.current || !userInfo) return;
      isFetched.current = true;
      loadSettingsAndLogs();
    }
  }, [code, state, router, userInfo, setupLang]);

  // Handle realtime logs WebSocket connection
  useEffect(() => {
    if (code && state) return; // Don't connect WS in OAuth mode

    const token = getCookie("USRSS");
    if (!isConnected || !token) return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWS = () => {
      try {
        const decodedToken = atob(token);
        const wsHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
          ? `${window.location.hostname}:5000`
          : window.location.host;
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${wsProtocol}//${wsHost}/v1/me/connection/integration/streamlabs/ws?token=${encodeURIComponent(decodedToken)}`;

        ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === "created") {
              setLogs((prev) => [data.log, ...prev]);
            } else if (data.event === "updated") {
              setLogs((prev) =>
                prev.map((log) => (log.id === data.log.id ? data.log : log))
              );
            }
          } catch (e) {
            // ignore
          }
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connectWS, 3000);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch (err) {
        // ignore
      }
    };

    connectWS();

    return () => {
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [isConnected, code, state]);

  const loadSettingsAndLogs = async () => {
    setIsLoading(true);
    const token = getCookie("USRSS");
    const headers = {
      Authorization: "Bearer " + atob(token || ""),
    };

    try {
      // Load settings
      const settingsRes = await fetch("/api/v1/me/connection/integration/streamlabs", { headers });
      if (settingsRes.status === 401) {
        logout();
        return;
      }
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setIsConnected(settings.isConnected);
        const optionsVal = settings.options;

        if (optionsVal !== null) {
          if (optionsVal === 0) {
            // Option 0 represents default / all enabled
            setStripeEnabled(true);
            setBmacMembershipEnabled(true);
            setKofiDonationEnabled(true);
            setKofiPurchaseEnabled(true);
            setBmacEnabled(true);
          } else {
            setStripeEnabled((optionsVal & StreamlabsOption.STRIPE_PAYMENT_SUCCESS) !== 0);
            setBmacMembershipEnabled((optionsVal & StreamlabsOption.BMAC_MEMBERSHIP_SUCCESS) !== 0);
            setKofiDonationEnabled((optionsVal & StreamlabsOption.KOFI_DONATION_SUCCESS) !== 0);
            setKofiPurchaseEnabled((optionsVal & StreamlabsOption.KOFI_PURCHASE_SUCCESS) !== 0);
            setBmacEnabled((optionsVal & StreamlabsOption.BMAC_DONATION_SUCCESS) !== 0);
          }
        }
      }

      // Load logs
      const logsRes = await fetch("/api/v1/me/connection/integration/streamlabs/logs", { headers });
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      }
    } catch (err) {
      toast.error(setupLang.error_load);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    const token = getCookie("USRSS");

    // Calculate options value
    let val = StreamlabsOption.CONFIGURED_FLAG; // Always include configured flag to avoid 0-fallback
    if (stripeEnabled) val |= StreamlabsOption.STRIPE_PAYMENT_SUCCESS;
    if (bmacMembershipEnabled) val |= StreamlabsOption.BMAC_MEMBERSHIP_SUCCESS;
    if (kofiDonationEnabled) val |= StreamlabsOption.KOFI_DONATION_SUCCESS;
    if (kofiPurchaseEnabled) val |= StreamlabsOption.KOFI_PURCHASE_SUCCESS;
    if (bmacEnabled) val |= StreamlabsOption.BMAC_DONATION_SUCCESS;

    try {
      const res = await fetch("/api/v1/me/connection/integration/streamlabs", {
        method: "PATCH",
        headers: {
          Authorization: "Bearer " + atob(token || ""),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ options: val }),
      });

      if (res.ok) {
        toast.success(setupLang.success_save);
      } else {
        toast.error(setupLang.error_save);
      }
    } catch (err) {
      toast.error(setupLang.error_network);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    setIsSaving(true);
    const token = getCookie("USRSS");

    try {
      const res = await fetch("/api/v1/me/connection/integration/streamlabs", {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + atob(token || ""),
        },
      });

      if (res.ok) {
        toast.success(setupLang.success_disconnect);
        router.push("/app/connections?t=trigger");
      } else {
        toast.error(setupLang.error_disconnect);
      }
    } catch (err) {
      toast.error(setupLang.error_network);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8 text-foreground/40" />
      </div>
    );
  }

  // Render OAuth callback loader screen
  if (code && state) {
    return (
      <div className="w-full flex flex-col min-h-0 mt-6 flex-1 gap-1.5 font-sans">
        <div className="w-full flex flex-col items-center justify-center min-h-0 bg-foreground/5 rounded-4xl py-6 flex-1 border-2 border-dashed border-foreground/10">
          <div className="flex items-center justify-center gap-4 animate-pulse">
            <Image
              src={"/favicon.ico"}
              width={64}
              height={64}
              alt="Alertbox.org"
              className="-ml-4.25"
            />
            <Spinner className="size-4 text-foreground/40" />
            <Streamlabs className="size-10 -mt-0.75 ml-2" />
          </div>
          <h1 className="text-lg font-semibold mt-3">
            {t.oauth.connecting}
          </h1>
          <p className="text-xs text-foreground/40 mt-3 text-center">
            {t.oauth.connecting_description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto flex flex-col min-h-0 flex-1 py-4 animate-fade-in duration-300 font-sans">
      {/* Back button */}
      <Link
        href="/app/connections?t=trigger"
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
          <h1 className="text-3xl font-bold tracking-tight font-sans">
            {t.name}
          </h1>
          <p className="text-sm text-foreground/50 mt-1">{t.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans">
        {/* Left Column: Option Toggles */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-card/40 p-4 md:p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <SlidersIcon size={22} className="text-foreground/75" />
              {setupLang.settings_title}
            </h2>

            <div className="space-y-5">
              {[
                {
                  label: setupLang.relay_bmac_donation,
                  checked: bmacEnabled,
                  onChange: (checked: boolean) => setBmacEnabled(checked),
                },
                {
                  label: setupLang.relay_bmac_membership,
                  checked: bmacMembershipEnabled,
                  onChange: (checked: boolean) => setBmacMembershipEnabled(checked),
                },
                {
                  label: setupLang.relay_kofi_donation,
                  checked: kofiDonationEnabled,
                  onChange: (checked: boolean) => setKofiDonationEnabled(checked),
                },
                {
                  label: setupLang.relay_kofi_purchase,
                  checked: kofiPurchaseEnabled,
                  onChange: (checked: boolean) => setKofiPurchaseEnabled(checked),
                },
                {
                  label: setupLang.relay_stripe,
                  checked: stripeEnabled,
                  onChange: (checked: boolean) => setStripeEnabled(checked),
                },
              ].map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-foreground/5 transition-colors cursor-pointer select-none group"
                >
                  <span className="text-sm font-semibold text-foreground/70 group-hover:text-foreground">
                    {item.label}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={item.checked}
                    onChange={(e) => item.onChange(e.target.checked)}
                  />
                  <div className="relative w-11 h-6 bg-foreground/15 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
                </label>
              ))}

              <div className="pt-4 flex flex-col gap-3">
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="w-full h-12 rounded-xl text-xs font-bold tracking-wider cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
                >
                  {isSaving ? <Spinner className="size-4 text-current" /> : setupLang.btn_save}
                </Button>

                {isConnected && (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isSaving}
                    onClick={() => setIsConfirmOpen(true)}
                    className="w-full h-12 rounded-xl text-xs font-bold tracking-wider cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <LinkBreakIcon size={16} />
                    {setupLang.btn_disconnect}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Relay Event Logs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-card/40 p-4 md:p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ClockIcon size={22} className="text-foreground/75" />
              {setupLang.logs_title}
            </h2>

            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-foreground/30 text-center">
                <ClockIcon size={48} className="mb-2 opacity-55" />
                <p className="text-sm font-semibold text-foreground/70">
                  {setupLang.no_logs}
                </p>
                <p className="text-xs mt-1 text-foreground/40">
                  {setupLang.no_logs_desc}
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl bg-foreground/5 border border-foreground/5 flex flex-col gap-2 relative group overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                        {log.provider === "buymeacoffee" ? "Buy Me a Coffee" : log.provider}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full select-none ${
                          log.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : log.status === "FAILED"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold">
                        {(log.amount / 100).toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-foreground/45">
                        {log.currency.toUpperCase()}
                      </span>
                      <span className="text-xs text-foreground/40 ml-auto select-none">
                        {new Date(log.createdAt).toLocaleString(lang.key === "th-TH" ? "th-TH" : "en-US", {
                          hour12: false,
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="text-xs text-foreground/70">
                      <span className="font-semibold text-foreground/90">{log.senderName}</span>
                      {log.message && <span className="italic block mt-1 bg-foreground/5 p-2 rounded-xl text-foreground/50">{log.message}</span>}
                    </div>

                    {log.errorMessage && (
                      <div className="mt-2 text-[11px] text-red-500/90 font-mono bg-red-500/5 p-2 rounded-xl border border-red-500/10">
                        Error: {log.errorMessage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Disconnect Confirmation Modal */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent size="sm" className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 p-2 size-12 rounded-xl text-destructive dark:bg-destructive/20 dark:text-destructive">
              <LinkBreakIcon weight="regular" size={12} />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-lg">
              {setupLang.confirm_disconnect_title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {setupLang.confirm_disconnect_desc}
            </AlertDialogDescription>
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
              {isSaving ? (
                <Spinner className="size-4" />
              ) : (
                setupLang.btn_confirm
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default StreamlabsPage;
