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
  secret: string | null;
  skey: string;
  soon: boolean;
  connections: Connections | null;
  setConnections: Dispatch<SetStateAction<Connections | null>>;
}) {
  const lang = useStore(coreStore, (state) => state.lang);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowSecret, setIsShowSecret] = useState(isConnected && !!secret);
  const [currentSecret, setCurrentSecret] = useState(secret);

  const update = async (endpoint: string, key: string) => {
    setIsLoading(true);
    const token = getCookie("USRSS");
    const r = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + atob(token || ""),
      },
      body: currentSecret,
    });
    if (r.ok) {
      setConnections((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [key]: currentSecret,
        };
      });
    }
    setIsLoading(false);
  };
  const disconnect = async (endpoint: string, key: string) => {
    setIsLoading(true);
    const token = getCookie("USRSS");
    const r = await fetch(endpoint, {
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
      setCurrentSecret(null);
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full bg-card p-4 rounded-2xl group">
      <div className="flex flex-col size-full min-w-0 min-h-0 flex-1 gap-1.5">
        {icon}
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">{name}</h1>
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
          ) : (
            <>
              <AnimatePresence>
                {isShowSecret ? (
                  <div className="flex items-center gap-2 min-w-0 flex-4 w-full">
                    <Input
                      type="text"
                      placeholder={lang.data.app.connections.placeholder}
                      defaultValue={secret || ""}
                      value={currentSecret || ""}
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
                    {currentSecret &&
                    currentSecret.length > 0 &&
                    currentSecret !== secret ? (
                      <Button
                        variant="default"
                        className="rounded-xl p-4 -mr-1"
                        disabled={isLoading}
                        onClick={() => update(api_endpoint, skey)}
                      >
                        {lang.data.app.connections.update}
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
                ) : (
                  <Button
                    variant="default"
                    className="rounded-xl p-4 min-w-0 flex-1 w-full"
                    onClick={() => setIsShowSecret(true)}
                  >
                    {lang.data.app.connections.status.connect}
                  </Button>
                )}
              </AnimatePresence>
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
        </div>
      </div>
    </div>
  );
}

export default Connection;
