"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RouteError]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="min-h-[60dvh] w-full flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-6 text-center space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Unable to render this page</h2>
        <p className="text-sm text-muted-foreground">
          A runtime error occurred while loading this view.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-muted-foreground/70">Ref: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="default" className="rounded-xl" onClick={reset}>
            Retry
          </Button>
          <Button
            variant="secondary"
            className="rounded-xl"
            onClick={() => window.location.reload()}
          >
            Reload
          </Button>
        </div>
      </div>
    </div>
  );
}
