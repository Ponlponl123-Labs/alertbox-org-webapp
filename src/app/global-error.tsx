"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh bg-background text-foreground flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            An unexpected application error occurred. Please retry or reload the page.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-muted-foreground/70">
              Ref: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium cursor-pointer"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
