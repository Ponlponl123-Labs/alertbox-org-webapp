import { useSyncExternalStore } from "react";

const MOBILE_MQL_QUERY = "(max-width: 767px)";

function subscribeIsMobile(callback: () => void) {
  const mql = window.matchMedia(MOBILE_MQL_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

const getIsMobile = () => window.matchMedia(MOBILE_MQL_QUERY).matches;
const getServerFalse = () => false;

export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribeIsMobile,
    getIsMobile,
    getServerFalse,
  );
}
