import { getApiUrl } from "@/lib/api";

const SUCCESS_TTL_MS = 10 * 60 * 1000;
const FAILURE_TTL_MS = 30 * 1000;

let isProductionCached: boolean | null = null;
let cacheExpiresAt = 0;
let pendingCheck: Promise<boolean> | null = null;

export const checkIsAlertboxProduction = async (): Promise<boolean> => {
  const now = Date.now();
  if (isProductionCached !== null && now < cacheExpiresAt) {
    return isProductionCached;
  }
  if (pendingCheck) return pendingCheck;

  pendingCheck = (async () => {
    try {
      const res = await fetch(getApiUrl("/api/v1/instance"), {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      const isProd = res.status === 200;
      isProductionCached = isProd;
      cacheExpiresAt = Date.now() + (isProd || res.status === 404 ? SUCCESS_TTL_MS : FAILURE_TTL_MS);
      return isProd;
    } catch {
      isProductionCached = false;
      cacheExpiresAt = Date.now() + FAILURE_TTL_MS;
      return false;
    } finally {
      pendingCheck = null;
    }
  })();

  return pendingCheck;
};

export const resetInstanceCache = (): void => {
  isProductionCached = null;
  cacheExpiresAt = 0;
  pendingCheck = null;
};

export const isAlertboxProduction = (): boolean => isProductionCached === true;
export const isSelfHosted = (): boolean => !isAlertboxProduction();
