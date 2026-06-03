"use client";
import Connection from "@/components/connection";
import { Spinner } from "@/components/ui/spinner";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { Connections } from "@/types/user.types";
import { getCookie } from "cookies-next/client";
import { useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import {
  Stripe,
  BuyMeACoffee,
  KoFi,
  Youtube,
  Streamlabs,
  Twitch,
  Patreon,
} from "@thesvg/react";
import { FeelFreePay } from "@/components/icons";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/animate/tabs";
import {
  ContactlessPaymentIcon,
  FacebookLogoIcon,
  WebhooksLogoIcon,
} from "@phosphor-icons/react";

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
    <>
      <h1 className="font-semibold text-3xl mt-1.5">
        {lang.data.app.connections.title}
      </h1>
      <p className="mt-1.5 text-sm text-foreground/40">
        {lang.data.app.connections.description}
      </p>
      <div className="w-full flex flex-col min-h-0 mt-6 flex-1 gap-1.5">
        {!connections && (
          <div className="w-full flex items-center justify-center min-h-0 bg-foreground/5 rounded-4xl py-6 flex-1 border-2 border-dashed border-foreground/10">
            <Spinner className="size-6 text-foreground/40 mx-auto my-8" />
          </div>
        )}
        {connections && (
          <Tabs>
            <TabsList className="w-full h-max p-0 bg-transparent gap-1.5">
              <TabsTrigger value="payment" className="xl:p-2.5 p-5">
                <ContactlessPaymentIcon weight="bold" size={32} />
                {lang.data.app.connections.tabs.payment}
              </TabsTrigger>
              <TabsTrigger value="trigger" className="xl:p-2.5 p-5">
                <WebhooksLogoIcon weight="bold" size={32} />
                {lang.data.app.connections.tabs.trigger}
              </TabsTrigger>
            </TabsList>
            <TabsContents className="rounded-2xl">
              <TabsContent
                value="payment"
                className="flex flex-col xl:grid xl:grid-cols-2 gap-1.5"
              >
                {[
                  {
                    api_endpoint: "/api/v1/me/connection/stripe",
                    icon: <Stripe className="size-8" />,
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
                    icon: <KoFi className="size-8" />,
                    name: lang.data.app.connections.providers.kofi.name,
                    description:
                      lang.data.app.connections.providers.kofi.description,
                    privacy: lang.data.app.connections.providers.kofi.privacy,
                    payout: lang.data.app.connections.providers.kofi.payout,
                    isConnected: connections?.kofi ? true : false,
                    key: "kofi",
                    soon: false,
                  },
                  {
                    api_endpoint: "/api/v1/me/connection/buymeacoffee",
                    icon: <BuyMeACoffee className="size-8" />,
                    name: lang.data.app.connections.providers.bmac.name,
                    description:
                      lang.data.app.connections.providers.bmac.description,
                    privacy: lang.data.app.connections.providers.bmac.privacy,
                    payout: lang.data.app.connections.providers.bmac.payout,
                    isConnected: connections?.bmac ? true : false,
                    key: "bmac",
                    soon: false,
                  },
                  {
                    api_endpoint: "/api/v1/me/connection/feelfreepay",
                    icon: <FeelFreePay className="size-8" />,
                    name: lang.data.app.connections.providers.feelfreepay.name,
                    description:
                      lang.data.app.connections.providers.feelfreepay
                        .description,
                    privacy:
                      lang.data.app.connections.providers.feelfreepay.privacy,
                    payout:
                      lang.data.app.connections.providers.feelfreepay.payout,
                    isConnected: connections?.ffp ? true : false,
                    key: "ffp",
                    soon: true,
                  },
                  {
                    api_endpoint: "/api/v1/me/connection/youtube",
                    icon: <Youtube className="size-8" />,
                    name: lang.data.app.connections.providers.youtube.name,
                    description:
                      lang.data.app.connections.providers.youtube.description,
                    privacy:
                      lang.data.app.connections.providers.youtube.privacy,
                    payout: lang.data.app.connections.providers.youtube.payout,
                    isConnected: connections?.youtube ? true : false,
                    key: "youtube",
                    soon: true,
                  },
                  {
                    api_endpoint: "/api/v1/me/connection/facebook",
                    icon: (
                      <FacebookLogoIcon
                        weight="fill"
                        className="size-8 text-blue-600"
                      />
                    ),
                    name: lang.data.app.connections.providers.facebook.name,
                    description:
                      lang.data.app.connections.providers.facebook.description,
                    privacy:
                      lang.data.app.connections.providers.facebook.privacy,
                    payout: lang.data.app.connections.providers.facebook.payout,
                    isConnected: connections?.facebook ? true : false,
                    key: "facebook",
                    soon: true,
                  },
                  {
                    api_endpoint: "/api/v1/me/connection/twitch",
                    icon: <Twitch className="size-8" />,
                    name: lang.data.app.connections.providers.twitch.name,
                    description:
                      lang.data.app.connections.providers.twitch.description,
                    privacy: lang.data.app.connections.providers.twitch.privacy,
                    payout: lang.data.app.connections.providers.twitch.payout,
                    isConnected: connections?.twitch ? true : false,
                    key: "twitch",
                    soon: true,
                  },
                  {
                    api_endpoint: "/api/v1/me/connection/patreon",
                    icon: <Patreon className="size-8" />,
                    name: lang.data.app.connections.providers.patreon.name,
                    description:
                      lang.data.app.connections.providers.patreon.description,
                    privacy:
                      lang.data.app.connections.providers.patreon.privacy,
                    payout: lang.data.app.connections.providers.patreon.payout,
                    isConnected: connections?.patreon ? true : false,
                    key: "patreon",
                    soon: true,
                  },
                ].map((c, i) => (
                  <Connection
                    key={i}
                    api_endpoint={c.api_endpoint}
                    icon={c.icon}
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
              </TabsContent>
              <TabsContent value="trigger" className="flex flex-col gap-1.5">
                {[
                  {
                    api_endpoint: "/api/v1/me/connection/streamlabs",
                    icon: <Streamlabs className="size-8" />,
                    name: lang.data.app.connections.providers.streamlabs.name,
                    description:
                      lang.data.app.connections.providers.streamlabs
                        .description,
                    privacy:
                      lang.data.app.connections.providers.streamlabs.privacy,
                    isConnected: connections?.streamlabs ? true : false,
                    key: "streamlabs",
                    soon: true,
                  },
                ].map((c, i) => (
                  <Connection
                    key={i}
                    api_endpoint={c.api_endpoint}
                    icon={c.icon}
                    name={c.name}
                    description={c.description}
                    privacy={c.privacy}
                    isConnected={c.isConnected}
                    secret={connections?.[c.key as keyof Connections] || null}
                    connections={connections}
                    setConnections={setConnections}
                    skey={c.key}
                    soon={c.soon}
                  />
                ))}
              </TabsContent>
            </TabsContents>
          </Tabs>
        )}
      </div>
    </>
  );
}

export default Page;
