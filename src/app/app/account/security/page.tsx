"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { violationStore } from "@/hooks/store/violation";
import { VIOLATION_BLOCK_LEVEL } from "@/consts/violation";
import { cn } from "@/lib/utils";
import { Device } from "@/types/user.types";
import {
  DevicesIcon,
  HandPeaceIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useStore } from "zustand";
import { getApiUrl } from "@/lib/api";
import { toast } from "@/components/custom-ui/toast";
import { ShieldCheck } from "@/components/animate-ui/icons/hugeicons/shield-check";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircleIcon, QuestionIcon, ShieldWarningIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr";
import { TriangleAlert } from "@/components/animate-ui/icons/hugeicons/triangle-alert";
import { OctagonAlert } from "@/components/animate-ui/icons/hugeicons/octagon-alert";

function Page() {
  const lang = useStore(coreStore, (state) => state.lang);
  const userViolation = useStore(violationStore, (state) => state.cache["user"]?.data);
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { userInfo, logout, authFetch } = useUserContext();

  useEffect(() => {
    if (!userInfo) return;
    void violationStore.getState().fetchUserViolations(authFetch);
  }, [userInfo, authFetch]);

  const hasViolations = Boolean(
    userViolation && (userViolation.level > 0 || userViolation.violate.length > 0),
  );
  const isViolationBlocked = (userViolation?.level ?? 0) >= VIOLATION_BLOCK_LEVEL;

  const revoke = async (device: Device) => {
    if (isRevoking || device.isThisDevice || device.isRevoked) return;
    setIsRevoking(true);
    try {
      const r = await authFetch(
        getApiUrl(`/api/v1/me/device/${encodeURIComponent(device.id)}`),
        { method: "DELETE" },
      );
      if (r.status === 401) {
        logout();
        return;
      }
      if (!r.ok) {
        toast.error(lang.data.app.security.toasts.revoke_failed);
        return;
      }
      const revokedDevice: Device = { ...device, isRevoked: true };
      setDevices((prev) =>
        (prev ?? []).map((d) => (d.id === device.id ? revokedDevice : d)),
      );
      setSelectedDevice((prev) => (prev?.id === device.id ? revokedDevice : prev));
    } catch {
      toast.error(lang.data.app.security.toasts.revoke_network);
    } finally {
      setIsRevoking(false);
    }
  };

  useEffect(() => {
    if (!userInfo?.id) return;
    const controller = new AbortController();
    (async () => {
      try {
        const r = await authFetch(getApiUrl("/api/v1/me/device"), {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        if (r.status === 401) {
          logout();
          return;
        }
        if (r.ok) {
          const data = (await r.json()) as Device[];
          if (!controller.signal.aborted) {
            setDevices(Array.isArray(data) ? data : []);
          }
        }
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") {
          toast.error(coreStore.getState().lang.data.app.security.toasts.load_failed);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();
    return () => controller.abort();
  }, [logout, userInfo?.id, authFetch]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full px-12 pt-12 flex flex-1 flex-col items-center text-center gap-6 z-10"
    >
      <div className="flex flex-col items-center mt-auto">
        {hasViolations ? (
          isViolationBlocked ? (
            <OctagonAlert
              className="mb-3 size-24 text-rose-500 p-6 bg-rose-500/10 rounded-full"
              animate
            />
          ) : (
            <TriangleAlert
              className="mb-3 size-24 text-amber-500 p-6 bg-amber-500/10 rounded-full"
              animate
            />
          )
        ) : (
          <ShieldCheck
            className="mb-3 size-24 text-emerald-500 p-6 bg-emerald-500/10 rounded-full"
            animate
          />
        )}
        <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-foreground my-3">
          Security Checkup
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg font-sans mt-0.5">
          {hasViolations ? (
            <>
              {isViolationBlocked ? "Actions restricted" : "Policy violation notice"} —{" "}
              <span className={isViolationBlocked ? "text-rose-500" : "text-amber-500"}>
                Level {userViolation?.level ?? 0}
              </span>{" "}
              ({userViolation?.violate.length ?? 0} violation(s) recorded)
            </>
          ) : (
            "No recommended action found"
          )}
        </p>
      </div>
      <div className="w-full max-w-2xl flex flex-col gap-4 p-1 mb-auto bg-card rounded-2xl overflow-hidden">
        <Accordion multiple className="divide-none w-full">
          <AccordionItem value="device">
            <AccordionTrigger className="hover:bg-muted/30 rounded-xl p-3 hover:no-underline flex items-center gap-3">
              <CheckCircleIcon weight="fill" className="text-emerald-500 size-6" />
              <div>
                <h3 className="text-sm">Your devices</h3>
                <p className="text-muted-foreground font-sans">Where you&apos;re signed in</p>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {isLoading && !devices ? (
                <Spinner className="size-6 text-foreground/40 mx-auto my-8" />
              ) : (
                <ResizablePanelGroup
                  orientation="horizontal"
                  className="min-w-0 flex-1 flex z-20 relative gap-1"
                >
                  <ResizablePanel defaultSize="80%">
                    <ScrollArea className="flex h-full max-h-96 gap-3">
                      {devices?.map((d, i) => (
                        <Button
                          variant={
                            selectedDevice?.id === d.id ? "secondary" : "ghost"
                          }
                          onClick={() => setSelectedDevice(d)}
                          className={cn(
                            "w-full rounded-md p-3 h-max flex flex-wrap justify-between gap-2 bg-background/30 overflow-hidden",
                            selectedDevice?.id === d.id &&
                            "border-2 border-foreground/10 bg-foreground/5",
                          )}
                          key={i}
                        >
                          {(d.isThisDevice || d.isRevoked) && (
                            <div className="flex w-full items-center gap-1.5 mb-0.5">
                              {d.isThisDevice && (
                                <Badge className="bg-sky-400 rounded-2xl rounded-tl-sm text-black text-[10px] font-semibold pr-2.5">
                                  <HandPeaceIcon className="size-6" weight="fill" />
                                  {lang.data.app.security.device.this}
                                </Badge>
                              )}
                              {d.isRevoked && (
                                <Badge className="bg-amber-400 rounded-2xl rounded-tl-sm text-black text-[10px] font-semibold pr-2.5">
                                  <ShieldCheckIcon
                                    className="size-6"
                                    weight="fill"
                                  />
                                  {lang.data.app.security.device.manage.disabled}
                                </Badge>
                              )}
                            </div>
                          )}
                          <div className="flex w-full items-center gap-3 mb-1.5">
                            <DevicesIcon className="size-6" weight="fill" />
                            <div className="flex flex-col gap-1.5">
                              <h1 className="text-sm font-semibold">
                                {`${d.os} ${d.osVersion}`}
                              </h1>
                            </div>
                          </div>
                          {[
                            {
                              title: lang.data.app.security.device.info.os,
                              value:
                                [d.os, d.osVersion].filter(Boolean).join(" ") ||
                                lang.data.app.security.device.unknown,
                            },
                            {
                              title: lang.data.app.security.device.info.browser,
                              value:
                                [d.platform, d.platformVersion].filter(Boolean).join(" ") ||
                                lang.data.app.security.device.unknown,
                            },
                            {
                              title:
                                lang.data.app.security.device.info.cpu_architecture,
                              value:
                                d.cpuArchitecture ||
                                lang.data.app.security.device.unknown,
                            },
                            {
                              title: lang.data.app.security.device.info.ip,
                              value: d.ipAddress,
                            },
                            {
                              title: lang.data.app.security.device.info.isp,
                              value:
                                d.isp ||
                                lang.data.app.security.device.unknown,
                            },
                            ...(selectedDevice?.id === d.id
                              ? [
                                {
                                  title: lang.data.app.security.device.info.lat,
                                  value:
                                    d.latitude ||
                                    lang.data.app.security.device
                                      .unknown_location,
                                },
                                {
                                  title: lang.data.app.security.device.info.lon,
                                  value:
                                    d.longitude ||
                                    lang.data.app.security.device
                                      .unknown_location,
                                },
                                {
                                  title:
                                    lang.data.app.security.device.info.country,
                                  value:
                                    d.country ||
                                    lang.data.app.security.device
                                      .unknown_location,
                                },
                                {
                                  title: lang.data.app.security.device.info.city,
                                  value:
                                    d.city ||
                                    lang.data.app.security.device
                                      .unknown_location,
                                },
                                {
                                  title:
                                    lang.data.app.security.device.info.region,
                                  value:
                                    d.region ||
                                    lang.data.app.security.device
                                      .unknown_location,
                                },
                              ]
                              : []),
                            {
                              title: lang.data.app.security.device.info.time,
                              value:
                                new Date(d.createdAt).toLocaleDateString(lang.key, {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                }) || lang.data.app.security.device.unknown,
                              fullWidth: true,
                            },
                            {
                              title: lang.data.app.security.device.info.last_used,
                              value: d.lastUsed ?
                                new Date(d.lastUsed).toLocaleDateString(lang.key, {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                }) : lang.data.app.security.device.unknown,
                              halfWidth: true,
                            },
                            {
                              title: lang.data.app.security.device.info.expires,
                              value:
                                new Date(d.expiresAt).toLocaleDateString(lang.key, {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                }) || lang.data.app.security.device.unknown,
                              halfWidth: true,
                            },
                          ].map((info, ii) => (
                            <div
                              key={`${i}-${ii}`}
                              className={cn(
                                "flex flex-col gap-0.5 items-start text-start",
                                info?.halfWidth && "min-w-[calc(50%-0.25rem)]",
                                info?.fullWidth && "min-w-full",
                              )}
                            >
                              <h3 className="text-[10px] text-foreground/40 font-semibold font-sans">
                                {info.title}
                              </h3>
                              <p className="text-xs font-sans">{info.value}</p>
                            </div>
                          ))}
                        </Button>
                      ))}
                    </ScrollArea>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel
                    defaultSize="20%"
                    className="min-w-0 flex-1 min-h-0 h-auto bg-background/70 rounded-lg flex items-center justify-center text-center text-foreground/20 text-xs tracking-wider relative"
                  >
                    {selectedDevice ? (
                      <iframe
                        title={lang.data.app.security.map_title}
                        sandbox="allow-scripts allow-same-origin"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="absolute top-0 left-0 w-full h-full flex-1 min-w-0 min-h-0 border-0"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(String(Number.isFinite(selectedDevice.latitude) ? selectedDevice.latitude : 0))},${encodeURIComponent(String(Number.isFinite(selectedDevice.longitude) ? selectedDevice.longitude : 0))}&hl=${encodeURIComponent(lang.key)}&z=14&output=embed`}
                      />
                    ) : (
                      lang.data.app.security.device.unselected_map
                    )}
                  </ResizablePanel>
                </ResizablePanelGroup>
              )}
              <AnimatePresence>
                {selectedDevice && (
                  <motion.div
                    initial={{ opacity: 0, y: "-100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "-100%" }}
                    id="session-manager"
                    className="w-full p-2 items-center flex gap-2 flex-wrap bg-muted/30 rounded-lg mt-1 z-0 relative"
                  >
                    <span className="text-foreground font-semibold m-0 text-xs select-none inline-flex gap-2">
                      {lang.data.app.security.device.manage.title}{" "}
                      <strong className="text-foreground font-semibold m-0 text-xs -ml-1">
                        {`"${selectedDevice?.os} ${selectedDevice?.osVersion}"`}
                      </strong>
                      :
                    </span>
                    <Tooltip disabled={!selectedDevice?.isThisDevice}>
                      <TooltipTrigger
                        delay={0}
                        render={
                          <Button
                            variant={
                              selectedDevice?.isThisDevice || selectedDevice?.isRevoked
                                ? "outline"
                                : "secondary"
                            }
                            size="xs"
                            disabled={
                              isRevoking ||
                              selectedDevice?.isThisDevice ||
                              selectedDevice?.isRevoked
                            }
                            className="rounded-xl p-2 text-[10px] tracking-wider m-0"
                            onClick={() =>
                              selectedDevice &&
                              !selectedDevice?.isThisDevice &&
                              !selectedDevice?.isRevoked &&
                              void revoke(selectedDevice)
                            }
                          />
                        }
                      >
                        {isRevoking ? (
                          <Spinner className="size-4 text-foreground/40" />
                        ) : (
                          lang.data.app.security.device.manage.revoke
                        )}
                      </TooltipTrigger>
                      <TooltipContent className={"rounded-lg font-semibold"}>
                        <p>
                          {lang.data.app.security.device.manage.cant_selfrevoke}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                )}
              </AnimatePresence>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="account-standing">
            <AccordionTrigger className="hover:bg-muted/30 rounded-xl p-3 hover:no-underline flex items-center gap-3">
              {hasViolations ? (
                isViolationBlocked ? (
                  <ShieldWarningIcon weight="fill" className="text-rose-500 size-6" />
                ) : (
                  <WarningIcon weight="fill" className="text-amber-500 size-6" />
                )
              ) : (
                <CheckCircleIcon weight="fill" className="text-emerald-500 size-6" />
              )}
              <div>
                <h3 className="text-sm">Account Standing</h3>
                {hasViolations ? (
                  <p className="text-muted-foreground font-sans">
                    {userViolation?.violate.length ?? 0} violation(s) recorded —{" "}
                    <span className={isViolationBlocked ? "text-rose-500" : "text-amber-500"}>
                      Level {userViolation?.level ?? 0}
                    </span>
                  </p>
                ) : (
                  <p className="text-muted-foreground font-sans">
                    You&apos;re account is <span className="text-emerald-500">all good</span>
                  </p>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="my-1 px-2">
              {hasViolations && userViolation ? (
                <div className="flex flex-col gap-2">
                  {userViolation.violate.map((v, idx) => (
                    <div
                      key={`${v.timestamp}-${idx}`}
                      className="rounded-lg bg-muted/30 px-3 py-2 text-xs flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant={v.level >= VIOLATION_BLOCK_LEVEL ? "destructive" : "secondary"}
                          className="text-[10px] px-1.5 py-0 h-4 rounded-sm"
                        >
                          Level {v.level}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(v.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-sans text-foreground whitespace-pre-wrap wrap-break-word text-start">
                        {v.message}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="max-w-md font-sans my-6 mx-auto">
                  Thank you for upholding Alertbox.org Terms of Service and Community Guidelines. If you have a violation, it will appear here.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="multi-step-verification">
            <AccordionTrigger className="hover:bg-muted/30 rounded-xl p-3 hover:no-underline flex items-center gap-3">
              <QuestionIcon weight="fill" className="text-muted-foreground size-6" />
              <div>
                <h3 className="text-sm">2-Step Verification</h3>
                <p className="text-muted-foreground font-sans">
                  Add an extra layer of security to your account
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="my-6 px-2">
              <p className="max-w-md font-sans mx-auto">
                Comming soon.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="third-party-access">
            <AccordionTrigger className="hover:bg-muted/30 rounded-xl p-3 hover:no-underline flex items-center gap-3">
              <CheckCircleIcon weight="fill" className="text-emerald-500 size-6" />
              <div>
                <h3 className="text-sm">Third-party access</h3>
                <p className="text-muted-foreground font-sans">no any apps have access to your data</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="my-6 px-2">
              <p className="max-w-md font-sans mx-auto">
                You&apos;re account is secure. No third-party apps have access to your data.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </motion.div>
  );
}

export default Page;
