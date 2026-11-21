export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const formatLog = (level: string, event: string, meta?: Record<string, unknown>) =>
      JSON.stringify({
        ts: new Date().toISOString(),
        level,
        service: "alertbox-org-webapp",
        event,
        ...meta,
      });

    process.on("unhandledRejection", (reason) => {
      console.error(
        formatLog("error", "unhandled_rejection", {
          reason: reason instanceof Error ? reason.message : String(reason),
        }),
      );
    });
  }
}

export function onRequestError(
  error: { digest?: string; message?: string },
  request: { path?: string; method?: string },
  context: { routerKind?: string; routePath?: string; routeType?: string },
) {
  console.error(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "error",
      service: "alertbox-org-webapp",
      event: "nextjs_request_error",
      digest: error?.digest,
      message: error?.message,
      method: request?.method,
      path: request?.path,
      routerKind: context?.routerKind,
      routePath: context?.routePath,
      routeType: context?.routeType,
    }),
  );
}
