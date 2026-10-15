import { getApiUrl } from "@/lib/api";

let isProductionCached: boolean | null = null;
let pendingCheck: Promise<boolean> | null = null;

/**
 * Queries the backend instance check endpoint.
 * Returns true if the backend returns status 200 (AlertBox.org production), false otherwise.
 */
export const checkIsAlertboxProduction = async (): Promise<boolean> => {
  if (isProductionCached !== null) return isProductionCached;
  if (pendingCheck) return pendingCheck;

  pendingCheck = (async () => {
    try {
      const res = await fetch(getApiUrl("/api/v1/instance"), { method: "GET" });
      isProductionCached = res.status === 200;
    } catch {
      isProductionCached = false;
    }
    return isProductionCached;
  })();

  return pendingCheck;
};

export const isAlertboxProduction = (): boolean => isProductionCached === true;
export const isSelfHosted = (): boolean => !isAlertboxProduction();
