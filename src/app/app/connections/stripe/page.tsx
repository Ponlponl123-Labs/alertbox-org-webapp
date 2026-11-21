"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { isSafePathSegment } from "@/lib/security";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";

function StripeRedirectHandler() {
  const lang = useStore(coreStore, (s) => s.lang);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code && state) {
      const parts = state.split(".");
      if (parts.length >= 2) {
        const [streamerId, orgId] = parts;
        if (isSafePathSegment(orgId) && isSafePathSegment(streamerId)) {
          router.replace(
            `/app/${encodeURIComponent(orgId)}/${encodeURIComponent(streamerId)}/connections/stripe?${searchParams.toString()}`,
          );
          return;
        }
      }
    }
    router.replace("/app");
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Spinner className="size-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{lang.data.app.connections.redirect.redirecting_streamer}</p>
    </div>
  );
}

export default function StripeRedirectPage() {
  const lang = useStore(coreStore, (s) => s.lang);
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Spinner className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{lang.data.common.loading_ellipsis}</p>
        </div>
      }
    >
      <StripeRedirectHandler />
    </Suspense>
  );
}
