"use client";
import { useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { Spinner } from "@/components/ui/spinner";
import { getApiUrl } from "@/lib/api";
import { toast } from "@/components/custom-ui/toast";
import {
  XIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import { Stripe } from "@thesvg/react";
import { Connections } from "@/types/user.types";
import { canAccessStreamer } from "@/lib/rbac";
import { StreamerPerm, OrgPerm } from "@/consts/permission";
import { motion } from "motion/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function StripePage() {
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo, logout, authFetch, activeOrg, activeStreamer } = useUserContext();
  const router = useRouter();
  const routeParams = useParams();
  const params = useSearchParams();
  const code = params.get("code");
  const state = params.get("state");

  const canManageIntegrations = canAccessStreamer(
    activeOrg,
    activeStreamer,
    StreamerPerm.STREAMER_INTEGRATION_MANAGE,
    OrgPerm.INTEGRATION_MANAGE
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [oauthStatus, setOauthStatus] = useState<
    "connecting" | "success" | "failed"
  >("connecting");
  const [connections, setConnections] = useState<Connections | null>(null);
  const t = lang.data.app.connections.kofi_setup;
  const t2 = lang.data.app.connections.providers.streamlabs;

  const isFetched = useRef(false);
  const routeOrg = routeParams?.org as string | undefined;
  const routeStreamer = routeParams?.streamer as string | undefined;
  const orgKey = activeOrg?.slug || activeOrg?.id || routeOrg;
  const streamerKey = activeStreamer?.name || activeStreamer?.id || routeStreamer;
  const connectionsEndpoint = activeOrg && activeStreamer
    ? getApiUrl(`/api/v1/org/${activeOrg.id}/streamers/${activeStreamer.id}/connections`)
    : getApiUrl("/api/v1/me/connection");
  const stripeEndpoint = activeOrg && activeStreamer
    ? getApiUrl(`/api/v1/org/${activeOrg.id}/streamers/${activeStreamer.id}/connections/stripe`)
    : getApiUrl("/api/v1/me/connection/stripe");
  const backHref = orgKey && streamerKey ? `/app/${orgKey}/${streamerKey}/connections` : "/app/connections";

  // Handle OAuth code exchange flow if code & state exist in URL
  useEffect(() => {
    if (code && state) {
      const parts = state.split(".");
      const orgId = parts.length >= 2 ? parts[1] : activeOrg?.id;
      const streamerId = parts.length >= 2 ? parts[0] : activeStreamer?.id;
      const targetEndpoint =
        orgId && streamerId
          ? `/api/v1/org/${orgId}/streamers/${streamerId}/connections/stripe`
          : "/api/v1/me/connection/stripe";

      authFetch(getApiUrl(targetEndpoint), {
        method: "POST",
        body: code,
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to connect");
          }
          setOauthStatus("success");
          setTimeout(() => {
            router.push(backHref);
          }, 2400);
        })
        .catch(() => {
          setOauthStatus("failed");
          setTimeout(() => {
            router.push(backHref);
          }, 2400);
        });
    } else {
      if (isFetched.current || !userInfo) return;
      isFetched.current = true;
    }
  }, [code, state, router, userInfo, authFetch, backHref, activeOrg?.id, activeStreamer?.id]);

  useEffect(() => {
    if (isFetched.current || !userInfo) return;
    isFetched.current = true;
    authFetch(connectionsEndpoint)
      .then((res) => {
        if (res.status === 401) {
          logout();
          return;
        }
        if (res.ok) return res.json();
        throw new Error("Failed to fetch connections");
      })
      .then((data: Connections) => {
        setConnections(data);
      })
      .catch(() => {
        // ignore
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [logout, userInfo, authFetch, connectionsEndpoint]);

  const handleDisconnect = async () => {
    setIsSaving(true);

    try {
      const res = await authFetch(stripeEndpoint, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(t.success_disconnect);
        setConnections((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            stripe: null,
          };
        });
      } else {
        toast.error(t.error_disconnect);
      }
    } catch {
      toast.error(t.error_network);
    } finally {
      setIsSaving(false);
    }
  };

  // Render OAuth callback loader screen
  if (code && state) {
    return (
      <div className="w-full flex flex-col min-h-0 mt-6 flex-1 gap-1.5 font-sans">
        <div className="w-full flex flex-col items-center justify-center min-h-0 py-6 flex-1">
          <div className="flex items-center justify-center gap-4">
            <Image
              src={"/favicon.ico"}
              width={64}
              height={64}
              alt="Alertbox.org"
              className="-ml-4.25"
            />
            {oauthStatus === "connecting" ? (
              <Spinner className="size-4 text-foreground/40" />
            ) : oauthStatus === "success" ? (
              <div className="text-emerald-500 animate-scale-in">
                <CheckIcon weight="bold" size={16} />
              </div>
            ) : (
              <div className="text-rose-500 animate-scale-in">
                <XIcon weight="bold" size={16} />
              </div>
            )}
            <Stripe className="size-12 ml-2" />
          </div>
          <h1 className="text-lg font-semibold mt-3">
            {oauthStatus === "connecting"
              ? "Connecting with Stripe"
              : oauthStatus === "success"
                ? t2.oauth.connected
                : t2.oauth.failed}
          </h1>
          <p className="text-xs text-foreground/40 mt-3 text-center font-sans leading-relaxed">
            {oauthStatus === "connecting"
              ? "We're now connecting your Stripe account to Alertbox.org Please wait for a moment..."
              : oauthStatus === "success"
                ? t2.oauth.connected_description
                : t2.oauth.failed_description}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-100">
        <Spinner className="size-8 text-foreground/40" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mx-auto max-w-384 px-12 pt-12 flex flex-col gap-6 z-10 min-h-0 flex-1"
    >
      <div className="flex items-center w-full justify-between gap-4 mb-8 font-sans">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium tracking-tight text-foreground my-3">
            Stripe
          </h1>
          <p className="text-sm font-sans text-muted-foreground mt-3">
            Enterprise-grade payment gateway for accepting credit/debit cards, Apple Pay, and Google Pay globally.
          </p>
        </div>
        <div className="p-3">
          <Stripe className="size-12" />
        </div>
      </div>
    </motion.div>
  );
}

export default StripePage;
