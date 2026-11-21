"use client";
import React, { useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getApiUrl } from "@/lib/api";
import { Input } from "react-smooth-input";
import { toast } from "@/components/custom-ui/toast";
import {
  LockKeyIcon,
  LinkBreakIcon,
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
import { BuyMeACoffee } from "@thesvg/react";
import { Badge } from "@/components/ui/badge";
import { Connections } from "@/types/user.types";
import { canAccessStreamer } from "@/lib/rbac";
import { StreamerPerm, OrgPerm } from "@/consts/permission";
import { motion } from "motion/react";
import { AnimateIcon } from "@animate-ui/react/icons";
import { Collapsible } from "@animate-ui/react/primitives/base-ui/collapsible";
import { ArrowDown01 } from "@/components/animate-ui/icons/hugeicons/arrow-down-01";
import { Accordion } from "@animate-ui/react/primitives/base-ui/accordion";
import { Check } from "@/components/animate-ui/icons/hugeicons/check";
import { CopyButton, CopyButtonIcon } from "@animate-ui/react/primitives/buttons/copy";
import { SquareArrowOutUpRight } from "@/components/animate-ui/icons/hugeicons/square-arrow-out-up-right";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Clipboard } from "@/components/animate-ui/icons/hugeicons/clipboard";
import { ClipboardCheck } from "@/components/animate-ui/icons/hugeicons/clipboard-check";

function BmacPage() {
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo, logout, authFetch, activeOrg, activeStreamer } = useUserContext();
  const routeParams = useParams();
  const targetOrg = activeOrg?.id || activeOrg?.slug || (routeParams?.org as string);
  const targetStreamer = activeStreamer?.id || activeStreamer?.name || (routeParams?.streamer as string);

  const canManageIntegrations = canAccessStreamer(
    activeOrg,
    activeStreamer,
    StreamerPerm.STREAMER_INTEGRATION_MANAGE,
    OrgPerm.INTEGRATION_MANAGE
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [connections, setConnections] = useState<Connections | null>(null);
  const [username, setUsername] = useState("");
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const [secret, setSecret] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [focusOnStep, setFocusOnStep] = useState<string[]>(["item-0"]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(username.trim());
    }, 800);
    return () => clearTimeout(timer);
  }, [username]);

  const isFetched = useRef(false);
  const webhookUrl = "https://api.alertbox.org/v1/webhook/buymeacoffee";

  const t = lang.data.app.connections.bmac_setup;

  const connectionsEndpoint = targetOrg && targetStreamer
    ? getApiUrl(`/api/v1/org/${targetOrg}/streamers/${targetStreamer}/integration`)
    : "";
  const bmacEndpoint = targetOrg && targetStreamer
    ? getApiUrl(`/api/v1/org/${targetOrg}/streamers/${targetStreamer}/integration/buymeacoffee`)
    : "";

  useEffect(() => {
    if (isFetched.current || !userInfo || !connectionsEndpoint) return;
    isFetched.current = true;
    authFetch(connectionsEndpoint)
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
        if (data.bmac) {
          setUsername(data.bmac.username || "");
          setSecret(data.bmac.secret || "");
          if (data.bmac.username) setStep(4);
          if (data.bmac.secret) setStep(5);
        }
      })
      .catch(() => {
        // ignore
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [logout, userInfo, authFetch, connectionsEndpoint]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !secret.trim()) {
      toast.error(t.error_fields);
      return;
    }

    setIsSaving(true);

    try {
      const res = await authFetch(bmacEndpoint, {
        method: "POST",
        headers: {
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
            bmac: { username: username.trim(), secret: secret.trim() },
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

    try {
      const res = await authFetch(bmacEndpoint, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(t.success_disconnect);
        setConnections((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            bmac: null,
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
      <div className="w-full flex items-center justify-center min-h-100">
        <Spinner className="size-8 text-foreground/40" />
      </div>
    );
  }

  const isConnected = !!connections?.bmac;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mx-auto max-w-384 px-12 pt-12 flex flex-col gap-6 z-10 min-h-0 flex-1"
    >
      <div className="flex items-center w-full justify-between gap-4 mb-8 font-sans">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium tracking-tight text-foreground my-3">
            {t.title}
          </h1>
          <p className="text-sm font-sans text-muted-foreground mt-3">
            {t.description}
          </p>
        </div>
        <div className="p-3">
          <BuyMeACoffee className="size-12 *:fill-amber-300" />
        </div>
      </div>

      <Collapsible.Root defaultOpen>
        <AnimateIcon animateOnHover="default-loop">
          <Collapsible.Trigger className="w-full p-3 rounded-xl not-data-panel-open:bg-muted/40 data-panel-open:bg-muted font-semibold text-xs flex gap-3 items-center justify-start text-start group/accordion-trigger">
            <ArrowDown01 animateOnHover className="size-4 group-aria-expanded/accordion-trigger:rotate-180 transition-all" />
            How to setup
          </Collapsible.Trigger>
        </AnimateIcon>
        <Collapsible.Panel>
          <div className="p-1 mt-3 rounded-xl">
            <Accordion.Root value={focusOnStep} onValueChange={setFocusOnStep}>
              {[
                {
                  title: t.step1_title,
                  children: (
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        {t.step1_desc_prefix}
                        <Link
                          href="https://studio.buymeacoffee.com/webhooks"
                          target="_blank"
                          className="text-indigo-400 hover:underline"
                        >
                          {t.step1_desc_link}
                        </Link>
                        {t.step1_desc_suffix}
                      </span>
                      <div className="flex items-center mt-3 gap-1">
                        <Link href="https://studio.buymeacoffee.com/webhooks" target="_blank">
                          <AnimateIcon animateOnHover>
                            <Button variant="default" className="rounded-xl h-max p-3 font-semibold">
                              <SquareArrowOutUpRight />
                              Go to Buy Me a Coffee Webhooks Page
                            </Button>
                          </AnimateIcon>
                        </Link>
                        <AnimateIcon animateOnHover>
                          <Button onClick={() => { setStep(1); setFocusOnStep(["item-1"]); }} variant="secondary" className="rounded-xl h-max p-3 font-semibold">
                            <Check />
                            Mark as done
                          </Button>
                        </AnimateIcon>
                      </div>
                    </div>
                  ),
                },
                {
                  title: t.step2_title,
                  children: (
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        {t.step2_desc}
                      </span>
                      <span tabIndex={0} className="bg-muted mt-3 text-xs tracking-tighter font-lexendexa rounded-lg p-2 select-all cursor-text">
                        {webhookUrl}
                      </span>
                      <div className="flex items-center mt-3 gap-1">
                        <CopyButton asChild content={webhookUrl} aria-label="Copy">
                          <AnimateIcon animateOnHover>
                            <Button variant="default" className="rounded-xl h-max p-3 font-semibold">
                              <CopyButtonIcon icon={<Clipboard />} copiedIcon={<ClipboardCheck />} />
                              Copy your endpoint
                            </Button>
                          </AnimateIcon>
                        </CopyButton>
                        <AnimateIcon animateOnHover>
                          <Button onClick={() => { setStep(2); setFocusOnStep(["item-2"]); }} variant="secondary" className="rounded-xl h-max p-3 font-semibold">
                            <Check />
                            Mark as done
                          </Button>
                        </AnimateIcon>
                      </div>
                    </div>
                  ),
                },
                {
                  title: t.step3_title,
                  children: (
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        {t.step3_desc}
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <Badge
                          variant="secondary"
                          className="rounded-lg font-mono text-[10px] px-2 py-0.5 border border-foreground/10 select-all cursor-pointer"
                        >
                          support created
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="rounded-lg font-mono text-[10px] px-2 py-0.5 border border-foreground/10 select-all cursor-pointer"
                        >
                          monthly support started
                        </Badge>
                      </div>
                      <div className="flex items-center mt-3 gap-1">
                        <AnimateIcon animateOnHover>
                          <Button onClick={() => { setStep(3); setFocusOnStep(["item-3"]); }} variant="secondary" className="rounded-xl h-max p-3 font-semibold">
                            <Check />
                            Mark as done
                          </Button>
                        </AnimateIcon>
                      </div>
                    </div>
                  ),
                },
                {
                  title: t.step4_title,
                  children: (
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        {t.step4_desc}
                      </span>
                      <div className="flex items-center mt-3 gap-1">
                        <AnimateIcon animateOnHover>
                          <Button onClick={() => { setStep(4); setFocusOnStep(["item-4"]); }} variant="secondary" className="rounded-xl h-max p-3 font-semibold">
                            <Check />
                            Mark as done
                          </Button>
                        </AnimateIcon>
                      </div>
                    </div>
                  ),
                },
                {
                  title: t.step5_title,
                  children: (
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        {t.step5_desc}
                      </span>
                      <div className="flex items-center mt-3 gap-1">
                        <AnimateIcon animateOnHover>
                          <Button onClick={() => { setStep(5); setFocusOnStep(["item-5"]); }} variant="secondary" className="rounded-xl h-max p-3 font-semibold">
                            <Check />
                            Mark as done
                          </Button>
                        </AnimateIcon>
                      </div>
                    </div>
                  ),
                },
              ].map((item, idx) => (
                <Accordion.Item key={idx} value={"item-" + idx} className="relative pb-3 group/accordion-item" {...step > idx && { "data-finished": true }}>
                  <div className="w-1 h-[calc(100%-2rem)] not-group-data-finished/accordion-item:not-group-data-open/accordion-item:max-h-0 max-h-full transition-all bg-secondary group-data-finished/accordion-item:bg-primary absolute top-9 not-group-data-finished/accordion-item:mask-b-from-0 left-4.5 group-last/accordion-item:hidden" />
                  <Accordion.Header>
                    <AnimateIcon animateOnHover="default-loop">
                      <Accordion.Trigger className="w-full p-1 rounded-2xl hover:bg-foreground/10 font-semibold text-xs flex gap-3 items-center justify-start text-start group/accordion-trigger active:scale-100 not-group-data-finished/accordion-item:not-aria-expanded:opacity-60 not-group-data-finished/accordion-item:not-aria-expanded:blur-[1px]">
                        <div className="size-8 flex items-center justify-center z-10 rounded-2xl not-group-data-finished/accordion-item:border-2 border-secondary group-data-finished/accordion-item:bg-primary group-data-finished/accordion-item:text-primary-foreground">
                          {idx + 1}
                        </div>
                        {item.title}
                        <ArrowDown01 animateOnHover className="size-4 group-aria-expanded/accordion-trigger:rotate-180 transition-all ml-auto" />
                      </Accordion.Trigger>
                    </AnimateIcon>
                  </Accordion.Header>
                  <Accordion.Panel>
                    <div className="p-1 pb-3 pl-12 mt-1 rounded-xl">
                      {item.children}
                    </div>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start font-sans">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-medium">{t.settings_title}</h2>
              {isConnected ? (
                <span className="text-xs font-semibold px-3 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center gap-2 select-none animate-fade-in">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {lang.data.app.connections.status.connected}
                </span>
              ) : (
                <span className="text-xs font-semibold px-3 py-2 bg-foreground/10 text-foreground/40 rounded-xl flex items-center gap-2 select-none">
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
                    readOnly={isSaving || !canManageIntegrations}
                    maxLength={64}
                    onChange={(e) => setUsername(e.target.value)}
                    startContent={
                      <span className="text-sm text-foreground/40 font-medium select-none font-sans">
                        buymeacoffee.com/
                      </span>
                    }
                    className="text-foreground flex-1 min-w-0"
                    fontStyle={{
                      fontFamily: "var(--font-sans)",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                    classNames={{
                      base: "h-12 rounded-xl w-full border-2 gap-0",
                    }}
                  />
                </div>
                <p className="text-[10px] text-foreground/40 font-sans">
                  {t.username_desc}
                </p>
              </div>

              <div className="flex flex-col gap-2 font-sans">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/45 flex items-center gap-1 font-sans">
                  <LockKeyIcon size={14} weight="bold" className="inline" />
                  {t.secret}
                </label>
                <Input
                  type="password"
                  required
                  placeholder={t.secret_placeholder}
                  value={secret}
                  readOnly={isSaving || !canManageIntegrations}
                  maxLength={255}
                  onChange={(e) => setSecret(e.target.value)}
                  className="text-foreground flex-1 min-w-0 font-sans"
                  fontStyle={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                  classNames={{
                    base: "h-12 rounded-xl px-3 border-2 border-transparent dark:bg-white/10 bg-black/10 hover:bg-black/5 hover:border-black/10 dark:hover:bg-white/5 dark:hover:border-white/10 focus-within:bg-black/5! focus-within:border-black/10! focus-within:dark:bg-white/5! focus-within:dark:border-white/10! w-full",
                  }}
                />
                <p className="text-[10px] text-foreground/40 font-sans">
                  Please ensure the secret is correct, because when the widget is works didn&apos;t mean the secret is correct. its will cause to cannot regonize any alerts if its wrong.
                </p>
              </div>

              <div className="flex gap-2 justify-end font-sans">
                {isConnected && canManageIntegrations && (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isSaving}
                    onClick={() => setIsConfirmOpen(true)}
                    className="h-max p-4 rounded-xl text-xs tracking-wider flex items-center justify-center gap-2"
                  >
                    <LinkBreakIcon size={16} />
                    {t.btn_disconnect}
                  </Button>
                )}
                {canManageIntegrations ? (
                  <Button
                    type="submit"
                    variant="default"
                    disabled={isSaving || !username.trim() || !secret.trim()}
                    className="h-max p-4 rounded-xl text-xs tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <Spinner className="size-4 text-current" />
                    ) : isConnected ? (
                      t.btn_update
                    ) : (
                      t.btn_connect
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled
                    className="h-max p-4 rounded-xl text-xs tracking-wider opacity-60 cursor-not-allowed"
                  >
                    Read-only (No Permission)
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
        <div className="rounded-2xl flex flex-col bg-muted">
          <span className="px-3 py-1 font-semibold text-muted-foreground select-none text-sm">Live Preview</span>
          <div className="flex items-center justify-center border-2 border-muted rounded-2xl bg-card overflow-hidden">
            {
              debouncedUsername.length >= 3 ? (
                <iframe
                  className="w-96 h-172 border-0 rounded-sm bg-white scale-75 pointer-events-none"
                  tabIndex={-1}
                  src={`https://www.buymeacoffee.com/widget/page/${debouncedUsername}`}
                  title="Buy Me a Coffee"
                  style={{ colorScheme: "light", scrollbarWidth: "thin" }}
                  loading="lazy"
                />
              ) : (
                <div className="w-96 h-172 bg-foreground/10 rounded-sm scale-75 flex items-center justify-center text-xs text-muted-foreground select-none">
                  {username.trim().length > 0 ? "Loading preview..." : "Enter username to preview"}
                </div>
              )
            }
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
    </motion.div>
  );
}

export default BmacPage;
