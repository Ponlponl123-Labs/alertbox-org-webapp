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
import { cn } from "@/lib/utils";
import { Device } from "@/types/user.types";
import {
  ClockUserIcon,
  DevicesIcon,
  HandPeaceIcon,
  PaperPlaneTiltIcon,
  PenIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import { getCookie } from "cookies-next/client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import { getApiUrl } from "@/lib/api";

function Page() {
  const lang = useStore(coreStore, (state) => state.lang);
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { userInfo, logout } = useUserContext();
  const isFetched = useRef(false);

  const revoke = async (device: Device) => {
    if (isRevoking || device.isThisDevice) return;
    setIsRevoking(true);
    const access_token = atob(getCookie("USRSS") || "");
    const r = await fetch(getApiUrl(`/api/v1/me/device/${device.id}`), {
      method: "DELETE",
      headers: {
        authorization: "Bearer " + access_token,
      },
    });
    if (r.status === 401) return logout();
    if (!r.ok) {
      setIsRevoking(false);
      return;
    }
    setDevices((prev) => [
      ...(prev?.filter((d) => d.id !== device.id) as Device[]),
      {
        ...device,
        isRevoked: true,
      } as Device,
    ]);
    setIsRevoking(false);
  };

  useEffect(() => {
    if (isFetched.current || !userInfo || !userInfo.id) return;
    isFetched.current = true;
    (async () => {
      const access_token = atob(getCookie("USRSS") || "");
      const r = await fetch(getApiUrl("/api/v1/me/device"), {
        headers: {
          authorization: "Bearer " + access_token,
        },
      });
      if (r.status === 401) return logout();
      if (!r.ok) {
        setIsLoading(false);
        return;
      }
      const data = await r.json();
      setDevices(data as Device[]);
      setIsLoading(false);
    })();
  }, [isFetched, logout, userInfo]);

  return (
    <>
      <h1 className="font-semibold text-3xl mt-1.5">
        {lang.data.app.security.title}
      </h1>
      <p className="mt-1.5 text-sm text-foreground/40">
        {lang.data.app.security.description}
      </p>
      <div className="w-full flex flex-col min-h-0 mt-6 flex-1 gap-4">
        {[
          {
            icon: (
              <ClockUserIcon
                size={22}
                className="text-foreground/60"
                weight="fill"
              />
            ),
            title: lang.data.app.security.registered,
            value: userInfo?.createdAt
              ? new Date(userInfo.createdAt).toLocaleDateString(lang.key, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              : lang.data.app.security.device.unknown,
          },
          {
            icon: (
              <PenIcon size={22} className="text-foreground/60" weight="fill" />
            ),
            title: lang.data.app.security.registered_with,
            value:
              userInfo?.createWith === "discord" ? (
                <>
                  <svg
                    role="img"
                    viewBox="0 0 24 24"
                    className="size-4 fill-foreground"
                  >
                    <title>Discord</title>
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                  <strong>Discord</strong>
                </>
              ) : (
                userInfo?.createWith?.toWellFormed() || "Not set"
              ),
          },
          {
            icon: (
              <PaperPlaneTiltIcon
                size={22}
                className="text-foreground/60"
                weight="fill"
              />
            ),
            title: lang.data.app.security.email.title,
            description: lang.data.app.security.email.description,
            value: userInfo?.email || "Not set",
          },
        ].map((item, i) => (
          <div className="w-full bg-card p-4 rounded-2xl group" key={i}>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.25">
                {item.icon}
                <h1 className="text-lg font-semibold">{item.title}</h1>
              </div>
              {item?.description && (
                <p className="text-foreground/40 text-xs">{item.description}</p>
              )}
              <div className="flex items-center gap-1.5 w-full flex-1 min-w-0 mt-1.5 max-sm:flex-col px-2 py-1.5 rounded-lg bg-foreground/5 text-sm text-foreground/80 group-hover:bg-foreground/10 select-none pointer-events-none">
                {item.value}
              </div>
            </div>
          </div>
        ))}
        <div className="w-full bg-card p-4 rounded-2xl group">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.25">
              <DevicesIcon
                size={22}
                className="text-foreground/60"
                weight="fill"
              />
              <h1 className="text-lg font-semibold">
                {lang.data.app.security.device.title}
              </h1>
            </div>
            <p className="text-foreground/40 text-xs">
              {lang.data.app.security.device.description}
            </p>
          </div>
          {isLoading && !devices ? (
            <Spinner className="size-6 text-foreground/40 mx-auto my-8" />
          ) : (
            <ResizablePanelGroup
              orientation="horizontal"
              className="min-w-0 flex-1 flex bg-muted mt-2 rounded-lg z-20 relative"
            >
              <ResizablePanel defaultSize="67%">
                <ScrollArea className="flex h-full max-h-96 gap-3 p-1">
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
                            `${d.os} ${d.osVersion}` ||
                            lang.data.app.security.device.unknown,
                        },
                        {
                          title: lang.data.app.security.device.info.browser,
                          value:
                            `${d.platform} ${d.platformVersion}` ||
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
                          <h3 className="text-xs text-foreground/40 font-semibold font-sans">
                            {info.title}
                          </h3>
                          <p className="text-sm">{info.value}</p>
                        </div>
                      ))}
                    </Button>
                  ))}
                </ScrollArea>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel
                defaultSize="33%"
                className="min-w-0 flex-1 min-h-64 h-auto bg-background/70 rounded-r-lg flex items-center justify-center text-center text-foreground/20 text-xs tracking-wider relative"
              >
                {selectedDevice ? (
                  <iframe
                    frameBorder="0"
                    scrolling="no"
                    className="absolute top-0 left-0 w-full h-full flex-1 min-w-0 min-h-0"
                    src={`https://maps.google.com/maps?q=${String(selectedDevice?.latitude ?? "0.0")},${String(selectedDevice?.longitude ?? "0.0")}&hl=${lang.key}&z=14&output=embed`}
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
                className="w-full px-3 pt-3 pb-1 items-center flex gap-2 flex-wrap -mt-2 bg-background rounded-b-lg z-0 relative"
              >
                <span className="text-foreground/40 font-semibold m-0 text-xs">
                  {lang.data.app.security.device.manage.title}
                </span>
                <strong className="text-foreground/40 font-semibold m-0 text-xs -ml-1">
                  {`"${selectedDevice?.os} ${selectedDevice?.osVersion}" : `}
                </strong>
                <Tooltip disabled={!selectedDevice?.isThisDevice}>
                  <TooltipTrigger
                    delay={0}
                    render={
                      <Button
                        variant={
                          selectedDevice?.isThisDevice ? "outline" : "secondary"
                        }
                        size={"xs"}
                        className="rounded-xl p-2 text-[10px] tracking-wider m-0"
                        onClick={() =>
                          selectedDevice &&
                          !selectedDevice?.isThisDevice &&
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
        </div>
      </div>
    </>
  );
}

export default Page;
