"use client";

import { useEffect } from "react";
import { useStore } from "zustand";
import { coreStore } from "@/hooks/store/core";
import { formatI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const lang = useStore(coreStore, (state) => state.lang);

  useEffect(() => {
    console.error("[RouteError]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="min-h-[60dvh] w-full flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full rounded-xl bg-card p-8 text-center space-y-4">
        <h2 className="text-xl font-medium font-sans text-foreground">{lang.data.errors.page_title}</h2>
        <p className="text-sm text-muted-foreground font-sans">
          {lang.data.errors.page_desc}
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-muted-foreground/70">
            {formatI18n(lang.data.errors.ref_code, { digest: error.digest })}
          </p>
        )}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="default" className="rounded-xl p-3 h-max" onClick={reset}>
            {lang.data.common.retry}
          </Button>
          <Button
            variant="secondary"
            className="rounded-xl p-3 h-max"
            onClick={() => window.location.reload()}
          >
            {lang.data.common.reload}
          </Button>
        </div>
      </div>
    </div>
  );
}
