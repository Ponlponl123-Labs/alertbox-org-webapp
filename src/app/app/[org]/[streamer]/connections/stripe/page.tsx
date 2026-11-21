"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";
import { toast } from "@/components/custom-ui/toast";
import { XIcon, CheckIcon, LinkBreakIcon } from "@phosphor-icons/react";
import { Stripe } from "@thesvg/react";
import { Connections } from "@/types/user.types";
import { canAccessStreamer } from "@/lib/rbac";
import { StreamerPerm, OrgPerm } from "@/consts/permission";
import { isSafePathSegment } from "@/lib/security";
import { motion } from "motion/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function StripePageContent() {
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
    OrgPerm.INTEGRATION_MANAGE,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [oauthStatus, setOauthStatus] = useState<"connecting" | "success" | "failed">(
    "connecting",
  );
  const [connections, setConnections] = useState<Connections | null>(null);
  const t = lang.data.app.connections.kofi_setup;
  const t2 = lang.data.app.connections.providers.streamlabs;

  const oauthExchangedRef = useRef(false);
  const routeOrg = routeParams?.org as string | undefined;
  const routeStreamer = routeParams?.streamer as string | undefined;
  const targetOrg = String(routeOrg || activeOrg?.id || activeOrg?.slug || "");
  const targetStreamer = String(routeStreamer || activeStreamer?.id || activeStreamer?.name || "");
  const safeOrg = isSafePathSegment(targetOrg) ? targetOrg : null;
  const safeStreamer = isSafePathSegment(targetStreamer) ? targetStreamer : null;

  const connectionsEndpoint =
    safeOrg && safeStreamer
      ? getApiUrl(
          `/api/v1/org/${encodeURIComponent(safeOrg)}/streamers/${encodeURIComponent(safeStreamer)}/integration`,
        )
      : "";
  const stripeEndpoint =
    safeOrg && safeStreamer
      ? getApiUrl(
          `/api/v1/org/${encodeURIComponent(safeOrg)}/streamers/${encodeURIComponent(safeStreamer)}/integration/stripe`,
        )
      : "";
  const backHref =
    safeOrg && safeStreamer
      ? `/app/${encodeURIComponent(safeOrg)}/${encodeURIComponent(safeStreamer)}/connections`
      : "/app/connections";

  useEffect(() => {
    if (!code || !state || !userInfo || oauthExchangedRef.current) return;
    oauthExchangedRef.current = true;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const parts = state.split(".");
    const rawOrgId = parts.length >= 2 ? parts[1] : activeOrg?.id;
    const rawStreamerId = parts.length >= 2 ? parts[0] : activeStreamer?.id;

    if (!isSafePathSegment(rawOrgId) || !isSafePathSegment(rawStreamerId)) {
      queueMicrotask(() => setOauthStatus("failed"));
      timer = setTimeout(() => router.push(backHref), 2400);
      return () => {
        if (timer) clearTimeout(timer);
      };
    }

    const targetEndpoint = `/api/v1/org/${encodeURIComponent(rawOrgId)}/streamers/${encodeURIComponent(rawStreamerId)}/connections/stripe`;

    authFetch(getApiUrl(targetEndpoint), {
      method: "POST",
      body: code,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to connect");
        setOauthStatus("success");
        timer = setTimeout(() => router.push(backHref), 2400);
      })
      .catch(() => {
        setOauthStatus("failed");
        timer = setTimeout(() => router.push(backHref), 2400);
      });

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [code, state, router, userInfo, authFetch, backHref, activeOrg?.id, activeStreamer?.id]);

  useEffect(() => {
    if ((code && state) || !userInfo || !connectionsEndpoint) {
      if (!code && !state && !connectionsEndpoint) {
        queueMicrotask(() => setIsLoading(false));
      }
      return;
    }

    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) setIsLoading(true);
    });

    authFetch(connectionsEndpoint, { signal: controller.signal })
      .then((res) => {
        if (res.status === 401) {
          logout();
          return null;
        }
        if (res.ok) return res.json() as Promise<Connections>;
        throw new Error("Failed to fetch connections");
      })
      .then((data) => {
        if (!controller.signal.aborted && data) {
          setConnections(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [code, state, logout, userInfo, authFetch, connectionsEndpoint]);

  const handleDisconnect = async () => {
    if (!canManageIntegrations || !stripeEndpoint || isSaving) return;
    setIsSaving(true);
    try {
      const res = await authFetch(stripeEndpoint, { method: "DELETE" });
      if (res.ok) {
        toast.success(t.success_disconnect);
        setConnections((prev) => (prev ? { ...prev, stripe: null } : null));
      } else {
        toast.error(t.error_disconnect);
      }
    } catch {
      toast.error(t.error_network);
    } finally {
      setIsSaving(false);
    }
  };

  if (code && state) {
    return (
      <div className="w-full flex flex-col min-h-0 mt-6 flex-1 gap-1.5 font-sans">
        <div className="w-full flex flex-col items-center justify-center min-h-0 py-6 flex-1">
          <div className="flex items-center justify-center gap-4">
            <Image
              src="/favicon.ico"
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
              ? "We're now connecting your Stripe account to Alertbox.org. Please wait..."
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

  const isConnected = Boolean(connections?.stripe);

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
      {isConnected && canManageIntegrations && (
        <div>
          <Button
            type="button"
            variant="destructive"
            disabled={isSaving}
            onClick={handleDisconnect}
            className="rounded-xl gap-2"
          >
            {isSaving ? <Spinner className="size-4" /> : <LinkBreakIcon size={16} />}
            {t.btn_disconnect}
          </Button>
        </div>
      )}
    </motion.div>
  );
}

export default function StripePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center min-h-100">
          <Spinner className="size-8 text-foreground/40" />
        </div>
      }
    >
      <StripePageContent />
    </Suspense>
  );
}
