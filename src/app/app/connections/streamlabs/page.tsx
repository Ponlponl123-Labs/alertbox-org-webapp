"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

function StreamlabsRedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code && state) {
      const parts = state.split(".");
      if (parts.length >= 2) {
        const [streamerId, orgId] = parts;
        router.replace(
          `/app/${orgId}/${streamerId}/connections/streamlabs?${searchParams.toString()}`
        );
        return;
      }
    }
    router.replace("/app");
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Spinner className="size-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Redirecting to streamer settings...</p>
    </div>
  );
}

export default function StreamlabsRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Spinner className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <StreamlabsRedirectHandler />
    </Suspense>
  );
}
