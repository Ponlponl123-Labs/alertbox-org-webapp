import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};
const getServerCooldown = () => false;

export function useUriCooldown(cooldownDateStr?: string | null): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => Boolean(cooldownDateStr && new Date(cooldownDateStr).getTime() > Date.now()),
    getServerCooldown,
  );
}
