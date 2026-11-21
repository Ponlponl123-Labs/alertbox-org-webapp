"use client";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { useStore } from "zustand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { coreStore } from "@/hooks/store/core";
import {
  BankIcon,
  CaretDownIcon,
  GearSixIcon,
  LockKeyIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { AnimatePresence } from "motion/react";
import { Input } from "react-smooth-input";
import { Connections } from "@/types/user.types";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import { useUserContext } from "@/contexts/user";
import { cn } from "@/lib/utils";
import { Collapsible } from "@animate-ui/react/primitives/base-ui/collapsible";

export interface ConnectionProps {
  api_endpoint: string;
  icon: ReactNode;
  name: string;
  description: string;
  privacy?: string;
  payout?: string;
  isConnected: boolean;
  isUseOauth?: boolean;
  secret: unknown;
  skey: string;
  soon?: boolean;
  href?: string;
  readOnly?: boolean;
  connections: Connections | null;
  setConnections: Dispatch<SetStateAction<Connections | null>>;
}

export default function Connection({
  api_endpoint,
  icon,
  name,
  description,
  privacy,
  payout,
  isConnected,
  isUseOauth,
  secret,
  skey,
  soon,
  href,
  readOnly,
  connections,
  setConnections,
}: ConnectionProps) {
  const lang = useStore(coreStore, (state) => state.lang);
  const { authFetch, activeOrg, activeStreamer } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isReadMoreOpen, setIsReadMoreOpen] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [isShowSecret, setIsShowSecret] = useState(isConnected && !!secret);

  const isDisabled = Boolean(connections?.disabled?.[skey]);
  const isEnabled = isConnected && !isDisabled;

  const orgKey = activeOrg?.slug || activeOrg?.id;
  const streamerKey = activeStreamer?.name || activeStreamer?.id;
  const targetHref =
    href ||
    (orgKey && streamerKey
      ? `/app/${orgKey}/${streamerKey}/connections/${skey}`
      : `/app/connections/${skey}`);

  const isUserSecretFlow = skey === "kofi" || skey === "bmac";

  const initialUsername =
    secret && typeof secret === "object" && "username" in secret
      ? (secret as { username: string }).username
      : "";
  const initialSecret =
    secret && typeof secret === "object" && "secret" in secret
      ? (secret as { secret: string }).secret
      : typeof secret === "string"
        ? secret
        : "";

  const [username, setUsername] = useState(initialUsername);
  const [currentSecret, setCurrentSecret] = useState(initialSecret);

  const toggleDisabled = async (nextDisabled: boolean) => {
    setIsLoading(true);
    setConnections((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        disabled: {
          ...prev.disabled,
          [skey]: nextDisabled,
        },
      };
    });

    try {
      const r = await authFetch(getApiUrl(api_endpoint), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: nextDisabled }),
      });
      if (!r.ok) {
        setConnections((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            disabled: {
              ...prev.disabled,
              [skey]: !nextDisabled,
            },
          };
        });
      }
    } catch {
      setConnections((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          disabled: {
            ...prev.disabled,
            [skey]: !nextDisabled,
          },
        };
      });
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (endpoint: string, key: string) => {
    setIsLoading(true);
    const headers: Record<string, string> = {};
    let body: string;
    if (isUserSecretFlow) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify({ username, secret: currentSecret });
    } else {
      body = currentSecret || "";
    }

    const r = await authFetch(getApiUrl(endpoint), {
      method: "POST",
      headers,
      body,
    });
    if (r.ok) {
      setConnections((prev) => {
        if (!prev) return prev;
        const newSecretVal = isUserSecretFlow
          ? { username, secret: currentSecret }
          : currentSecret;
        return {
          ...prev,
          [key]: newSecretVal,
          disabled: {
            ...prev.disabled,
            [key]: false,
          },
        };
      });
    }
    setIsLoading(false);
  };

  const disconnect = async (endpoint: string, key: string) => {
    setIsLoading(true);
    const r = await authFetch(getApiUrl(endpoint), {
      method: "DELETE",
    });
    if (r.ok) {
      setConnections((prev) => {
        if (!prev) return prev;
        const updatedDisabled = { ...prev.disabled };
        delete updatedDisabled[key];
        return {
          ...prev,
          [key]: null,
          disabled: updatedDisabled,
        };
      });
      setUsername("");
      setCurrentSecret("");
    }
    setIsLoading(false);
  };

  const canSave = isUserSecretFlow
    ? username.trim() !== "" && currentSecret.trim() !== ""
    : currentSecret !== null && currentSecret.trim() !== "";

  const hasChanges = isUserSecretFlow
    ? username !== initialUsername || currentSecret !== initialSecret
    : currentSecret !== initialSecret;

  const hasExtraInfo = Boolean(privacy || payout || isConnected);

  return (
    <>
      <div className="group relative flex flex-col justify-between rounded-xl bg-card/60 p-3 transition-all duration-200 hover:bg-card">
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center transition-transform duration-200">
              {icon}
            </div>

            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1.5 rounded-sm p-2 text-xs border-0 font-medium select-none transition-colors",
                      isEnabled
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-amber-500/10 text-amber-500"
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        isEnabled ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                      )}
                    />
                    {isEnabled
                      ? lang.data.app.connections.status.connected
                      : lang.key === "th-TH"
                        ? "หยุดชั่วคราว"
                        : "Paused"}
                  </Badge>
                  <Switch
                    checked={isEnabled}
                    disabled={isLoading || readOnly}
                    onCheckedChange={(checked) => toggleDisabled(!checked)}
                    aria-label={`Toggle ${name}`}
                  />
                </>
              ) : soon ? (
                <Badge
                  variant="outline"
                  className="rounded-sm border-0 bg-foreground/5 p-2 text-xs font-medium text-muted-foreground/70 select-none"
                >
                  {lang.data.app.connections.soon}
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="rounded-sm p-2 text-xs font-medium text-muted-foreground select-none"
                >
                  {lang.data.app.connections.status.notconnected}
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-3.5">
            <h3 className="text-lg font-medium text-foreground">
              {name}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed font-sans text-muted-foreground">
              {description}
            </p>
          </div>

          {hasExtraInfo && (
            <div className="mt-2.5">
              <Collapsible.Root>
                <Collapsible.Trigger
                  onClick={() => setIsReadMoreOpen((prev) => !prev)}
                  className="inline-flex cursor-pointer items-center gap-1 text-xs p-0 h-max bg-transparent! font-medium text-muted-foreground hover:text-foreground select-none"
                >
                  <span>
                    {isReadMoreOpen
                      ? lang.key === "th-TH"
                        ? "ย่อข้อมูล"
                        : "Show less"
                      : lang.key === "th-TH"
                        ? "อ่านเพิ่มเติม"
                        : lang.data.common.read_more || "Read more"}
                  </span>
                  <CaretDownIcon
                    className={cn(
                      "size-3 transition-transform duration-200",
                      isReadMoreOpen && "rotate-180"
                    )}
                  />
                </Collapsible.Trigger>
                <Collapsible.Panel className="flex flex-col gap-2 pt-2">
                  {privacy && (
                    <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-2.5">
                      <LockKeyIcon
                        weight="fill"
                        className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-foreground/80">
                          {lang.data.app.connections.privacy}
                        </span>
                        <p className="text-[11px] leading-relaxed text-muted-foreground font-sans">
                          {privacy}
                        </p>
                      </div>
                    </div>
                  )}
                  {payout && (
                    <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-2.5">
                      <BankIcon
                        weight="fill"
                        className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-foreground/80">
                          {lang.data.app.connections.payout}
                        </span>
                        <p className="text-[11px] leading-relaxed text-muted-foreground font-sans">
                          {payout}
                        </p>
                      </div>
                    </div>
                  )}
                  {isConnected && !readOnly && (
                    <div className="mt-1 flex justify-end pt-1">
                      <Button
                        type="button"
                        onClick={() => setShowDisconnectDialog(true)}
                        className="inline-flex cursor-pointer items-center p-0 h-max bg-transparent! gap-1 text-xs text-destructive/80 transition-colors hover:text-destructive"
                      >
                        <TrashIcon className="size-3" />
                        <span>{lang.data.app.connections.status.disconnect}</span>
                      </Button>
                    </div>
                  )}
                </Collapsible.Panel>
              </Collapsible.Root>
            </div>
          )}
        </div>

        <div className="mt-3">
          {soon ? (
            <Button
              variant="outline"
              size="sm"
              className="h-max w-full p-3 cursor-not-allowed rounded-lg border-2 border-dashed text-xs text-muted-foreground/60 opacity-60"
              disabled
            >
              {lang.data.app.connections.soon}
            </Button>
          ) : isConnected ? (
            <Link href={targetHref} className="block w-full">
              <Button
                variant="outline"
                size="sm"
                className="h-max w-full p-3 rounded-lg text-xs font-medium hover:bg-accent border-0"
              >
                <GearSixIcon className="size-3.5" />
                {lang.key === "th-TH" ? "ตั้งค่าการใช้งาน" : "Configure"}
              </Button>
            </Link>
          ) : isUserSecretFlow ? (
            readOnly ? (
              <Button
                variant="outline"
                size="sm"
                className="h-max w-full p-3 cursor-not-allowed rounded-lg text-xs opacity-70 border-0"
                disabled
              >
                Not Connected (Read-only)
              </Button>
            ) : (
              <Link href={targetHref} className="block w-full">
                <Button
                  size="sm"
                  className="h-max w-full p-3 rounded-lg text-xs font-medium border-0"
                >
                  <PlusIcon className="size-3.5" />
                  {lang.data.app.connections.status.connect}
                </Button>
              </Link>
            )
          ) : (isUseOauth || typeof secret === "boolean") ? (
            <Button
              size="sm"
              className="h-max w-full p-3 rounded-lg text-xs font-medium border-0"
              onClick={async () => {
                if (readOnly) return;
                setIsLoading(true);
                const r = await authFetch(getApiUrl(api_endpoint + "/oauth2"), {
                  method: "GET",
                });
                if (r.ok) {
                  const oauth2_link = await r.text();
                  window.location.href = oauth2_link;
                }
              }}
              disabled={isLoading || readOnly}
            >
              {isLoading ? (
                <Spinner className="size-3.5" />
              ) : readOnly ? (
                "Disabled (Read-only)"
              ) : (
                <>
                  <PlusIcon className="size-3.5" />
                  {lang.data.app.connections.status.connect}
                </>
              )}
            </Button>
          ) : (
            <AnimatePresence>
              {isShowSecret ? (
                <div className="flex w-full min-w-0 flex-col gap-2">
                  <div className="flex flex-1 w-full min-w-0 items-center gap-1">
                    <Input
                      type="text"
                      placeholder={lang.data.app.connections.placeholder}
                      value={currentSecret}
                      readOnly={isLoading || readOnly}
                      maxLength={255}
                      onChange={(e) => setCurrentSecret(e.target.value)}
                      className="flex-1 font-mono text-xs text-foreground/70"
                      classNames={{ base: "h-10 rounded-lg" }}
                      fontStyle={{
                        fontFamily: "var(--font-sans)",
                        fontWeight: "400",
                        fontSize: "12px",
                      }}
                    />
                    {readOnly ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-max w-full p-3 rounded-lg text-xs opacity-70"
                        disabled
                      >
                        Read-only
                      </Button>
                    ) : canSave && hasChanges ? (
                      <Button
                        variant="default"
                        size="sm"
                        className="h-max w-full p-3 rounded-lg text-xs"
                        disabled={isLoading}
                        onClick={() => update(api_endpoint, skey)}
                      >
                        {isLoading ? (
                          <Spinner className="size-3.5" />
                        ) : (
                          lang.data.app.connections.update
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-max p-3 rounded-lg text-xs"
                        disabled={isLoading}
                        onClick={() => setIsShowSecret(false)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Button
                    variant="default"
                    size="sm"
                    className="h-max w-full p-3 rounded-lg flex-1 gap-1.5 text-xs font-medium"
                    onClick={() => setIsShowSecret(true)}
                    disabled={readOnly}
                  >
                    <PlusIcon className="size-3.5" />
                    {readOnly
                      ? "Disabled (Read-only)"
                      : lang.data.app.connections.status.connect}
                  </Button>
                  <Link href={targetHref} className="flex-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-max w-full p-3 rounded-lg text-xs"
                    >
                      {lang.data.app.connections.howto}
                    </Button>
                  </Link>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      <AlertDialog
        open={showDisconnectDialog}
        onOpenChange={setShowDisconnectDialog}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {name}?</AlertDialogTitle>
            <AlertDialogDescription className="font-sans">
              {lang.key === "th-TH"
                ? `คุณแน่ใจหรือไม่ว่าต้องการตัดการเชื่อมต่อกับ ${name}? ข้อมูลการเข้าสู่ระบบและ Secret ทั้งหมดจะถูกลบออก และ Alertbox จะไม่ได้รับสัญญาณแจ้งเตือนการโดเนทจากแพลตฟอร์มนี้อีกต่อไป`
                : `Are you sure you want to disconnect ${name}? All secret credentials will be permanently removed, and Alertbox will stop receiving donation webhook triggers from this platform.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-0">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                await disconnect(api_endpoint, skey);
                setShowDisconnectDialog(false);
              }}
            >
              {lang.data.app.connections.status.disconnect}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
