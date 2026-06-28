"use client";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { useStore } from "zustand";
import { Button } from "./ui/button";
import { coreStore } from "@/hooks/store/core";
import { BankIcon, LockKeyIcon } from "@phosphor-icons/react";
import { AnimatePresence } from "motion/react";
import { Input } from "react-smooth-input";
import { Connections } from "@/types/user.types";
import { getCookie } from "cookies-next/client";
import { Spinner } from "./ui/spinner";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";

function Connection({
  api_endpoint,
  icon,
  name,
  description,
  privacy,
  payout,
  isConnected,
  secret,
  skey,
  soon,
  connections: _,
  setConnections,
}: {
  api_endpoint: string;
  icon: ReactNode;
  name: string;
  description: string;
  privacy?: string;
  payout?: string;
  isConnected: boolean;
  secret: unknown;
  skey: string;
  soon?: boolean;
  connections: Connections | null;
  setConnections: Dispatch<SetStateAction<Connections | null>>;
}) {
  const lang = useStore(coreStore, (state) => state.lang);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowSecret, setIsShowSecret] = useState(isConnected && !!secret);

  const isUserSecretFlow = skey === "kofi" || skey === "bmac";

  const getInitialUsername = () => {
    if (secret && typeof secret === "object" && "username" in secret) {
      return (secret as { username: string }).username;
    }
    return "";
  };

  const getInitialSecret = () => {
    if (secret && typeof secret === "object" && "secret" in secret) {
      return (secret as { secret: string }).secret;
    }
    return typeof secret === "string" ? secret : "";
  };

  const [username, setUsername] = useState(getInitialUsername());
  const [currentSecret, setCurrentSecret] = useState(getInitialSecret());

  const initialUsername = getInitialUsername();
  const initialSecret = getInitialSecret();

  const update = async (endpoint: string, key: string) => {
    setIsLoading(true);
    const token = getCookie("USRSS");
    const headers: Record<string, string> = {
      Authorization: "Bearer " + atob(token || ""),
    };
    let body: string;
    if (isUserSecretFlow) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify({ username, secret: currentSecret });
    } else {
      body = currentSecret || "";
    }

    const r = await fetch(getApiUrl(endpoint), {
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
        };
      });
    }
    setIsLoading(false);
  };

  const disconnect = async (endpoint: string, key: string) => {
    setIsLoading(true);
    const token = getCookie("USRSS");
    const r = await fetch(getApiUrl(endpoint), {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + atob(token || ""),
      },
    });
    if (r.ok) {
      setConnections((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [key]: null,
        };
      });
      setUsername("");
      setCurrentSecret("");
    }
    setIsLoading(false);
  };

  const canSave = isUserSecretFlow
    ? (username.trim() !== "" && currentSecret.trim() !== "")
    : (currentSecret !== null && currentSecret.trim() !== "");

  const hasChanges = isUserSecretFlow
    ? (username !== initialUsername || currentSecret !== initialSecret)
    : (currentSecret !== initialSecret);

  return (
    <div className="w-full bg-card/80 backdrop-blur-sm backdrop-saturate-200 p-4 rounded-3xl group z-10">
      <div className="flex flex-col size-full min-w-0 min-h-0 flex-1 gap-1.5">
        {icon}
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-semibold">{name}</h1>
          {isConnected && (
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center gap-1 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {lang.data.app.connections.status.connected}
            </span>
          )}
        </div>
        <p className="text-foreground/40 text-xs">{description}</p>
        {privacy && (
          <div className="flex">
            <div className="h-auto w-1 rounded-full bg-foreground/10" />
            <div className="flex flex-col flex-1 min-w-0 p-2.25 gap-1.5">
              <span className="text-foreground/60 font-semibold text-sm">
                <LockKeyIcon weight="fill" className="inline mr-1.5" />
                {lang.data.app.connections.privacy}
              </span>
              <p className="text-foreground/40 text-xs">{privacy}</p>
            </div>
          </div>
        )}
        {payout && (
          <div className="flex">
            <div className="h-auto w-1 rounded-full bg-foreground/10" />
            <div className="flex flex-col flex-1 min-w-0 p-2.25 gap-1.5">
              <span className="text-foreground/60 font-semibold text-sm">
                <BankIcon weight="fill" className="inline mr-1.5" />
                {lang.data.app.connections.payout}
              </span>
              <p className="text-foreground/40 text-xs">{payout}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 w-full pt-1.5 max-sm:flex-col mt-auto relative">
          {soon ? (
            <Button
              variant="outline"
              className="rounded-xl p-4 min-w-0 flex-1 w-full border-2 border-dashed"
              disabled
            >
              {lang.data.app.connections.soon}
            </Button>
          ) : isUserSecretFlow ? (
            <Link
              href={"/app/connections/" + skey}
              className="w-full min-w-0 flex-1"
            >
              <Button
                variant={isConnected ? "secondary" : "default"}
                className="rounded-xl p-4 w-full"
              >
                {isConnected
                  ? (lang.key === "th-TH" ? "ตั้งค่าการใช้งาน" : "Configure")
                  : lang.data.app.connections.status.connect}
              </Button>
            </Link>
          ) : typeof secret === "boolean" ? (
            <>
              {!secret ? (
                <Button
                  className="rounded-xl p-4 min-w-0 flex-1 w-full border-2 border-dashed"
                  onClick={async () => {
                    setIsLoading(true);
                    const token = getCookie("USRSS");
                    const r = await fetch(api_endpoint + "/oauth2", {
                      method: "GET",
                      headers: {
                        Authorization: "Bearer " + atob(token || ""),
                      },
                    });
                    if (r.ok) {
                      const oauth2_link = await r.text();
                      window.location.href = oauth2_link;
                    }
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Spinner className="size-4" />
                  ) : (
                    lang.data.app.connections.status.connect
                  )}
                </Button>
              ) : (
                <Link
                  href={"/app/connections/" + skey}
                  className="w-full min-w-0 flex-1"
                >
                  <Button
                    variant={"secondary"}
                    className="rounded-xl p-4 w-full"
                  >
                    {lang.key === "th-TH" ? "ตั้งค่าการใช้งาน" : "Configure"}
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <>
              <AnimatePresence>
                {isShowSecret ? (
                  <div className="flex flex-col gap-2 min-w-0 w-full">
                    {isUserSecretFlow && (
                      <Input
                        type="text"
                        placeholder="Username"
                        value={username}
                        readOnly={isLoading}
                        maxLength={64}
                        onChange={(e) => setUsername(e.target.value)}
                        className="text-foreground/60 font-mono text-sm flex-1 min-w-0"
                        fontStyle={{
                          fontFamily: "var(--font-sans)",
                          fontWeight: "400",
                          fontSize: "12px",
                        }}
                      />
                    )}
                    <div className="flex items-center gap-2 min-w-0 w-full">
                      <Input
                        type="text"
                        placeholder={isUserSecretFlow ? "Webhook Secret" : lang.data.app.connections.placeholder}
                        value={currentSecret}
                        readOnly={isLoading}
                        maxLength={255}
                        onChange={(e) => setCurrentSecret(e.target.value)}
                        className="text-foreground/60 font-mono text-sm flex-1 min-w-0"
                        fontStyle={{
                          fontFamily: "var(--font-sans)",
                          fontWeight: "400",
                          fontSize: "12px",
                        }}
                      />
                      {canSave && hasChanges ? (
                        <Button
                          variant="default"
                          className="rounded-xl p-4 -mr-1"
                          disabled={isLoading}
                          onClick={() => update(api_endpoint, skey)}
                        >
                          {isLoading ? (
                            <Spinner className="size-4" />
                          ) : (
                            lang.data.app.connections.update
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          className="rounded-xl p-4"
                          disabled={isLoading}
                          onClick={async () => {
                            if (isConnected) {
                              await disconnect(api_endpoint, skey);
                            }
                            setIsShowSecret(false);
                          }}
                        >
                          {isLoading ? (
                            <Spinner className="size-4" />
                          ) : (
                            lang.data.app.connections.status.disconnect
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <Button
                      variant="default"
                      className="rounded-xl p-4 min-w-0 flex-1 w-full"
                      onClick={() => setIsShowSecret(true)}
                    >
                      {lang.data.app.connections.status.connect}
                    </Button>
                    <Link
                      href={"/app/connections/" + skey}
                      className="min-w-0 flex-1 w-full"
                    >
                      <Button variant="secondary" className="rounded-xl p-4 w-full">
                        {lang.data.app.connections.howto}
                      </Button>
                    </Link>
                  </>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Connection;
