"use client";
import Connection from "@/components/features/streamer/connection";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import { coreStore } from "@/hooks/store/core";
import { Connections } from "@/types/user.types";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useStore } from "zustand";
import { Button } from "@/components/ui/button";
import {
  Stripe,
  BuyMeACoffee,
  KoFi,
  Youtube,
  Streamlabs,
  Twitch,
  Patreon,
  Xendit,
  Discord,
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
} from "@animate-ui/react/primitives/tabs";
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
import { cn } from "@/lib/utils";
import type { ProviderItem } from "@/types/connections.types";

function SectionGrid({
  title,
  description,
  count,
  variant = "active",
  emptyMessage,
  children,
}: {
  title: string;
  description?: string;
  count: number;
  variant?: "active" | "available" | "unavailable";
  emptyMessage?: string;
  children: React.ReactNode;
}) {
  if (count === 0 && !emptyMessage) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col justify-between gap-1 pb-0.5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            {title}
          </h2>
          <Badge
            variant={variant === "active" ? "outline" : "secondary"}
            className={cn(
              "rounded-full p-3 text-xs font-medium border-0",
              variant === "active" &&
              "bg-emerald-500/10 text-emerald-500",
              variant === "unavailable" &&
              "text-muted-foreground/60"
            )}
          >
            {count}
          </Badge>
        </div>
        {description && (
          <p className="text-xs font-sans text-muted-foreground">{description}</p>
        )}
      </div>

      {count > 0 ? (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-muted/20 p-8 min-h-64 text-center">
          <p className="text-xs text-muted-foreground font-sans">{emptyMessage}</p>
        </div>
      )}
    </section>
  );
}

function ConnectionsContent() {
  const [fetchState, setFetchState] = useState<{
    key: string;
    data: Connections | null;
    error: boolean;
  }>({ key: "", data: null, error: false });
  const [retryTick, setRetryTick] = useState(0);
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo, logout, authFetch, activeOrg, activeStreamer } =
    useUserContext();
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const selectedTab = searchParams.get("t");

  const targetOrg =
    activeOrg?.id || activeOrg?.slug || (routeParams?.org as string);
  const targetStreamer =
    activeStreamer?.id ||
    activeStreamer?.name ||
    (routeParams?.streamer as string);

  const canManageIntegrations = canAccessStreamer(
    activeOrg,
    activeStreamer,
    StreamerPerm.STREAMER_INTEGRATION_MANAGE,
    OrgPerm.INTEGRATION_MANAGE
  );

  const encodedOrg = targetOrg ? encodeURIComponent(targetOrg) : "";
  const encodedStreamer = targetStreamer ? encodeURIComponent(targetStreamer) : "";
  const requestKey = encodedOrg && encodedStreamer ? `${encodedOrg}:${encodedStreamer}:${retryTick}` : "";

  const connections = fetchState.key === requestKey ? fetchState.data : null;
  const fetchError = fetchState.key === requestKey ? fetchState.error : false;

  const setConnections: React.Dispatch<React.SetStateAction<Connections | null>> = useCallback(
    (updater) => {
      setFetchState((prev) => {
        const current = prev.key === requestKey ? prev.data : null;
        const next = typeof updater === "function" ? updater(current) : updater;
        return { key: requestKey, data: next, error: false };
      });
    },
    [requestKey],
  );

  const getProviderEndpoint = useCallback((key: string) => {
    const providerMap: Record<string, string> = {
      bmac: "buymeacoffee",
      ffp: "feelfreepay",
    };
    const provider = providerMap[key] || key;
    return `/api/v1/org/${encodedOrg}/streamers/${encodedStreamer}/integration/${provider}`;
  }, [encodedOrg, encodedStreamer]);

  useEffect(() => {
    if (!userInfo || !requestKey) return;
    const controller = new AbortController();

    const endpoint = getApiUrl(
      `/api/v1/org/${encodedOrg}/streamers/${encodedStreamer}/integration`
    );

    authFetch(endpoint, { signal: controller.signal })
      .then((res) => {
        if (res.status === 401) {
          logout();
          return null;
        }
        if (!res.ok) {
          if (!controller.signal.aborted) {
            setFetchState({ key: requestKey, data: null, error: true });
          }
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && !controller.signal.aborted) {
          setFetchState({ key: requestKey, data, error: false });
        }
      })
      .catch((err) => {
        if ((err as Error)?.name !== "AbortError" && !controller.signal.aborted) {
          setFetchState({ key: requestKey, data: null, error: true });
        }
      });

    return () => controller.abort();
  }, [logout, userInfo, authFetch, encodedOrg, encodedStreamer, requestKey]);

  const paymentProviders: ProviderItem[] = [
    {
      api_endpoint: getProviderEndpoint("stripe"),
      icon: <Stripe className="size-7" />,
      name: lang.data.app.connections.providers.stripe.name,
      description: lang.data.app.connections.providers.stripe.description,
      privacy: lang.data.app.connections.providers.stripe.privacy,
      payout: lang.data.app.connections.providers.stripe.payout,
      isConnected: connections?.stripe ? true : false,
      isUseOauth: true,
      key: "stripe",
      soon: false,
    },
    {
      api_endpoint: getProviderEndpoint("stripe-connect"),
      icon: <Stripe className="size-7" />,
      name: lang.data.app.connections.stripe_connect_name,
      description: lang.data.app.connections.providers.stripe.description,
      privacy: lang.data.app.connections.providers.stripe.privacy,
      payout: lang.data.app.connections.providers.stripe.payout,
      isConnected: false,
      key: "stripe-connect",
      soon: true,
    },
    {
      api_endpoint: getProviderEndpoint("kofi"),
      icon: <KoFi className="size-7" />,
      name: lang.data.app.connections.providers.kofi.name,
      description: lang.data.app.connections.providers.kofi.description,
      privacy: lang.data.app.connections.providers.kofi.privacy,
      payout: lang.data.app.connections.providers.kofi.payout,
      isConnected: connections?.kofi ? true : false,
      key: "kofi",
      soon: false,
    },
    {
      api_endpoint: getProviderEndpoint("bmac"),
      icon: <BuyMeACoffee className="size-7" />,
      name: lang.data.app.connections.providers.bmac.name,
      description: lang.data.app.connections.providers.bmac.description,
      privacy: lang.data.app.connections.providers.bmac.privacy,
      payout: lang.data.app.connections.providers.bmac.payout,
      isConnected: connections?.bmac ? true : false,
      key: "bmac",
      soon: false,
    },
    {
      api_endpoint: getProviderEndpoint("xendit"),
      icon: <Xendit className="size-7" />,
      name: lang.data.app.connections.providers.xendit.name,
      description: lang.data.app.connections.providers.xendit.description,
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
          width={28}
          height={28}
          className="rounded-md"
          alt="omise"
        />
      ),
      name: lang.data.app.connections.providers.omise.name,
      description: lang.data.app.connections.providers.omise.description,
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
          width={28}
          height={28}
          className="rounded-md"
          alt="2c2p"
        />
      ),
      name: lang.data.app.connections.providers["2c2p"].name,
      description: lang.data.app.connections.providers["2c2p"].description,
      privacy: lang.data.app.connections.providers["2c2p"].privacy,
      payout: lang.data.app.connections.providers["2c2p"].payout,
      isConnected: false,
      key: "2c2p",
      soon: true,
    },
    {
      api_endpoint: getProviderEndpoint("youtube"),
      icon: <Youtube className="size-7" />,
      name: lang.data.app.connections.providers.youtube.name,
      description: lang.data.app.connections.providers.youtube.description,
      privacy: lang.data.app.connections.providers.youtube.privacy,
      payout: lang.data.app.connections.providers.youtube.payout,
      isConnected: connections?.youtube ? true : false,
      key: "youtube",
      soon: true,
    },
    {
      api_endpoint: getProviderEndpoint("facebook"),
      icon: (
        <FacebookLogoIcon weight="fill" className="size-7 text-blue-600" />
      ),
      name: lang.data.app.connections.providers.facebook.name,
      description: lang.data.app.connections.providers.facebook.description,
      privacy: lang.data.app.connections.providers.facebook.privacy,
      payout: lang.data.app.connections.providers.facebook.payout,
      isConnected: connections?.facebook ? true : false,
      key: "facebook",
      soon: true,
    },
    {
      api_endpoint: getProviderEndpoint("twitch"),
      icon: <Twitch className="size-7" />,
      name: lang.data.app.connections.providers.twitch.name,
      description: lang.data.app.connections.providers.twitch.description,
      privacy: lang.data.app.connections.providers.twitch.privacy,
      payout: lang.data.app.connections.providers.twitch.payout,
      isConnected: connections?.twitch ? true : false,
      key: "twitch",
      soon: true,
    },
    {
      api_endpoint: getProviderEndpoint("patreon"),
      icon: <Patreon className="size-7" />,
      name: lang.data.app.connections.providers.patreon.name,
      description: lang.data.app.connections.providers.patreon.description,
      privacy: lang.data.app.connections.providers.patreon.privacy,
      payout: lang.data.app.connections.providers.patreon.payout,
      isConnected: connections?.patreon ? true : false,
      key: "patreon",
      soon: true,
    },
    {
      api_endpoint: getProviderEndpoint("ffp"),
      icon: <FeelFreePay className="size-7" />,
      name: lang.data.app.connections.providers.feelfreepay.name,
      description: lang.data.app.connections.providers.feelfreepay.description,
      privacy: lang.data.app.connections.providers.feelfreepay.privacy,
      payout: lang.data.app.connections.providers.feelfreepay.payout,
      isConnected: connections?.ffp ? true : false,
      key: "ffp",
      soon: true,
    },
  ];

  const triggerProviders: ProviderItem[] = [
    {
      api_endpoint: getProviderEndpoint("streamlabs"),
      icon: <Streamlabs className="size-7" />,
      name: lang.data.app.connections.providers.streamlabs.name,
      description: lang.data.app.connections.providers.streamlabs.description,
      privacy: lang.data.app.connections.providers.streamlabs.privacy,
      isConnected: Boolean(connections?.streamlabs),
      key: "streamlabs",
      soon: false,
    },
    {
      api_endpoint: getProviderEndpoint("discord"),
      icon: <Discord className="size-7" />,
      name: lang.data.app.connections.providers.discord.name,
      description: lang.data.app.connections.providers.discord.description,
      privacy: lang.data.app.connections.providers.discord.privacy,
      isConnected: Boolean(connections?.discord),
      key: "discord",
      soon: true,
    },
  ];

  const renderCard = (c: ProviderItem) => (
    <Connection
      key={c.key}
      api_endpoint={c.api_endpoint}
      icon={c.icon}
      name={c.name}
      description={c.description}
      privacy={c.privacy}
      payout={c.payout}
      isConnected={c.isConnected}
      secret={connections?.[c.key as keyof Connections] ?? null}
      isUseOauth={c.isUseOauth}
      connections={connections}
      setConnections={setConnections}
      skey={c.key}
      soon={c.soon}
      readOnly={!canManageIntegrations}
    />
  );

  const activePayment = paymentProviders.filter((p) => p.isConnected);
  const availablePayment = paymentProviders.filter((p) => !p.soon && !p.isConnected);
  const unavailablePayment = paymentProviders.filter((p) => p.soon);

  const activeTrigger = triggerProviders.filter((p) => p.isConnected);
  const availableTrigger = triggerProviders.filter((p) => !p.soon && !p.isConnected);
  const unavailableTrigger = triggerProviders.filter((p) => p.soon);

  const sectionsText = lang.data.app.connections.sections;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex min-h-0 w-full max-w-384 flex-1 flex-col gap-6 px-4 pt-10 sm:px-8 lg:px-12 z-10"
    >
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="my-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl md:text-3xl lg:text-4xl">
            {lang.data.app.connections.title}
          </h1>
          <p className="font-sans text-xs sm:text-sm text-muted-foreground">
            {lang.data.app.connections.description}
          </p>
        </div>
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col gap-2">
        {!connections && !fetchError && (
          <div className="flex min-h-64 flex-1 items-center justify-center rounded-4xl border-2 border-dashed border-foreground/10 bg-foreground/5 py-12">
            <Spinner className="mx-auto size-6 text-foreground/40" />
          </div>
        )}

        {!connections && fetchError && (
          <div className="flex min-h-64 flex-1 flex-col items-center justify-center gap-3 rounded-4xl border-2 border-dashed border-foreground/10 bg-foreground/5 py-12 text-center">
            <p className="text-xs text-muted-foreground font-sans">{lang.data.app.connections.load_error}</p>
            <Button variant="secondary" size="sm" onClick={() => setRetryTick((n) => n + 1)}>
              {lang.data.common.retry}
            </Button>
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
              <TabsList className="flex gap-2 rounded-lg">
                <TabsHighlightItem value="payment" className="flex-1">
                  <TabsTrigger
                    value="payment"
                    className="flex h-full w-full items-center justify-center gap-2 rounded-2xl p-3.5 text-xs sm:text-sm font-medium hover:bg-muted/30"
                  >
                    <ContactlessPaymentIcon weight="bold" size={18} />
                    {lang.data.app.connections.tabs.payment}
                  </TabsTrigger>
                </TabsHighlightItem>
                <TabsHighlightItem value="trigger" className="flex-1">
                  <TabsTrigger
                    value="trigger"
                    className="flex h-full w-full items-center justify-center gap-2 rounded-2xl p-3.5 text-xs sm:text-sm font-medium hover:bg-muted/30"
                  >
                    <WebhooksLogoIcon weight="bold" size={18} />
                    {lang.data.app.connections.tabs.trigger}
                  </TabsTrigger>
                </TabsHighlightItem>
              </TabsList>
            </TabsHighlight>

            <TabsContents className="mt-6 rounded-2xl">
              <TabsContent value="payment" className="flex flex-col gap-8">
                <SectionGrid
                  title={sectionsText?.active || "Active Integrations"}
                  description={sectionsText?.active_desc}
                  count={activePayment.length}
                  variant="active"
                  emptyMessage={
                    sectionsText?.active_empty ||
                    "No active payment integrations yet. Choose an available integration below to connect."
                  }
                >
                  {activePayment.map(renderCard)}
                </SectionGrid>

                <SectionGrid
                  title={sectionsText?.available || "Available Integrations"}
                  description={sectionsText?.available_desc}
                  count={availablePayment.length}
                  variant="available"
                >
                  {availablePayment.map(renderCard)}
                </SectionGrid>

                <SectionGrid
                  title={sectionsText?.unavailable || "Unavailable Integrations"}
                  description={sectionsText?.unavailable_desc}
                  count={unavailablePayment.length}
                  variant="unavailable"
                >
                  {unavailablePayment.map(renderCard)}
                </SectionGrid>
              </TabsContent>

              <TabsContent value="trigger" className="flex flex-col gap-8">
                <SectionGrid
                  title={sectionsText?.active || "Active Integrations"}
                  description={sectionsText?.active_desc}
                  count={activeTrigger.length}
                  variant="active"
                  emptyMessage={
                    sectionsText?.active_empty ||
                    "No active trigger integrations yet. Connect an available trigger below."
                  }
                >
                  {activeTrigger.map(renderCard)}
                </SectionGrid>

                <SectionGrid
                  title={sectionsText?.available || "Available Integrations"}
                  description={sectionsText?.available_desc}
                  count={availableTrigger.length}
                  variant="available"
                >
                  {availableTrigger.map(renderCard)}
                </SectionGrid>

                <SectionGrid
                  title={sectionsText?.unavailable || "Unavailable Integrations"}
                  description={sectionsText?.unavailable_desc}
                  count={unavailableTrigger.length}
                  variant="unavailable"
                >
                  {unavailableTrigger.map(renderCard)}
                </SectionGrid>
              </TabsContent>
            </TabsContents>
          </Tabs>
        )}
      </div>
    </motion.div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-64 flex-1 items-center justify-center py-12">
          <Spinner className="mx-auto size-6 text-foreground/40" />
        </div>
      }
    >
      <ConnectionsContent />
    </Suspense>
  );
}
