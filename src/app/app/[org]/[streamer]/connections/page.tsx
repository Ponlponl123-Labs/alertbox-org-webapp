"use client";
import Connection from "@/components/features/streamer/connection";
import { Spinner } from "@/components/ui/spinner";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import { coreStore } from "@/hooks/store/core";
import { Connections } from "@/types/user.types";
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
  Xendit,
} from "@thesvg/react";
import { FeelFreePay } from "@/components/icons";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from '@animate-ui/react/primitives/tabs';
import {
  ContactlessPaymentIcon,
  FacebookLogoIcon,
  WebhooksLogoIcon,
} from "@phosphor-icons/react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { canAccessStreamer } from "@/lib/rbac";
import { OrgPerm, StreamerPerm } from "@/consts/permission";
import { motion } from "motion/react";

function Page() {
  const [connections, setConnections] = useState<Connections | null>(null);
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo, logout, authFetch, activeOrg, activeStreamer } = useUserContext();
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const selectedTab = searchParams.get("t");
  const lastFetchedKey = useRef("");

  const targetOrg = activeOrg?.id || activeOrg?.slug || (routeParams?.org as string);
  const targetStreamer = activeStreamer?.id || activeStreamer?.name || (routeParams?.streamer as string);

  const canManageIntegrations = canAccessStreamer(
    activeOrg,
    activeStreamer,
    StreamerPerm.STREAMER_INTEGRATION_MANAGE,
    OrgPerm.INTEGRATION_MANAGE,
  );

  const getProviderEndpoint = (key: string) => {
    const providerMap: Record<string, string> = {
      bmac: "buymeacoffee",
      ffp: "feelfreepay",
    };
    const provider = providerMap[key] || key;
    if (activeOrg && activeStreamer) {
      return `/api/v1/org/${activeOrg.id}/streamers/${activeStreamer.id}/connections/${provider}`;
    }
    return `/api/v1/me/connection/${provider}`;
  };

  useEffect(() => {
    if (!userInfo || !targetOrg || !targetStreamer) return;
    const fetchKey = `${targetOrg}:${targetStreamer}`;
    if (lastFetchedKey.current === fetchKey) return;
    lastFetchedKey.current = fetchKey;

    const endpoint = getApiUrl(`/api/v1/org/${targetOrg}/streamers/${targetStreamer}/connections`);

    authFetch(endpoint)
      .then((res) => {
        if (res.status === 401) {
          logout();
          return null;
        }
        if (!res.ok) {
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setConnections(data);
      })
      .catch(() => { });
  }, [logout, userInfo, authFetch, targetOrg, targetStreamer]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mx-auto max-w-384 px-12 pt-12 flex flex-col gap-6 z-10 min-h-0 flex-1"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-full">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium tracking-tight text-foreground my-3">
            {lang.data.app.connections.title}
          </h1>
          <p className="text-sm font-sans text-muted-foreground mt-3">
            {lang.data.app.connections.description}
          </p>
        </div>
      </div>

      <div className="w-full flex flex-col min-h-0 flex-1 gap-1.5">
        {!connections && (
          <div className="w-full flex items-center justify-center min-h-0 bg-foreground/5 rounded-4xl py-6 flex-1 border-2 border-dashed border-foreground/10">
            <Spinner className="size-6 text-foreground/40 mx-auto my-8" />
          </div>
        )}
        {connections && (
          <Tabs
            defaultValue={
              typeof selectedTab === "string"
                ? selectedTab.toLowerCase()
                : "payment"
            }
          >
            <TabsHighlight className="absolute inset-0 rounded-2xl bg-muted">
              <TabsList className="flex rounded-lg gap-3">
                <TabsHighlightItem value="payment" className="flex-1">
                  <TabsTrigger value="payment" className="w-full h-full flex gap-2 p-4 font-medium text-sm items-center justify-center hover:bg-muted/30 rounded-2xl">
                    <ContactlessPaymentIcon weight="bold" size={20} />
                    {lang.data.app.connections.tabs.payment}
                  </TabsTrigger>
                </TabsHighlightItem>
                <TabsHighlightItem value="trigger" className="flex-1">
                  <TabsTrigger value="trigger" className="w-full h-full flex gap-2 p-4 font-medium text-sm items-center justify-center hover:bg-muted/30 rounded-2xl">
                    <WebhooksLogoIcon weight="bold" size={20} />
                    {lang.data.app.connections.tabs.trigger}
                  </TabsTrigger>
                </TabsHighlightItem>
              </TabsList>
            </TabsHighlight>
            <TabsContents className="rounded-2xl mt-3">
              <TabsContent
                value="payment"
                className="flex flex-col xl:grid xl:grid-cols-2 gap-1.5"
              >
                {[
                  {
                    api_endpoint: getProviderEndpoint("stripe"),
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
                    api_endpoint: getProviderEndpoint("kofi"),
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
                    api_endpoint: getProviderEndpoint("bmac"),
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
                    api_endpoint: getProviderEndpoint("xendit"),
                    icon: <Xendit className="size-8" />,
                    name: lang.data.app.connections.providers.xendit.name,
                    description:
                      lang.data.app.connections.providers.xendit.description,
                    privacy: lang.data.app.connections.providers.xendit.privacy,
                    payout: lang.data.app.connections.providers.xendit.payout,
                    isConnected: connections?.xendit ? true : false,
                    key: "xendit",
                    soon: true,
                  },
                  {
                    api_endpoint: getProviderEndpoint("omise"),
                    icon: (
                      <Image
                        src={"/omise.webp"}
                        width={32}
                        height={32}
                        className="rounded-md"
                        alt="omise"
                      />
                    ),
                    name: lang.data.app.connections.providers.omise.name,
                    description:
                      lang.data.app.connections.providers.omise.description,
                    privacy: lang.data.app.connections.providers.omise.privacy,
                    payout: lang.data.app.connections.providers.omise.payout,
                    isConnected: false,
                    key: "omise",
                    soon: true,
                  },
                  {
                    api_endpoint: getProviderEndpoint("2c2p"),
                    icon: (
                      <Image
                        src={"/2c2p.webp"}
                        width={32}
                        height={32}
                        className="rounded-md"
                        alt="omise"
                      />
                    ),
                    name: lang.data.app.connections.providers["2c2p"].name,
                    description:
                      lang.data.app.connections.providers["2c2p"].description,
                    privacy:
                      lang.data.app.connections.providers["2c2p"].privacy,
                    payout: lang.data.app.connections.providers["2c2p"].payout,
                    isConnected: false,
                    key: "2c2p",
                    soon: true,
                  },
                  {
                    api_endpoint: getProviderEndpoint("youtube"),
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
                    api_endpoint: getProviderEndpoint("facebook"),
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
                    api_endpoint: getProviderEndpoint("twitch"),
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
                    api_endpoint: getProviderEndpoint("patreon"),
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
                  {
                    api_endpoint: getProviderEndpoint("ffp"),
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
                    readOnly={!canManageIntegrations}
                  />
                ))}
              </TabsContent>
              <TabsContent value="trigger" className="flex flex-col gap-1.5">
                {[
                  {
                    api_endpoint: getProviderEndpoint("streamlabs"),
                    icon: <Streamlabs className="size-8" />,
                    name: lang.data.app.connections.providers.streamlabs.name,
                    description:
                      lang.data.app.connections.providers.streamlabs
                        .description,
                    privacy:
                      lang.data.app.connections.providers.streamlabs.privacy,
                    isConnected: connections?.streamlabs,
                    key: "streamlabs",
                    soon: false,
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
                    secret={c.isConnected}
                    connections={connections}
                    setConnections={setConnections}
                    skey={c.key}
                    soon={c.soon}
                    readOnly={!canManageIntegrations}
                  />
                ))}
              </TabsContent>
            </TabsContents>
          </Tabs>
        )}
      </div>
    </motion.div>
  );
}

export default Page;
