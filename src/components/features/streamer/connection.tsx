"use client";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { useStore } from "zustand";
import { Button } from "@/components/ui/button";
import { coreStore } from "@/hooks/store/core";
import { BankIcon, LockKeyIcon } from "@phosphor-icons/react";
import { AnimatePresence } from "motion/react";
import { Input } from "react-smooth-input";
import { Connections } from "@/types/user.types";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import { useUserContext } from "@/contexts/user";

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
  href,
  readOnly,
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
  href?: string;
  readOnly?: boolean;
  connections: Connections | null;
  setConnections: Dispatch<SetStateAction<Connections | null>>;
}) {
  const lang = useStore(coreStore, (state) => state.lang);
  const { authFetch, activeOrg, activeStreamer } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isShowSecret, setIsShowSecret] = useState(isConnected && !!secret);

  const orgKey = activeOrg?.slug || activeOrg?.id;
  const streamerKey = activeStreamer?.name || activeStreamer?.id;
  const targetHref = href || (orgKey && streamerKey ? `/app/${orgKey}/${streamerKey}/connections/${skey}` : `/app/connections/${skey}`);

  const isUserSecretFlow = skey === "kofi" || skey === "bmac";

  const initialUsername = (secret && typeof secret === "object" && "username" in secret)
    ? (secret as { username: string }).username
    : "";
  const initialSecret = (secret && typeof secret === "object" && "secret" in secret)
    ? (secret as { secret: string }).secret
    : typeof secret === "string" ? secret : "";

  const [username, setUsername] = useState(initialUsername);
  const [currentSecret, setCurrentSecret] = useState(initialSecret);

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
    <div className="w-full bg-card supports-backdrop-filter:bg-card/80 supports-backdrop-filter:backdrop-blur-sm supports-backdrop-filter:backdrop-saturate-200 p-4 rounded-4xl group z-10">
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
              className="rounded-2xl p-3 min-w-0 flex-1 w-full border-2 border-dashed h-max"
              disabled
            >
              {lang.data.app.connections.soon}
            </Button>
          ) : isUserSecretFlow ? (
            readOnly && !isConnected ? (
              <Button
                variant="outline"
                className="rounded-2xl p-3 w-full cursor-not-allowed opacity-70 h-max"
                disabled
              >
                Not Connected (Read-only)
              </Button>
            ) : (
              <Link
                href={targetHref}
                className="w-full min-w-0 flex-1"
              >
                <Button
                  variant={isConnected ? "secondary" : "default"}
                  className="rounded-2xl p-3 w-full h-max"
                >
                  {isConnected
                    ? (lang.key === "th-TH" ? "ตั้งค่าการใช้งาน" : "Configure")
                    : lang.data.app.connections.status.connect}
                </Button>
              </Link>
            )
          ) : typeof secret === "boolean" ? (
            <>
              {!secret ? (
                <Button
                  className="rounded-2xl p-3 min-w-0 flex-1 w-full border-2 border-dashed h-max"
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
                    <Spinner className="size-4" />
                  ) : (
                    readOnly ? "Disabled (Read-only)" : lang.data.app.connections.status.connect
                  )}
                </Button>
              ) : (
                <Link
                  href={targetHref}
                  className="w-full min-w-0 flex-1"
                >
                  <Button
                    variant={"secondary"}
                    className="rounded-2xl p-3 w-full h-max"
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
                        readOnly={isLoading || readOnly}
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
                        readOnly={isLoading || readOnly}
                        maxLength={255}
                        onChange={(e) => setCurrentSecret(e.target.value)}
                        className="text-foreground/60 font-mono text-sm flex-1 min-w-0"
                        fontStyle={{
                          fontFamily: "var(--font-sans)",
                          fontWeight: "400",
                          fontSize: "12px",
                        }}
                      />
                      {readOnly ? (
                        <Button
                          variant="secondary"
                          className="rounded-2xl p-3 cursor-not-allowed opacity-70 h-max"
                          disabled
                        >
                          Read-only
                        </Button>
                      ) : canSave && hasChanges ? (
                        <Button
                          variant="default"
                          className="rounded-2xl p-3 -mr-1 h-max"
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
                          className="rounded-2xl p-3 h-max"
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
                      className="rounded-2xl p-3 min-w-0 flex-1 w-full h-max"
                      onClick={() => setIsShowSecret(true)}
                      disabled={readOnly}
                    >
                      {readOnly ? "Disabled (Read-only)" : lang.data.app.connections.status.connect}
                    </Button>
                    <Link
                      href={targetHref}
                      className="min-w-0 flex-1 w-full"
                    >
                      <Button variant="secondary" className="rounded-2xl p-3 w-full h-max">
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
