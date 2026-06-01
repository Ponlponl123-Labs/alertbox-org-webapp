"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { cn, getFallbackInitial } from "@/lib/utils";
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

function Page() {
  const lang = useStore(coreStore, (state) => state.lang);
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [failed, setFailed] = useState<string | null>(null);
  const { userInfo, logout } = useUserContext();
  const isFetched = useRef(false);

  const revoke = async (device: Device) => {
    if (isRevoking || device.isThisDevice) return;
    setIsRevoking(true);
    const access_token = atob(getCookie("USRSS") || "");
    const r = await fetch(`/api/v1/me/device/${device.id}`, {
      method: "DELETE",
      headers: {
        authorization: "Bearer " + access_token,
      },
    });
    if (r.status === 401) return logout();
    if (!r.ok) {
      setFailed("true");
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
      const r = await fetch("/api/v1/me/device", {
        headers: {
          authorization: "Bearer " + access_token,
        },
      });
      if (r.status === 401) return logout();
      if (!r.ok) {
        setFailed("true");
        setIsLoading(false);
        return;
      }
      const data = await r.json();
      setDevices(data as Device[]);
      setIsLoading(false);
    })();
  }, [isFetched, logout, userInfo]);

  return (
    <div className="min-h-0 flex-1 w-full flex flex-col pb-8">
      {userInfo && (
        <div className="flex gap-1.75 items-center">
          <Avatar size="sm">
            {userInfo.avatar && <AvatarImage src={userInfo.avatar} />}
            <AvatarFallback>{getFallbackInitial(userInfo.name)}</AvatarFallback>
          </Avatar>
          <span className="text-foreground/40">@{userInfo?.name}</span>
        </div>
      )}
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
            value: userInfo?.time
              ? new Date(userInfo.time).toLocaleDateString(lang.key, {
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
            value: userInfo?.create_with?.toWellFormed() || "Not set",
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
                            {`${d.os} ${d.os_ver}`}
                          </h1>
                        </div>
                      </div>
                      {[
                        {
                          title: lang.data.app.security.device.info.os,
                          value:
                            `${d.os} ${d.os_ver}` ||
                            lang.data.app.security.device.unknown,
                        },
                        {
                          title: lang.data.app.security.device.info.browser,
                          value:
                            `${d.platform} ${d.platform_ver}` ||
                            lang.data.app.security.device.unknown,
                        },
                        {
                          title:
                            lang.data.app.security.device.info.cpu_architecture,
                          value:
                            d.cpu_architecture ||
                            lang.data.app.security.device.unknown,
                        },
                        {
                          title: lang.data.app.security.device.info.ip,
                          value: d.ip_addr,
                        },
                        {
                          title: lang.data.app.security.device.info.isp,
                          value:
                            d.ip_addr_isp ||
                            lang.data.app.security.device.unknown,
                        },
                        ...(selectedDevice?.id === d.id
                          ? [
                              {
                                title: lang.data.app.security.device.info.lat,
                                value:
                                  d.ip_addr_lat ||
                                  lang.data.app.security.device
                                    .unknown_location,
                              },
                              {
                                title: lang.data.app.security.device.info.lon,
                                value:
                                  d.ip_addr_long ||
                                  lang.data.app.security.device
                                    .unknown_location,
                              },
                              {
                                title:
                                  lang.data.app.security.device.info.country,
                                value:
                                  d.ip_addr_country ||
                                  lang.data.app.security.device
                                    .unknown_location,
                              },
                              {
                                title: lang.data.app.security.device.info.city,
                                value:
                                  d.ip_addr_city ||
                                  lang.data.app.security.device
                                    .unknown_location,
                              },
                              {
                                title:
                                  lang.data.app.security.device.info.region,
                                value:
                                  d.ip_addr_region ||
                                  lang.data.app.security.device
                                    .unknown_location,
                              },
                            ]
                          : []),
                        {
                          title: lang.data.app.security.device.info.time,
                          value:
                            new Date(d.time).toLocaleDateString(lang.key, {
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
                          value:
                            new Date(d.last_used).toLocaleDateString(lang.key, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            }) || lang.data.app.security.device.unknown,
                          halfWidth: true,
                        },
                        {
                          title: lang.data.app.security.device.info.expires,
                          value:
                            new Date(d.expire).toLocaleDateString(lang.key, {
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
                    src={`https://maps.google.com/maps?q=${String(selectedDevice?.ip_addr_lat ?? "0.0")},${String(selectedDevice?.ip_addr_long ?? "0.0")}&hl=${lang.key}&z=14&output=embed`}
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
                  {`"${selectedDevice?.os} ${selectedDevice?.os_ver}" : `}
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
    </div>
  );
}

export default Page;
