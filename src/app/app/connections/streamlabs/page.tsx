"use client";
import { Spinner } from "@/components/ui/spinner";
import { coreStore } from "@/hooks/store/core";
import { Streamlabs } from "@thesvg/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "zustand";
import { useEffect, useState } from "react";
import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { getCookie } from "cookies-next/client";

function Page() {
  const lang = useStore(coreStore, (state) => state.lang);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const params = useSearchParams();
  const code = params.get("code");
  const state = params.get("state");
  const router = useRouter();

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
          setIsError(false);
          setTimeout(() => {
            router.push("/app/connections?t=trigger");
          }, 2400);
        })
        .catch(() => {
          setIsError(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      setIsError(true);
    }
  }, [code, state]);

  return (
    <>
      <h1 className="font-semibold text-3xl mt-1.5">
        {lang.data.app.connections.title}
      </h1>
      <p className="mt-1.5 text-sm text-foreground/40">
        {lang.data.app.connections.description}
      </p>
      <div className="w-full flex flex-col min-h-0 mt-6 flex-1 gap-1.5">
        {code && (
          <div className="w-full flex flex-col items-center justify-center min-h-0 bg-foreground/5 rounded-4xl py-6 flex-1 border-2 border-dashed border-foreground/10">
            <div className="flex items-center justify-center gap-4">
              <Image
                src={"/favicon.ico"}
                width={64}
                height={64}
                alt="Alertbox.org"
                className="-ml-4.25"
              />
              {isLoading ? (
                <Spinner className="size-4 text-foreground/40" />
              ) : !isError ? (
                <CheckIcon className="size-4 text-emerald-400" weight="bold" />
              ) : (
                <XIcon weight="bold" className="size-4 text-red-400" />
              )}
              <Streamlabs className="size-10 -mt-0.75 ml-2" />
            </div>
            <h1 className="text-lg font-semibold mt-3">
              {isLoading
                ? lang.data.app.connections.providers.streamlabs.oauth
                    .connecting
                : !isError
                  ? lang.data.app.connections.providers.streamlabs.oauth
                      .connected
                  : lang.data.app.connections.providers.streamlabs.oauth.failed}
            </h1>
            <p className="text-xs text-foreground/40 mt-3 text-center">
              {isLoading
                ? lang.data.app.connections.providers.streamlabs.oauth
                    .connecting_description
                : !isError
                  ? lang.data.app.connections.providers.streamlabs.oauth
                      .connected_description
                  : lang.data.app.connections.providers.streamlabs.oauth
                      .failed_description}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default Page;
