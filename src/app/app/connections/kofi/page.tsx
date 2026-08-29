"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useStore } from "zustand";
import { getCookie } from "cookies-next/client";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getApiUrl } from "@/lib/api";
import { Input } from "react-smooth-input";
import { toast } from "sonner";
import {
  LockKeyIcon,
  GlobeIcon,
  ArrowLeftIcon,
  LinkBreakIcon,
  CheckIcon,
  CopyIcon,
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
import { KoFi } from "@thesvg/react";
import { Connections } from "@/types/user.types";

function KofiPage() {
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo, logout } = useUserContext();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [connections, setConnections] = useState<Connections | null>(null);
  const [username, setUsername] = useState("");
  const [secret, setSecret] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const isFetched = useRef(false);
  const webhookUrl = "https://api.alertbox.org/v1/webhook/kofi";

  const t = lang.data.app.connections.kofi_setup;

  useEffect(() => {
    if (isFetched.current || !userInfo) return;
    isFetched.current = true;
    const token = getCookie("USRSS");
    fetch(getApiUrl("/api/v1/me/connection"), {
      headers: {
        Authorization: "Bearer " + atob(token || ""),
      },
    })
      .then((res) => {
        if (res.status === 401) {
          logout();
          return;
        }
        if (res.ok) return res.json();
        throw new Error("Failed to fetch connections");
      })
      .then((data: Connections) => {
        setConnections(data);
        if (data.kofi) {
          setUsername(data.kofi.username || "");
          setSecret(data.kofi.secret || "");
        }
      })
      .catch(() => {
        // ignore
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [logout, userInfo]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setIsCopied(true);
      toast.success(t.copied);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !secret.trim()) {
      toast.error(t.error_fields);
      return;
    }

    setIsSaving(true);

    const token = getCookie("USRSS");
    try {
      const res = await fetch(getApiUrl("/api/v1/me/connection/kofi"), {
        method: "POST",
        headers: {
          Authorization: "Bearer " + atob(token || ""),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          secret: secret.trim(),
        }),
      });

      if (res.ok) {
        toast.success(t.success_save);
        setConnections((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            kofi: { username: username.trim(), secret: secret.trim() },
          };
        });
      } else {
        const errorText = await res.text();
        toast.error(errorText || t.error_save);
      }
    } catch {
      toast.error(t.error_network);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    setIsSaving(true);

    const token = getCookie("USRSS");
    try {
      const res = await fetch(getApiUrl("/api/v1/me/connection/kofi"), {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + atob(token || ""),
        },
      });

      if (res.ok) {
        toast.success(t.success_disconnect);
        setConnections((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            kofi: null,
          };
        });
        setUsername("");
        setSecret("");
      } else {
        toast.error(t.error_disconnect);
      }
    } catch {
      toast.error(t.error_network);
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

  const isConnected = !!connections?.kofi;

  return (
    <div className="w-full mx-auto flex flex-col min-h-0 flex-1 py-4 animate-fade-in duration-300">
      <Link
        href="/app/connections?t=payment"
        className="flex items-center gap-1 text-sm font-semibold text-foreground/50 hover:text-foreground/80 w-max mb-6 mt-3 transition-colors font-sans"
      >
        <ArrowLeftIcon size={16} weight="bold" />
        {t.back}
      </Link>

      <div className="flex items-center gap-4 mb-8 font-sans">
        <div className="p-3 bg-red-100 text-red-500 rounded-2xl">
          <KoFi className="size-10" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-sans">
            {t.title}
          </h1>
          <p className="text-sm text-foreground/50 mt-1">{t.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card/40 p-4 md:p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <GlobeIcon size={22} className="text-foreground/75" />
              {t.steps_title}
            </h2>

            <div className="space-y-6 relative border-l border-foreground/10 pl-6 ml-3 text-sm group">
              <div className="relative group-hover:opacity-30 hover:opacity-100">
                <span className="absolute -left-9.5 top-0 flex items-center justify-center size-7 rounded-xl bg-muted text-muted-foreground font-bold text-xs select-none">
                  1
                </span>
                <h3 className="font-bold text-base mb-1">{t.step1_title}</h3>
                <div className="text-foreground/60 leading-relaxed font-sans text-xs">
                  {t.step1_desc_prefix}
                  <a
                    href="https://ko-fi.com/manage/webhooks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:underline"
                  >
                    {t.step1_desc_link}
                  </a>
                  {t.step1_desc_suffix}
                </div>
              </div>

              <div className="relative group-hover:opacity-30 hover:opacity-100">
                <span className="absolute -left-9.5 top-0 flex items-center justify-center size-7 rounded-xl bg-muted text-muted-foreground font-bold text-xs select-none">
                  2
                </span>
                <h3 className="font-bold text-base mb-1">{t.step2_title}</h3>
                <p className="text-foreground/60 leading-relaxed mb-3 text-xs">
                  {t.step2_desc}
                </p>

                <div className="flex items-center gap-2 bg-foreground/5 rounded-3xl p-1 font-mono text-xs w-full max-w-full overflow-hidden">
                  <span className="truncate flex-1 text-foreground/60 select-all font-mono ml-1.5">
                    {webhookUrl}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-2 hover:bg-foreground/10 rounded-xl transition-all cursor-pointer shrink-0 text-foreground/60 hover:text-foreground"
                    title={lang.key === "th-TH" ? "คัดลอก URL" : "Copy URL"}
                  >
                    {isCopied ? (
                      <CheckIcon size={16} className="text-emerald-500" />
                    ) : (
                      <CopyIcon size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div className="relative group-hover:opacity-30 hover:opacity-100">
                <span className="absolute -left-9.5 top-0 flex items-center justify-center size-7 rounded-xl bg-muted text-muted-foreground font-bold text-xs select-none">
                  3
                </span>
                <h3 className="font-bold text-base mb-1">{t.step3_title}</h3>
                <p className="text-foreground/60 leading-relaxed font-sans text-xs">
                  {t.step3_desc}
                </p>
              </div>

              <div className="relative group-hover:opacity-30 hover:opacity-100">
                <span className="absolute -left-9.5 top-0 flex items-center justify-center size-7 rounded-xl bg-muted text-muted-foreground font-bold text-xs select-none">
                  4
                </span>
                <h3 className="font-bold text-base mb-1">{t.step4_title}</h3>
                <p className="text-foreground/60 leading-relaxed font-sans text-xs">
                  {t.step4_desc}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card/40 p-4 md:p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{t.settings_title}</h2>
              {isConnected ? (
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center gap-1 select-none animate-fade-in">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {lang.data.app.connections.status.connected}
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-foreground/10 text-foreground/40 rounded-full flex items-center gap-1 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/40" />
                  {lang.data.app.connections.status.notconnected}
                </span>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="flex flex-col gap-2 font-sans">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/45 flex items-center gap-1">
                  {t.username}
                </label>
                <div className="relative flex items-center">
                  <Input
                    type="text"
                    required
                    placeholder="username"
                    value={username}
                    readOnly={isSaving}
                    maxLength={64}
                    onChange={(e) => setUsername(e.target.value)}
                    startContent={
                      <span className="text-xs text-foreground/40 font-semibold select-none font-sans">
                        ko-fi.com/
                      </span>
                    }
                    className="text-foreground flex-1 min-w-0"
                    fontStyle={{
                      fontFamily: "var(--font-sans)",
                      fontWeight: "600",
                      fontSize: "12px",
                    }}
                    classNames={{
                      base: "h-12 rounded-xl w-full gap-0",
                    }}
                  />
                </div>
                <p className="text-[10px] text-foreground/40 font-sans">
                  {t.username_desc}
                </p>
              </div>

              <div className="flex flex-col gap-2 font-sans">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/45 flex items-center gap-1 font-sans">
                  <LockKeyIcon size={14} className="inline" />
                  {t.secret}
                </label>
                <Input
                  type="password"
                  required
                  placeholder={t.secret_placeholder}
                  value={secret}
                  readOnly={isSaving}
                  maxLength={255}
                  onChange={(e) => setSecret(e.target.value)}
                  className="text-foreground flex-1 min-w-0 font-sans"
                  fontStyle={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: "600",
                    fontSize: "12px",
                  }}
                  classNames={{
                    base: "h-12 rounded-xl px-3 border-2 border-transparent dark:bg-white/10 bg-black/10 hover:bg-black/5 hover:border-black/10 dark:hover:bg-white/5 dark:hover:border-white/10 focus-within:bg-black/5! focus-within:border-black/10! focus-within:dark:bg-white/5! focus-within:dark:border-white/10! w-full",
                  }}
                />
              </div>

              <div className="flex flex-col gap-2 font-sans">
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isSaving || !username.trim() || !secret.trim()}
                  className="w-full h-12 rounded-xl text-xs font-bold tracking-wider cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <Spinner className="size-4 text-current" />
                  ) : isConnected ? (
                    t.btn_update
                  ) : (
                    t.btn_connect
                  )}
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
                    {t.btn_disconnect}
                  </Button>
                )}
              </div>
            </form>
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
              {lang.key === "th-TH"
                ? "ยืนยันการตัดการเชื่อมต่อ"
                : "Confirm Disconnection"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.confirm_disconnect}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              variant="secondary"
              className="rounded-xl cursor-pointer"
              disabled={isSaving}
            >
              {lang.key === "th-TH" ? "ยกเลิก" : "Cancel"}
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
              ) : lang.key === "th-TH" ? (
                "ยืนยัน"
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default KofiPage;
