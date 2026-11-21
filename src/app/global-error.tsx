"use client";

import { useEffect, useSyncExternalStore } from "react";
import { readStoredLanguageKey } from "@/hooks/store/core";
import lang, { formatI18n } from "@/lib/i18n";

const noopSubscribe = () => () => {};
const getServerLanguageKey = () => "en-US" as const;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const langKey = useSyncExternalStore(
    noopSubscribe,
    readStoredLanguageKey,
    getServerLanguageKey,
  );

  useEffect(() => {
    console.error("[GlobalError]", error.digest ?? error.message);
  }, [error]);

  const activeLang = lang(langKey);

  return (
    <html lang={activeLang.key} className="dark">
      <body className="min-h-dvh bg-background text-foreground flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold">{activeLang.data.errors.global_title}</h2>
          <p className="text-sm text-muted-foreground">
            {activeLang.data.errors.global_desc}
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-muted-foreground/70">
              {formatI18n(activeLang.data.errors.ref_code, { digest: error.digest })}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium cursor-pointer"
          >
            {activeLang.data.errors.try_again}
          </button>
        </div>
      </body>
    </html>
  );
}
