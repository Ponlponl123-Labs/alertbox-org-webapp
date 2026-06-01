"use client";
import Connection from "@/components/connection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { getFallbackInitial } from "@/lib/utils";
import { Connections } from "@/types/user.types";
import { getCookie } from "cookies-next/client";
import { useEffect, useRef, useState } from "react";
import { useStore } from "zustand";

function Page() {
  const [connections, setConnections] = useState<Connections | null>(null);
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo, logout } = useUserContext();
  const isFetched = useRef(false);

  useEffect(() => {
    if (isFetched.current || !userInfo) return;
    isFetched.current = true;
    const token = getCookie("USRSS");
    fetch("/api/v1/me/connection", {
      headers: {
        Authorization: "Bearer " + atob(token || ""),
      },
    })
      .then((res) => {
        if (res.status === 401) {
          logout();
          return null;
        }
        return res.json();
      })
      .then((data) => {
        setConnections(data);
      });
  }, [logout, userInfo]);

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
        {lang.data.app.connections.title}
      </h1>
      <p className="mt-1.5 text-sm text-foreground/40">
        {lang.data.app.connections.description}
      </p>
      <div className="w-full flex flex-col min-h-0 mt-6 flex-1 gap-1.5">
        {!connections && (
          <div className="w-full flex items-center justify-center min-h-0 bg-foreground/5 rounded-4xl flex-1 border-2 border-dashed border-foreground/10">
            <span className="tracking-wider text-foreground/40">
              Loading...
            </span>
          </div>
        )}
        {connections &&
          [
            {
              api_endpoint: "/api/v1/me/connection/stripe",
              img: "/stripe.webp",
              name: lang.data.app.connections.providers.stripe.name,
              description:
                lang.data.app.connections.providers.stripe.description,
              privacy: lang.data.app.connections.providers.stripe.privacy,
              payout: lang.data.app.connections.providers.stripe.payout,
              isConnected: connections?.stripe ? true : false,
              key: "stripe",
              soon: true,
            },
            {
              api_endpoint: "/api/v1/me/connection/kofi",
              img: "/kofi.webp",
              name: lang.data.app.connections.providers.kofi.name,
              description: lang.data.app.connections.providers.kofi.description,
              privacy: lang.data.app.connections.providers.kofi.privacy,
              payout: lang.data.app.connections.providers.kofi.payout,
              isConnected: connections?.kofi ? true : false,
              key: "kofi",
              soon: false,
            },
            {
              api_endpoint: "/api/v1/me/connection/buymeacoffee",
              img: "/buymeacoffee.webp",
              name: lang.data.app.connections.providers.bmac.name,
              description: lang.data.app.connections.providers.bmac.description,
              privacy: lang.data.app.connections.providers.bmac.privacy,
              payout: lang.data.app.connections.providers.bmac.payout,
              isConnected: connections?.bmac ? true : false,
              key: "bmac",
              soon: false,
            },
            {
              api_endpoint: "/api/v1/me/connection/feelfreepay",
              img: "/feelfreepay.svg",
              name: lang.data.app.connections.providers.feelfreepay.name,
              description:
                lang.data.app.connections.providers.feelfreepay.description,
              privacy: lang.data.app.connections.providers.feelfreepay.privacy,
              payout: lang.data.app.connections.providers.feelfreepay.payout,
              isConnected: connections?.ffp ? true : false,
              key: "ffp",
              soon: true,
            },
          ].map((c, i) => (
            <Connection
              key={i}
              api_endpoint={c.api_endpoint}
              img={c.img}
              name={c.name}
              description={c.description}
              privacy={c.privacy}
              payout={c.payout}
              isConnected={c.isConnected}
              secret={connections?.[c.key as keyof Connections] || null}
              connections={connections}
              setConnections={setConnections}
              skey={c.key}
              soon={c.soon}
            />
          ))}
      </div>
    </div>
  );
}

export default Page;
